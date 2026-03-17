import { useEffect } from "react";
import { useBranding } from "@/hooks/useBranding";

export function DynamicFavicon() {
	const { data: branding } = useBranding();

	useEffect(() => {
		if (!branding) return;

		// Add timestamp to bust cache
		const timestamp = Date.now();
		const faviconUrl = branding.favicon_url 
			? `${branding.favicon_url}?t=${timestamp}` 
			: `/favicon.ico?t=${timestamp}`;
		
		// Remove existing favicon links
		const existingIcons = document.querySelectorAll("link[rel*='icon']");
		existingIcons.forEach(el => el.remove());

		// Create new favicon link
		const link = document.createElement("link");
		link.rel = "icon";
		link.type = "image/x-icon";
		link.href = faviconUrl;
		document.head.appendChild(link);

		// Create shortcut icon
		const shortcutLink = document.createElement("link");
		shortcutLink.rel = "shortcut icon";
		shortcutLink.type = "image/x-icon";
		shortcutLink.href = faviconUrl;
		document.head.appendChild(shortcutLink);

		// Update apple touch icon
		const existingApple = document.querySelector("link[rel='apple-touch-icon']");
		if (existingApple) existingApple.remove();
		
		const appleLink = document.createElement("link");
		appleLink.rel = "apple-touch-icon";
		appleLink.href = faviconUrl;
		document.head.appendChild(appleLink);

		// Update site title
		if (branding.site_title) {
			document.title = branding.site_title;
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
