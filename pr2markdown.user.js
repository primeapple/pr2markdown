// ==UserScript==
// @name         PR to Markdown
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  Add a copy button to GitHub and GitLab pull requests to copy PR content as markdown
// @author       You
// @match        https://github.com/*
// @include      https://gitlab.*
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @run-at       document-end
// ==/UserScript==

(function () {
    "use strict";

    // Logging system
    const LOG_LEVELS = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    };

    const CURRENT_LOG_LEVEL = LOG_LEVELS.ERROR; // Default to only show errors

    const INCLUDE_REPO_SHORTHAND_KEY = "includeRepoShorthand";

    const logger = {
        error: (message, ...args) => {
            if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
                console.error(`PR2Markdown: ${message}`, ...args);
            }
        },
        warn: (message, ...args) => {
            if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
                console.warn(`PR2Markdown: ${message}`, ...args);
            }
        },
        info: (message, ...args) => {
            if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
                console.info(`PR2Markdown: ${message}`, ...args);
            }
        },
        debug: (message, ...args) => {
            if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
                console.debug(`PR2Markdown: ${message}`, ...args);
            }
        }
    };

    /**
     * @typedef {"github" | "gitlab"} Platform
     */

    const TITLE_SELECTOR = {
        github: '[data-component="TitleArea"]',
        gitlab: "h1",
    };

    /**
     * @returns {Platform | null}
     */
    function detectPlatform() {
        const hostname = window.location.hostname;
        const path = window.location.pathname;
        if (hostname.includes("github")) {
            return "github";
        } else if (hostname.includes("gitlab") || path.includes("/-/merge_requests/")) {
            return "gitlab";
        }
        return null;
    }

    /**
     * @param {Platform} platform
     * @returns {boolean}
     */
    function isOnPRPage(platform) {
        const path = window.location.pathname;

        switch (platform) {
            case "github":
                const parts = path.split("/")
                return parts[3] == "pull" && /^\d+$/.test(parts[4])
            case "gitlab":
                return /\/-\/merge_requests\/\d+/.test(path);
        }
    }

    /**
     * @param {Platform} platform
     * @returns {Element}
     * @throws {Error} If the title element cannot be found
     */
    function getTitleElement(platform) {
        const selector = TITLE_SELECTOR[platform];
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Title element with selector "${selector}" not found for platform: ${platform}`);
        }
        return element;
    }

    /**
     * @param {Platform} platform
     * @returns {Element}
     * @throws {Error} If the action section cannot be found
     */
    function getActionSection(platform) {
        const titleElement = getTitleElement(platform);
        let actionSection;

        switch (platform) {
            case "gitlab":
                actionSection = titleElement.nextElementSibling;
                break;
            case "github":
                actionSection = titleElement.nextElementSibling;
                break;
        }

        if (!actionSection) {
            throw new Error(`Action section not found for platform: ${platform}`);
        }
        return actionSection;
    }

    /**
     * @param {Platform} platform
     * @returns {string}
     */
    function getPRTitle(platform) {
        const titleElement = getTitleElement(platform);
        switch (platform) {
            case "gitlab":
                return titleElement.textContent.trim() || "Merge Request";
            case "github":
                return titleElement.firstChild?.firstChild?.firstChild?.textContent.trim() || "Pull Request";
        }
    }

    /**
     * @param {Platform} platform
     * @returns {string}
     */
    function getPRUrl(platform) {
        const pathname = window.location.pathname;
        let basePath = "";

        if (platform === 'github') {
            const parts = pathname.split("/");
            basePath = `/${parts[1]}/${parts[2]}/pull/${parts[4]}`;
        } else if (platform === 'gitlab') {
            basePath = pathname.match(/^(.*\/-\/merge_requests\/\d+)/)[1];
        }

        return window.location.origin + basePath;
    }

    /**
     * @param {Platform} platform
     * @param {string} url
     * @returns {string}
     * @throws {Error} If the URL is not a valid PR/MR URL for the platform
     */
    function getRepoShorthand(platform, url) {
        const pathname = new URL(url).pathname;
        const pattern = platform === "github"
            ? /^\/([^/]+\/[^/]+)\/pull\/\d+$/
            : /^\/(.+)\/-\/merge_requests\/\d+$/;
        const match = pathname.match(pattern);

        if (!match) {
            throw new Error(`Invalid ${platform} PR/MR URL: ${url}`);
        }

        return decodeURIComponent(match[1]);
    }

    /**
     * @param {string} title
     * @param {string} url
     * @param {string} [repoShorthand]
     * @returns {string}
     */
    function generateMarkdown(title, url, repoShorthand) {
        const label = repoShorthand ? `${repoShorthand} - ${title}` : title;
        return `[${label}](${url})`;
    }

    /**
     * @param {string} text
     * @returns {Promise<boolean>}
     */
    async function copyToClipboard(text) {
        try {
            GM_setClipboard(text);
            return true;
        } catch (err) {
            logger.error("Failed to copy to clipboard:", err);
            return false;
        }
    }

    /**
     * @param {Platform} platform
     */
    function getButtonClassNamesByPlatform(platform) {
        switch (platform) {
            case "github":
                return "btn";
            case "gitlab":
                return "gl-button btn btn-md btn-default gl-hidden @sm/panel:gl-inline-flex gl-self-start";
        }
    }

    /**
     * @returns {boolean}
     */
    function shouldIncludeRepoShorthand() {
        return GM_getValue(INCLUDE_REPO_SHORTHAND_KEY, false);
    }

    function registerOptionsMenu() {
        let menuId;

        const register = () => {
            menuId = GM_registerMenuCommand(
                `Include repo shorthand: ${shouldIncludeRepoShorthand() ? "On" : "Off"}`,
                () => {
                    GM_setValue(INCLUDE_REPO_SHORTHAND_KEY, !shouldIncludeRepoShorthand());
                    GM_unregisterMenuCommand(menuId);
                    register();
                },
                {
                    autoClose: false,
                }
            );
        };

        register();
    }

    /**
     * @param {Platform} platform
     */
    function tryAddCopyButton(platform) {
        if (!isOnPRPage(platform)) {
            logger.debug("Not on a PR/MR page");
            return;
        }
        logger.debug(`On MR page for platform: ${platform}`);

        if (document.getElementById("pr2md-copy-btn")) {
            logger.debug("Button already exists")
            return;
        }

        logger.info("Attempting to add copy button");

        try {
            const titleElement = getTitleElement(platform);
            const actionSection = getActionSection(platform);

            logger.debug("Found title element:", titleElement);
            logger.debug("Found action section:", actionSection);

            const button = document.createElement("button");
            button.id = "pr2md-copy-btn";
            button.className = getButtonClassNamesByPlatform(platform);
            button.textContent = "📋";
            button.title = "Copy PR as Markdown";

            button.addEventListener("click", async function () {
                const title = getPRTitle(platform);
                const url = getPRUrl(platform);
                const repoShorthand = shouldIncludeRepoShorthand()
                    ? getRepoShorthand(platform, url)
                    : undefined;

                const markdown = generateMarkdown(title, url, repoShorthand);
                logger.debug("Generated markdown:", markdown);

                const success = await copyToClipboard(markdown);

                if (success) {
                    button.textContent = "✅";
                    setTimeout(() => {
                        button.textContent = "📋";
                    }, 2000);
                } else {
                    button.textContent = "❌";
                    setTimeout(() => {
                        button.textContent = "📋";
                    }, 2000);
                }
            });

            actionSection.insertBefore(button, actionSection.firstChild);
            logger.info("Button added successfully");

        } catch (error) {
            logger.error("Error adding copy button:", error);
        }
    }

    function init() {
        logger.info("Userscript loaded on", window.location.href);
        registerOptionsMenu();

        const platform = detectPlatform();
        logger.debug("Detected platform:", platform);

        if (!platform) {
            logger.warn("Platform not detected or not supported");
            return;
        }

        try {
            // if (document.readyState === "loading") {
            // 	document.addEventListener("DOMContentLoaded", () =>
            // 		tryAddCopyButton(platform),
            // 	);
            // } else {
            // 	tryAddCopyButton(platform);
            // }

            const observer = new MutationObserver(() => {
                tryAddCopyButton(platform);
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        } catch (error) {
            logger.error("Error during initialization:", error);
        }
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { generateMarkdown, getRepoShorthand };
    } else {
        init();
    }
})();
