# PR to Markdown Browser Extension

A simple browser extension that adds a copy button next to GitHub and GitLab pull requests to copy the PR as markdown in the format `[PR Title](PR URL)`.

## Features

- 📋 One-click copy button next to PR titles
- 🔗 Generates markdown links in format: `[Name of the PR](url.to.the.pr/)`
- 🌐 Works on GitHub.com, GitLab.com, and self-hosted GitLab instances
- ✨ Includes PR description if available
- 🎯 Minimal and lightweight

## Installation

### Development Installation

1. Clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this directory
5. The extension is now installed and ready to use

### Usage

1. Navigate to any GitHub or GitLab pull request
2. Look for the 📋 button next to the PR title
3. Click the button to copy the PR as markdown
4. The button will show ✅ on success or ❌ on failure

## Supported Platforms

- **GitHub**: github.com and GitHub Enterprise
- **GitLab**: gitlab.com and self-hosted GitLab instances

## Output Format

The extension copies PRs in this markdown format:

```markdown
[PR Title](https://github.com/user/repo/pull/123)

PR description goes here if available...
```

## Development

No build process required - the extension uses plain JavaScript.

- `content.js` - Main content script that runs on PR pages
- `manifest.json` - Extension configuration
- `styles.css` - Button styling