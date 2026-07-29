# My Userscripts Collection

A collection of browser userscripts I've developed to enhance various websites.

## Userscripts

### PR to Markdown

A simple userscript that adds a copy button next to GitHub and GitLab pull requests to copy the PR as markdown in the format `[PR Title](PR URL)`.
There is an option to add the repo shortand to the displayed text, making it `[user/repo - PR Title](PR URL)`.

Supported platforms are:
- **GitHub**: github.com and GitHub Enterprise
- **GitLab**: gitlab.com and self-hosted GitLab instances

#### Usage

1. Navigate to any GitHub or GitLab pull request
2. Look for the 📋 button next to the PR title
3. Click the button to copy the PR as markdown
4. The button will show ✅ on success or ❌ on failure
5. The toggle to include the shorthand can be found in the Tampermonkey menu.

## Installation

### Userscript (Tampermonkey)

For e.g. the `pr2markdown` script do the following:

1. Install [Tampermonkey](https://www.tampermonkey.net/) extension in your browser
2. Import the userscript via url in Tampermonkey (`Utilities` -> `Import from URL` -> `https://github.com/primeapple/userscripts/raw/refs/heads/main/pr2markdown.user.js`)
3. The script is now active on GitHub and GitLab PR pages

## Development

No build process required - userscripts use plain JavaScript.
We do have a typechecking, testing and linting pipeline via Github Actions.
Check the `scripts` section in the `package.json`.
