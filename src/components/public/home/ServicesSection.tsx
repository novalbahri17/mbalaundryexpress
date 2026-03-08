import { motion } from "framer-motion";
import { ArrowRight, Crown, Shirt, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Card, Container, Heading, Section } from "@/components/ui";
import type { LucideIcon } from "lucide-react";

type ServiceTone = "ruby" | "sapphire" | "teal";

type ServiceItem = {
	title: string;
	description: string;
	icon: LucideIcon;
	tone: ServiceTone;
	size: "lg" | "sm";
};

const services: ServiceItem[] = [
	{
		title: "Cuci Kering",
		description: "Paket inti untuk kebutuhan harian dengan hasil bersih dan rapi.",
		icon: Shirt,
		tone: "ruby",
		size: "lg",
	},
	{
		title: "Setrika",
		description: "Setrika presisi dengan standar lipatan premium.",
		icon: Sparkles,
		tone: "sapphire",
		size: "sm",
	},
	{
		title: "Express 3 Jam",
		description: "Layanan prioritas untuk jadwal super padat.",
		icon: Zap,
		tone: "teal",
		size: "sm",
	},
	{
		title: "Premium Care",
		description: "Perawatan kain khusus untuk item bernilai tinggi.",
		icon: Crown,
		tone: "ruby",
		size: "sm",
	},
];

const toneClass: Record<ServiceTone, string> = {
	ruby: "border-ruby-500/40 bg-ruby-500/10 text-ruby-700 dark:text-ruby-300",
	sapphire: "border-sapphire-500/40 bg-sapphire-500/10 text-sapphire-700 dark:text-sapphire-300",
	teal: "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300",
};

export function ServicesSection() {
	return (
		<Section reveal>
			<Container size="xl">
				<div className="mb-8 flex items-end justify-between gap-4">
					<div>
						<Badge tone="info">Services Overview</Badge>
						<Heading variant="h2" className="mt-3">
							Layanan Utama dengan standar modern
						</Heading>
					</div>
					<Link
						to="/cara-pakai"
						className="hidden items-center gap-2 text-sm font-semibold text-ruby-700 hover:text-ruby-600 md:inline-flex dark:text-ruby-300"
					>
						Lihat Semua Layanan
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>

				<div className="grid auto-rows-[180px] grid-cols-1 gap-4 md:grid-cols-3">
					{services.map((service, index) => {
						const Icon = service.icon;
						const isWide = service.size === "lg";
						return (
							<motion.div
								key={service.title}
								initial={{ opacity: 0, y: 18 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-10%" }}
								transition={{ delay: index * 0.08 }}
								className={isWide ? "md:col-span-2 md:row-span-2" : ""}
							>
								<Card
									variant="glass"
									interactive
									className="h-full border-2 border-neutral-900/10 shadow-md dark:border-neutral-100/10"
								>
									<div className="flex h-full flex-col">
										<div
											className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${toneClass[service.tone]}`}
										>
											<Icon className="h-5 w-5" aria-hidden />
										</div>
										<p className="mt-4 text-h4 text-neutral-900 dark:text-white">{service.title}</p>
										<p className="mt-2 text-body text-neutral-600 dark:text-neutral-300">{service.description}</p>
									</div>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</Container>
		</Section>
	);
}
