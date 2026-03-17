import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, MessageCircle, Moon, Sun, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { DynamicLogo } from "@/components/public/layout/DynamicLogo";

import { useLocaleStore } from "@/store/localeStore";
import { useThemeStore } from "@/store/themeStore";
import { toWhatsappLink } from "@/utils/format";
import { cn } from "@/utils/index";

type NavbarProps = {
	whatsapp?: string;
};

type NavItem = {
	to: string;
	label: { id: string; en: string };
	end?: boolean;
};

type NavbarLocaleText = {
	chooseMenu: string;
	chatWa: string;
	chatWaShort: string;
	openMenu: string;
	closeMenu: string;
	lightMode: string;
	darkMode: string;
	moreMenu: string;
};

const primaryNavItems: NavItem[] = [
	{ to: "/", label: { id: "Beranda", en: "Home" }, end: true },
	{ to: "/cabang", label: { id: "Cabang", en: "Branches" } },
	{ to: "/promo", label: { id: "Promo", en: "Promotions" } },
	{ to: "/galeri", label: { id: "Galeri", en: "Gallery" } },
	{ to: "/harga", label: { id: "Harga", en: "Pricing" } },
];

const secondaryNavItems: NavItem[] = [
	{ to: "/cara-pakai", label: { id: "Cara Pakai", en: "How It Works" } },
	{ to: "/blog", label: { id: "Blog", en: "Blog" } },
	{ to: "/karir", label: { id: "Loker", en: "Careers" } },
	{ to: "/kemitraan", label: { id: "Kemitraan", en: "Partnership" } },
	{ to: "/kontak", label: { id: "Kontak", en: "Contact" } },
];

const localeText: Record<"id" | "en", NavbarLocaleText> = {
	id: {
		chooseMenu: "Pilih menu layanan MBA Laundry Express",
		chatWa: "Chat WhatsApp",
		chatWaShort: "Chat WA",
		openMenu: "Buka menu",
		closeMenu: "Tutup menu",
		lightMode: "Mode Terang",
		darkMode: "Mode Gelap",
		moreMenu: "Lainnya",
	},
	en: {
		chooseMenu: "Choose MBA Laundry Express service menu",
		chatWa: "WhatsApp Chat",
		chatWaShort: "Chat WA",
		openMenu: "Open menu",
		closeMenu: "Close menu",
		lightMode: "Light Mode",
		darkMode: "Dark Mode",
		moreMenu: "More",
	},
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

	const text = localeText[locale];
	const isDark = mode === "dark";

	const moreRef = useRef<HTMLDivElement | null>(null);

	const ctaLink = useMemo(
		() =>
			toWhatsappLink(
				whatsapp ?? "6281234567890",
				locale === "id"
					? "Halo MBA Laundry, saya ingin order laundry."
					: "Hi MBA Laundry, I would like to order laundry service.",
			),
		[locale, whatsapp],
	);

	const secondaryActive = useMemo(
		() =>
			secondaryNavItems.some((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)),
		[location.pathname],
	);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 40);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const path = location.pathname;
	useEffect(() => {
		setMobileOpen(false);
		setMoreOpen(false);
	}, [path]);

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
				? "bg-gradient-primary text-white shadow-ruby-glow"
				: "text-neutral-700 hover:bg-white/80 hover:text-ruby-700 dark:text-neutral-200 dark:hover:bg-neutral-900/70 dark:hover:text-ruby-300",
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
								className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
								aria-label={text.closeMenu}
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Controls */}
						<div className="mb-4 flex items-center gap-2">
							<button
								type="button"
								onClick={toggleMode}
								aria-label={isDark ? text.lightMode : text.darkMode}
								className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
							>
								{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							</button>
							<div className="flex h-10 items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-neutral-900">
								<button
									type="button"
									onClick={() => setLocale("id")}
									className={cn(
										"h-8 rounded-lg px-3 text-xs font-bold",
										locale === "id" ? "bg-ruby-500 text-white" : "text-neutral-600 dark:text-neutral-300",
									)}
								>
									ID
								</button>
								<button
									type="button"
									onClick={() => setLocale("en")}
									className={cn(
										"h-8 rounded-lg px-3 text-xs font-bold",
										locale === "en" ? "bg-ruby-500 text-white" : "text-neutral-600 dark:text-neutral-300",
									)}
								>
									EN
								</button>
							</div>
						</div>

						{/* Menu Items */}
						<div className="flex-1 space-y-1 overflow-y-auto py-2">
							{[...primaryNavItems, ...secondaryNavItems].map((item) => (
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
									<span>{item.label[locale]}</span>
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
								{text.chatWa}
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
							: "border-neutral-200/90 bg-white/70 backdrop-blur-glass dark:border-neutral-800/80 dark:bg-neutral-950/70"
				}`}
			>
				<nav className="section-wrap flex h-[88px] items-center justify-between">
					<div
						className={cn(
							"relative flex h-[64px] w-full items-center justify-between rounded-2xl border px-3 lg:px-4",
							scrolled
								? "border-white/55 bg-white/78 shadow-xl backdrop-blur-glass dark:border-white/20 dark:bg-neutral-950/78"
								: "border-white/35 bg-white/60 backdrop-blur-glass dark:border-white/10 dark:bg-neutral-950/55",
						)}
					>
						<span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-ruby-400/60 to-transparent" />
						<DynamicLogo />

						<div className="hidden items-center gap-1 xl:flex">
							{primaryNavItems.map((item) => (
								<NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
									{item.label[locale]}
								</NavLink>
							))}

							<div className="relative" ref={moreRef}>
								<button
									type="button"
									onClick={() => setMoreOpen((state) => !state)}
									className={cn(
										"inline-flex min-h-[42px] items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition",
										secondaryActive || moreOpen
											? "bg-gradient-primary text-white shadow-ruby-glow"
											: "text-neutral-700 hover:bg-white/80 hover:text-ruby-700 dark:text-neutral-200 dark:hover:bg-neutral-900/70 dark:hover:text-ruby-300",
									)}
								>
									{text.moreMenu}
									<ChevronDown className={cn("h-4 w-4 transition", moreOpen && "rotate-180")} />
								</button>

								<AnimatePresence>
									{moreOpen ? (
										<motion.div
											initial={{ opacity: 0, y: 8, scale: 0.98 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, y: 8, scale: 0.98 }}
											className="absolute right-0 top-[115%] z-[72] min-w-[220px] rounded-2xl border border-white/40 bg-white/95 p-2 shadow-xl backdrop-blur-glass dark:border-white/15 dark:bg-neutral-950/90"
										>
											{secondaryNavItems.map((item) => (
												<NavLink
													key={item.to}
													to={item.to}
													className={({ isActive }) =>
														cn(
															"flex min-h-[42px] items-center justify-between rounded-lg px-3 text-sm font-semibold",
															isActive
																? "bg-gradient-primary text-white"
																: "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
														)
													}
												>
													{item.label[locale]}
													<ArrowUpRight className="h-4 w-4 opacity-80" />
												</NavLink>
											))}
										</motion.div>
									) : null}
								</AnimatePresence>
							</div>
						</div>

						<div className="hidden items-center gap-2 lg:flex">
							<div className="inline-flex h-10 min-w-[84px] items-center rounded-xl border border-neutral-300 bg-white/80 p-1 dark:border-neutral-700 dark:bg-neutral-900/80">
								<button
									type="button"
									onClick={() => setLocale("id")}
									className={cn(
										"h-7 min-w-[34px] rounded-md px-2 text-[11px] font-bold",
										locale === "id" ? "bg-gradient-primary text-white" : "text-neutral-700 dark:text-neutral-200",
									)}
								>
									ID
								</button>
								<button
									type="button"
									onClick={() => setLocale("en")}
									className={cn(
										"h-7 min-w-[34px] rounded-md px-2 text-[11px] font-bold",
										locale === "en" ? "bg-gradient-primary text-white" : "text-neutral-700 dark:text-neutral-200",
									)}
								>
									EN
								</button>
							</div>

							<button
								type="button"
								onClick={toggleMode}
								aria-label={isDark ? text.lightMode : text.darkMode}
								className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-xl border border-neutral-300 bg-white/80 p-2 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200"
							>
								{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							</button>

							<a
								href={ctaLink}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-10 min-w-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-white shadow-ruby-glow transition hover:scale-[1.02] active:scale-[0.98]"
							>
								<MessageCircle className="h-4 w-4" />
								{text.chatWaShort}
							</a>
						</div>

						<div className="flex items-center gap-2 lg:hidden">
							<button
								type="button"
								onClick={toggleMode}
								aria-label={isDark ? text.lightMode : text.darkMode}
								className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-xl border border-neutral-300 bg-white/85 p-2 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/85 dark:text-neutral-200"
							>
								{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							</button>
							<button
								type="button"
								aria-label={text.openMenu}
								aria-expanded={mobileOpen}
								onClick={() => setMobileOpen((state) => !state)}
								className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-xl border border-neutral-300 bg-white/85 p-2 dark:border-neutral-700 dark:bg-neutral-900/85"
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
