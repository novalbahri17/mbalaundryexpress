import { Coins, TimerReset, WashingMachine } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientText } from "@/components/public/shared/GradientText";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import { useLandingText } from "@/hooks/useLandingText";
import { usePublicText } from "@/hooks/usePublicText";

export function CaraPakaiSection() {
	const text = usePublicText();
	const t = text.home.howItWorks;
	// Teks dari admin (menu "Teks Landing") + versi Inggrisnya.
	// Kunci lama `how_to_step*` tetap dipakai supaya isian admin yang sudah ada
	// tidak hilang.
	const { values: landing } = useLandingText();

	const steps = [
		{
			title: landing.landing_how_step1_title || t.step1Title,
			desc: landing.landing_how_step1_desc || t.step1Desc,
			icon: WashingMachine,
			accent: "text-ruby-600 dark:text-ruby-300",
			bg: "bg-ruby-100/90 dark:bg-ruby-500/18",
		},
		{
			title: landing.landing_how_step2_title || t.step2Title,
			desc: landing.landing_how_step2_desc || t.step2Desc,
			icon: Coins,
			accent: "text-sapphire-600 dark:text-sapphire-300",
			bg: "bg-sapphire-100/90 dark:bg-sapphire-500/18",
		},
		{
			title: landing.landing_how_step3_title || t.step3Title,
			desc: landing.landing_how_step3_desc || t.step3Desc,
			icon: TimerReset,
			accent: "text-teal-600 dark:text-teal-300",
			bg: "bg-teal-100/90 dark:bg-teal-500/18",
		},
	];

	// Judul bagian: pakai teks landing yang bisa diedit admin, dipecah supaya
	// bagian akhirnya diberi gradien.
	const heading = (landing.landing_how_title || t.title).trim();
	const highlightAt = heading.lastIndexOf(" ");
	const headingLead = highlightAt > 0 ? heading.slice(0, highlightAt + 1) : "";
	const headingHighlight = highlightAt > 0 ? heading.slice(highlightAt + 1) : heading;

	return (
		<section className="section-wrap mt-24" id="cara-pakai">
			<ScrollReveal className="mb-10 text-center">
				<p className="section-kicker">{landing.landing_how_kicker}</p>
				<h2 className="section-title">
					{headingLead}
					<GradientText>{headingHighlight}</GradientText>
				</h2>
			</ScrollReveal>

			<div className="relative">
				<div className="grid gap-5 md:grid-cols-3">
					{steps.map((step, index) => {
						const Icon = step.icon;
						return (
							<ScrollReveal key={step.title} delay={index * 0.1}>
								<div className="glass-card relative rounded-3xl p-6 transition hover:shadow-card">
									<p className="text-[4.2rem] font-extrabold leading-none text-[var(--brand)]">{index + 1}</p>
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
					{t.cta}
				</Link>
			</div>
		</section>
	);
}
