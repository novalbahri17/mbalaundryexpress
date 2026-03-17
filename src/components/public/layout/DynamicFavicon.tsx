import { useEffect } from "react";
import { useBranding } from "@/hooks/useBranding";

export function DynamicFavicon() {
	const { data: branding } = useBranding();

	useEffect(() => {
		if (!branding) {
			console.log("[DynamicFavicon] No branding data");
			return;
		}

		console.log("[DynamicFavicon] Updating favicon with:", branding.favicon_url);

		// Add timestamp to bust cache
		const timestamp = Date.now();
		const faviconUrl = branding.favicon_url 
			? `${branding.favicon_url}?t=${timestamp}` 
			: `/favicon.ico?t=${timestamp}`;
		
		console.log("[DynamicFavicon] Final favicon URL:", faviconUrl);

		// Remove ALL existing favicon links
		const selectors = [
			"link[rel='icon']",
			"link[rel='shortcut icon']", 
			"link[rel='apple-touch-icon']",
			"link[rel='apple-touch-icon-precomposed']"
		];
		
		selectors.forEach(selector => {
			const elements = document.querySelectorAll(selector);
			elements.forEach(el => {
				console.log("[DynamicFavicon] Removing:", selector);
				el.remove();
			});
		});

		// Create new favicon link - try different approaches
		// Approach 1: Standard favicon
		const link = document.createElement("link");
		link.rel = "icon";
		link.href = faviconUrl;
		document.head.appendChild(link);
		console.log("[DynamicFavicon] Added icon link");

		// Approach 2: Shortcut icon
		const shortcutLink = document.createElement("link");
		shortcutLink.rel = "shortcut icon";
		shortcutLink.href = faviconUrl;
		document.head.appendChild(shortcutLink);
		console.log("[DynamicFavicon] Added shortcut icon link");

		// Approach 3: Apple touch icon
		const appleLink = document.createElement("link");
		appleLink.rel = "apple-touch-icon";
		appleLink.href = faviconUrl;
		document.head.appendChild(appleLink);
		console.log("[DynamicFavicon] Added apple-touch-icon link");

		// Force browser to notice the change
		const forceUpdate = document.createElement("link");
		forceUpdate.rel = "icon";
		forceUpdate.type = "image/png";
		forceUpdate.href = faviconUrl;
		document.head.appendChild(forceUpdate);

		// Update site title
		if (branding.site_title) {
			document.title = branding.site_title;
			console.log("[DynamicFavicon] Updated title:", branding.site_title);
		}

		// Update meta description
		let metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement;
		if (!metaDesc) {
			metaDesc = document.createElement("meta");
			metaDesc.name = "description";
			document.head.appendChild(metaDesc);
		}
		if (branding.site_description) {
			metaDesc.content = branding.site_description;
		}

	}, [branding]);

	return null;
}
