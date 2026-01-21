// ==UserScript==
// @name         PR to Markdown
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Add a copy button to GitHub and GitLab pull requests to copy PR content as markdown
// @author       You
// @match        https://github.com/*
// @include      https://gitlab.*
// @grant        GM_setClipboard
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
		github: "bdi",
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
			throw new Error(`Title element not found for platform: ${platform}`);
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
				actionSection = titleElement.parentElement?.nextElementSibling;
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
		return titleElement ? titleElement.textContent.trim() : "Pull Request";
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
	 * @param {string} title
	 * @param {string} url
	 * @returns {string}
	 */
	function generateMarkdown(title, url) {
		return `[${title}](${url})`;
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
                return "btn-sm btn";
            case "gitlab":
                return "gl-button btn btn-md btn-default gl-hidden @sm/panel:gl-inline-flex gl-self-start";
        }
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

				const markdown = generateMarkdown(title, url);
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

	init();
})();
