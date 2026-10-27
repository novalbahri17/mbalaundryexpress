import { motion } from "framer-motion";
import { ArrowRight, CircleDollarSign, Clock, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/public/shared/ScrollReveal";
import { useLandingText } from "@/hooks/useLandingText";
import { usePublicText } from "@/hooks/usePublicText";
import { cn } from "@/utils";

export function HowItWorksSection() {
	const text = usePublicText();
	const t = text.home.howItWorks;
	const { values: landing } = useLandingText();

	const steps = [
		{
			number: "1",
			title: landing.landing_how_step1_title,
			description: landing.landing_how_step1_desc,
			icon: LayoutGrid,
			bgClass: "bg-ruby-100 dark:bg-ruby-900/30",
			iconClass: "text-ruby-600 dark:text-ruby-400",
		},
		{
			number: "2",
			title: landing.landing_how_step2_title,
			description: landing.landing_how_step2_desc,
			icon: CircleDollarSign,
			bgClass: "bg-sapphire-100 dark:bg-sapphire-900/30",
			iconClass: "text-sapphire-600 dark:text-sapphire-400",
		},
		{
			number: "3",
			title: landing.landing_how_step3_title,
			description: landing.landing_how_step3_desc,
			icon: Clock,
			bgClass: "bg-teal-100 dark:bg-teal-900/30",
			iconClass: "text-teal-600 dark:text-teal-400",
		},
	];

	return (
		<section className="section-block relative overflow-hidden bg-neutral-50 dark:bg-neutral-900">
			{/* Background Pattern */}
			<div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
						backgroundSize: "40px 40px",
					}}
				/>
			</div>

			<div className="section-inner relative flex flex-col items-center">
				{/* HEADER */}
				<ScrollReveal>
					<p className="section-kicker">{landing.landing_how_kicker}</p>
				</ScrollReveal>

				<ScrollReveal delay={0.1}>
					<h2 className="section-title text-center">{landing.landing_how_title}</h2>
				</ScrollReveal>

				<ScrollReveal delay={0.2}>
					<p className="mt-4 text-center text-[18px] leading-[1.5] text-neutral-600 dark:text-neutral-300">
						{landing.landing_how_subtitle}
					</p>
				</ScrollReveal>

				{/* Steps layout */}
				<div className="relative mt-16 w-full">
					<StaggerContainer className="grid w-full grid-cols-1 gap-8 md:grid-cols-3" staggerDelay={0.15}>
						{steps.map((step, index) => (
							<StaggerItem key={step.number} className="h-full">
								<motion.div
									whileHover={{ y: -8 }}
									transition={{ duration: 0.3 }}
									className="group relative flex h-full flex-col items-center rounded-[24px] border border-neutral-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-transparent hover:shadow-2xl md:p-10 dark:border-neutral-700 dark:bg-neutral-800"
								>
									{/* Step Number Badge */}
									<div
										className={cn(
											"absolute -top-4 left-1/2 flex h-8 -translate-x-1/2 items-center justify-center rounded-full bg-ruby-700 px-4 text-[14px] font-bold text-white",
										)}
									>
										{t.stepBadge} {step.number}
									</div>

									{/* Icon */}
									<motion.div
										whileHover={{ scale: 1.05 }}
										className={cn(
											"mt-4 flex h-[90px] w-[90px] items-center justify-center rounded-[24px] transition-colors",
											step.bgClass,
										)}
									>
										<step.icon className={cn("h-10 w-10", step.iconClass)} />
									</motion.div>

									{/* Content */}
									<h3 className="mt-6 text-center text-[22px] font-bold text-neutral-900 transition-colors group-hover:text-ruby-600 dark:text-white dark:group-hover:text-ruby-400">
										{step.title}
									</h3>
									<p className="mt-3 text-center text-[16px] leading-[1.75] text-neutral-600 dark:text-neutral-300">
										{step.description}
									</p>

									{/* Arrow indicator */}
									{index < steps.length - 1 && (
										<div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-neutral-300 dark:text-neutral-600 md:block">
											<ArrowRight className="h-8 w-8" />
										</div>
									)}
								</motion.div>
							</StaggerItem>
						))}
					</StaggerContainer>
				</div>

				{/* BOTTOM CTA */}
				<ScrollReveal delay={0.5}>
					<div className="mt-16 text-center">
						<Link
							to="/cara-pakai"
							className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-[16px] font-semibold text-ruby-500 shadow-lg transition-all hover:gap-3 hover:bg-ruby-50 hover:shadow-xl dark:bg-neutral-800 dark:text-ruby-400 dark:hover:bg-ruby-900/20"
						>
							{t.cta}
							<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />{" "}
						</Link>
					</div>
				</ScrollReveal>
			</div>
		</section>
	);
}
