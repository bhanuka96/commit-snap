# Commit Snap

Generate git snapshots and get AI-powered commit messages instantly.

## Quick Start

Click the **"Snapshot"** button in the status bar → Get professional commit messages.

---

## Step-by-Step Guide

### Step 1: Generate Snapshot

1. Make changes to your code
2. Click the **"Snapshot"** button in the status bar (bottom-right)
3. Click **"Open File"** in the notification
4. You'll see `git_snapshot.txt` with all your changes

> **Alternative**: Press `Cmd+Shift+P` → Type "Generate Git Snapshot" → Enter

---

### Step 2: Set Up Grok Project (One-Time Setup)

1. Go to [grok.com](https://grok.com)
2. Create a new project called **"Git Commit Assistant"**
3. Copy and paste this prompt into the project instructions:

```
Git Commit Assistant

You are a Git commit assistant that helps developers write accurate, conventional, and clean Git commit messages based on code diffs.

You will receive either:
- git diff --cached (staged changes only) OR
- git diff (unstaged changes) OR
- Both git diff and git diff --cached together

Your task is to:
1. Parse and understand the code changes and file paths.
2. Identify whether files are staged or unstaged:
   - Files from git diff --cached are already staged (do not git add them again)
   - Files from git diff are unstaged (must include git add before committing)
3. Group related changes logically only when appropriate:
   - ✅ Group if changes belong to the same feature/module/component
   - 🚫 Do NOT group unrelated changes (different screens, purposes, or types)
4. Generate ONE SINGLE BASH BLOCK containing all git add and commit commands for easy copy-paste execution.

Commit Message Format:
type(scope): short summary

- Bullet 1: What changed (plain, simple)
- Bullet 2: Why it changed or what it improves/fixes
- (Optional) Bullet 3: User/UX/code impact, removed logic, etc.

✅ Output Format - Generate ONE bash block with all commands:

git add path/to/file1 [path/to/file2 ...]
git commit -m "type(scope): short summary

- Bullet 1: What changed (plain, simple)
- Bullet 2: Why it changed or what it improves/fixes
- (Optional) Bullet 3: User/UX/code impact, removed logic, etc."

git add path/to/other/files
git commit -m "type(scope): short summary

- Bullet 1: What changed
- Bullet 2: Why it changed or what it improves/fixes
- (Optional) Bullet 3: Impact or context"

Guidelines:
- Keep commit messages clear, concise, and descriptive
- Use appropriate commit types: feat, fix, refactor, style, docs, test, chore, perf
- Group logically related changes into single commits
- Separate unrelated changes into distinct commits
- Always include git add commands for unstaged files before their commits
```

4. Set **Preferred Mode** to **"Expert"** (recommended)
5. Save the project

---

### Step 3: Generate Commit Message

1. Open a **new chat** in your "Git Commit Assistant" project
2. Paste the **entire contents** of `git_snapshot.txt`
3. Press Enter and wait for Grok to generate the commit commands

**IMPORTANT**: Use the **copy button** on the code block (top-right corner)
- ✅ **DO**: Click the copy button on the bash code block
- ❌ **DON'T**: Copy the entire Grok response

---

### Step 4: Commit Your Changes

1. Open your terminal
2. Paste the bash block from Grok
3. Press Enter

Example output from Grok:
```bash
git add src/auth/login.ts src/auth/jwt.ts
git commit -m "feat(auth): add user login functionality

- Implemented JWT-based authentication system
- Added secure token storage and validation
- Improved user session management"
```

---

### Step 5: Clean Up (Important!)

After committing, do one of the following:

**Option 1**: Add to `.gitignore` (recommended for ongoing use)
```bash
echo "git_snapshot.txt" >> .gitignore
```

**Option 2**: Delete the snapshot file
```bash
rm git_snapshot.txt
```

---

## Using Other LLMs (ChatGPT, Claude, etc.)

Don't want to use Grok? No problem!

1. Generate snapshot (Step 1)
2. Open ChatGPT, Claude, or your preferred LLM
3. Paste this prompt + the snapshot contents:
   ```
   Based on this git snapshot, generate git add and commit commands in a bash code block:

   [paste git_snapshot.txt contents here]
   ```
4. Copy and paste the commands in your terminal

---

## What's in the Snapshot?

The extension captures:
- Git status (tracked and untracked files)
- Staged changes (`git diff --cached`)
- Unstaged changes (`git diff`)
- Contents of new/untracked files (text files only, skips binaries)

---

## Requirements

- VS Code 1.96.2 or higher
- Git installed
- A git repository

---

## License

MIT License - See LICENSE file for details

---

**Questions or Issues?** Open an issue on [GitHub](https://github.com/bhanuka96/commit-snap)
