# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension that adds a copy button next to pull requests on GitHub/GitLab to copy PR content as markdown format.

## Technology Stack

- **JavaScript/TypeScript** - Main development language
- **NPM** - Package manager
- **Web Extensions API** - Browser extension framework
- **Content Scripts** - For DOM manipulation on GitHub/GitLab pages

## Common Commands

- `npm install` - Install dependencies
- `npm run build` - Build the extension
- `npm run dev` - Development build with watching
- `npm test` - Run tests
- `npm run lint` - Lint JavaScript/TypeScript code
- `npm run format` - Format code

## Architecture

The extension will likely consist of:

- **manifest.json** - Extension configuration and permissions
- **content-scripts/** - Scripts injected into GitHub/GitLab pages
- **background/** - Service worker for extension logic
- **popup/** - Extension popup UI (if needed)
- **utils/** - Shared utilities for markdown conversion
- **styles/** - CSS for UI elements

## Key Development Areas

1. **Content Script Integration**: Inject copy buttons into GitHub/GitLab PR pages
2. **DOM Parsing**: Extract PR content (title, description, comments, etc.)
3. **Markdown Conversion**: Convert extracted content to properly formatted markdown
4. **Cross-Platform Support**: Handle differences between GitHub and GitLab DOM structures
5. **Permissions**: Configure appropriate extension permissions for GitHub/GitLab domains

## Browser Extension Specifics

- Use `chrome.tabs` API for page interaction
- Content scripts run in isolated context
- Message passing between content scripts and background scripts
- Handle dynamic content loading (SPAs like GitHub/GitLab)