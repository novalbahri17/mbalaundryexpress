import { Gift, Home, MapPin, Phone } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLocaleStore } from "@/store/localeStore";

const items: Array<{ to: string; label: { id: string; en: string }; icon: typeof Home }> = [
	{ to: "/", label: { id: "Beranda", en: "Home" }, icon: Home },
	{ to: "/cabang", label: { id: "Cabang", en: "Branches" }, icon: MapPin },
	{ to: "/promo", label: { id: "Promo", en: "Promo" }, icon: Gift },
	{ to: "/kontak", label: { id: "Kontak", en: "Contact" }, icon: Phone },
];

export function BottomNav() {
	const locale = useLocaleStore((state) => state.locale);

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-white/90 pb-safe pt-2 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-neutral-950/90">
			<ul className="grid grid-cols-4 gap-1 px-4 pb-2">
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<li key={item.to}>
							<NavLink
								to={item.to}
								className={({ isActive }) =>
									`flex min-h-[44px] flex-col items-center justify-center rounded-xl px-1 py-1 text-[11px] font-medium transition-all ${
										isActive
											? "bg-ruby-500 text-white shadow-lg shadow-ruby-500/25"
											: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/80"
									}`
								}
							>
								<Icon className="mb-0.5 h-5 w-5" />
								<span className="truncate">{item.label[locale]}</span>
							</NavLink>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
