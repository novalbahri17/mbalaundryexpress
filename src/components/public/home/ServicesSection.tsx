import { motion } from "framer-motion";
import { ArrowRight, Crown, Shirt, Sparkles, Zap, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Card } from "@/design-system";
import type { LucideIcon } from "lucide-react";

type ServiceTone = "ruby" | "sapphire" | "teal" | "amber";

type ServiceItem = {
	title: string;
	description: string;
	icon: LucideIcon;
	tone: ServiceTone;
	price: string;
};

const services: ServiceItem[] = [
	{
		title: "Cuci Kering",
		description: "Paket inti untuk kebutuhan harian dengan hasil bersih dan rapi.",
		icon: Shirt,
		tone: "ruby",
		price: "Rp 10.000",
	},
	{
		title: "Setrika",
		description: "Setrika presisi dengan standar lipatan premium. Rapi dan wangi.",
		icon: Sparkles,
		tone: "sapphire",
		price: "Rp 5.000",
	},
	{
		title: "Express 3 Jam",
		description: "Layanan prioritas untuk jadwal super padat. Cepat tanpa mengorbankan kualitas.",
		icon: Zap,
		tone: "teal",
		price: "Rp 15.000",
	},
	{
		title: "Premium Care",
		description: "Perawatan kain khusus untuk item bernilai tinggi. Silk, wool, dan lainnya.",
		icon: Crown,
		tone: "amber",
		price: "Rp 25.000",
	},
];

const toneClasses: Record<ServiceTone, { bg: string; icon: string; badge: string }> = {
	ruby: {
		bg: "from-ruby-500/5 to-rose-500/5",
		icon: "bg-gradient-to-br from-ruby-500 to-rose-500 text-white",
		badge: "bg-ruby-100 text-ruby-700 dark:bg-ruby-950/50 dark:text-ruby-300",
	},
	sapphire: {
		bg: "from-sapphire-500/5 to-blue-500/5",
		icon: "bg-gradient-to-br from-sapphire-500 to-blue-500 text-white",
		badge: "bg-sapphire-100 text-sapphire-700 dark:bg-sapphire-950/50 dark:text-sapphire-300",
	},
	teal: {
		bg: "from-teal-500/5 to-emerald-500/5",
		icon: "bg-gradient-to-br from-teal-500 to-emerald-500 text-white",
		badge: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
	},
	amber: {
		bg: "from-amber-500/5 to-orange-500/5",
		icon: "bg-gradient-to-br from-amber-500 to-orange-500 text-white",
		badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
	},
};

export function ServicesSection() {
	return (
		<section className="bg-neutral-50 px-4 py-16 dark:bg-neutral-900 sm:px-6 sm:py-20 md:px-12 md:py-32">
			<div className="mx-auto max-w-[1200px]">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-12 md:flex-row md:items-end"
				>
					<div className="text-center md:text-left">
						<span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sapphire-500 to-blue-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-lg">
							<Package className="h-4 w-4" />
							Layanan
						</span>
						<h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl md:text-4xl">
							Layanan Utama Kami
						</h2>
						<p className="mt-2 max-w-lg text-sm text-neutral-600 dark:text-neutral-300 sm:text-base">
							Pilih layanan yang sesuai dengan kebutuhan laundry Anda
						</p>
					</div>
					<Link to="/cara-pakai" className="hidden md:block">
						<Button variant="ghost" rightIcon={<ArrowRight className="h-4 w-4" />}>
							Lihat Semua
						</Button>
					</Link>
				</motion.div>

				{/* Services Grid - 2 cols on mobile, 4 on desktop */}
				<div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
					{services.map((service, index) => {
						const Icon = service.icon;
						const tones = toneClasses[service.tone];

						return (
							<motion.div
								key={service.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
							>
								<Card hoverLift className={`h-full bg-gradient-to-br ${tones.bg}`}>
									<div
										className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tones.icon} shadow-lg sm:h-12 sm:w-12`}
									>
										<Icon className="h-5 w-5 sm:h-6 sm:w-6" />
									</div>

									<h3 className="mt-3 text-lg font-bold text-neutral-900 dark:text-white sm:mt-4 sm:text-xl">
										{service.title}
									</h3>

									<p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
										{service.description}
									</p>

									<div className="mt-4 flex items-center justify-between sm:mt-5">
										<span
											className={`rounded-full px-2.5 py-1 text-xs font-semibold sm:px-3 sm:text-sm ${tones.badge}`}
										>
											{service.price}
										</span>
									</div>
								</Card>
							</motion.div>
						);
					})}
				</div>

				{/* Mobile CTA */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					className="mt-8 text-center md:hidden"
				>
					<Link to="/cara-pakai">
						<Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
							Lihat Semua Layanan
						</Button>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
