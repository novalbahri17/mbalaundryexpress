import { Droplets, MapPin, Sparkles, Zap } from "lucide-react";
import { GradientText } from "@/components/public/shared/GradientText";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";

const reasons = [
	{
		title: "Harga Transparan",
		desc: "Tidak ada biaya tersembunyi. Tarif per layanan tampil jelas dan selalu update.",
		icon: Sparkles,
		colors: { bg: "bg-brand-100/90 dark:bg-brand-500/18", text: "text-brand-600 dark:text-brand-300" },
	},
	{
		title: "Mesin Selalu Bersih",
		desc: "Perawatan rutin harian dengan standar kebersihan tinggi untuk setiap drum mesin.",
		icon: Droplets,
		colors: {
			bg: "bg-sapphire-100/90 dark:bg-sapphire-500/18",
			text: "text-sapphire-600 dark:text-sapphire-300",
		},
	},
	{
		title: "Proses Super Cepat",
		desc: "Siklus cuci dan kering yang efisien untuk jadwal harian yang padat.",
		icon: Zap,
		colors: { bg: "bg-amber-100/90 dark:bg-amber-500/18", text: "text-amber-600 dark:text-amber-300" },
	},
	{
		title: "Lokasi Strategis",
		desc: "Dekat area kampus, kos, dan pusat aktivitas agar akses laundry makin praktis.",
		icon: MapPin,
		colors: { bg: "bg-teal-100/90 dark:bg-teal-500/18", text: "text-teal-600 dark:text-teal-300" },
	},
];

export function WhyUsSection() {
	return (
		<section className="section-wrap mt-24">
			<ScrollReveal className="mb-10 text-center">
				<p className="section-kicker">Keunggulan</p>
				<h2 className="section-title">
					Kenapa Pilih <GradientText>MBA Laundry?</GradientText>
				</h2>
			</ScrollReveal>

			<div className="grid gap-5 sm:grid-cols-2">
				{reasons.map((item, index) => {
					const Icon = item.icon;
					return (
						<ScrollReveal key={item.title} delay={index * 0.08}>
							<div className="glass-card h-full rounded-3xl p-7 transition hover:-translate-y-1.5 hover:shadow-brand-glow">
								<div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.colors.bg}`}>
									<Icon className={`h-6 w-6 ${item.colors.text}`} />
								</div>
								<h3 className="text-xl font-bold text-mba-text dark:text-white">{item.title}</h3>
								<p className="mt-3 text-sm leading-7 text-mba-subtext dark:text-mba-darkSubtext">
									{item.desc}
								</p>
							</div>
						</ScrollReveal>
					);
				})}
			</div>
		</section>
	);
}
