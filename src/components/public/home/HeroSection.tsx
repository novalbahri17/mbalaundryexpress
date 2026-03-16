import { CheckCircle2, Clock, MapPin, Star, TrendingUp, Users, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/design-system";
import { HeroImageGrid } from "./HeroImageGrid";

const stats = [
	{ icon: TrendingUp, value: "12.5K+", label: "Cucian Selesai", color: "from-ruby-500 to-ruby-600" },
	{ icon: Star, value: "4.9", label: "Rating Google", color: "from-amber-400 to-amber-500" },
	{ icon: Users, value: "500+", label: "Pelanggan Puas", color: "from-sapphire-500 to-sapphire-600" },
	{ icon: MapPin, value: "2", label: "Cabang Aktif", color: "from-teal-500 to-teal-600" },
];

const features = [
	{ icon: Star, text: "4.9/5 dari 500+ review" },
	{ icon: MapPin, text: "2 cabang di Surabaya" },
	{ icon: Clock, text: "Buka 07:00 - 23:00" },
	{ icon: CheckCircle2, text: "Mesin selalu bersih" },
];

export function HeroSection() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end start"],
	});

	const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

	return (
		<section
			ref={containerRef}
			className="relative min-h-[100svh] overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-neutral-50 pt-24 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 sm:pt-28 lg:pt-32"
		>
			{/* Animated Background */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<motion.div
					animate={{
						x: [0, 20, 0],
						y: [0, -15, 0],
						scale: [1, 1.05, 1],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
					className="absolute -left-20 top-10 h-[300px] w-[300px] rounded-full bg-ruby-500/10 blur-[80px] dark:bg-ruby-500/15 sm:h-[400px] sm:w-[400px] lg:h-[600px] lg:w-[600px]"
				/>
				<motion.div
					animate={{
						x: [0, -15, 0],
						y: [0, 20, 0],
						scale: [1, 1.1, 1],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
					className="absolute -right-20 top-20 h-[250px] w-[250px] rounded-full bg-sapphire-500/10 blur-[70px] dark:bg-sapphire-500/15 sm:h-[350px] sm:w-[350px] lg:h-[500px] lg:w-[500px]"
				/>
				<motion.div
					animate={{
						x: [0, 15, 0],
						y: [0, 15, 0],
						scale: [1, 1.03, 1],
					}}
					transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
					className="absolute bottom-10 left-1/3 h-[200px] w-[200px] rounded-full bg-teal-500/8 blur-[70px] dark:bg-teal-500/12 sm:h-[300px] sm:w-[300px] lg:h-[400px] lg:w-[400px]"
				/>

				{/* Grid Pattern */}
				<div
					className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
					style={{
						backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
						backgroundSize: "40px 40px",
					}}
				/>
			</div>

			<motion.div
				style={{ y, opacity }}
				className="relative z-10 mx-auto flex min-h-[calc(100svh-6rem)] max-w-[1400px] flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-12 lg:py-16"
			>
				<div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
					{/* Left Content */}
					<div className="flex flex-col items-center text-center lg:items-start lg:text-left">
						{/* Badge */}
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
							<span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-ruby-100 to-rose-100 px-3 py-1.5 text-xs font-semibold text-ruby-700 dark:from-ruby-950/50 dark:to-rose-950/50 dark:text-ruby-300 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
								<Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
								Self-Service Laundry Modern
							</span>
						</motion.div>

						{/* Headline */}
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl lg:text-[3.5rem] lg:leading-[1.1]"
						>
							Laundry Sendiri,
							<br className="hidden sm:block" />
							<span className="bg-gradient-to-r from-ruby-600 via-rose-500 to-ruby-600 bg-clip-text text-transparent">
								Hemat Maksimal
							</span>
							<span className="text-neutral-400">,</span>
							<br className="hidden sm:block" />
							<span className="text-neutral-700 dark:text-neutral-200">Cepat Beres</span>
						</motion.h1>

						{/* Description */}
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="mt-4 max-w-md text-base leading-relaxed text-neutral-600 dark:text-neutral-300 sm:mt-6 sm:text-lg lg:max-w-xl"
						>
							Cuci dan kering sendiri dengan mesin modern. Hanya Rp 10.000 untuk cuci, Rp 10.000 untuk kering. Lokasi
							strategis, buka sampai malam.
						</motion.p>

						{/* CTA Buttons */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start"
						>
							<Link to="/cabang" className="w-full sm:w-auto">
								<Button
									size="lg"
									leftIcon={<MapPin className="h-4 w-4 sm:h-5 sm:w-5" />}
									rightIcon={<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />}
									className="w-full"
								>
									Pilih Cabang
								</Button>
							</Link>
							<Link to="/cara-pakai" className="w-full sm:w-auto">
								<Button variant="outline" size="lg" className="w-full">
									Lihat Harga
								</Button>
							</Link>
						</motion.div>

						{/* Features - Scrollable on mobile */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className="mt-6 w-full sm:mt-8"
						>
							<div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0 lg:justify-start">
								{features.map((feature, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: 0.5 + index * 0.1 }}
										className="flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white/80 px-3 py-1.5 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/80 sm:gap-2 sm:px-4"
									>
										<feature.icon className="h-3.5 w-3.5 text-ruby-500 sm:h-4 sm:w-4" />
										<span className="whitespace-nowrap text-xs font-medium text-neutral-700 dark:text-neutral-300 sm:text-sm">
											{feature.text}
										</span>
									</motion.div>
								))}
							</div>
						</motion.div>

						{/* Stats - 2x2 grid on mobile */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.6 }}
							className="mt-8 grid grid-cols-2 gap-4 border-t border-neutral-200/60 pt-6 dark:border-neutral-700/60 sm:mt-10 sm:gap-6 sm:pt-8 lg:grid-cols-4"
						>
							{stats.map((stat, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.7 + index * 0.1 }}
									className="text-center"
								>
									<div
										className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-lg sm:h-12 sm:w-12`}
									>
										<stat.icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
									</div>
									<p className="mt-2 text-xl font-bold text-neutral-900 dark:text-white sm:mt-3 sm:text-2xl">
										{stat.value}
									</p>
									<p className="text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">{stat.label}</p>
								</motion.div>
							))}
						</motion.div>
					</div>

					{/* Right Content - Image Grid */}
					<motion.div
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.7, delay: 0.3 }}
						className="relative mx-auto w-full max-w-sm sm:max-w-md lg:mx-0 lg:max-w-none"
					>
						<HeroImageGrid />
					</motion.div>
				</div>
			</motion.div>
		</section>
	);
}
