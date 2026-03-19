import { useEffect, useCallback } from "react";
import { useBranding } from "@/hooks/useBranding";

// Global function to update favicon - can be called from anywhere
export function updateFavicon() {
	// Get current branding from localStorage
	const storedBranding = localStorage.getItem("branding_settings");
	let faviconUrl = "/favicon.ico";
	let siteTitle = "MBA Laundry Express";

	if (storedBranding) {
		try {
			const branding = JSON.parse(storedBranding);
			faviconUrl = branding.favicon_url || branding.logo_url || "/favicon.ico";
			siteTitle = branding.site_title || "MBA Laundry Express";
		} catch {
			// Ignore parse error
		}
	}

	const timestamp = Date.now();
	const faviconWithTimestamp = `${faviconUrl}?t=${timestamp}`;

	// Remove all existing favicon links
	document.querySelectorAll("link[rel*='icon']").forEach((el) => el.remove());

	// Add new favicon links with cache-busting
	const links = [
		{ rel: "icon", type: "image/x-icon" },
		{ rel: "shortcut icon", type: "image/x-icon" },
		{ rel: "apple-touch-icon", type: "image/png" },
	];

	links.forEach(({ rel, type }) => {
		const link = document.createElement("link");
		link.rel = rel;
		link.type = type;
		link.href = faviconWithTimestamp;
		document.head.appendChild(link);
	});

	// Update page title
	document.title = siteTitle;

	// Update meta description
	const stored = localStorage.getItem("branding_settings");
	if (stored) {
		try {
			const branding = JSON.parse(stored);
			if (branding.site_description) {
				let metaDesc = document.querySelector('meta[name="description"]');
				if (!metaDesc) {
					metaDesc = document.createElement("meta");
					metaDesc.setAttribute("name", "description");
					document.head.appendChild(metaDesc);
				}
				metaDesc.setAttribute("content", branding.site_description);
			}
		} catch {
			// Ignore
		}
	}

	console.log("[DynamicFavicon] Favicon updated:", faviconWithTimestamp);
}

export function DynamicFavicon() {
	const { data: branding } = useBranding();

	const applyFavicon = useCallback(() => {
		if (!branding) return;

		// Store in localStorage for access from updateFavicon function
		localStorage.setItem("branding_settings", JSON.stringify(branding));

		const timestamp = Date.now();
		const faviconUrl = branding.favicon_url || branding.logo_url || "/favicon.ico";
		const faviconWithTimestamp = `${faviconUrl}?t=${timestamp}`;

		// Remove existing favicon links
		document.querySelectorAll("link[rel*='icon']").forEach((el) => el.remove());

		// Add new favicon links
		const links = [
			{ rel: "icon", type: "image/x-icon" },
			{ rel: "shortcut icon", type: "image/x-icon" },
			{ rel: "apple-touch-icon", type: "image/png" },
		];

		links.forEach(({ rel, type }) => {
			const link = document.createElement("link");
			link.rel = rel;
			link.type = type;
			link.href = faviconWithTimestamp;
			document.head.appendChild(link);
		});

		// Update page title
		if (branding.site_title) {
			document.title = branding.site_title;
		}

		// Update meta description
		if (branding.site_description) {
			let metaDesc = document.querySelector('meta[name="description"]');
			if (!metaDesc) {
				metaDesc = document.createElement("meta");
				metaDesc.setAttribute("name", "description");
				document.head.appendChild(metaDesc);
			}
			metaDesc.setAttribute("content", branding.site_description);
		}

		console.log("[DynamicFavicon] Applied favicon:", faviconWithTimestamp);
	}, [branding]);

	useEffect(() => {
		applyFavicon();
	}, [applyFavicon]);

	// Also update favicon periodically to ensure it sticks
	useEffect(() => {
		if (!branding) return;

		const interval = setInterval(() => {
			applyFavicon();
		}, 3000);

		// Stop after 15 seconds
		setTimeout(() => {
			clearInterval(interval);
		}, 15000);

		return () => clearInterval(interval);
	}, [branding, applyFavicon]);

	return null;
}
