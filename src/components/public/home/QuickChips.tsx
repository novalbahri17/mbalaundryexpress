import { MessageCircle, WalletCards, WashingMachine, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/public/shared/GlassCard";

const chips = [
	{
		to: "/cabang",
		label: "Pilih Cabang",
		description: "Temukan lokasi terdekat",
		icon: MapPin,
		iconTone: "text-brand-600 dark:text-brand-300",
		iconBg: "bg-brand-100/90 dark:bg-brand-500/18",
	},
	{
		to: "/harga",
		label: "Cek Harga",
		description: "Tarif transparan real-time",
		icon: WalletCards,
		iconTone: "text-sapphire-600 dark:text-sapphire-300",
		iconBg: "bg-sapphire-100/90 dark:bg-sapphire-500/18",
	},
	{
		to: "/cara-pakai",
		label: "Cara Pakai",
		description: "Ikuti 3 langkah sederhana",
		icon: WashingMachine,
		iconTone: "text-teal-600 dark:text-teal-300",
		iconBg: "bg-teal-100/90 dark:bg-teal-500/18",
	},
	{
		to: "/kontak",
		label: "Chat Kami",
		description: "Tim support siap bantu",
		icon: MessageCircle,
		iconTone: "text-amber-600 dark:text-amber-300",
		iconBg: "bg-amber-100/90 dark:bg-amber-500/18",
	},
];

export function QuickChips() {
	return (
		<section className="section-wrap -mt-14 relative z-20">
			<div className="rounded-3xl border border-white/40 bg-white/65 p-3 shadow-[0_20px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
				<div className="flex snap-x gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
					{chips.map((chip) => {
						const Icon = chip.icon;
						return (
							<Link key={chip.to} to={chip.to} className="min-w-[220px] snap-start md:min-w-0">
								<GlassCard className="group rounded-2xl border-white/35 p-4 transition hover:border-brand-300/30">
									<div className="flex items-center gap-3">
										<div className={`grid h-10 w-10 place-items-center rounded-xl ${chip.iconBg}`}>
											<Icon className={`h-[18px] w-[18px] ${chip.iconTone}`} />
										</div>
										<div className="min-w-0">
											<p className="truncate text-sm font-bold text-mba-text dark:text-mba-darkText">
												{chip.label}
											</p>
											<p className="truncate text-xs text-mba-subtext dark:text-mba-darkSubtext">
												{chip.description}
											</p>
										</div>
									</div>
								</GlassCard>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
