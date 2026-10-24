/**
 * MBA Laundry Express - Security Provider
 * Wraps the app with security features
 */

import { type ReactNode, useEffect } from "react";
import { useAntiDetection } from "@/hooks/useAntiDetection";
import { useBotDetection, useClickjackingProtection, useDevtoolsDetection } from "@/hooks/useSecurity";

interface SecurityProviderProps {
	children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
	// Anti-detection (Wappalyzer, BuiltWith, etc)
	useAntiDetection();

	// Apply clickjacking protection
	useClickjackingProtection();

	// Detect devtools
	useDevtoolsDetection(() => {
		console.clear();
		console.log("%cStop!", "color: red; font-size: 50px; font-weight: bold;");
		console.log("%cThis is a browser feature intended for developers.", "font-size: 16px;");
	});

	// Detect bots
	const isBot = useBotDetection();

	useEffect(() => {
		// Disable right-click on production
		if (import.meta.env.PROD) {
			const disableContextMenu = (e: MouseEvent) => {
				// Allow on form elements
				const target = e.target as HTMLElement;
				if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
					return;
				}
				e.preventDefault();
			};

			document.addEventListener("contextmenu", disableContextMenu);

			return () => {
				document.removeEventListener("contextmenu", disableContextMenu);
			};
		}
	}, []);

	useEffect(() => {
		// Disable keyboard shortcuts for devtools
		const disableDevTools = (e: KeyboardEvent) => {
			// F12
			if (e.key === "F12") {
				e.preventDefault();
			}

			// Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
			if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) {
				e.preventDefault();
			}

			// Ctrl+U (view source)
			if (e.ctrlKey && e.key === "u") {
				e.preventDefault();
			}
		};

		document.addEventListener("keydown", disableDevTools);

		return () => {
			document.removeEventListener("keydown", disableDevTools);
		};
	}, []);

	if (isBot) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4 text-center">
				<div>
					<h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
					<p className="mt-2 text-neutral-600">Automated access detected.</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
