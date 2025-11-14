# Change Log

All notable changes to the "commit-snap" extension will be documented in this file.

## [0.0.5] - 2025-11-14

### Fixed
- Updated README

## [0.0.4] - 2025-11-14

### Changed
- Completely redesigned README for simplicity and clarity
- Moved step-by-step guide to the top (most important content first)
- Removed unnecessary sections (Features, How It Works, Commands, etc.)
- Streamlined documentation to focus on actual usage

### Added
- Step 5: Clean Up instructions (add to .gitignore or delete snapshot file)
- Clear "Quick Start" section at the top
- Simpler "What's in the Snapshot?" section

### Improved
- Much cleaner, more scannable layout with horizontal rules
- Better visual hierarchy
- Easier to follow for first-time users

## [0.0.3] - 2025-11-14

### Added
- Comprehensive step-by-step workflow documentation in README
- Detailed Grok.com project setup instructions with expert mode recommendation
- Best practices for using the extension with Grok AI
- Alternative workflow for ChatGPT, Claude, and other LLMs
- Instructions on proper copying of commit messages from code blocks (use copy button, not full response)
- Sample Grok project prompt for consistent commit message generation

### Improved
- README structure with clearer sections
- User guidance for first-time users
- Examples of commit message generation workflow

## [0.0.2] - 2025-11-14

### Fixed
- Updated GitHub repository URL in package.json

## [0.0.1] - 2025-11-14

### Added
- Initial release
- Status bar button for quick git snapshot generation
- Command palette commands: "Generate Git Snapshot" and "Open Last Generated Snapshot"
- Automatic git repository detection
- Comprehensive snapshot generation including:
  - Git status with all files
  - Staged changes (git diff --cached)
  - Unstaged changes (git diff)
  - Untracked file contents
- Smart binary file detection and exclusion
- Progress notifications during snapshot generation
- Quick actions to open generated file or copy path
- Support for nested directories in untracked files

### Technical Details
- Built with TypeScript
- Webpack bundling for optimal performance
- Uses VS Code API 1.96.2+
- Node.js child_process for git command execution

## [Unreleased]

### Planned Features
- Configuration options for custom snapshot file name
- Option to exclude certain file types or patterns
- Direct LLM API integration (OpenAI, Anthropic)
- Snapshot history viewer
- Custom snapshot templates
