import { useEffect, useRef } from "react";
import { useBranding } from "@/hooks/useBranding";

export function AdminFavicon() {
	const { data: branding } = useBranding();
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!branding?.favicon_url) return;

		const updateFavicon = () => {
			const timestamp = Date.now();
			const faviconUrl = `${branding.favicon_url}?t=${timestamp}`;
			
			// Remove all existing favicon links
			document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());

			// Create and append new favicon
			const link = document.createElement("link");
			link.rel = "icon";
			link.type = "image/x-icon";
			link.href = faviconUrl;
			document.head.appendChild(link);
		};

		// Update immediately
		updateFavicon();

		// Update every 2 seconds for 10 seconds to ensure it sticks
		intervalRef.current = setInterval(updateFavicon, 2000);
		
		setTimeout(() => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		}, 10000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [branding?.favicon_url]);

	return null;
}
