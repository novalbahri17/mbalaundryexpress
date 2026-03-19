import { useEffect, useCallback } from "react";
import { useBranding } from "@/hooks/useBranding";

export function AdminFavicon() {
	const { data: branding } = useBranding();

	const updateFavicon = useCallback(() => {
		if (!branding) return;

		// Store branding in localStorage for access from other components
		localStorage.setItem("branding_settings", JSON.stringify(branding));

		const timestamp = Date.now();
		const faviconUrl = branding.favicon_url || branding.logo_url || "/favicon.ico";
		const faviconWithTimestamp = `${faviconUrl}?t=${timestamp}`;

		// Remove all existing favicon links
		document.querySelectorAll("link[rel*='icon']").forEach((el) => el.remove());

		// Create and append new favicon links
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

		// Update title
		if (branding.site_title) {
			document.title = `${branding.site_title} - Admin`;
		}

		console.log("[AdminFavicon] Updated:", faviconWithTimestamp);
	}, [branding]);

	useEffect(() => {
		updateFavicon();
	}, [updateFavicon]);

	// Update every 3 seconds for 15 seconds to ensure it sticks
	useEffect(() => {
		if (!branding) return;

		const interval = setInterval(updateFavicon, 3000);

		setTimeout(() => {
			clearInterval(interval);
		}, 15000);

		return () => clearInterval(interval);
	}, [branding, updateFavicon]);

	return null;
}
