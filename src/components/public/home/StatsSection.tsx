import { MapPinned, Star, WashingMachine } from "lucide-react";
import { CountUp } from "@/components/public/shared/CountUp";
import { GradientText } from "@/components/public/shared/GradientText";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import { useBranches } from "@/hooks/useBranches";
import { usePageContentMap } from "@/hooks/usePageContent";

export function StatsSection() {
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const { data: content = {} } = usePageContentMap();

	const stats = [
		{
			label: "Cucian Berhasil",
			value: Number(content.stats_cucian ?? 12000),
			suffix: "+",
			icon: WashingMachine,
			accent: "text-brand-300",
		},
		{
			label: "Cabang Aktif",
			value: branches.length,
			suffix: "",
			icon: MapPinned,
			accent: "text-sapphire-300",
		},
		{
			label: "Rating Pelanggan",
			value: Number(content.stats_rating ?? 4.9),
			suffix: "/5",
			icon: Star,
			accent: "text-teal-300",
		},
	];

	return (
		<section className="section-wrap mt-24">
			<div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#1A1A2E] px-7 py-12 text-white dark:bg-[#0D0D1A] md:px-10 md:py-14">
				<div className="pointer-events-none absolute -left-20 -top-14 h-64 w-64 rounded-full bg-brand-500/25 blur-[90px]" />
				<div className="pointer-events-none absolute -right-20 -bottom-14 h-64 w-64 rounded-full bg-sapphire-500/25 blur-[100px]" />
				<div className="pointer-events-none absolute inset-0 dot-grid opacity-15" />

				<ScrollReveal className="relative z-10 mb-10 text-center">
					<p className="mx-auto inline-flex rounded-full border border-white/20 bg-white/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
						Statistik
					</p>
					<h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
						Pertumbuhan <GradientText>Real-Time</GradientText> MBA Laundry
					</h2>
				</ScrollReveal>

				<div className="relative z-10 grid gap-5 md:grid-cols-3">
					{stats.map((item, index) => {
						const Icon = item.icon;
						return (
							<ScrollReveal key={item.label} delay={index * 0.1}>
								<div className="rounded-3xl border border-white/15 bg-white/[0.08] p-6 text-center backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.12]">
									<div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.08]">
										<Icon className={`h-6 w-6 ${item.accent}`} />
									</div>
									<p className="text-[2.2rem] font-extrabold leading-none tabular-nums text-white">
										<CountUp value={item.value} suffix={item.suffix} />
									</p>
									<p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
										{item.label}
									</p>
								</div>
							</ScrollReveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}
