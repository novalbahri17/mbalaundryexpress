import { Coins, TimerReset, WashingMachine } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientText } from "@/components/public/shared/GradientText";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import { usePageContentMap } from "@/hooks/usePageContent";

export function CaraPakaiSection() {
	const { data: content = {} } = usePageContentMap();
	const steps = [
		{
			title: content.how_to_step1_title ?? "Pilih Mesin Kosong",
			desc: content.how_to_step1_desc ?? "Cari mesin cuci atau pengering yang tersedia.",
			icon: WashingMachine,
			accent: "text-ruby-600 dark:text-ruby-300",
			bg: "bg-ruby-100/90 dark:bg-ruby-500/18",
		},
		{
			title: content.how_to_step2_title ?? "Bayar & Mulai",
			desc: content.how_to_step2_desc ?? "Scan QRIS atau masukkan koin sesuai tarif.",
			icon: Coins,
			accent: "text-sapphire-600 dark:text-sapphire-300",
			bg: "bg-sapphire-100/90 dark:bg-sapphire-500/18",
		},
		{
			title: content.how_to_step3_title ?? "Tunggu & Ambil",
			desc: content.how_to_step3_desc ?? "Estimasi 30-40 menit cuci, 20-30 menit kering.",
			icon: TimerReset,
			accent: "text-teal-600 dark:text-teal-300",
			bg: "bg-teal-100/90 dark:bg-teal-500/18",
		},
	];

	return (
		<section className="section-wrap mt-24" id="cara-pakai">
			<ScrollReveal className="mb-10 text-center">
				<p className="section-kicker">Cara Pakai</p>
				<h2 className="section-title">
					Mudah! <GradientText>Cukup 3 Langkah</GradientText>
				</h2>
			</ScrollReveal>

			<div className="relative">
				<div className="grid gap-5 md:grid-cols-3">
					{steps.map((step, index) => {
						const Icon = step.icon;
						return (
							<ScrollReveal key={step.title} delay={index * 0.1}>
								<div className="glass-card relative rounded-3xl p-6 transition hover:-translate-y-1.5 hover:shadow-ruby-glow">
									<p className="gradient-text text-[4.2rem] font-extrabold leading-none">{index + 1}</p>
									<div className={`mt-3 inline-flex rounded-xl p-2.5 ${step.bg}`}>
										<Icon className={`h-5 w-5 ${step.accent}`} />
									</div>
									<p className="mt-4 text-lg font-bold text-neutral-900 dark:text-white">{step.title}</p>
									<p className="mt-2 text-sm text-[var(--text-muted)]">{step.desc}</p>
								</div>
							</ScrollReveal>
						);
					})}
				</div>
			</div>

			<div className="mt-8 text-center">
				<Link to="/cara-pakai" className="btn-primary inline-flex rounded-full px-6 py-2.5 text-sm font-semibold">
					Panduan Lengkap
				</Link>
			</div>
		</section>
	);
}
