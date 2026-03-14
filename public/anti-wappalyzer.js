/**
 * MBA Laundry Express - Anti-Wappalyzer Defense
 * Script untuk memblokir Wappalyzer extension secara aktif
 */

(function() {
	'use strict';
	
	// Jalankan segera
	const defenseStart = Date.now();
	
	// ============================================
	// 1. DETEKSI DAN HAPUS ELEMEN WAPPALYZER
	// ============================================
	
	function removeWappalyzerElements() {
		// Hapus semua elemen yang ditambahkan Wappalyzer
		const selectors = [
			'[class*="wappalyzer"]',
			'[id*="wappalyzer"]',
			'[data-wappalyzer]',
			'script[src*="wappalyzer"]',
			'link[href*="wappalyzer"]',
			'iframe[src*="wappalyzer"]',
		];
		
		selectors.forEach(selector => {
			document.querySelectorAll(selector).forEach(el => {
				try {
					el.remove();
				} catch(e) {}
			});
		});
	}
	
	// Jalankan segera dan terus-menerus
	removeWappalyzerElements();
	setInterval(removeWappalyzerElements, 50);
	
	// ============================================
	// 2. OVERRIDE DETEKSI WAPPALYZER
	// ============================================
	
	// Simpan referensi asli
	const originalFetch = window.fetch;
	const originalXHR = window.XMLHttpRequest;
	const originalOpen = originalXHR.prototype.open;
	
	// Blokir request ke server Wappalyzer
	window.fetch = function(url, options) {
		const urlStr = String(url);
		if (urlStr.includes('wappalyzer') || 
			urlStr.includes('builtwith') ||
			urlStr.includes('whatruns')) {
			return Promise.reject(new Error('Blocked'));
		}
		return originalFetch.apply(this, arguments);
	};
	
	// Blokir XHR ke server deteksi
	originalXHR.prototype.open = function(method, url) {
		const urlStr = String(url);
		if (urlStr.includes('wappalyzer') || 
			urlStr.includes('builtwith') ||
			urlStr.includes('whatruns')) {
			throw new Error('Blocked');
		}
		return originalOpen.apply(this, arguments);
	};
	
	// ============================================
	// 3. POISON TECHNOLOGY DATABASE
	// ============================================
	
	// Buat fake technology signatures
	const fakeSignatures = {
		// Fake React markers
		'__REACT_DEVTOOLS_GLOBAL_HOOK__': { 
			renderers: new Map(),
			supportsFiber: false,
			inject: function() {},
			onCommitFiberRoot: function() {},
			onCommitFiberUnmount: function() {},
		},
		
		// Fake Vue
		'__VUE__': false,
		'Vue': undefined,
		
		// Fake Angular
		'angular': undefined,
		'ng': undefined,
		
		// Fake jQuery (buat Wappalyzer bingung)
		'jQuery': { fn: { jquery: '1.6.0' } },
		'$': { fn: { jquery: '1.6.0' } },
	};
	
	// Inject fake signatures
	Object.keys(fakeSignatures).forEach(key => {
		try {
			Object.defineProperty(window, key, {
				get: function() { return fakeSignatures[key]; },
				set: function() {},
				configurable: false
			});
		} catch(e) {}
	});
	
	// ============================================
	// 4. OVERRIDE DOMParser (Wappalyzer menggunakannya)
	// ============================================
	
	const originalDOMParser = window.DOMParser;
	window.DOMParser = function() {
		const parser = new originalDOMParser();
		const originalParseFromString = parser.parseFromString;
		
		parser.parseFromString = function(string, type) {
			// Hapus signature dari string sebelum diparse
			let cleanString = string
				.replace(/data-react[^\s>]*/gi, '')
				.replace(/data-vite[^\s>]*/gi, '')
				.replace(/__vite[^\s>]*/gi, '')
				.replace(/ng-/gi, '')
				.replace(/v-/gi, '');
			
			return originalParseFromString.call(this, cleanString, type);
		};
		
		return parser;
	};
	
	// ============================================
	// 5. OVERRIDE document.documentElement.innerHTML
	// ============================================
	
	// Wappalyzer sering membaca innerHTML untuk analisis
	const originalInnerHTMLGetter = Object.getOwnPropertyDescriptor(
		HTMLElement.prototype, 'innerHTML'
	).get;
	
	Object.defineProperty(HTMLElement.prototype, 'innerHTML', {
		get: function() {
			let html = originalInnerHTMLGetter.call(this);
			
			// Hapus signature dari HTML
			html = html
				.replace(/data-react[^\s>"']*/gi, '')
				.replace(/data-vite[^\s>"']*/gi, '')
				.replace(/__vite[^\s>"']*/gi, '')
				.replace(/ng-/gi, '')
				.replace(/v-/gi, '')
				.replace(/class="[^"]*react[^"]*"/gi, '')
				.replace(/class="[^"]*vue[^"]*"/gi, '');
			
			return html;
		},
		set: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML').set,
		configurable: true
	});
	
	// ============================================
	// 6. OVERRIDE PerformanceObserver (Wappalyzer menggunakannya)
	// ============================================
	
	const originalPerformanceObserver = window.PerformanceObserver;
	window.PerformanceObserver = function(callback) {
		// Wrap callback untuk filter data
		const wrappedCallback = function(list, observer) {
			// Filter entries yang mengandung signature
			const entries = list.getEntries();
			const filteredEntries = entries.filter(entry => {
				const name = entry.name || '';
				return !name.includes('react') && 
					   !name.includes('vite') && 
					   !name.includes('vue') &&
					   !name.includes('angular');
			});
			
			// Buat fake list object
			const fakeList = {
				getEntries: () => filteredEntries,
				getEntriesByType: list.getEntriesByType,
				getEntriesByName: list.getEntriesByName,
			};
			
			return callback(fakeList, observer);
		};
		
		return new originalPerformanceObserver(wrappedCallback);
	};
	
	// ============================================
	// 7. OVERRIDE MutationObserver (Wappalyzer menggunakannya)
	// ============================================
	
	const originalMutationObserver = window.MutationObserver;
	window.MutationObserver = function(callback) {
		const wrappedCallback = function(mutations, observer) {
			// Filter mutations yang mengandung signature Wappalyzer
			const filteredMutations = mutations.filter(mutation => {
				const target = mutation.target;
				if (target instanceof HTMLElement) {
					const html = target.outerHTML || '';
					return !html.includes('wappalyzer');
				}
				return true;
			});
			
			return callback(filteredMutations, observer);
		};
		
		return new originalMutationObserver(wrappedCallback);
	};
	
	// ============================================
	// 8. BUAT NOISE UNTUK MENGGANGGU ANALISIS
	// ============================================
	
	// Tambahkan fake script tags
	function addFakeScripts() {
		const fakeScripts = [
			{ src: '/jquery.min.js', content: '/* jQuery v1.6.0 */' },
			{ src: '/bootstrap.js', content: '/* Bootstrap */' },
			{ src: '/legacy.js', content: '/* Legacy code */' },
		];
		
		fakeScripts.forEach(script => {
			const el = document.createElement('script');
			el.src = script.src;
			el.textContent = script.content;
			el.setAttribute('data-fake', 'true');
			document.head.appendChild(el);
		});
	}
	
	// Tambahkan fake meta tags
	function addFakeMeta() {
		const meta = document.createElement('meta');
		meta.name = 'generator';
		meta.content = 'WordPress 5.0';
		document.head.appendChild(meta);
		
		const meta2 = document.createElement('meta');
		meta2.name = 'framework';
		meta2.content = 'jQuery';
		document.head.appendChild(meta2);
	}
	
	// Jalankan setelah DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			addFakeScripts();
			addFakeMeta();
		});
	} else {
		addFakeScripts();
		addFakeMeta();
	}
	
	// ============================================
	// 9. PROTEKSI BERKALA
	// ============================================
	
	setInterval(() => {
		// Hapus semua global Wappalyzer
		delete window.wappalyzer;
		delete window.Wappalyzer;
		delete window.BuiltWith;
		delete window.builtwith;
		delete window.whatruns;
		delete window.WhatRuns;
		
		// Clear console
		console.clear();
	}, 100);
	
	// ============================================
	// 10. DETEKSI JIKA WAPPALYZER AKTIF
	// ============================================
	
	// Cek jika Wappalyzer menambahkan elemen
	const checkWappalyzer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node instanceof HTMLElement) {
					// Jika Wappalyzer menambahkan elemen, hapus segera
					if (node.className && node.className.includes && 
						(node.className.includes('wappalyzer') || 
						 node.id.includes('wappalyzer'))) {
						node.remove();
					}
				}
			});
		});
	});
	
	checkWappalyzer.observe(document.documentElement, {
		childList: true,
		subtree: true
	});
	
	console.log('Anti-Wappalyzer defense active in', (Date.now() - defenseStart), 'ms');
})();
