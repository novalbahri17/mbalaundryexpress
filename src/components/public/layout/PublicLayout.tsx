import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AutoTranslate } from "@/components/public/layout/AutoTranslate";
import { BottomNav } from "@/components/public/layout/BottomNav";
import { DynamicFavicon } from "@/components/public/layout/DynamicFavicon";
import { FloatingWA } from "@/components/public/layout/FloatingWA";
import { Footer } from "@/components/public/layout/Footer";
import { Navbar } from "@/components/public/layout/Navbar";
import { PublicSeo } from "@/components/public/layout/PublicSeo";
import { ToastContainer } from "@/design-system";
import { usePageContentMap } from "@/hooks/usePageContent";
import { usePublicText } from "@/hooks/usePublicText";
import { useSiteSettingsMap } from "@/hooks/useSiteSettings";
import { useLocaleStore } from "@/store/localeStore";
import { normalizeHexColor } from "@/utils/validation";

function ScrollProgress() {
	const progressRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const updateProgress = () => {
			if (!progressRef.current) return;
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
			progressRef.current.style.width = `${scrollPercent}%`;
		};

		updateProgress();
		window.addEventListener("scroll", updateProgress, { passive: true });
		return () => window.removeEventListener("scroll", updateProgress);
	}, []);

	return <div ref={progressRef} className="scroll-progress" />;
}

export function PublicLayout() {
	const { data: content = {} } = usePageContentMap();
	const { data: siteSettings = {} } = useSiteSettingsMap();
	// Saat bahasa diganti, seluruh pohon halaman di-mount ulang supaya tidak ada
	// sisa teks lama (Indonesia) yang tertinggal di DOM.
	const locale = useLocaleStore((state) => state.locale);
	const location = useLocation();
	const text = usePublicText();

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

	// Sengaja bergantung pada `location.pathname`: tiap pindah halaman kita
	// ingin halaman kembali ke atas. Dipakai lewat `void` agar biome mengerti.
	const pathname = location.pathname;
	useEffect(() => {
		void pathname;
		window.scrollTo({ top: 0, behavior: "auto" });
	}, [pathname]);

	return (
		<div
			style={publicStyle}
			className="relative min-h-screen overflow-x-hidden bg-[var(--landing-bg-light)] text-[var(--text-main)] dark:bg-[var(--landing-bg-dark)]"
		>
			<AutoTranslate />
			<PublicSeo />
			<DynamicFavicon />
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-lg focus:bg-sapphire-700 focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
			>
				{text.common.skipToContent}
			</a>
			<ScrollProgress />
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
						<Outlet key={locale} />
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
