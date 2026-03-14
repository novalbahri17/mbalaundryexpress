import { Gift, Clock, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePromos } from "@/hooks/usePromos";
import { Button, Card, CardBadge } from "@/design-system";

type TimeLeft = {
	days: number;
	hours: number;
	minutes: number;
};

function getTimeLeft(target: string): TimeLeft {
	const end = new Date(target).getTime();
	const diff = Math.max(0, end - Date.now());
	const days = Math.floor(diff / (24 * 60 * 60 * 1000));
	const hours = Math.floor((diff / (60 * 60 * 1000)) % 24);
	const minutes = Math.floor((diff / (60 * 1000)) % 60);
	return { days, hours, minutes };
}

export function PromoSection() {
	const { data: promos = [], isLoading } = usePromos({ activeOnly: true, showOnHome: true });
	const visiblePromos = useMemo(() => promos.slice(0, 6), [promos]);

	if (isLoading || visiblePromos.length === 0) return null;

	return (
		<section className="overflow-hidden bg-neutral-50 px-4 py-16 dark:bg-neutral-900 sm:px-6 sm:py-20 md:px-12 md:py-24">
			<div className="mx-auto max-w-[1200px]">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center"
				>
					<span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ruby-500 to-rose-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white shadow-lg">
						<Gift className="h-4 w-4" />
						Promo Terbaru
					</span>
					<h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl md:text-4xl">
						Diskon & Penawaran Spesial
					</h2>
					<p className="mx-auto mt-3 max-w-lg px-4 text-sm text-neutral-600 dark:text-neutral-300 sm:text-base">
						Dapatkan harga terbaik untuk layanan laundry Anda
					</p>
				</motion.div>

				{/* Promo Cards - Responsive Grid */}
				<div className="mt-8 grid gap-4 px-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 sm:px-0 lg:grid-cols-3">
					{visiblePromos.map((promo, index) => {
						const time = getTimeLeft(promo.end_date);
						const plainDescription = promo.description?.replace(/<[^>]*>/g, "").trim() ?? "";

						return (
							<motion.div
								key={promo.id}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
							>
								<Card hoverLift className="h-full overflow-hidden" noPadding>
									{/* Image */}
									<div className="relative h-40 overflow-hidden sm:h-48">
										<img
											src={
												promo.image ||
												"https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?q=80&w=2070&auto=format&fit=crop"
											}
											alt={promo.title}
											className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
										/>
										<div className="absolute left-3 top-3 sm:left-4 sm:top-4">
											<CardBadge variant="error">Promo Aktif</CardBadge>
										</div>
									</div>

									{/* Content */}
									<div className="p-4 sm:p-5">
										<h3 className="text-base font-bold text-neutral-900 dark:text-white sm:text-lg">{promo.title}</h3>
										{plainDescription && (
											<p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
												{plainDescription}
											</p>
										)}

										{/* Countdown */}
										<div className="mt-3 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 sm:mt-4 sm:text-sm">
											<Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
											<span>
												Berlaku {time.days}h {time.hours}j lagi
											</span>
										</div>
									</div>
								</Card>
							</motion.div>
						);
					})}
				</div>

				{/* Bottom Link */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					className="mt-8 text-center sm:mt-12"
				>
					<Link to="/promo">
						<Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
							Lihat Semua Promo
						</Button>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
