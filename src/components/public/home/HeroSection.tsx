import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientText } from "@/components/public/shared/GradientText";
import { useBranches } from "@/hooks/useBranches";
import { usePageContentMap } from "@/hooks/usePageContent";

function formatCompact(value: number): string {
	return value.toLocaleString("id-ID");
}

export function HeroSection() {
	const { data: content = {} } = usePageContentMap();
	const { data: branches = [] } = useBranches({ activeOnly: true });

	const heroTitle = content.hero_title || "Laundry Sendiri, Bersih Maksimal, Harga Pasti";
	const titleWords = heroTitle.split(" ");
	const subtitle =
		content.hero_subtitle ||
		"Rp 10.000 cuci dan Rp 10.000 kering. Mesin modern, proses cepat, dan hasil bersih tanpa ribet.";

	const statsCucian = Number(content.stats_cucian ?? 12000);
	const statsRating = Number(content.stats_rating ?? 4.9);

	return (
		<section className="hero-noise relative overflow-hidden bg-hero-light pb-24 pt-32 md:pb-32 md:pt-40 dark:bg-hero-dark">
			<div
				className="pointer-events-none absolute -left-24 -top-16 h-[320px] w-[320px] rounded-full bg-brand-600 blur-[90px]"
				style={{ opacity: "var(--orb-opacity)" }}
			/>
			<div
				className="pointer-events-none absolute -right-24 top-1/3 h-[380px] w-[380px] rounded-full bg-sapphire-600 blur-[110px]"
				style={{ opacity: "var(--orb-opacity)" }}
			/>
			<div
				className="pointer-events-none absolute bottom-[-140px] left-1/2 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-teal-500 blur-[100px]"
				style={{ opacity: "var(--orb-opacity)" }}
			/>
			<div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

			<div className="section-wrap relative z-10">
				<div className="grid items-center gap-14 lg:grid-cols-2">
					<div className="text-center lg:text-left">
						<motion.p
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.45 }}
							className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-700 shadow-sm backdrop-blur-md lg:mx-0 dark:border-white/10 dark:bg-white/10 dark:text-brand-300"
						>
							<span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
							Self-Service Laundry Modern
						</motion.p>

						<h1 className="mt-6 text-[clamp(2.4rem,6.2vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-mba-text dark:text-white">
							{titleWords.map((word, index) => {
								const shouldHighlight =
									word.toLowerCase().includes("bersih") ||
									word.toLowerCase().includes("maksimal") ||
									word.toLowerCase().includes("pasti");
								return (
									<motion.span
										key={`${word}-${index}`}
										initial={{ opacity: 0, y: 24, filter: "blur(5px)" }}
										animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
										transition={{ duration: 0.45, delay: 0.08 + index * 0.06 }}
										className="mr-3 inline-block"
									>
										{shouldHighlight ? <GradientText>{word}</GradientText> : word}
									</motion.span>
								);
							})}
						</h1>

						<motion.p
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.45, delay: 0.28 }}
							className="mx-auto mt-6 max-w-2xl text-base leading-8 text-mba-subtext md:text-lg lg:mx-0 dark:text-mba-darkSubtext"
						>
							{subtitle}
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.45, delay: 0.38 }}
							className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
						>
							<Link
								to="/cabang"
								className="btn-primary inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold md:text-base"
							>
								{content.hero_cta_primary || "Pilih Cabang Terdekat"}
								<ArrowRight className="h-[18px] w-[18px]" />
							</Link>
							<Link
								to="/promo"
								className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white/70 px-7 py-3 text-sm font-bold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-700 hover:text-white dark:border-brand-500/30 dark:bg-white/5 dark:text-brand-300 dark:hover:bg-brand-500 md:text-base"
							>
								<PlayCircle className="h-[18px] w-[18px]" />
								{content.hero_cta_secondary || "Lihat Promo Hari Ini"}
							</Link>
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.45, delay: 0.52 }}
							className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold text-mba-subtext lg:justify-start dark:text-mba-darkSubtext"
						>
							<span className="inline-flex items-center gap-1.5">
								<CheckCircle2 className="h-4 w-4 text-teal-500" />
								{formatCompact(statsCucian)}+ cucian
							</span>
							<span className="inline-flex items-center gap-1.5">
								<CheckCircle2 className="h-4 w-4 text-brand-500" />
								{statsRating.toFixed(1)} rating
							</span>
							<span className="inline-flex items-center gap-1.5">
								<CheckCircle2 className="h-4 w-4 text-sapphire-500" />
								{branches.length} cabang aktif
							</span>
						</motion.div>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 24, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
						className="relative mx-auto w-full max-w-[560px]"
					>
						<div className="rounded-[40px] border border-slate-200 bg-white p-4 shadow-[0_24px_64px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-[#141824] md:p-5">
							<div className="rounded-[30px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#111827] md:p-5">
								<div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B1322]">
									<img
										src="/washer-3d.png"
										alt="Mesin laundry modern MBA Laundry"
										className="h-[300px] w-full object-cover object-left-center md:h-[360px]"
										loading="lazy"
									/>
								</div>

								<div className="mt-5 grid gap-3 sm:grid-cols-3">
									<div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 text-center dark:border-white/10 dark:bg-[#0F1522]">
										<p className="text-[11px] font-bold uppercase tracking-[0.12em] text-mba-subtext dark:text-mba-darkSubtext">
											Cuci
										</p>
										<p className="mt-1.5 text-lg font-extrabold text-brand-700 dark:text-brand-300">Rp 10.000</p>
									</div>
									<div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 text-center dark:border-white/10 dark:bg-[#0F1522]">
										<p className="text-[11px] font-bold uppercase tracking-[0.12em] text-mba-subtext dark:text-mba-darkSubtext">
											Kering
										</p>
										<p className="mt-1.5 text-lg font-extrabold text-sapphire-700 dark:text-sapphire-300">Rp 10.000</p>
									</div>
									<div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 text-center dark:border-white/10 dark:bg-[#0F1522]">
										<p className="text-[11px] font-bold uppercase tracking-[0.12em] text-mba-subtext dark:text-mba-darkSubtext">
											Estimasi
										</p>
										<p className="mt-1.5 text-lg font-extrabold text-slate-800 dark:text-slate-200">60 Menit</p>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7, duration: 0.35 }}
					className="mt-12 text-center text-sm font-semibold text-mba-subtext dark:text-mba-darkSubtext"
				>
					Jelajahi lebih
				</motion.div>
			</div>
		</section>
	);
}
