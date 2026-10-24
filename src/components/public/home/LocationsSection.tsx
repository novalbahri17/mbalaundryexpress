import { ChevronLeft, ChevronRight, Clock, MapPin, Phone, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { useBranches } from "@/hooks/useBranches";
import { usePublicText } from "@/hooks/usePublicText";
import { Button, Card } from "@/design-system";

const FALLBACK_BRANCH_IMAGE =
	"https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2071&auto=format&fit=crop";

const scrollStepPx = 320;

export function LocationsSection() {
	const text = usePublicText();
	const t = text.home.locations;
	const { data: branches = [], isLoading } = useBranches({ activeOnly: true });
	const railRef = useRef<HTMLDivElement | null>(null);

	const handleScroll = (direction: "left" | "right") => {
		const target = railRef.current;
		if (!target) return;

		target.scrollBy({
			left: direction === "left" ? -scrollStepPx : scrollStepPx,
			behavior: "smooth",
		});
	};

	return (
		<section className="section-block bg-white dark:bg-neutral-950">
			<div className="section-inner">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center"
				>
					<p className="section-kicker">{t.kicker}</p>
					<h2 className="section-title text-center">{t.title}</h2>
					<p className="section-subtitle mx-auto !max-w-lg text-center">{t.subtitle}</p>
				</motion.div>

				{/* Branch Cards */}
				<div className="mt-8 sm:mt-12">
					{isLoading ? (
						<p className="text-center text-neutral-500 dark:text-neutral-400">{t.loading}</p>
					) : branches.length === 0 ? (
						<p className="text-center text-neutral-500 dark:text-neutral-400">{t.empty}</p>
					) : (
						<>
							{/* Navigation - Hidden on mobile */}
							<div className="mb-4 hidden items-center justify-between sm:flex">
								<p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
									{branches.length} {t.activeCount}
								</p>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleScroll("left")}
										className="h-11 w-11 rounded-full p-0"
									>
										<ChevronLeft className="h-5 w-5" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleScroll("right")}
										className="h-11 w-11 rounded-full p-0"
									>
										<ChevronRight className="h-5 w-5" />
									</Button>
								</div>
							</div>

							{/* Cards Rail - Full width on mobile */}
							<div
								ref={railRef}
								className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:gap-6"
							>
								{branches.map((branch, index) => (
									<motion.article
										key={branch.id}
										initial={{ opacity: 0, x: 20 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
										className="w-[85vw] shrink-0 snap-start sm:w-[300px] md:w-[340px]"
									>
										<Card hoverLift className="h-full overflow-hidden" noPadding>
											{/* Image */}
											<div className="relative h-44 w-full overflow-hidden sm:h-48">
												<SafeImage
													src={branch.cover_image || FALLBACK_BRANCH_IMAGE}
													fallbackLabel={branch.name}
													alt={branch.name}
													className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
													loading="lazy"
												/>
											</div>

											{/* Content */}
											<div className="flex flex-1 flex-col p-4 sm:p-5">
												<h3 className="text-lg font-bold text-neutral-900 dark:text-white sm:text-xl">{branch.name}</h3>

												<div className="mt-2 flex items-start gap-2">
													<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ruby-500 sm:h-5 sm:w-5" />
													<p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
														{branch.address}
													</p>
												</div>

												<div className="mt-3 space-y-1.5 sm:mt-4">
													<div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
														<Clock className="h-3.5 w-3.5 text-neutral-400 sm:h-4 sm:w-4" />
														<span className="text-xs sm:text-sm">07:00 - 23:00</span>
													</div>
													<div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
														<Phone className="h-3.5 w-3.5 text-neutral-400 sm:h-4 sm:w-4" />
														<span className="line-clamp-1 text-xs sm:text-sm">{branch.whatsapp || "-"}</span>
													</div>
												</div>

												<div className="mt-4 sm:mt-5">
													<Link to={`/cabang/${branch.slug}`} className="block">
														<Button
															variant="outline"
															fullWidth
															size="md"
															rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
														>
															{t.viewDetail}
														</Button>
													</Link>
												</div>
											</div>
										</Card>
									</motion.article>
								))}
							</div>
						</>
					)}
				</div>

				{/* Bottom CTA - Add padding bottom for mobile to avoid overlap with BottomNav */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					className="mt-8 text-center sm:mt-12 md:pb-0"
				>
					<Link to="/cabang" className="inline-block w-full sm:w-auto">
						<Button size="sm" className="w-full sm:w-auto sm:px-6" rightIcon={<MapPin className="h-4 w-4" />}>
							{t.viewAll}
						</Button>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
