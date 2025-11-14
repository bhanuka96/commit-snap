import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(exec);

let statusBarItem: vscode.StatusBarItem;
let lastSnapshotPath: string | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Commit Snap extension is now active');

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = 'commit-snap.generateSnapshot';
  statusBarItem.text = '$(git-commit) Snapshot';
  statusBarItem.tooltip = 'Generate Git Snapshot';
  context.subscriptions.push(statusBarItem);

  // Update status bar visibility based on git repo status
  updateStatusBarVisibility();

  // Watch for workspace folder changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      updateStatusBarVisibility();
    })
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('commit-snap.generateSnapshot', async () => {
      await generateGitSnapshot();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('commit-snap.openLastSnapshot', async () => {
      await openLastSnapshot();
    })
  );
}

async function updateStatusBarVisibility() {
  const isGitRepo = await checkIfGitRepo();
  if (isGitRepo) {
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}

async function checkIfGitRepo(): Promise<boolean> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return false;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;

  try {
    await execAsync('git rev-parse --show-toplevel', { cwd: workspaceRoot });
    return true;
  } catch (error) {
    return false;
  }
}

async function getGitRoot(): Promise<string | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No workspace folder open');
    return null;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;

  try {
    const { stdout } = await execAsync('git rev-parse --show-toplevel', {
      cwd: workspaceRoot
    });
    return stdout.trim();
  } catch (error) {
    vscode.window.showErrorMessage('Not a git repository');
    return null;
  }
}

async function generateGitSnapshot() {
  const gitRoot = await getGitRoot();
  if (!gitRoot) {
    return;
  }

  const outputPath = path.join(gitRoot, 'git_snapshot.txt');

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Generating git snapshot...',
        cancellable: false
      },
      async (progress) => {
        let content = '';

        // Git Status
        progress.report({ message: 'Getting git status...' });
        content += '---GIT STATUS---\n';
        try {
          const { stdout: status } = await execAsync('git status --untracked-files=all', {
            cwd: gitRoot
          });
          content += status + '\n\n';
        } catch (error) {
          content += `Error getting status: ${error}\n\n`;
        }

        // Git Diff Cached
        progress.report({ message: 'Getting staged changes...' });
        try {
          const { stdout: cachedDiff } = await execAsync('git diff --cached', {
            cwd: gitRoot
          });
          if (cachedDiff.trim()) {
            content += '---GIT DIFF CACHED---\n';
            content += cachedDiff + '\n\n';
          }
        } catch (error) {
          // Ignore if no cached diff
        }

        // Git Diff
        progress.report({ message: 'Getting unstaged changes...' });
        content += '---GIT DIFF---\n';
        try {
          const { stdout: diff } = await execAsync('git diff', { cwd: gitRoot });
          content += diff + '\n\n';
        } catch (error) {
          content += `Error getting diff: ${error}\n\n`;
        }

        // Untracked Files
        progress.report({ message: 'Processing untracked files...' });
        content += '---UNTRACKED FILE CONTENT---\n';
        try {
          const { stdout: untrackedFiles } = await execAsync(
            'git ls-files --others --exclude-standard',
            { cwd: gitRoot }
          );

          const files = untrackedFiles.trim().split('\n').filter(f => f);

          for (const file of files) {
            const filePath = path.join(gitRoot, file);
            content += await processUntrackedFile(filePath, file);
          }
        } catch (error) {
          content += `Error getting untracked files: ${error}\n`;
        }

        // Write to file
        progress.report({ message: 'Saving snapshot...' });
        await fs.promises.writeFile(outputPath, content, 'utf8');
        lastSnapshotPath = outputPath;
      }
    );

    // Show success message with actions
    const action = await vscode.window.showInformationMessage(
      `Git snapshot saved to: ${outputPath}`,
      'Open File',
      'Copy Path'
    );

    if (action === 'Open File') {
      const doc = await vscode.workspace.openTextDocument(outputPath);
      await vscode.window.showTextDocument(doc);
    } else if (action === 'Copy Path') {
      await vscode.env.clipboard.writeText(outputPath);
      vscode.window.showInformationMessage('Path copied to clipboard');
    }

  } catch (error) {
    vscode.window.showErrorMessage(`Failed to generate snapshot: ${error}`);
  }
}

async function processUntrackedFile(filePath: string, relativePath: string): Promise<string> {
  let content = '';

  try {
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      // Process directory recursively
      const entries = await fs.promises.readdir(filePath);
      for (const entry of entries) {
        const entryPath = path.join(filePath, entry);
        const entryRelativePath = path.join(relativePath, entry);
        content += await processUntrackedFile(entryPath, entryRelativePath);
      }
    } else if (stat.isFile()) {
      // Check if binary file
      const ext = path.extname(filePath).toLowerCase();
      const binaryExtensions = [
        '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico',
        '.mp3', '.mp4', '.wav', '.ogg', '.pdf', '.zip',
        '.tar', '.gz', '.exe', '.dll', '.so', '.dylib'
      ];

      content += `--- ${relativePath} ---\n`;

      if (binaryExtensions.includes(ext)) {
        content += '[binary file skipped]\n\n';
      } else {
        try {
          const fileContent = await fs.promises.readFile(filePath, 'utf8');
          content += fileContent + '\n\n';
        } catch (error) {
          content += '[unable to read file]\n\n';
        }
      }
    }
  } catch (error) {
    content += `--- ${relativePath} ---\n[error accessing file: ${error}]\n\n`;
  }

  return content;
}

async function openLastSnapshot() {
  if (!lastSnapshotPath) {
    // Try to find snapshot file in workspace
    const gitRoot = await getGitRoot();
    if (gitRoot) {
      lastSnapshotPath = path.join(gitRoot, 'git_snapshot.txt');
    }
  }

  if (!lastSnapshotPath) {
    vscode.window.showWarningMessage('No snapshot has been generated yet');
    return;
  }

  try {
    // Check if file exists
    await fs.promises.access(lastSnapshotPath);
    const doc = await vscode.workspace.openTextDocument(lastSnapshotPath);
    await vscode.window.showTextDocument(doc);
  } catch (error) {
    vscode.window.showErrorMessage(`Snapshot file not found: ${lastSnapshotPath}`);
    lastSnapshotPath = undefined;
  }
}

export function deactivate() {
  // Clean up resources
}
