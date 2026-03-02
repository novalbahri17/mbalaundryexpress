import { Link } from "react-router-dom";
import { GradientText } from "@/components/public/shared/GradientText";

export function BrandLogo({ to = "/" }: { to?: string }) {
	return (
		<Link to={to} className="flex items-center gap-2.5">
			<svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="mba-logo-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
						<stop stopColor="#C62828" />
						<stop offset="1" stopColor="#1565C0" />
					</linearGradient>
				</defs>
				<rect x="3" y="2" width="18" height="20" rx="4" fill="url(#mba-logo-grad)" fillOpacity="0.15" />
				<circle cx="12" cy="12" r="5.2" stroke="url(#mba-logo-grad)" strokeWidth="1.7" />
				<circle cx="9" cy="7" r="1" fill="#C62828" />
				<circle cx="12" cy="12" r="2.1" fill="#1565C0" />
			</svg>
			<div className="leading-tight">
				<p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-300">
					MBA
				</p>
				<p className="text-sm font-extrabold md:text-base">
					<GradientText>LAUNDRY EXPRESS</GradientText>
				</p>
			</div>
		</Link>
	);
}
