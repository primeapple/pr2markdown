# AGENTS.md - Development Guidelines for PR to Markdown Userscript

This document provides development guidelines for agentic coding agents working on the PR to Markdown userscript project. Follow these guidelines to maintain consistency and quality.

## Project Overview

This is a browser userscript that adds a copy button to GitHub and GitLab pull requests, allowing users to copy PR links in markdown format `[PR Title](PR URL)`.

## Build/Lint/Test Commands

### Build Process
This project doesn't require a traditional build process since it contains userscripts that runs directly in the browser.

- **No build needed**: The `*.user.js` files are the final deliverables
- **No compilation needed**: Pure JavaScript with Tampermonkey metadata headers
- **No bundling**: Single file userscript

### Testing
Userscripts are tested by installing them in browser extensions like Tampermonkey.

#### Manual Testing Steps:
1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Copy contents of `*.user.js` into a new Tampermonkey script
3. Save and enable the script
4. Navigate to GitHub/GitLab PR pages to test functionality

#### Test Scenarios:
- GitHub PR pages: `https://github.com/user/repo/pull/123`
- GitLab MR pages: `https://gitlab.com/user/repo/-/merge_requests/123`
- GitHub Enterprise and self-hosted GitLab instances

#### Single Test Execution:
Since there are no automated tests, manual testing is required for each change. Test the copy button functionality:
- Click the 📋 button next to PR titles
- Verify markdown format: `[PR Title](URL)` is copied to clipboard
- Check success indicator (✅) and error indicator (❌)

### Linting
No automated linting tools are configured. Code quality is maintained through manual review and adherence to the style guidelines below.

### Code Quality Checks
Before committing changes:
1. Test the userscript manually in browser
2. Verify no JavaScript errors in browser console
3. Check that all platform detection works (GitHub, GitLab)
4. Ensure the copy button appears on PR pages and functions correctly

## Code Style Guidelines

### JavaScript Standards

#### Language Version
- Use ES6+ features (const/let, arrow functions, template literals, async/await)
- Target modern browsers that support Tampermonkey

#### Variables and Constants
```javascript
// Use const for constants and let for variables
const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
const CURRENT_LOG_LEVEL = LOG_LEVELS.ERROR;

let platform = detectPlatform();
```

#### Functions
```javascript
// Use arrow functions for concise expressions
const logger = {
    error: (message, ...args) => {
        if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
            console.error(`PR2Markdown: ${message}`, ...args);
        }
    }
};

// Use function declarations for complex functions
function detectPlatform() {
    const hostname = window.location.hostname;
    // ... implementation
}
```

#### Naming Conventions
- **Functions**: camelCase, descriptive names (`getTitleElement`, `copyToClipboard`)
- **Variables**: camelCase (`titleElement`, `actionSection`)
- **Constants**: UPPER_SNAKE_CASE for global constants (`LOG_LEVELS`, `CURRENT_LOG_LEVEL`)
- **Classes**: PascalCase (none in this project)
- **CSS Classes**: kebab-case with project prefix (`pr2md-copy-btn`)

#### String Literals
- Use single quotes for JavaScript strings
- Use template literals for string interpolation
```javascript
const message = `PR2Markdown: ${message}`;
const selector = 'h1';
```

#### Code Structure
- Use "use strict" directive at function scope
- Wrap entire userscript in IIFE (Immediately Invoked Function Expression)
- Organize code into logical sections with comments

#### Comments and Documentation
- Use JSDoc comments for all functions
- Include parameter types and return types
- Document thrown errors
```javascript
/**
 * @param {Platform} platform
 * @returns {Element}
 * @throws {Error} If the title element cannot be found
 */
function getTitleElement(platform) {
    // implementation
}
```

#### Error Handling
- Use try/catch blocks for operations that might fail
- Log errors with descriptive messages
- Return boolean success indicators where appropriate
```javascript
async function copyToClipboard(text) {
    try {
        GM_setClipboard(text);
        return true;
    } catch (err) {
        logger.error("Failed to copy to clipboard:", err);
        return false;
    }
}
```

#### DOM Manipulation
- Use modern DOM APIs (querySelector, createElement)
- Check for element existence before manipulation
- Use descriptive class names and IDs

#### CSS Styling
- Use CSS-in-JS approach with template literals
- Include platform-specific themes (GitHub light/dark, GitLab light/dark)
- Use CSS custom properties for theming where possible
- Follow BEM-like naming convention for CSS classes

#### Platform Detection
- Support multiple platforms (GitHub, GitLab)
- Use hostname and URL path detection
- Handle both hosted and self-hosted instances

#### Logging
- Implement configurable logging levels
- Prefix all log messages with project identifier
- Use appropriate console methods (error, warn, info, debug)

### File Organization

#### Userscript Structure
```
pr2markdown.user.js
├── Tampermonkey headers (@name, @match, etc.)
├── IIFE wrapper
├── Logging system
├── CSS injection
├── Platform detection utilities
├── DOM manipulation functions
├── Main initialization logic
```

#### Single File Architecture
Since this is a userscript, everything resides in one file. Organize code sections:
1. Tampermonkey metadata
2. Constants and configuration
3. Logging utilities
4. CSS styles
5. Platform detection
6. DOM utilities
7. Main functionality
8. Initialization

### Security Considerations
- Use GM_setClipboard for clipboard access (Tampermonkey API)
- Avoid eval() or other dangerous constructs
- Validate inputs before processing
- Handle errors gracefully without exposing sensitive information

### Browser Compatibility
- Target modern browsers that support ES6+
- Test in Chrome, Firefox, Safari, and Edge
- Ensure Tampermonkey/Greasemonkey compatibility

### Performance
- Use efficient DOM queries (querySelector vs getElementsByClassName)
- Minimize DOM traversals
- Use MutationObserver for dynamic content detection
- Avoid polling; use event-driven approaches

## Development Workflow

1. Make changes to `pr2markdown.user.js`
2. Test manually in browser with Tampermonkey
3. Verify functionality on GitHub and GitLab PR pages
4. Check browser console for errors
5. Update README.md if functionality changes
6. Commit with descriptive message

## Commit Guidelines

- Use present tense imperative mood ("Add feature" not "Added feature")
- Reference issue numbers when applicable
- Keep first line under 50 characters
- Provide detailed description for complex changes

## External Rules

No Cursor rules (.cursor/rules/ or .cursorrules) or Copilot rules (.github/copilot-instructions.md) are configured for this project.

---

*This document should be updated when new tools, frameworks, or significant code patterns are introduced to the project.*
