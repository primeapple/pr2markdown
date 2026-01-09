# PR to Markdown

A simple browser extension and userscript that adds a copy button next to GitHub and GitLab pull requests to copy the PR as markdown in the format `[PR Title](PR URL)`.

## Installation

### Browser Extension

#### Development Installation

1. Clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this directory
5. The extension is now installed and ready to use

### Userscript (Tampermonkey)

1. Install [Tampermonkey](https://www.tampermonkey.net/) extension in your browser
2. Copy the contents of `pr2markdown.user.js`
3. Create a new userscript in Tampermonkey and paste the code
4. Save the userscript
5. The script is now active on GitHub and GitLab PR pages

## Usage

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
```

## Development

No build process required - both the extension and userscript use plain JavaScript.

### Files

- `content.js` - Main content script logic for the extension
- `manifest.json` - Extension configuration
- `styles.css` - Button styling
- `pr2markdown.user.js` - Tampermonkey userscript version
