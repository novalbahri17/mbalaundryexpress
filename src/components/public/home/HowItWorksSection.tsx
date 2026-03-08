import { motion } from "framer-motion";
import { ArrowRight, CircleDollarSign, Clock, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/public/shared/ScrollReveal";

const steps = [
	{
		number: "1",
		title: "Pilih Mesin Kosong",
		description: "Cari mesin cuci atau pengering yang tersedia. Cek kondisi mesin bersih.",
		icon: LayoutGrid,
		color: "ruby",
		gradient: "from-ruby-500 to-rose-600",
		bgLight: "bg-ruby-100",
		bgDark: "bg-ruby-500/20",
	},
	{
		number: "2",
		title: "Bayar & Mulai",
		description: "Scan QRIS atau masukkan koin sesuai tarif. Mesin otomatis mulai bekerja.",
		icon: CircleDollarSign,
		color: "sapphire",
		gradient: "from-sapphire-500 to-blue-600",
		bgLight: "bg-sapphire-100",
		bgDark: "bg-sapphire-500/20",
	},
	{
		number: "3",
		title: "Tunggu & Ambil",
		description: "Estimasi 30-40 menit cuci, 20-30 menit kering. Ambil pakaian setelah selesai.",
		icon: Clock,
		color: "teal",
		gradient: "from-teal-500 to-emerald-600",
		bgLight: "bg-teal-100",
		bgDark: "bg-teal-500/20",
	},
];

export function HowItWorksSection() {
	return (
		<section className="relative overflow-hidden bg-neutral-50 px-6 py-24 md:px-12 md:py-32">
			{/* Background Pattern */}
			<div className="pointer-events-none absolute inset-0 opacity-[0.03]">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
						backgroundSize: "40px 40px",
					}}
				/>
			</div>

			<div className="relative mx-auto flex max-w-[1200px] flex-col items-center">
				{/* HEADER */}
				<ScrollReveal>
					<span className="rounded-full bg-gradient-to-r from-ruby-500 to-ruby-600 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white shadow-md">
						Cara Pakai
					</span>
				</ScrollReveal>

				<ScrollReveal delay={0.1}>
					<h2 className="mt-3 text-center text-[32px] font-bold leading-[1.2] text-neutral-900 md:text-[40px]">
						Mudah! Cukup 3 Langkah
					</h2>
				</ScrollReveal>

				<ScrollReveal delay={0.2}>
					<p className="mt-4 text-center text-[18px] leading-[1.5] text-neutral-600">
						Proses laundry mandiri yang simple dan cepat
					</p>
				</ScrollReveal>

				{/* Steps layout */}
				<div className="relative mt-16 w-full">
					<StaggerContainer className="grid w-full grid-cols-1 gap-8 md:grid-cols-3" staggerDelay={0.15}>
						{steps.map((step, index) => (
							<StaggerItem key={step.number}>
								<motion.div
									whileHover={{ y: -8 }}
									transition={{ duration: 0.3 }}
									className="group relative flex flex-col items-center rounded-[24px] border border-neutral-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-transparent hover:shadow-2xl md:p-10"
									style={{
										background:
											"linear-gradient(white, white) padding-box, linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to)) border-box",
									}}
								>
									{/* Step Number Badge */}
									<div
										className={`absolute -top-4 left-1/2 flex h-8 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r ${step.gradient} px-4 text-[14px] font-bold text-white shadow-lg`}
									>
										Langkah {step.number}
									</div>

									{/* Icon */}
									<motion.div
										whileHover={{ scale: 1.1, rotate: 5 }}
										className={`mt-4 flex h-[90px] w-[90px] items-center justify-center rounded-[24px] ${step.bgLight} shadow-inner transition-colors group-hover:${step.bgDark}`}
									>
										<step.icon className={`h-10 w-10 text-${step.color}-500`} />
									</motion.div>

									{/* Content */}
									<h3 className="mt-6 text-center text-[22px] font-bold text-neutral-900 transition-colors group-hover:text-ruby-600">
										{step.title}
									</h3>
									<p className="mt-3 text-center text-[16px] leading-[1.75] text-neutral-600">{step.description}</p>

									{/* Arrow indicator */}
									{index < steps.length - 1 && (
										<div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-neutral-300 md:block">
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
							className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-[16px] font-semibold text-ruby-500 shadow-lg transition-all hover:gap-3 hover:bg-ruby-50 hover:shadow-xl"
						>
							Panduan Lengkap
							<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
						</Link>
					</div>
				</ScrollReveal>
			</div>
		</section>
	);
}
