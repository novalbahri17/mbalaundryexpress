/**
 * MBA Laundry Express - Anti-Detection Script
 * Runs immediately to block Wappalyzer and similar tools
 */

(function () {
	"use strict";

	// Execute immediately
	const startTime = performance.now();

	// ============================================
	// 1. REMOVE ALL TECHNOLOGY SIGNATURES
	// ============================================

	// Clear existing signatures
	window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
	window.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__ = undefined;
	window.__REACT_DEVTOOLS_COMPONENT_FILTERS__ = undefined;
	window.__VITE_IS_MODERN__ = undefined;
	window.__VITE_PRELOAD__ = undefined;
	window.__NEXT_DATA__ = undefined;
	window.__NEXT_LOADED_PAGES__ = undefined;
	window.__NUXT__ = undefined;
	window.__VUE__ = undefined;
	window.$nuxt = undefined;
	window.$vue = undefined;
	window.angular = undefined;
	window.ng = undefined;
	window.Ember = undefined;
	window.Backbone = undefined;
	window.Meteor = undefined;
	window.Svelte = undefined;

	// ============================================
	// 2. BLOCK EXTENSION GLOBALS
	// ============================================

	// Block Wappalyzer
	Object.defineProperty(window, "wappalyzer", {
		get: function () {
			return undefined;
		},
		set: function () {},
		configurable: false,
	});

	Object.defineProperty(window, "Wappalyzer", {
		get: function () {
			return undefined;
		},
		set: function () {},
		configurable: false,
	});

	// Block BuiltWith
	Object.defineProperty(window, "BuiltWith", {
		get: function () {
			return undefined;
		},
		set: function () {},
		configurable: false,
	});

	Object.defineProperty(window, "builtwith", {
		get: function () {
			return undefined;
		},
		set: function () {},
		configurable: false,
	});

	// Block WhatRuns
	Object.defineProperty(window, "whatruns", {
		get: function () {
			return undefined;
		},
		set: function () {},
		configurable: false,
	});

	// Block SimilarTech
	Object.defineProperty(window, "SimilarTech", {
		get: function () {
			return undefined;
		},
		set: function () {},
		configurable: false,
	});

	// ============================================
	// 3. HIDE WEBPACK/BUNDLER SIGNATURES
	// ============================================

	window.webpackJsonp = undefined;
	window.__webpack_public_path__ = undefined;
	window.__webpack_require__ = undefined;
	window.__webpack_chunk_load__ = undefined;
	window.__webpack_get_script_filename__ = undefined;

	// ============================================
	// 4. OVERRIDE CONSOLE TO HIDE FRAMEWORK LOGS
	// ============================================

	const originalLog = console.log;
	const originalWarn = console.warn;
	const originalInfo = console.info;
	const originalError = console.error;

	const blockedPatterns = [
		/react/i,
		/vite/i,
		/next\.?js/i,
		/vue/i,
		/angular/i,
		/tailwind/i,
		/framer-motion/i,
		/zustand/i,
		/tanstack/i,
		/antd/i,
		/\[vite\]/i,
		/\[hmr\]/i,
		/wappalyzer/i,
		/builtwith/i,
		/whatruns/i,
	];

	function shouldBlock(args) {
		try {
			const message = Array.from(args).join(" ");
			return blockedPatterns.some((p) => p.test(message));
		} catch (e) {
			return false;
		}
	}

	console.log = function (...args) {
		if (!shouldBlock(args)) {
			return originalLog.apply(this, args);
		}
	};

	console.warn = function (...args) {
		if (!shouldBlock(args)) {
			return originalWarn.apply(this, args);
		}
	};

	console.info = function (...args) {
		if (!shouldBlock(args)) {
			return originalInfo.apply(this, args);
		}
	};

	console.error = function (...args) {
		if (!shouldBlock(args)) {
			return originalError.apply(this, args);
		}
	};

	// ============================================
	// 5. OVERRIDE DOCUMENT METHODS
	// ============================================

	// Override createElement to hide React markers
	const originalCreateElement = document.createElement;
	document.createElement = function (tagName, options) {
		const element = originalCreateElement.call(document, tagName, options);

		// Remove data-reactroot and similar attributes
		if (element.setAttribute) {
			const originalSetAttribute = element.setAttribute;
			element.setAttribute = function (name, value) {
				if (name.startsWith("data-react") || name.startsWith("data-vite")) {
					return;
				}
				return originalSetAttribute.call(this, name, value);
			};
		}

		return element;
	};

	// ============================================
	// 6. HIDE SCRIPT SOURCES
	// ============================================

	// Override script loading
	const originalAppendChild = Element.prototype.appendChild;
	Element.prototype.appendChild = function (node) {
		if (node.tagName === "SCRIPT") {
			// Hide src
			Object.defineProperty(node, "src", {
				get: function () {
					return "/app.js";
				},
				configurable: true,
			});

			// Hide inner content
			Object.defineProperty(node, "textContent", {
				get: function () {
					return "";
				},
				configurable: true,
			});
		}
		return originalAppendChild.call(this, node);
	};

	// ============================================
	// 7. CONTINUOUS CLEANUP
	// ============================================

	setInterval(function () {
		// Clear extension globals
		window.wappalyzer = undefined;
		window.Wappalyzer = undefined;
		window.BuiltWith = undefined;
		window.builtwith = undefined;
		window.whatruns = undefined;
		window.SimilarTech = undefined;

		// Remove extension elements
		document.querySelectorAll('[class*="wappalyzer"]').forEach(function (el) {
			el.remove();
		});
		document.querySelectorAll('[id*="wappalyzer"]').forEach(function (el) {
			el.remove();
		});
	}, 100);

	// ============================================
	// 8. DETECT AND BLOCK EXTENSIONS
	// ============================================

	// Monitor for extension injection
	var observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			mutation.addedNodes.forEach(function (node) {
				if (node.nodeType === 1) {
					// Element node
					var html = node.outerHTML || "";
					if (
						html.indexOf("wappalyzer") !== -1 ||
						html.indexOf("builtwith") !== -1 ||
						html.indexOf("whatruns") !== -1
					) {
						node.remove();
					}
				}
			});
		});
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});

	// ============================================
	// 9. CLEAR CONSOLE PERIODICALLY
	// ============================================

	if (window.location.hostname !== "localhost") {
		setInterval(function () {
			console.clear();
		}, 500);
	}

	// Log execution time
	console.log("Security initialized in", (performance.now() - startTime).toFixed(2), "ms");
})();
