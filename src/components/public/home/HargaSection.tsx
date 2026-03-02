import { useEffect } from "react";
import type { ReactNode } from "react";
import { Check, Droplets, Wind } from "lucide-react";
import { CountUp } from "@/components/public/shared/CountUp";
import { GradientText } from "@/components/public/shared/GradientText";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import { useBranches } from "@/hooks/useBranches";

type HargaSectionProps = {
	onPriceChange: (washPrice: number, dryPrice: number) => void;
};

function PricingCard({
	type,
	icon,
	accentBg,
	accentText,
	price,
	durationText,
	backDetails,
}: {
	type: string;
	icon: ReactNode;
	accentBg: string;
	accentText: string;
	price: number;
	durationText: string;
	backDetails: string[];
}) {
	return (
		<div className="group h-full overflow-hidden rounded-[1.5rem] border border-transparent bg-white shadow-card-sm transition-all duration-300 hover:-translate-y-2 hover:border-brand-200 hover:shadow-card-hover dark:border-mba-darkBorder dark:bg-mba-darkSurface dark:hover:border-brand-500/30">
			<div className={`h-2 w-full ${accentBg}`} />

			<div className="p-8 pb-10">
				<div className={`mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 ${accentText} transition-transform duration-300 group-hover:scale-110 dark:bg-black/20`}>
					{icon}
				</div>
				<h4 className="mb-2 text-[1.25rem] font-bold text-mba-text dark:text-mba-darkText">{type}</h4>
				<div className="mb-6 flex items-baseline justify-center gap-1">
					<span className="text-[1rem] font-semibold text-mba-subtext dark:text-mba-darkSubtext">Rp</span>
					<span className="text-[2.5rem] font-extrabold tabular-nums leading-none text-mba-text dark:text-white">
						<CountUp value={price} />
					</span>
				</div>
				<p className={`mb-8 text-sm font-bold ${accentText}`}>{durationText}</p>

				<ul className="mb-8 space-y-4 text-left">
					{backDetails.map((detail) => (
						<li key={detail} className="flex items-start gap-3">
							<Check className={`mt-0.5 h-5 w-5 shrink-0 ${accentText}`} />
							<span className="text-[15px] font-medium leading-snug text-mba-subtext dark:text-mba-darkSubtext">
								{detail}
							</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

export function HargaSection({ onPriceChange }: HargaSectionProps) {
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const washPrice = branches[0]?.price_wash ?? 10000;
	const dryPrice = branches[0]?.price_dry ?? 10000;

	useEffect(() => {
		onPriceChange(washPrice, dryPrice);
	}, [dryPrice, onPriceChange, washPrice]);

	return (
		<section className="section-wrap mt-24" id="harga">
			<div className="grid items-center gap-12 lg:grid-cols-12 xl:gap-16">
				<div className="lg:col-span-5 xl:col-span-4">
					<ScrollReveal>
						<p className="section-kicker">Pricing</p>
						<h2 className="section-title text-mba-text dark:text-white">
							Harga Jelas, <GradientText>Tanpa Biaya Tersembunyi</GradientText>
						</h2>
						<p className="section-subtitle text-base">
							Bayar sesuai yang kamu pakai. Tarif otomatis mengikuti data cabang aktif agar selalu akurat.
						</p>
					</ScrollReveal>
				</div>

				<div className="lg:col-span-7 xl:col-span-8">
					<div className="grid gap-6 sm:grid-cols-2">
						<ScrollReveal delay={0.1}>
							<PricingCard
								type="Mencuci"
								icon={<Droplets className="h-8 w-8" />}
								accentBg="bg-brand-600"
								accentText="text-brand-600 dark:text-brand-300"
								price={washPrice}
								durationText="Estimasi 30-40 Menit"
								backDetails={[
									"Kapasitas mesin 7-10kg",
									"Teknologi hemat air",
									"Program aman untuk berbagai kain",
									"Detergen steril otomatis",
								]}
							/>
						</ScrollReveal>

						<ScrollReveal delay={0.2}>
							<PricingCard
								type="Mengeringkan"
								icon={<Wind className="h-8 w-8" />}
								accentBg="bg-sapphire-600"
								accentText="text-sapphire-600 dark:text-sapphire-300"
								price={dryPrice}
								durationText="Estimasi 20-30 Menit"
								backDetails={[
									"Kapasitas mesin 7-10kg",
									"Sensor suhu stabil",
									"Mode cepat untuk kebutuhan mendesak",
									"Hasil kering siap lipat",
								]}
							/>
						</ScrollReveal>
					</div>
				</div>
			</div>
		</section>
	);
}
