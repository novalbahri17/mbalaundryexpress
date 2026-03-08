import { Gift, Home, MessageCircle, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLocaleStore } from "@/store/localeStore";

const items: Array<{ to: string; label: { id: string; en: string }; icon: typeof Home }> = [
	{ to: "/", label: { id: "Beranda", en: "Home" }, icon: Home },
	{ to: "/harga", label: { id: "Harga", en: "Pricing" }, icon: Wallet },
	{ to: "/promo", label: { id: "Promo", en: "Promo" }, icon: Gift },
	{ to: "/kontak", label: { id: "Kontak", en: "Contact" }, icon: MessageCircle },
];

export function BottomNav() {
	const locale = useLocaleStore((state) => state.locale);

	return (
		<nav className="fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-white/25 bg-white/80 p-2 backdrop-blur-glass md:hidden dark:border-white/15 dark:bg-neutral-950/75">
			<ul className="grid grid-cols-4 gap-1">
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<li key={item.to}>
							<NavLink
								to={item.to}
								className={({ isActive }) =>
									`flex min-h-[44px] flex-col items-center justify-center rounded-xl px-1 text-[10px] font-semibold ${
										isActive
											? "bg-gradient-primary text-white shadow-md"
											: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/80"
									}`
								}
							>
								<Icon className="mb-0.5 h-4 w-4" />
								<span className="truncate">{item.label[locale]}</span>
							</NavLink>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
