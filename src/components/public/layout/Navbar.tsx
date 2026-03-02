import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BrandLogo } from "@/components/public/layout/BrandLogo";
import { useThemeStore } from "@/store/themeStore";
import { toWhatsappLink } from "@/utils/format";

type NavbarProps = {
	whatsapp?: string;
};

const navItems = [
	{ to: "/cabang", label: "Cabang" },
	{ to: "/promo", label: "Promo" },
	{ to: "/harga", label: "Harga" },
	{ to: "/cara-pakai", label: "Cara Pakai" },
	{ to: "/blog", label: "Blog" },
	{ to: "/kontak", label: "Kontak" },
];

export function Navbar({ whatsapp }: NavbarProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const location = useLocation();
	const mode = useThemeStore((state) => state.mode);
	const toggleMode = useThemeStore((state) => state.toggle);

	const ctaLink = useMemo(
		() =>
			toWhatsappLink(
				whatsapp ?? "6281234567890",
				"Halo MBA Laundry, saya ingin tanya cabang terdekat dan promo aktif.",
			),
		[whatsapp],
	);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 50);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		setMobileOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	const mobileMenu = (
		<AnimatePresence>
			{mobileOpen ? (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
						onClick={() => setMobileOpen(false)}
					/>
					<motion.aside
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 24, stiffness: 220 }}
						className="glass-card fixed right-0 top-0 z-[9999] flex h-full w-full max-w-[320px] flex-col border-l border-white/20 px-5 pb-6 pt-6"
					>
						<div className="mb-8 flex items-center justify-between">
							<BrandLogo />
							<button
								type="button"
								aria-label="Tutup menu"
								onClick={() => setMobileOpen(false)}
								className="grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/70 text-mba-text dark:bg-white/5 dark:text-mba-darkText"
							>
								<X className="h-[18px] w-[18px]" />
							</button>
						</div>

						<div className="space-y-1.5">
							{navItems.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									className="block rounded-xl border border-transparent px-4 py-3 text-sm font-bold text-mba-text transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:text-mba-darkText dark:hover:border-brand-500/20 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
								>
									{item.label}
								</Link>
							))}
						</div>

						<div className="mt-auto space-y-3 pt-6">
							<button
								type="button"
								onClick={toggleMode}
								className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/65 text-sm font-bold text-mba-text dark:border-white/10 dark:bg-white/5 dark:text-mba-darkText"
							>
								{mode === "light" ? (
									<>
										<Moon className="h-4 w-4" /> Dark Mode
									</>
								) : (
									<>
										<Sun className="h-4 w-4" /> Light Mode
									</>
								)}
							</button>
							<a
								href={ctaLink}
								target="_blank"
								rel="noopener noreferrer"
								className="btn-primary flex h-11 w-full items-center justify-center rounded-xl text-sm font-bold"
							>
								Chat WhatsApp
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
				className={`fixed top-0 z-50 w-full transition-all duration-300 ${
					scrolled
						? "border-b border-white/25 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#0A0A0F]/75"
						: "bg-transparent"
				}`}
			>
				<nav className="section-wrap flex h-[84px] items-center justify-between">
					<BrandLogo />

					<div className="hidden items-center gap-8 lg:flex">
						{navItems.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									`nav-link text-[15px] font-bold transition ${
										isActive
											? "text-brand-700 dark:text-brand-300"
											: "text-mba-text hover:text-brand-700 dark:text-mba-darkText dark:hover:text-brand-300"
									}`
								}
							>
								{item.label}
							</NavLink>
						))}
					</div>

					<div className="hidden items-center gap-4 lg:flex">
						<button
							type="button"
							aria-label="Toggle dark mode"
							onClick={toggleMode}
							className="grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-white/70 text-brand-700 transition hover:scale-[1.03] dark:border-white/10 dark:bg-white/5 dark:text-brand-300"
						>
							<AnimatePresence mode="wait" initial={false}>
								{mode === "light" ? (
									<motion.span
										key="sun"
										initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
										animate={{ opacity: 1, scale: 1, rotate: 0 }}
										exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
										transition={{ duration: 0.2 }}
									>
										<Sun className="h-[18px] w-[18px]" />
									</motion.span>
								) : (
									<motion.span
										key="moon"
										initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
										animate={{ opacity: 1, scale: 1, rotate: 0 }}
										exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
										transition={{ duration: 0.2 }}
									>
										<Moon className="h-[18px] w-[18px]" />
									</motion.span>
								)}
							</AnimatePresence>
						</button>
						<a
							href={ctaLink}
							target="_blank"
							rel="noopener noreferrer"
							className="btn-primary inline-flex items-center rounded-full px-6 py-2.5 text-[14px] font-bold"
						>
							Chat WhatsApp
						</a>
					</div>

					<button
						type="button"
						aria-label="Buka menu"
						aria-expanded={mobileOpen}
						onClick={() => setMobileOpen(true)}
						className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/70 text-mba-text lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-mba-darkText"
					>
						<Menu className="h-5 w-5" />
					</button>
				</nav>
			</header>

			{createPortal(mobileMenu, document.body)}
		</>
	);
}
