import { Gift, Home, MapPin, WashingMachine } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
	{ to: "/", label: "Home", icon: Home },
	{ to: "/cabang", label: "Cabang", icon: MapPin },
	{ to: "/promo", label: "Promo", icon: Gift },
	{ to: "/cara-pakai", label: "Cara Pakai", icon: WashingMachine },
];

export function BottomNav() {
	return (
		<nav className="glass-card fixed inset-x-4 bottom-4 z-40 rounded-2xl border border-white/25 px-2 py-2 md:hidden">
			<ul className="grid grid-cols-4 gap-1">
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<li key={item.to}>
							<NavLink
								to={item.to}
								className={({ isActive }) =>
									`flex min-h-11 flex-col items-center justify-center rounded-xl px-1 text-[10px] font-bold transition ${
										isActive
											? "bg-gradient-to-r from-brand-600 to-sapphire-600 text-white shadow-[0_10px_18px_rgba(198,40,40,0.28)]"
											: "text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/10"
									}`
								}
							>
								<Icon className="mb-0.5 h-4 w-4" />
								<span className="truncate">{item.label}</span>
							</NavLink>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
