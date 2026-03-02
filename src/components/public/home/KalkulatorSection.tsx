import { useMemo, useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { CountUp } from "@/components/public/shared/CountUp";

type KalkulatorSectionProps = {
	washPrice: number;
	dryPrice: number;
};

function ToggleChip({
	active,
	onChange,
	label,
	colorClass,
}: {
	active: boolean;
	onChange: (value: boolean) => void;
	label: string;
	colorClass: string;
}) {
	return (
		<button
			type="button"
			onClick={() => onChange(!active)}
			className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all shadow-sm ${
				active
					? `${colorClass} border-transparent text-white shadow-md -translate-y-0.5`
					: "border-mba-border bg-white text-mba-subtext hover:bg-mba-bg dark:border-mba-darkBorder dark:bg-mba-darkSurface dark:text-mba-darkSubtext dark:hover:bg-mba-darkBorder"
			}`}
		>
			{label}
		</button>
	);
}

export function KalkulatorSection({ washPrice, dryPrice }: KalkulatorSectionProps) {
	const [load, setLoad] = useState(2);
	const [washOn, setWashOn] = useState(true);
	const [dryOn, setDryOn] = useState(true);

	const total = useMemo(() => {
		const washCost = washOn ? load * washPrice : 0;
		const dryCost = dryOn ? load * dryPrice : 0;
		return washCost + dryCost;
	}, [load, washOn, dryOn, washPrice, dryPrice]);

	return (
		<section className="section-wrap mt-14" id="kalkulator">
			<div className="relative overflow-hidden rounded-[2rem] border border-mba-border bg-white p-8 shadow-card-sm dark:border-mba-darkBorder dark:bg-mba-darkSurface dark:shadow-none md:p-12">
				<div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/10 blur-[100px]" />
				<div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sapphire-500/10 blur-[100px]" />

				<div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
					<div>
						<div className="mb-7 flex items-center gap-4">
							<div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
								<Calculator className="h-7 w-7" />
							</div>
							<div>
								<h3 className="text-[1.4rem] font-extrabold text-mba-text dark:text-mba-darkText">
									Hitung Estimasi Biaya
								</h3>
								<p className="mt-1 text-[15px] font-medium text-mba-subtext dark:text-mba-darkSubtext">
									Atur jumlah muatan dan pilih layanan.
								</p>
							</div>
						</div>

						<div className="mb-8 rounded-2xl border border-mba-border bg-mba-bg p-6 dark:border-mba-darkBorder dark:bg-mba-darkBg">
							<div className="mb-4 flex justify-between text-[15px] font-bold text-mba-text dark:text-mba-darkText">
								<span>Jumlah Muatan</span>
								<span className="rounded-md bg-brand-50 px-3 py-1 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
									{load} Load
								</span>
							</div>
							<input
								type="range"
								min={1}
								max={10}
								value={load}
								onChange={(event) => setLoad(Number(event.target.value))}
								className="h-2.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 outline-none dark:bg-slate-700 dark:accent-brand-500"
								aria-label="Jumlah muatan"
							/>
							<div className="mt-4 flex justify-between text-sm font-semibold text-mba-subtext dark:text-mba-darkSubtext">
								<span>1 Load</span>
								<span>10 Load</span>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-4">
							<ToggleChip
								active={washOn}
								onChange={setWashOn}
								label="Cuci"
								colorClass="bg-brand-600 hover:bg-brand-700"
							/>
							<ToggleChip
								active={dryOn}
								onChange={setDryOn}
								label="Kering"
								colorClass="bg-sapphire-600 hover:bg-sapphire-700"
							/>
						</div>
					</div>

					<div className="relative overflow-hidden rounded-[1.5rem] border border-brand-100 bg-brand-50 p-10 text-center dark:border-brand-500/20 dark:bg-[#151c33]">
						<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-sapphire-500 to-teal-500" />

						<p className="mb-4 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-bold uppercase tracking-[0.1em] text-brand-700 shadow-sm dark:bg-mba-darkSurface dark:text-brand-300">
							Estimasi
						</p>
						<p className="pt-3 text-[3rem] font-extrabold leading-none tabular-nums text-mba-text dark:text-white md:text-[3.5rem]">
							<span className="mr-2 text-[1.5rem] font-bold text-mba-subtext dark:text-mba-darkSubtext">
								Rp
							</span>
							<CountUp value={total} />
						</p>
						<p className="mt-4 rounded-xl bg-white/60 py-2.5 text-[15px] font-medium text-mba-subtext dark:bg-black/20 dark:text-mba-darkSubtext">
							Total untuk <strong>{load} muatan</strong>
						</p>

						<Link
							to="/cabang"
							className="btn-primary mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-[15px] font-bold"
						>
							Cek Cabang Terdekat
							<ArrowRight className="h-5 w-5" />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
