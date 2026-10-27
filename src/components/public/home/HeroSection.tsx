import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MapPin, Wallet } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/design-system";
import { useBranches } from "@/hooks/useBranches";
import { effectivePrice, groupMachines, isQrisEnabled, useAllBranchMachines } from "@/hooks/useBranchMachines";
import { useLandingText } from "@/hooks/useLandingText";
import { usePublicText } from "@/hooks/usePublicText";
import { HeroImageGrid } from "./HeroImageGrid";

const fadeUp = {
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
};

export function HeroSection() {
	const text = usePublicText();
	const t = text.home.hero;
	// Teks yang bisa diubah admin dari menu "Teks Landing".
	const { values: landing } = useLandingText();
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const { data: allMachines = [] } = useAllBranchMachines();
	const activeBranchCount = branches.length;

	// Harga terendah yang benar-benar ada di database (bukan angka statis).
	const cheapest = useMemo(() => {
		let minWash = Infinity;
		let minDry = Infinity;
		for (const branch of branches) {
			const coinValue = branch.coin_value ?? 10000;
			const qrisOn = isQrisEnabled(branch);
			const cashOn = branch.cash_enabled !== false;
			// Cabang tanpa metode bayar aktif tidak dipakai sebagai acuan harga.
			if (!qrisOn && !cashOn) continue;
			const rows = groupMachines(allMachines.filter((m) => m.branch_id === branch.id));
			for (const row of rows) {
				const price = effectivePrice(row, coinValue, qrisOn);
				if (row.kind === "wash") minWash = Math.min(minWash, price);
				else minDry = Math.min(minDry, price);
			}
		}
		return {
			wash: Number.isFinite(minWash) ? minWash : 0,
			dry: Number.isFinite(minDry) ? minDry : 0,
		};
	}, [branches, allMachines]);

	const priceLabel = useMemo(() => {
		if (!cheapest.wash && !cheapest.dry) return t.priceTransparent;
		const washPart = cheapest.wash ? `Rp ${cheapest.wash.toLocaleString(text.numberLocale)} ${text.common.washes}` : "";
		const dryPart = cheapest.dry ? `Rp ${cheapest.dry.toLocaleString(text.numberLocale)} ${text.common.dries}` : "";
		return `${t.startFrom} ${[washPart, dryPart].filter(Boolean).join(", ")}`;
	}, [cheapest, t.priceTransparent, t.startFrom, text.numberLocale, text.common.washes, text.common.dries]);

	// Fakta nyata dari API. Tidak ada angka karangan.
	const facts = [
		{ icon: Wallet, text: priceLabel },
		{
			icon: MapPin,
			text: activeBranchCount > 0 ? `${activeBranchCount} ${t.activeBranches}` : landing.landing_hero_branch_fallback,
		},
		{ icon: CheckCircle2, text: landing.landing_hero_open_hours },
	];

	return (
		<section className="relative overflow-hidden bg-[var(--bg-app)] pt-24 sm:pt-28 lg:pt-32">
			<div className="relative z-10 mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-12">
				<div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
					{/* Left content */}
					<div className="flex flex-col items-center text-center lg:items-start lg:text-left">
						<motion.p {...fadeUp} transition={{ duration: 0.5 }} className="section-kicker">
							{landing.landing_hero_kicker}
						</motion.p>

						<motion.h1
							{...fadeUp}
							transition={{ duration: 0.5, delay: 0.08 }}
							className="mt-5 text-[clamp(2rem,7vw,3.4rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)]"
						>
							{landing.landing_hero_title_line1}
							<br className="hidden sm:block" />
							<span className="text-[var(--brand)]">{landing.landing_hero_title_highlight}</span>,
							<br className="hidden sm:block" />
							{landing.landing_hero_title_line3}
						</motion.h1>

						<motion.p
							{...fadeUp}
							transition={{ duration: 0.5, delay: 0.16 }}
							className="mt-5 max-w-md text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg lg:max-w-xl"
						>
							{landing.landing_hero_description}
						</motion.p>

						<motion.div
							{...fadeUp}
							transition={{ duration: 0.5, delay: 0.24 }}
							className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
						>
							<Link to="/cabang" className="w-full sm:w-auto">
								<Button
									size="lg"
									leftIcon={<MapPin className="h-5 w-5" />}
									rightIcon={<ArrowRight className="h-5 w-5" />}
									className="w-full"
								>
									{landing.landing_hero_cta_branches}
								</Button>
							</Link>
							<Link to="/harga" className="w-full sm:w-auto">
								<Button variant="outline" size="lg" className="w-full">
									{landing.landing_hero_cta_pricing}
								</Button>
							</Link>
						</motion.div>

						{/* Real facts, no invented numbers */}
						<motion.ul
							{...fadeUp}
							transition={{ duration: 0.5, delay: 0.32 }}
							className="mt-8 flex w-full flex-col gap-3 border-t border-[var(--border)] pt-6 sm:mt-10"
						>
							{facts.map((fact) => (
								<li key={fact.text} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
									<fact.icon className="h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden />
									<span>{fact.text}</span>
								</li>
							))}
						</motion.ul>
					</div>

					{/* Right content - image grid */}
					<motion.div
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="relative mx-auto mt-4 w-full max-w-sm sm:max-w-md lg:mx-0 lg:mt-0 lg:max-w-none"
					>
						<HeroImageGrid />
					</motion.div>
				</div>
			</div>
		</section>
	);
}
