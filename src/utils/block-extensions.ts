/**
 * MBA Laundry Express - Block Extension Detection
 * Mendeteksi dan memblokir extension Wappalyzer, BuiltWith, dll
 */

// ============================================
// DETECT EXTENSION PRESENCE
// ============================================
export function detectExtensions(): string[] {
	const detected: string[] = [];
	
	if (typeof window === 'undefined') return detected;
	
	// Check for Wappalyzer
	// @ts-ignore
	if (window.wappalyzer || window.Wappalyzer) {
		detected.push('Wappalyzer');
	}
	
	// Check for BuiltWith
	// @ts-ignore
	if (window.BuiltWith || window.builtwith) {
		detected.push('BuiltWith');
	}
	
	// Check for WhatRuns
	// @ts-ignore
	if (window.whatruns || window.WhatRuns) {
		detected.push('WhatRuns');
	}
	
	// Check for SimilarTech
	// @ts-ignore
	if (window.SimilarTech || window.similartech) {
		detected.push('SimilarTech');
	}
	
	// Check for Ghostery
	// @ts-ignore
	if (window.ghostery || window.Ghostery) {
		detected.push('Ghostery');
	}
	
	// Check for Privacy Badger
	// @ts-ignore
	if (window.privacyBadger || window.PrivacyBadger) {
		detected.push('Privacy Badger');
	}
	
	// Check for uBlock Origin (partial detection)
	// @ts-ignore
	if (window.ublock || window.uBlock) {
		detected.push('uBlock Origin');
	}
	
	return detected;
}

// ============================================
// BLOCK EXTENSION BY BEHAVIOR
// ============================================
export function blockExtensionBehavior(): void {
	if (typeof window === 'undefined') return;
	
	// Monitor for extension DOM modifications
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			// Check for extension-added elements
			mutation.addedNodes.forEach((node) => {
				if (node instanceof HTMLElement) {
					// Check for common extension class names/IDs
					const extensionIndicators = [
						'wappalyzer',
						'builtwith',
						'whatruns',
						'ghostery',
						'ublock',
						'adblock',
						'privacy-badger',
					];
					
					const html = node.outerHTML?.toLowerCase() || '';
					if (extensionIndicators.some(indicator => html.includes(indicator))) {
						// Remove the element
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
}

// ============================================
// POISON TECHNOLOGY DETECTION
// ============================================
export function poisonTechnologyDetection(): void {
	if (typeof window === 'undefined') return;
	
	// Override common detection methods
	
	// 1. Override React detection
	const originalCreateElement = document.createElement;
	document.createElement = function(tagName: string, options?: ElementCreationOptions) {
		const element = originalCreateElement.call(document, tagName, options);
		
		// Remove React data attributes
		if (element instanceof HTMLElement) {
			setTimeout(() => {
				const attributes = element.attributes;
				for (let i = attributes.length - 1; i >= 0; i--) {
					const attr = attributes[i];
					if (attr.name.startsWith('data-react') || attr.name.startsWith('data-vite')) {
						element.removeAttribute(attr.name);
					}
				}
			}, 0);
		}
		
		return element;
	};
	
	// 2. Override script loading detection
	const originalAppendChild = Element.prototype.appendChild;
	Element.prototype.appendChild = function<T extends Node>(node: T): T {
		if (node instanceof HTMLScriptElement) {
			// Obfuscate script src
			if (node.src) {
				Object.defineProperty(node, 'src', {
					get: () => '/app.js',
					configurable: true,
				});
			}
		}
		return originalAppendChild.call(this, node);
	};
	
	// 3. Override fetch to hide API calls
	const originalFetch = window.fetch;
	window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
		// Hide PocketBase/Vercel URLs
		if (typeof input === 'string') {
			const url = input.replace(/pocketbase|vercel|pb-api/gi, 'api');
			return originalFetch.call(window, url, init);
		}
		return originalFetch.call(window, input, init);
	};
}

// ============================================
// RANDOMIZE PAGE SIGNATURES
// ============================================
export function randomizePageSignatures(): void {
	if (typeof document === 'undefined') return;
	
	// Change doctype randomly (valid HTML5 variations)
	const doctypes = [
		'<!DOCTYPE html>',
		'<!DOCTYPE HTML>',
		'<!doctype html>',
	];
	
	// Randomize HTML attributes
	document.documentElement.setAttribute('lang', ['id', 'en', ''][Math.floor(Math.random() * 3)]);
	
	// Add random comments to confuse parsers
	const comments = [
		'<!-- Powered by Generic CMS -->',
		'<!-- Generated with Static Site Generator -->',
		'<!-- Build: ' + Math.random().toString(36).substring(7) + ' -->',
	];
	
	// Insert random comment
	const comment = document.createComment(comments[Math.floor(Math.random() * comments.length)]);
	document.head.insertBefore(comment, document.head.firstChild);
}

// ============================================
// DETECT AND BLOCK CHROME EXTENSIONS
// ============================================
export function detectChromeExtensions(): void {
	if (typeof window === 'undefined') return;
	if (!window.chrome?.runtime?.sendMessage) return;
	
	// Try to detect extensions by sending messages to known extension IDs
	const extensionIds = [
		'gppongmhjkpfnbhagpmjfkannfbllamg', // Wappalyzer
		'ekhagpcjgfckcibpmipkmdofkemcibee', // BuiltWith
		'cjbejifjhnhgpjmjbhgegnhdhdmggbm', // WhatRuns
	];
	
	extensionIds.forEach(id => {
		try {
			// @ts-ignore
			window.chrome.runtime.sendMessage(id, { ping: true }, () => {
				if (!window.chrome?.runtime?.lastError) {
					// Extension detected - take action
					console.clear();
				}
			});
		} catch {
			// Ignore errors
		}
	});
}

// ============================================
// MAIN BLOCKER
// ============================================
export function initExtensionBlocker(): void {
	if (typeof window === 'undefined') return;
	
	// Immediate checks
	const detected = detectExtensions();
	if (detected.length > 0) {
		console.log('Extension detected:', detected);
		
		// Clear console to hide our logs
		setInterval(() => {
			console.clear();
		}, 100);
	}
	
	// Apply protections
	blockExtensionBehavior();
	poisonTechnologyDetection();
	randomizePageSignatures();
	detectChromeExtensions();
	
	// Continuous protection
	setInterval(() => {
		// Remove extension-added elements
		document.querySelectorAll('[class*="wappalyzer"], [id*="wappalyzer"]').forEach(el => el.remove());
		document.querySelectorAll('[class*="builtwith"], [id*="builtwith"]').forEach(el => el.remove());
		
		// Clear extension data
		// @ts-ignore
		delete window.wappalyzer;
		// @ts-ignore
		delete window.Wappalyzer;
		// @ts-ignore
		delete window.BuiltWith;
		// @ts-ignore
		delete window.builtwith;
	}, 500);
}

export default initExtensionBlocker;
