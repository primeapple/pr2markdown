(function () {
	"use strict";

	const TITLE_SELECTOR = {
		github: "bdi",
		gitlab: "h1",
	};

	/**
	 * @returns {"github" | "gitlab" | null}
	 */
	function detectPlatform() {
		const hostname = window.location.hostname;
		if (hostname.includes("github")) {
			return "github";
		} else if (hostname.includes("gitlab") || isPotentialGitLab()) {
			return "gitlab";
		}
		return null;
	}

	/**
	 * @returns {boolean}
	 */
	function isPotentialGitLab() {
		const path = window.location.pathname;
		return (
			path.includes("/merge_requests/") || path.includes("/-/merge_requests/")
		);
	}

	/**
	 * @param {"github" | "gitlab"} platform
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
	 * @param {"github" | "gitlab"} platform
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
	 * @param {"github" | "gitlab"} platform
	 * @returns {string}
	 */
	function getPRTitle(platform) {
		const titleElement = getTitleElement(platform);
		return titleElement ? titleElement.textContent.trim() : "Pull Request";
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
			await navigator.clipboard.writeText(text);
			return true;
		} catch (err) {
			console.error("Failed to copy to clipboard:", err);
			return false;
		}
	}

	/**
	 * @param {"github" | "gitlab"} platform
	 */
	function addCopyButton(platform) {
		if (document.querySelector(".pr2md-copy-btn")) {
			return;
		}

		const button = document.createElement("button");
		button.className = "pr2md-copy-btn";
		button.textContent = "📋";
		button.title = "Copy PR as Markdown";

		button.addEventListener("click", async function () {
			const title = getPRTitle(platform);
			const url = window.location.href;

			const markdown = generateMarkdown(title, url);
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

		const actionSection = getActionSection(platform);
		actionSection.insertBefore(button, actionSection.firstChild);
	}

	function init() {
		const platform = detectPlatform();

		if (!platform) {
			console.log("PR2Markdown: Platform not detected or not supported");
			return;
		}

		console.log(`PR2Markdown: Detected platform: ${platform}`);

		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () =>
				addCopyButton(platform),
			);
		} else {
			addCopyButton(platform);
		}

		const observer = new MutationObserver(() => {
			addCopyButton(platform);
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	init();
})();
