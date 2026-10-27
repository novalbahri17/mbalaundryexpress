import { motion } from "framer-motion";
import { ArrowRight, Calculator, Check, Minus, Plus, Shirt, Wind } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/public/shared/ScrollReveal";
import { useBranches } from "@/hooks/useBranches";
import {
	effectivePrice,
	formatCapacity,
	formatDuration,
	groupMachines,
	isCashEnabled,
	isQrisEnabled,
	useBranchMachines,
} from "@/hooks/useBranchMachines";
import { useLandingText } from "@/hooks/useLandingText";
import { type PublicText, usePublicText } from "@/hooks/usePublicText";
import { formatRupiah } from "@/utils/format";

type MachineRows = ReturnType<typeof groupMachines>;

/** Gabungkan daftar durasi tanpa duplikat, mis. "25 menit" atau "24 menit · 45 menit". */
function joinDurations(machines: MachineRows, unit: string): string {
	return Array.from(new Set(machines.map((m) => formatDuration(m.duration_min, m.duration_max, unit)))).join(" · ");
}

/** Fitur mesin diambil dari data mesin cabang, bukan tulisan statis. */
function machineFeatures(kind: "wash" | "dry", machines: MachineRows, text: PublicText): string[] {
	const t = text.home.pricing;
	const own = machines.filter((m) => m.kind === kind);
	const sizes = Array.from(new Set(own.map((m) => formatCapacity(m.capacity_min, m.capacity_max)))).join(" · ");
	const durations = joinDurations(own, text.common.minuteShort);

	const base =
		kind === "wash" ? [t.washFeature1, t.washFeature2, t.washFeature3] : [t.dryFeature1, t.dryFeature2, t.dryFeature3];

	const out: string[] = [];
	if (sizes) out.push(`${t.washCapacityOption} ${sizes}`);
	if (durations) out.push(`${t.washDuration} ${durations}`);
	return [...out, ...base];
}

export function PricingSection() {
	const text = usePublicText();
	const t = text.home.pricing;
	const { values: landing } = useLandingText();
	const [branchId, setBranchId] = useState("");
	const { data: branches = [] } = useBranches({ activeOnly: true });

	const selectedBranch = useMemo(() => branches.find((b) => b.id === branchId) ?? branches[0], [branches, branchId]);
	const { data: machines = [] } = useBranchMachines(selectedBranch?.id);
	const machineRows = useMemo(() => groupMachines(machines), [machines]);

	const coinValue = selectedBranch?.coin_value ?? 10000;
	const qrisEnabled = isQrisEnabled(selectedBranch);
	const cashEnabled = isCashEnabled(selectedBranch);

	// Tarif tunai = coin termurah tiap jenis mesin. QRIS pakai harga khusus kalau ada.
	const cashWash = useMemo(() => {
		const wash = machineRows.filter((m) => m.kind === "wash");
		return wash.length ? Math.min(...wash.map((m) => effectivePrice(m, coinValue, false))) : 0;
	}, [machineRows, coinValue]);

	const cashDry = useMemo(() => {
		const dry = machineRows.filter((m) => m.kind === "dry");
		return dry.length ? Math.min(...dry.map((m) => effectivePrice(m, coinValue, false))) : 0;
	}, [machineRows, coinValue]);

	const qrisWash = useMemo(() => {
		const wash = machineRows.filter((m) => m.kind === "wash" && m.qris_price);
		return wash.length ? Math.min(...wash.map((m) => m.qris_price as number)) : 0;
	}, [machineRows]);

	const qrisDry = useMemo(() => {
		const dry = machineRows.filter((m) => m.kind === "dry" && m.qris_price);
		return dry.length ? Math.min(...dry.map((m) => m.qris_price as number)) : 0;
	}, [machineRows]);

	const pricePerWash = qrisEnabled && qrisWash ? qrisWash : cashWash;
	const pricePerDry = qrisEnabled && qrisDry ? qrisDry : cashDry;

	const washLabel = useMemo(() => {
		const wash = machineRows.filter((m) => m.kind === "wash");
		if (wash.length === 0) return t.chooseBranch;
		return `${t.washDuration} ${joinDurations(wash, text.common.minuteShort)}`;
	}, [machineRows, t.chooseBranch, t.washDuration, text.common.minuteShort]);

	const dryLabel = useMemo(() => {
		const dry = machineRows.filter((m) => m.kind === "dry");
		if (dry.length === 0) return t.chooseBranch;
		return `${t.dryDuration} ${joinDurations(dry, text.common.minuteShort)}`;
	}, [machineRows, t.chooseBranch, t.dryDuration, text.common.minuteShort]);

	const washFeatures = useMemo(() => machineFeatures("wash", machineRows, text), [machineRows, text]);
	const dryFeatures = useMemo(() => machineFeatures("dry", machineRows, text), [machineRows, text]);

	const [washCount, setWashCount] = useState(2);
	const [dryCount, setDryCount] = useState(2);
	const total = washCount * pricePerWash + dryCount * pricePerDry;

	const picker =
		branches.length > 1 ? (
			<select
				value={selectedBranch?.id ?? ""}
				onChange={(event) => setBranchId(event.target.value)}
				className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 focus:border-[var(--brand)] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
			>
				{branches.map((b) => (
					<option key={b.id} value={b.id}>
						{b.name}
					</option>
				))}
			</select>
		) : null;

	return (
		<section className="section-block relative overflow-hidden bg-white dark:bg-neutral-950">
			{/* Decorative background */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 overflow-hidden" />
			</div>

			<div className="section-inner relative flex flex-col items-center">
				{/* HEADER */}
				<ScrollReveal>
					<div className="flex items-center gap-2">
						<p className="section-kicker">{landing.landing_pricing_kicker}</p>
					</div>
				</ScrollReveal>

				<ScrollReveal delay={0.1}>
					<h2 className="section-title text-center">
						{landing.landing_pricing_title}{" "}
						<span className="text-[var(--brand)]">{landing.landing_pricing_title_highlight}</span>
					</h2>
				</ScrollReveal>

				<ScrollReveal delay={0.2}>
					<p className="section-subtitle text-center">{landing.landing_pricing_subtitle}</p>
				</ScrollReveal>

				{picker ? (
					<ScrollReveal delay={0.25}>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							{picker}
							<span className="text-xs text-neutral-500 dark:text-neutral-400">
								{qrisEnabled && cashEnabled ? (
									<>
										{t.cashAndQris}{" "}
										<span className="font-semibold text-neutral-800 dark:text-neutral-200">
											{formatRupiah(coinValue)}
										</span>
									</>
								) : qrisEnabled ? (
									<>{t.qrisPrice}</>
								) : (
									<>
										{t.coinValue}{" "}
										<span className="font-semibold text-neutral-800 dark:text-neutral-200">
											{formatRupiah(coinValue)}
										</span>
									</>
								)}
							</span>
						</div>
					</ScrollReveal>
				) : null}

				{/* PRICING CARDS */}
				<StaggerContainer
					className="mt-14 grid w-full max-w-[900px] grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
					staggerDelay={0.15}
				>
					{/* WASH CARD */}
					<StaggerItem className="h-full">
						<motion.div
							whileHover={{ y: -8 }}
							className="group relative flex h-full w-full flex-col items-center overflow-hidden rounded-[28px] border-2 border-neutral-100 bg-white p-8 shadow-lg transition-all hover:border-ruby-200 hover:shadow-2xl md:p-12 dark:border-neutral-800 dark:bg-neutral-900"
						>
							<motion.div
								whileHover={{ scale: 1.1, rotate: -5 }}
								className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-ruby-100 dark:bg-ruby-950/40"
							>
								<Shirt className="h-12 w-12 text-ruby-600" />
							</motion.div>

							<span className="mt-6 text-[16px] font-bold uppercase tracking-wide text-ruby-600">{t.wash}</span>

							<div className="mt-2 flex items-baseline gap-1">
								<span className="text-[24px] font-bold text-neutral-400 dark:text-neutral-500">Rp</span>
								<span className="text-[56px] font-bold leading-none text-neutral-900 md:text-[64px] dark:text-white">
									{pricePerWash.toLocaleString(text.numberLocale)}
								</span>
							</div>

							<p className="mt-2 text-center text-[14px] text-neutral-500 dark:text-neutral-400">
								{qrisEnabled ? `${t.qrisFrom} ` : `${t.startingFrom} `}
								{washLabel}
							</p>

							{qrisEnabled && cashEnabled ? (
								<p className="mt-2 rounded-full bg-neutral-100 px-3 py-1 text-[13px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
									{t.cashCoin} <span className="font-semibold">{formatRupiah(cashWash)}</span>
								</p>
							) : null}

							<hr className="my-8 w-full border-neutral-100 dark:border-neutral-800" />

							<ul className="flex w-full flex-col gap-4 text-[16px] text-neutral-700 dark:text-neutral-300">
								{washFeatures.map((feature, index) => (
									<motion.li
										key={feature}
										initial={{ opacity: 0, x: -10 }}
										whileInView={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
										viewport={{ once: true }}
										className="flex items-center gap-3"
									>
										<div className="flex h-5 w-5 items-center justify-center rounded-full bg-ruby-100">
											<Check className="h-3 w-3 text-ruby-600" />
										</div>
										{feature}
									</motion.li>
								))}
							</ul>
						</motion.div>
					</StaggerItem>

					{/* DRY CARD */}
					<StaggerItem className="h-full">
						<motion.div
							whileHover={{ y: -8 }}
							className="group relative flex h-full w-full flex-col items-center overflow-hidden rounded-[28px] border-2 border-neutral-100 bg-white p-8 shadow-lg transition-all hover:border-sapphire-200 hover:shadow-2xl md:p-12 dark:border-neutral-800 dark:bg-neutral-900"
						>
							<motion.div
								whileHover={{ scale: 1.1, rotate: 5 }}
								className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-sapphire-100 dark:bg-sapphire-950/40"
							>
								<Wind className="h-12 w-12 text-sapphire-600" />
							</motion.div>

							<span className="mt-6 text-[16px] font-bold uppercase tracking-wide text-sapphire-600">{t.dry}</span>

							<div className="mt-2 flex items-baseline gap-1">
								<span className="text-[24px] font-bold text-neutral-400 dark:text-neutral-500">Rp</span>
								<span className="text-[56px] font-bold leading-none text-neutral-900 md:text-[64px] dark:text-white">
									{pricePerDry.toLocaleString(text.numberLocale)}
								</span>
							</div>

							<p className="mt-2 text-center text-[14px] text-neutral-500 dark:text-neutral-400">
								{qrisEnabled ? `${t.qrisFrom} ` : `${t.startingFrom} `}
								{dryLabel}
							</p>

							{qrisEnabled && cashEnabled ? (
								<p className="mt-2 rounded-full bg-neutral-100 px-3 py-1 text-[13px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
									{t.cashCoin} <span className="font-semibold">{formatRupiah(cashDry)}</span>
								</p>
							) : null}

							<hr className="my-8 w-full border-neutral-100 dark:border-neutral-800" />

							<ul className="flex w-full flex-col gap-4 text-[16px] text-neutral-700 dark:text-neutral-300">
								{dryFeatures.map((feature, index) => (
									<motion.li
										key={feature}
										initial={{ opacity: 0, x: -10 }}
										whileInView={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 }}
										viewport={{ once: true }}
										className="flex items-center gap-3"
									>
										<div className="flex h-5 w-5 items-center justify-center rounded-full bg-sapphire-100">
											<Check className="h-3 w-3 text-sapphire-600" />
										</div>
										{feature}
									</motion.li>
								))}
							</ul>
						</motion.div>
					</StaggerItem>
				</StaggerContainer>

				{/* CALCULATOR */}
				<ScrollReveal delay={0.4}>
					<motion.div
						whileHover={{ scale: 1.01 }}
						className="mt-16 w-full max-w-[800px] min-w-0 overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-8 shadow-lg md:p-10 dark:border-neutral-800 dark:bg-neutral-900"
					>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-ruby-100">
								<Calculator className="h-5 w-5 text-ruby-600" />
							</div>
							<h3 className="text-[20px] font-bold text-neutral-900 dark:text-white">
								{landing.landing_pricing_calc_title}
							</h3>
						</div>

						<div className="mt-8 flex flex-col items-center justify-between gap-8 lg:flex-row">
							{/* Inputs */}
							<div className="flex w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto">
								<span className="min-w-[100px] text-[16px] font-medium text-neutral-700 dark:text-neutral-300">
									{t.perCoin}
								</span>

								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
										<motion.button
											whileTap={{ scale: 0.9 }}
											type="button"
											onClick={() => setWashCount(Math.max(0, washCount - 1))}
											className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors hover:bg-ruby-100 hover:text-ruby-600"
										>
											<Minus className="h-4 w-4" />
										</motion.button>
										<span className="w-10 text-center text-[18px] font-bold text-neutral-900 dark:text-white">
											{washCount}
										</span>
										<motion.button
											whileTap={{ scale: 0.9 }}
											type="button"
											onClick={() => setWashCount(washCount + 1)}
											className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors hover:bg-ruby-100 hover:text-ruby-600"
										>
											<Plus className="h-4 w-4" />
										</motion.button>
									</div>
									<span className="text-[14px] text-neutral-600 dark:text-neutral-400">{t.loadWash}</span>
								</div>

								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
										<motion.button
											whileTap={{ scale: 0.9 }}
											type="button"
											onClick={() => setDryCount(Math.max(0, dryCount - 1))}
											className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors hover:bg-sapphire-100 hover:text-sapphire-600"
										>
											<Minus className="h-4 w-4" />
										</motion.button>
										<span className="w-10 text-center text-[18px] font-bold text-neutral-900 dark:text-white">
											{dryCount}
										</span>
										<motion.button
											whileTap={{ scale: 0.9 }}
											type="button"
											onClick={() => setDryCount(dryCount + 1)}
											className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors hover:bg-sapphire-100 hover:text-sapphire-600"
										>
											<Plus className="h-4 w-4" />
										</motion.button>
									</div>
									<span className="text-[14px] text-neutral-600 dark:text-neutral-400">{t.loadDry}</span>
								</div>
							</div>

							{/* Total */}
							<div className="flex w-full flex-col items-center border-t border-neutral-200 pt-6 md:w-auto md:border-none md:pt-0 dark:border-neutral-700">
								<span className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
									{t.estimatedTotal}
								</span>
								<motion.span
									key={total}
									initial={{ scale: 1.2, color: "#dc2626" }}
									animate={{ scale: 1, color: "#dc2626" }}
									className="text-[44px] font-bold leading-none text-ruby-600 md:text-[52px]"
								>
									Rp {total.toLocaleString(text.numberLocale)}
								</motion.span>
								<span className="mt-1 text-[14px] text-neutral-500 dark:text-neutral-400">
									{text.fill(t.washDrySummary, { wash: washCount, dry: dryCount })}
								</span>
							</div>
						</div>

						<Link
							to="/cabang"
							className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-ruby-700 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-ruby-800"
						>
							{landing.landing_pricing_cta}
							<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
						</Link>
					</motion.div>
				</ScrollReveal>
			</div>
		</section>
	);
}
