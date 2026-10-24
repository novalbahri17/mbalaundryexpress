/**
 * MBA Laundry Express - Anti-Fingerprinting & Anti-Detection
 * Menghindari deteksi Wappalyzer, BuiltWith, dan tool sejenis
 */

// ============================================
// REMOVE TECHNOLOGY SIGNATURES
// ============================================
export function removeTechnologySignatures(): void {
	// Remove React DevTools signature
	if (typeof window !== "undefined") {
		// @ts-ignore
		delete window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
		// @ts-ignore
		delete window.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__;
		// @ts-ignore
		delete window.__REACT_DEVTOOLS_COMPONENT_FILTERS__;
		// @ts-ignore
		delete window.__REACT_DEVTOOLS_DETACHED__;

		// Remove Next.js/Vercel signatures
		// @ts-ignore
		delete window.__NEXT_DATA__;
		// @ts-ignore
		delete window.__NEXT_LOADED_PAGES__;
		// @ts-ignore
		delete window.__NEXT_P__;

		// Remove Vite signatures
		// @ts-ignore
		delete window.__VITE_IS_MODERN__;
		// @ts-ignore
		delete window.__VITE_PRELOAD__;

		// Remove common framework signatures
		// @ts-ignore
		delete window.Vue;
		// @ts-ignore
		delete window.vue;
		// @ts-ignore
		delete window.angular;
		// @ts-ignore
		delete window.ng;
		// @ts-ignore
		delete window.Ember;
		// @ts-ignore
		delete window.Backbone;
		// @ts-ignore
		delete window.Meteor;
		// @ts-ignore
		delete window.Svelte;
	}
}

// ============================================
// SPOOF NAVIGATOR
// ============================================
export function spoofNavigator(): void {
	if (typeof navigator === "undefined") return;

	// Override common detection properties
	try {
		Object.defineProperty(navigator, "webdriver", {
			get: () => undefined,
			configurable: true,
		});

		// Hide automation flags
		Object.defineProperty(navigator, "plugins", {
			get: () => [
				{
					name: "Chrome PDF Plugin",
					filename: "internal-pdf-viewer",
					description: "Portable Document Format",
					version: "undefined",
					length: 1,
					item: () => null,
					namedItem: () => null,
				},
				{
					name: "Native Client",
					filename: "internal-nacl-plugin",
					description: "",
					version: "undefined",
					length: 2,
					item: () => null,
					namedItem: () => null,
				},
			],
			configurable: true,
		});

		// Randomize user agent slightly
		const originalUA = navigator.userAgent;
		Object.defineProperty(navigator, "userAgent", {
			get: () => originalUA.replace(/\s\([^)]+\)/, ""),
			configurable: true,
		});
	} catch {
		// Silent fail
	}
}

// ============================================
// HIDE CONSOLE OUTPUT
// ============================================
export function hideConsoleSignatures(): void {
	if (typeof window === "undefined") return;

	// Store original console methods
	const originalConsole = {
		log: console.log,
		warn: console.warn,
		error: console.error,
		info: console.info,
		dir: console.dir,
		table: console.table,
	};

	// Filter out framework-specific messages
	const blockedPatterns = [
		/react/i,
		/vite/i,
		/next\.?js/i,
		/tailwind/i,
		/framer-motion/i,
		/zustand/i,
		/tanstack/i,
		/antd/i,
		/\[vite\]/i,
		/\[hmr\]/i,
	];

	function shouldBlock(...args: unknown[]): boolean {
		const message = args.join(" ");
		return blockedPatterns.some((pattern) => pattern.test(message));
	}

	console.log = (...args: unknown[]) => {
		if (!shouldBlock(...args)) {
			originalConsole.log(...args);
		}
	};

	console.warn = (...args: unknown[]) => {
		if (!shouldBlock(...args)) {
			originalConsole.warn(...args);
		}
	};

	console.info = (...args: unknown[]) => {
		if (!shouldBlock(...args)) {
			originalConsole.info(...args);
		}
	};
}

// ============================================
// RANDOMIZE FINGERPRINT
// ============================================
export function randomizeFingerprint(): void {
	if (typeof window === "undefined") return;

	// Random canvas fingerprint
	const originalGetContext = HTMLCanvasElement.prototype.getContext;
	HTMLCanvasElement.prototype.getContext = function (contextId: string, options?: unknown) {
		const context = originalGetContext.call(this, contextId, options);

		if (contextId === "2d" && context) {
			const ctx = context as CanvasRenderingContext2D;
			const originalFillText = ctx.fillText;

			ctx.fillText = function (...args: Parameters<typeof ctx.fillText>) {
				// Add subtle noise to text rendering
				if (args[2]) args[2] += (Math.random() - 0.5) * 0.1;
				if (args[3]) args[3] += (Math.random() - 0.5) * 0.1;
				return originalFillText.apply(this, args);
			};
		}

		return context;
	};

	// Randomize WebGL fingerprint
	try {
		const canvas = document.createElement("canvas");
		const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		if (gl) {
			const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
			if (debugInfo) {
				// Override WebGL vendor/renderer
				Object.defineProperty(gl, "getParameter", {
					value: (param: number) => {
						if (param === debugInfo.UNMASKED_VENDOR_WEBGL) {
							return "Google Inc.";
						}
						if (param === debugInfo.UNMASKED_RENDERER_WEBGL) {
							return "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)";
						}
						// @ts-ignore
						return gl.getParameter(param);
					},
				});
			}
		}
	} catch {
		// Silent fail
	}
}

// ============================================
// HIDE FROM EXTENSION DETECTION
// ============================================
export function hideFromExtensions(): void {
	if (typeof window === "undefined") return;

	// Hide from Wappalyzer extension
	// @ts-ignore
	window.wappalyzer = undefined;
	// @ts-ignore
	window.Wappalyzer = undefined;

	// Hide from BuiltWith
	// @ts-ignore
	window.BuiltWith = undefined;
	// @ts-ignore
	window.builtwith = undefined;

	// Hide from similar tools
	// @ts-ignore
	window.technologies = undefined;
	// @ts-ignore
	window.Technologies = undefined;
	// @ts-ignore
	window.detected = undefined;
}

// ============================================
// OBFUSCATE SCRIPT SOURCES
// ============================================
export function obfuscateScriptSources(): void {
	if (typeof document === "undefined") return;

	// Observe and modify script tags
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node instanceof HTMLScriptElement) {
					// Remove src attributes that reveal technology
					if (node.src) {
						const src = node.src.toLowerCase();
						if (
							src.includes("react") ||
							src.includes("vue") ||
							src.includes("angular") ||
							src.includes("vite") ||
							src.includes("next")
						) {
							// Replace with generic name
							const newSrc = src.replace(/[^/]+$/, "app.js");
							node.src = newSrc;
						}
					}
				}
			});
		});
	});

	observer.observe(document.head, { childList: true, subtree: true });
}

// ============================================
// GENERIC ERROR MESSAGES
// ============================================
export function genericErrorMessages(): void {
	if (typeof window === "undefined") return;

	// Override default error handler
	window.onerror = (msg, url, line, col, error) => {
		// Log to your own system, not console
		return true; // Prevent default error display
	};

	window.onunhandledrejection = (event) => {
		event.preventDefault();
	};
}

// ============================================
// REMOVE SOURCE MAPS
// ============================================
export function removeSourceMapReferences(): void {
	if (typeof document === "undefined") return;

	// Remove source map comments from scripts
	const scripts = document.querySelectorAll("script");
	scripts.forEach((script) => {
		if (script.textContent) {
			script.textContent = script.textContent.replace(/\/\/# sourceMappingURL=.+\n?/g, "");
		}
	});
}

// ============================================
// MAIN ANTI-DETECTION INIT
// ============================================
export function initAntiDetection(): void {
	if (typeof window === "undefined") return;

	// Run immediately
	removeTechnologySignatures();
	spoofNavigator();
	hideConsoleSignatures();
	hideFromExtensions();
	genericErrorMessages();

	// Run after DOM ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			randomizeFingerprint();
			obfuscateScriptSources();
			removeSourceMapReferences();
		});
	} else {
		randomizeFingerprint();
		obfuscateScriptSources();
		removeSourceMapReferences();
	}

	// Periodic cleanup
	setInterval(() => {
		removeTechnologySignatures();
		hideFromExtensions();
	}, 5000);
}

export default initAntiDetection;
