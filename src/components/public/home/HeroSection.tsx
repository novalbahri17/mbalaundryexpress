import { CheckCircle2, Clock, MapPin, Star, TrendingUp, Users, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const stats = [
	{ icon: TrendingUp, value: "12.5K+", label: "Cucian Selesai", color: "text-ruby-500" },
	{ icon: Star, value: "4.9", label: "Rating Google", color: "text-amber-500" },
	{ icon: Users, value: "500+", label: "Pelanggan Puas", color: "text-sapphire-500" },
	{ icon: MapPin, value: "2", label: "Cabang Aktif", color: "text-teal-500" },
];

const features = [
	{ icon: Star, text: "4.9/5 dari 500+ review" },
	{ icon: MapPin, text: "2 cabang di Surabaya" },
	{ icon: Clock, text: "Buka 07:00 - 23:00" },
	{ icon: CheckCircle2, text: "Mesin selalu bersih" },
];

export function HeroSection() {
	return (
		<section className="relative overflow-hidden bg-[var(--landing-bg-light)] px-6 py-20 dark:bg-[var(--landing-bg-dark)] md:py-28 lg:px-12">
			{/* Background Effects */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-20 -top-20 h-[340px] w-[340px] rounded-full bg-ruby-400/18 blur-[90px] dark:bg-ruby-500/20" />
				<div className="absolute right-[-80px] top-[12%] h-[380px] w-[380px] rounded-full bg-sapphire-400/18 blur-[95px] dark:bg-sapphire-500/18" />
				<div className="absolute bottom-[-120px] left-[36%] h-[340px] w-[340px] rounded-full bg-teal-400/14 blur-[95px] dark:bg-teal-500/16" />
				<div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/15 to-white/70 dark:from-neutral-950/30 dark:via-neutral-950/8 dark:to-neutral-950/55" />
				{/* Subtle pattern */}
				<div 
					className="absolute inset-0 opacity-[0.015]"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}
				/>
			</div>

			<div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 lg:grid-cols-2">
				{/* Left Content */}
				<div className="flex flex-col items-start text-left">
					<motion.span 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white shadow-lg"
					>
						✨ Self-Service Laundry Modern
					</motion.span>

					<motion.h1 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="mt-4 text-[40px] font-bold leading-[1.1] text-neutral-900 dark:text-neutral-100 md:text-[48px] lg:text-[56px]"
					>
						Laundry Sendiri,{" "}
						<span className="bg-gradient-to-r from-ruby-500 to-ruby-600 bg-clip-text text-transparent">
							Hemat Maksimal
						</span>
						, Cepat Beres
					</motion.h1>

					<motion.p 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="mt-6 max-w-[520px] text-[18px] leading-[1.75] text-neutral-600 dark:text-neutral-300"
					>
						Cuci dan kering sendiri dengan mesin modern. Rp 10.000 cuci, Rp 10.000 kering. Lokasi strategis, buka sampai malam.
					</motion.p>

					{/* CTA Buttons */}
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
					>
						<Link
							to="/cabang"
							className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ruby-500 to-ruby-600 px-8 py-4 text-[16px] font-semibold text-white shadow-ruby-glow transition-all hover:scale-105 hover:shadow-xl"
						>
							<MapPin className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
							Pilih Cabang Terdekat
						</Link>
						<Link
							to="/cara-pakai"
							className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ruby-500 bg-white/85 px-8 py-4 text-[16px] font-semibold text-ruby-500 transition-all hover:bg-ruby-50 hover:gap-3 dark:bg-neutral-950/70 dark:text-ruby-300 dark:hover:bg-neutral-900"
						>
							Lihat Harga & Cara Pakai
							<span className="transition-transform group-hover:translate-x-1">→</span>
						</Link>
					</motion.div>

					{/* Features */}
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
					>
						{features.map((feature, index) => (
							<div 
								key={index}
								className="flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 backdrop-blur-sm dark:bg-neutral-900/40"
							>
								<feature.icon className="h-4 w-4 text-ruby-500" />
								<span className="text-[13px] text-neutral-600 dark:text-neutral-300">{feature.text}</span>
							</div>
						))}
					</motion.div>

					{/* Stats Counter */}
					<motion.div 
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.5 }}
						className="mt-12 grid grid-cols-2 gap-4 border-t border-neutral-200/60 pt-8 sm:grid-cols-4"
					>
						{stats.map((stat, index) => (
							<motion.div 
								key={index}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
								className="group text-center"
							>
								<div className="flex justify-center">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110 dark:bg-neutral-800">
										<stat.icon className={`h-6 w-6 ${stat.color}`} />
									</div>
								</div>
								<p className="mt-3 text-[28px] font-bold leading-none text-neutral-900 dark:text-neutral-100">
									{stat.value}
								</p>
								<p className="mt-1 text-[13px] text-neutral-500">{stat.label}</p>
							</motion.div>
						))}
					</motion.div>
				</div>

				{/* Right Content - Image */}
				<motion.div 
					initial={{ opacity: 0, x: 40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.7, delay: 0.3 }}
					className="relative mx-auto mt-8 w-full max-w-lg lg:mt-0 lg:max-w-none"
				>
					<div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-white/35 shadow-2xl dark:border-white/15">
						<img
							src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=2070&auto=format&fit=crop"
							alt="Interior mesin cuci modern"
							className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
						/>
						{/* Overlay gradient */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
					</div>

					{/* Floating Card 1 */}
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.8 }}
						className="absolute right-[-10px] top-6 rounded-2xl border border-white/50 bg-white/95 px-5 py-3 shadow-lg backdrop-blur-xl md:right-[-24px] dark:border-white/20 dark:bg-neutral-900/95"
					>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-ruby-100 dark:bg-ruby-500/20">
								<Home className="h-6 w-6 text-ruby-500" />
							</div>
							<div>
								<p className="text-[12px] font-semibold uppercase text-neutral-500 dark:text-neutral-300">Mesin Modern</p>
								<p className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">7-10kg Kapasitas</p>
							</div>
						</div>
					</motion.div>

					{/* Floating Card 2 */}
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 1 }}
						className="absolute -left-4 bottom-8 rounded-2xl border border-white/50 bg-white/95 px-5 py-3 shadow-lg backdrop-blur-xl md:-left-8 dark:border-white/20 dark:bg-neutral-900/95"
					>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-500/20">
								<Clock className="h-6 w-6 text-teal-500" />
							</div>
							<div>
								<p className="text-[12px] font-semibold uppercase text-neutral-500 dark:text-neutral-300">Cepat & Efisien</p>
								<p className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">30-40 Menit</p>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
