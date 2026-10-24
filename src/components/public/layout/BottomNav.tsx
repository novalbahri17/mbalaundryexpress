import { Gift, Home, MapPin, Phone, Star } from "lucide-react";
import { NavLink } from "react-router-dom";
import { usePublicText } from "@/hooks/usePublicText";

const iconMap = [Home, MapPin, Gift, Star, Phone];

export function BottomNav() {
	const text = usePublicText();

	const items = [
		{ to: "/", label: text.nav.home },
		{ to: "/cabang", label: text.nav.branches },
		{ to: "/promo", label: text.nav.promotions },
		{ to: "/testimoni", label: text.nav.testimonials },
		{ to: "/kontak", label: text.nav.contact },
	];

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white pb-safe pt-1 md:hidden dark:border-neutral-800 dark:bg-neutral-950">
			<ul className="grid grid-cols-5 gap-0.5 px-2 pb-2">
				{items.map((item, index) => {
					const Icon = iconMap[index];
					return (
						<li key={item.to}>
							<NavLink
								to={item.to}
								className={({ isActive }) =>
									`flex min-h-[48px] flex-col items-center justify-center rounded-xl px-1 py-1 text-[11px] font-medium transition-colors ${
										isActive
											? "bg-[var(--brand)] text-[var(--brand-text)]"
											: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
									}`
								}
							>
								<Icon className="mb-0.5 h-5 w-5" />
								<span className="truncate">{item.label}</span>
							</NavLink>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
