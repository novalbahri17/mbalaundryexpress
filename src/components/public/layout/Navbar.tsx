import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, MessageCircle, Moon, Sun, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { DynamicLogo } from "@/components/public/layout/DynamicLogo";

import { useLocaleStore } from "@/store/localeStore";
import { useThemeStore } from "@/store/themeStore";
import { usePageContentMap } from "@/hooks/usePageContent";
import { usePublicText } from "@/hooks/usePublicText";
import { toWhatsappLink } from "@/utils/format";
import { cn } from "@/utils/index";

type NavbarProps = {
	whatsapp?: string;
};

type NavItem = {
	to: string;
	label: string;
	end?: boolean;
};

export function Navbar({ whatsapp }: NavbarProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);

	const location = useLocation();
	const isHome = location.pathname === "/";

	const locale = useLocaleStore((state) => state.locale);
	const setLocale = useLocaleStore((state) => state.setLocale);
	const mode = useThemeStore((state) => state.mode);
	const toggleMode = useThemeStore((state) => state.toggle);

	const text = usePublicText();
	const isDark = mode === "dark";

	const moreRef = useRef<HTMLDivElement | null>(null);

	const { data: pageContents = {} } = usePageContentMap();

	const activePrimaryItems = useMemo<NavItem[]>(() => {
		return [
			{ to: "/", label: text.nav.home, end: true },
			...(pageContents.module_cabang !== "false" ? [{ to: "/cabang", label: text.nav.branches }] : []),
			...(pageContents.module_promo !== "false" ? [{ to: "/promo", label: text.nav.promotions }] : []),
			...(pageContents.module_galeri !== "false" ? [{ to: "/galeri", label: text.nav.gallery }] : []),
			...(pageContents.module_harga !== "false" ? [{ to: "/harga", label: text.nav.pricing }] : []),
		];
	}, [pageContents, text.nav]);

	const activeSecondaryItems = useMemo<NavItem[]>(() => {
		return [
			...(pageContents.module_carapakai !== "false" ? [{ to: "/cara-pakai", label: text.nav.howItWorks }] : []),
			...(pageContents.module_blog !== "false" ? [{ to: "/blog", label: text.nav.blog }] : []),
			...(pageContents.module_loker !== "false" ? [{ to: "/karir", label: text.nav.careers }] : []),
			...(pageContents.module_kemitraan !== "false" ? [{ to: "/kemitraan", label: text.nav.partnership }] : []),
			...(pageContents.module_kontak !== "false" ? [{ to: "/kontak", label: text.nav.contact }] : []),
		];
	}, [pageContents, text.nav]);

	const ctaLink = useMemo(
		() => toWhatsappLink(whatsapp ?? "6281234567890", text.nav.waMessage),
		[whatsapp, text.nav.waMessage],
	);

	const secondaryActive = useMemo(
		() =>
			activeSecondaryItems.some((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)),
		[location.pathname, activeSecondaryItems],
	);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 40);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: deliberately running on route change
	useEffect(() => {
		setMobileOpen(false);
		setMoreOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	useEffect(() => {
		const onClickOutside = (event: MouseEvent) => {
			if (!moreRef.current) return;
			if (!moreRef.current.contains(event.target as Node)) {
				setMoreOpen(false);
			}
		};
		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, []);

	const navLinkClass = ({ isActive }: { isActive: boolean }) =>
		cn(
			"relative inline-flex min-h-[42px] items-center rounded-lg px-3 py-2 text-[13px] font-semibold transition",
			isActive
				? "bg-ruby-700 text-white hover:bg-ruby-800"
				: "text-neutral-700 hover:bg-neutral-100 hover:text-ruby-700 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-ruby-300",
		);

	const mobileMenu = (
		<AnimatePresence>
			{mobileOpen ? (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[70] bg-neutral-900/70 backdrop-blur-sm"
						onClick={() => setMobileOpen(false)}
					/>
					{/* Sidebar */}
					<motion.aside
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 24, stiffness: 220 }}
						className="fixed right-0 top-0 z-[71] flex h-full w-full max-w-[300px] flex-col border-l border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 sm:max-w-[340px] sm:p-5"
					>
						{/* Header */}
						<div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
							<DynamicLogo />
							<button
								type="button"
								onClick={() => setMobileOpen(false)}
								className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
								aria-label={text.nav.closeMenu}
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Controls */}
						<div className="mb-4 flex items-center gap-2">
							<button
								type="button"
								onClick={toggleMode}
								aria-label={isDark ? text.nav.lightMode : text.nav.darkMode}
								className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
							>
								{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							</button>
							<div className="flex h-11 items-center rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
								<button
									type="button"
									onClick={() => setLocale("id")}
									className={cn(
										"h-full min-w-[42px] rounded-lg px-2 text-xs font-bold",
										locale === "id"
											? "bg-[var(--brand)] text-[var(--brand-text)]"
											: "text-neutral-600 dark:text-neutral-300",
									)}
								>
									ID
								</button>
								<button
									type="button"
									onClick={() => setLocale("en")}
									className={cn(
										"h-full min-w-[42px] rounded-lg px-2 text-xs font-bold",
										locale === "en"
											? "bg-[var(--brand)] text-[var(--brand-text)]"
											: "text-neutral-600 dark:text-neutral-300",
									)}
								>
									EN
								</button>
							</div>
						</div>

						{/* Menu Items */}
						<div className="flex-1 space-y-1 overflow-y-auto py-2">
							{[...activePrimaryItems, ...activeSecondaryItems].map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									end={item.end}
									className={({ isActive }) =>
										cn(
											"group flex min-h-[48px] items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors",
											isActive
												? "bg-ruby-50 text-ruby-600 dark:bg-ruby-950/30 dark:text-ruby-400"
												: "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50",
										)
									}
								>
									<span>{item.label}</span>
									<ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
								</NavLink>
							))}
						</div>

						{/* CTA Button */}
						<div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
							<a
								href={ctaLink}
								target="_blank"
								rel="noopener noreferrer"
								className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ruby-500 px-4 text-sm font-semibold text-white shadow-lg shadow-ruby-500/25 transition hover:bg-ruby-600"
							>
								<MessageCircle className="h-4 w-4" />
								{text.nav.chatWa}
							</a>
						</div>
					</motion.aside>
				</>
			) : null}
		</AnimatePresence>
	);

	return (
		<>
			<header
				className={`fixed top-0 z-50 w-full border-b transition ${
					scrolled
						? "border-transparent bg-transparent"
						: isHome
							? "border-transparent bg-transparent"
							: "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
				}`}
			>
				<nav className="section-wrap flex h-[88px] items-center justify-between">
					<div
						className={cn(
							"relative flex h-[64px] w-full items-center justify-between rounded-2xl border px-3 lg:px-4",
							scrolled
								? "border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
								: "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950",
						)}
					>
						<span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-neutral-200 dark:bg-neutral-800" />
						<DynamicLogo />

						<div className="hidden items-center gap-1 xl:flex">
							{activePrimaryItems.map((item) => (
								<NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
									{item.label}
								</NavLink>
							))}

							<div className="relative" ref={moreRef}>
								<button
									type="button"
									onClick={() => setMoreOpen((state) => !state)}
									className={cn(
										"inline-flex min-h-[42px] items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition",
										secondaryActive || moreOpen
											? "bg-ruby-700 text-white"
											: "text-neutral-700 hover:bg-neutral-100 hover:text-ruby-700 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-ruby-300",
									)}
								>
									{text.nav.moreMenu}
									<ChevronDown className={cn("h-4 w-4 transition", moreOpen && "rotate-180")} />
								</button>

								<AnimatePresence>
									{moreOpen && activeSecondaryItems.length > 0 ? (
										<motion.div
											initial={{ opacity: 0, y: 8, scale: 0.98 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 8, scale: 0.98 }}
											className="absolute right-0 top-[115%] z-[72] min-w-[220px] rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
										>
											{activeSecondaryItems.map((item) => (
												<NavLink
													key={item.to}
													to={item.to}
													className={({ isActive }) =>
														cn(
															"flex min-h-[42px] items-center justify-between rounded-lg px-3 text-sm font-semibold",
															isActive
																? "bg-ruby-700 text-white"
																: "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
														)
													}
												>
													{item.label}
													<ArrowUpRight className="h-4 w-4 opacity-80" />
												</NavLink>
											))}
										</motion.div>
									) : null}
								</AnimatePresence>
							</div>
						</div>

						<div className="hidden items-center gap-2 lg:flex">
							<div className="inline-flex h-12 min-w-[92px] items-center rounded-xl border border-neutral-300 bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-900">
								<button
									type="button"
									onClick={() => setLocale("id")}
									className={cn(
										"h-full min-w-[42px] rounded-lg px-2 text-xs font-bold",
										locale === "id"
											? "bg-[var(--brand)] text-[var(--brand-text)]"
											: "text-neutral-700 dark:text-neutral-200",
									)}
								>
									ID
								</button>
								<button
									type="button"
									onClick={() => setLocale("en")}
									className={cn(
										"h-full min-w-[42px] rounded-lg px-2 text-xs font-bold",
										locale === "en"
											? "bg-[var(--brand)] text-[var(--brand-text)]"
											: "text-neutral-700 dark:text-neutral-200",
									)}
								>
									EN
								</button>
							</div>

							<button
								type="button"
								onClick={toggleMode}
								aria-label={isDark ? text.nav.lightMode : text.nav.darkMode}
								className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-neutral-300 bg-white p-2 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
							>
								{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							</button>

							<a
								href={ctaLink}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-xl bg-ruby-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-ruby-800"
							>
								<MessageCircle className="h-4 w-4" />
								{text.nav.chatWaShort}
							</a>
						</div>

						<div className="flex items-center gap-2 lg:hidden">
							<button
								type="button"
								onClick={toggleMode}
								aria-label={isDark ? text.nav.lightMode : text.nav.darkMode}
								className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-neutral-300 bg-white p-2 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
							>
								{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							</button>
							<button
								type="button"
								aria-label={text.nav.openMenu}
								aria-expanded={mobileOpen}
								onClick={() => setMobileOpen((state) => !state)}
								className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-neutral-300 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900"
							>
								<span className="relative block h-4 w-5">
									<motion.span
										animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
										className="absolute left-0 top-0 h-0.5 w-full rounded-full bg-neutral-800 dark:bg-neutral-100"
									/>
									<motion.span
										animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
										className="absolute left-0 top-[7px] h-0.5 w-full rounded-full bg-neutral-800 dark:bg-neutral-100"
									/>
									<motion.span
										animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
										className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-neutral-800 dark:bg-neutral-100"
									/>
								</span>
							</button>
						</div>
					</div>
				</nav>
			</header>

			{createPortal(mobileMenu, document.body)}
		</>
	);
}
