import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/public/layout/BottomNav";
import { FloatingWA } from "@/components/public/layout/FloatingWA";
import { Footer } from "@/components/public/layout/Footer";
import { Navbar } from "@/components/public/layout/Navbar";
import { PublicSeo } from "@/components/public/layout/PublicSeo";
import { usePageContentMap } from "@/hooks/usePageContent";
import { useSiteSettingsMap } from "@/hooks/useSiteSettings";
import { normalizeHexColor } from "@/utils/validation";
import { ToastContainer } from "@/design-system";

function ScrollProgress() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let frameId = 0;
		const onScroll = () => {
			if (frameId) return;
			frameId = window.requestAnimationFrame(() => {
				const top = window.scrollY;
				const height = document.documentElement.scrollHeight - window.innerHeight;
				setProgress(height > 0 ? (top / height) * 100 : 0);
				frameId = 0;
			});
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			if (frameId) window.cancelAnimationFrame(frameId);
		};
	}, []);

	return <span className="scroll-progress" style={{ width: `${progress}%` }} />;
}

function CursorFollower() {
	const nodeRef = useRef<HTMLSpanElement | null>(null);

	useEffect(() => {
		const node = nodeRef.current;
		if (!node) return;

		let frameId = 0;
		let latestX = 0;
		let latestY = 0;

		const render = () => {
			node.style.left = `${latestX}px`;
			node.style.top = `${latestY}px`;
			frameId = 0;
		};

		const onMove = (event: MouseEvent) => {
			latestX = event.clientX;
			latestY = event.clientY;
			if (!frameId) {
				frameId = window.requestAnimationFrame(render);
			}
		};

		window.addEventListener("mousemove", onMove, { passive: true });
		return () => {
			window.removeEventListener("mousemove", onMove);
			if (frameId) window.cancelAnimationFrame(frameId);
		};
	}, []);

	return <span ref={nodeRef} className="custom-cursor" />;
}

export function PublicLayout() {
	const { data: content = {} } = usePageContentMap();
	const { data: siteSettings = {} } = useSiteSettingsMap();
	const location = useLocation();

	const landingBgLight = normalizeHexColor(
		content.landing_bg_color_light ?? siteSettings.landing_bg_color_light,
		"#FAFAFA",
	);
	const landingBgDark = normalizeHexColor(
		content.landing_bg_color_dark ?? siteSettings.landing_bg_color_dark,
		"#0A0A0F",
	);

	const publicStyle = useMemo(
		() =>
			({
				"--landing-bg-light": landingBgLight,
				"--landing-bg-dark": landingBgDark,
			}) as CSSProperties,
		[landingBgDark, landingBgLight],
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "auto" });
	}, [location.pathname]);

	return (
		<div
			style={publicStyle}
			className="relative min-h-screen bg-[var(--landing-bg-light)] text-[var(--text-main)] dark:bg-[var(--landing-bg-dark)]"
		>
			<PublicSeo />
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-lg focus:bg-sapphire-700 focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
			>
				Skip to content
			</a>
			<ScrollProgress />
			<CursorFollower />
			<Navbar whatsapp={content.whatsapp_cs} />
			<main id="main-content" className="flex-1">
				<AnimatePresence mode="wait">
					<motion.div
						key={location.pathname}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.22, ease: "easeOut" }}
					>
						<Outlet />
					</motion.div>
				</AnimatePresence>
			</main>
			<Footer />
			<FloatingWA phone={content.whatsapp_cs} />
			<BottomNav />
			<ToastContainer position="top-right" />
		</div>
	);
}
