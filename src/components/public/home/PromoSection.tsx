import { Clock, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { usePromos } from "@/hooks/usePromos";
import { usePublicText } from "@/hooks/usePublicText";
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
	const text = usePublicText();
	const t = text.home.promo;
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
					<p className="section-kicker">{t.kicker}</p>
					<h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl md:text-4xl">
						{t.title}
					</h2>
					<p className="mx-auto mt-3 max-w-lg px-4 text-sm text-neutral-600 dark:text-neutral-300 sm:text-base">
						{t.subtitle}
					</p>
				</motion.div>

				{/* Promo Cards - Responsive Grid */}
				<div className="mt-8 grid gap-4 px-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 sm:px-0 lg:grid-cols-3">
					{visiblePromos.map((promo, index) => {
						const time = promo.end_date ? getTimeLeft(promo.end_date) : null;
						const plainDescription = promo.description?.replace(/<[^>]*>/g, "").trim() ?? "";
						// Promo global berlaku di semua cabang; promo lokal hanya di cabang
						// yang tertera, jadi namanya ditampilkan supaya tidak menyesatkan.
						const scopeLabel = promo.is_global
							? text.pages.promo.globalBadge
							: promo.branch_names && promo.branch_names.length > 0
								? promo.branch_names.join(", ")
								: text.pages.promo.localBadge;

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
										<SafeImage
											src={promo.image}
											fallbackLabel={promo.title}
											alt={promo.title}
											className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
										/>
										<div className="absolute left-3 top-3 sm:left-4 sm:top-4">
											<CardBadge variant={promo.is_global ? "primary" : "warning"}>{scopeLabel}</CardBadge>
										</div>
									</div>

									{/* Content */}
									<div className="p-4 sm:p-5">
										<h3 className="text-base font-bold text-neutral-900 dark:text-white sm:text-lg">{promo.title}</h3>
										{/* Deskripsi yang isinya sama dengan judul hanya mengulang teks, jadi tidak ditampilkan. */}
										{plainDescription && plainDescription.toLowerCase() !== promo.title.trim().toLowerCase() ? (
											<p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
												{plainDescription}
											</p>
										) : null}

										{/* Countdown: hanya untuk promo yang punya tenggat waktu. */}
										{time ? (
											<div className="mt-3 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 sm:mt-4 sm:text-sm">
												<Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
												<span>
													{text.countdown.validFor} {time.days}
													{text.countdown.daysShort} {time.hours}
													{text.countdown.hoursShort}
												</span>
											</div>
										) : null}
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
							{t.viewAll}
						</Button>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
