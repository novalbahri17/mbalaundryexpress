import { useEffect } from "react";
import { useBranding } from "@/hooks/useBranding";

export function DynamicFavicon() {
	const { data: branding } = useBranding();

	useEffect(() => {
		if (!branding) return;

		// Update favicon
		const faviconUrl = branding.favicon_url || "/favicon.ico";
		
		// Find existing favicon link
		let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
		
		if (!link) {
			// Create new favicon link
			link = document.createElement("link");
			link.rel = "icon";
			document.head.appendChild(link);
		}
		
		link.href = faviconUrl;

		// Update apple touch icon
		let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
		if (!appleLink) {
			appleLink = document.createElement("link");
			appleLink.rel = "apple-touch-icon";
			document.head.appendChild(appleLink);
		}
		appleLink.href = faviconUrl;

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
