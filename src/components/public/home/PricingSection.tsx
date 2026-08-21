import { motion } from "framer-motion";
import { ArrowRight, Check, Minus, Plus, Shirt, Sparkles, Wind } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/public/shared/ScrollReveal";

const washFeatures = [
	"Kapasitas mesin 7-10kg",
	"Teknologi hemat air",
	"Program aman untuk berbagai kain",
	"Detergen steril otomatis",
];

const dryFeatures = [
	"Kapasitas mesin 7-10kg",
	"Sensor suhu stabil",
	"Mode cepat untuk kebutuhan mendesak",
	"Hasil kering siap lipat",
];

export function PricingSection() {
	const [washCount, setWashCount] = useState(2);
	const [dryCount, setDryCount] = useState(2);

	const pricePerWash = 10000;
	const pricePerDry = 10000;
	const total = washCount * pricePerWash + dryCount * pricePerDry;

	return (
		<section className="relative overflow-hidden bg-white px-6 py-24 md:px-12 md:py-32 dark:bg-neutral-950">
			{/* Decorative background */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-ruby-100/50 blur-[100px] dark:bg-ruby-900/20" />
				<div className="absolute -left-40 bottom-20 h-[400px] w-[400px] rounded-full bg-sapphire-100/50 blur-[100px] dark:bg-sapphire-900/20" />
			</div>

			<div className="relative mx-auto flex max-w-[1200px] flex-col items-center">
				{/* HEADER */}
				<ScrollReveal>
					<div className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-sapphire-500" />
						<span className="rounded-full bg-gradient-to-r from-sapphire-500 to-sapphire-600 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white shadow-md">
							Harga
						</span>
					</div>
				</ScrollReveal>

				<ScrollReveal delay={0.1}>
					<h2 className="mt-3 text-center text-[32px] font-bold leading-[1.2] text-neutral-900 md:text-[40px] dark:text-white">
						Harga Jelas,{" "}
						<span className="bg-gradient-to-r from-ruby-500 to-ruby-600 bg-clip-text text-transparent">
							Tanpa Biaya Tersembunyi
						</span>
					</h2>
				</ScrollReveal>

				<ScrollReveal delay={0.2}>
					<p className="mt-4 max-w-[700px] text-center text-[18px] leading-[1.5] text-neutral-600 dark:text-neutral-300">
						Bayar sesuai yang kamu pakai. Tarif otomatis mengikuti data cabang aktif agar selalu update.
					</p>
				</ScrollReveal>

				{/* PRICING CARDS */}
				<StaggerContainer
					className="mt-16 grid w-full max-w-[900px] grid-cols-1 gap-8 md:grid-cols-2"
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
								className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-gradient-to-br from-ruby-100 to-rose-200 shadow-inner"
							>
								<Shirt className="h-12 w-12 text-ruby-600" />
							</motion.div>

							<span className="mt-6 text-[16px] font-bold uppercase tracking-wide text-ruby-600">Mencuci</span>

							<div className="mt-2 flex items-baseline gap-1">
								<span className="text-[24px] font-bold text-neutral-400 dark:text-neutral-500">Rp</span>
								<span className="text-[56px] font-bold leading-none text-neutral-900 md:text-[64px] dark:text-white">10.000</span>
							</div>

							<p className="mt-2 text-[14px] text-neutral-500 dark:text-neutral-400">Estimasi 30-40 Menit</p>

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
								className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-gradient-to-br from-sapphire-100 to-blue-200 shadow-inner"
							>
								<Wind className="h-12 w-12 text-sapphire-600" />
							</motion.div>

							<span className="mt-6 text-[16px] font-bold uppercase tracking-wide text-sapphire-600">Mengeringkan</span>

							<div className="mt-2 flex items-baseline gap-1">
								<span className="text-[24px] font-bold text-neutral-400 dark:text-neutral-500">Rp</span>
								<span className="text-[56px] font-bold leading-none text-neutral-900 md:text-[64px] dark:text-white">10.000</span>
							</div>

							<p className="mt-2 text-[14px] text-neutral-500 dark:text-neutral-400">Estimasi 20-30 Menit</p>

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
						className="mt-16 w-full max-w-[800px] overflow-hidden rounded-[28px] bg-gradient-to-br from-neutral-50 to-white p-8 shadow-xl ring-1 ring-neutral-100 md:p-10 dark:from-neutral-900 dark:to-neutral-950 dark:ring-neutral-800"
					>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-ruby-100">
								<Sparkles className="h-5 w-5 text-ruby-600" />
							</div>
							<h3 className="text-[20px] font-bold text-neutral-900 dark:text-white">Hitung Estimasi Biaya</h3>
						</div>

						<div className="mt-8 flex flex-col items-center justify-between gap-8 md:flex-row">
							{/* Inputs */}
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
								<span className="min-w-[100px] text-[16px] font-medium text-neutral-700 dark:text-neutral-300">Jumlah pakai:</span>

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
										<span className="w-10 text-center text-[18px] font-bold text-neutral-900 dark:text-white">{washCount}</span>
										<motion.button
											whileTap={{ scale: 0.9 }}
											type="button"
											onClick={() => setWashCount(washCount + 1)}
											className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors hover:bg-ruby-100 hover:text-ruby-600"
										>
											<Plus className="h-4 w-4" />
										</motion.button>
									</div>
									<span className="text-[14px] text-neutral-600 dark:text-neutral-400">Load cuci</span>
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
										<span className="w-10 text-center text-[18px] font-bold text-neutral-900 dark:text-white">{dryCount}</span>
										<motion.button
											whileTap={{ scale: 0.9 }}
											type="button"
											onClick={() => setDryCount(dryCount + 1)}
											className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors hover:bg-sapphire-100 hover:text-sapphire-600"
										>
											<Plus className="h-4 w-4" />
										</motion.button>
									</div>
									<span className="text-[14px] text-neutral-600 dark:text-neutral-400">Load kering</span>
								</div>
							</div>

							{/* Total */}
							<div className="flex w-full flex-col items-center border-t border-neutral-200 pt-6 md:w-auto md:border-none md:pt-0 dark:border-neutral-700">
								<span className="text-[12px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Estimasi Total</span>
								<motion.span
									key={total}
									initial={{ scale: 1.2, color: "#dc2626" }}
									animate={{ scale: 1, color: "#dc2626" }}
									className="text-[44px] font-bold leading-none text-ruby-600 md:text-[52px]"
								>
									Rp {total.toLocaleString("id-ID")}
								</motion.span>
								<span className="mt-1 text-[14px] text-neutral-500 dark:text-neutral-400">
									{washCount} cuci + {dryCount} kering
								</span>
							</div>
						</div>

						<Link
							to="/cabang"
							className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ruby-500 to-ruby-600 py-4 text-[16px] font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
						>
							Cek Cabang Terdekat
							<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
						</Link>
					</motion.div>
				</ScrollReveal>
			</div>
		</section>
	);
}
