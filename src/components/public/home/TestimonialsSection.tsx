import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Quote, Star, MessageCircle } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getTestimonials } from "@/api/testimonials.api";
import { usePublicText } from "@/hooks/usePublicText";
import { Button, Card } from "@/design-system";

export function TestimonialsSection() {
	const text = usePublicText();
	const t = text.home.testimonials;
	const scrollRef = useRef<HTMLDivElement>(null);

	const { data: testimonials = [], isLoading } = useQuery({
		queryKey: ["home-testimonials"],
		queryFn: () => getTestimonials({ approvedOnly: true, limit: 10 }),
	});

	const nextSlide = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
		}
	};

	const prevSlide = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
		}
	};

	if (isLoading || testimonials.length === 0) return null;

	return (
		<section className="section-block overflow-hidden bg-white dark:bg-neutral-950">
			<div className="section-inner !max-w-[1400px]">
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

				{/* Carousel */}
				<div className="relative mt-8 sm:mt-12">
					<div
						ref={scrollRef}
						className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-4 hide-scrollbar sm:gap-6"
					>
						{testimonials.map((item, index) => (
							<motion.div
								key={item.id}
								initial={{ opacity: 0, x: 20 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className="w-[85vw] max-w-[320px] shrink-0 snap-start sm:w-[340px] sm:max-w-none"
							>
								<Card className="h-full" hoverLift>
									<Quote className="h-6 w-6 text-ruby-500 sm:h-8 sm:w-8" />

									{/* Rating */}
									<div className="mt-3 flex items-center gap-1 sm:mt-4">
										{Array.from({ length: item.rating }).map((_, idx) => (
											<Star
												key={`${item.id}-star-${idx}`}
												className="h-4 w-4 fill-amber-400 text-amber-400 sm:h-5 sm:w-5"
											/>
										))}
									</div>

									{/* Comment */}
									<p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 sm:mt-4 sm:text-base">
										"{item.comment}"
									</p>

									{/* Author */}
									<div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-700 sm:mt-6 sm:gap-4 sm:pt-5">
										{item.photo ? (
											<img
												src={item.photo}
												alt={item.customer_name}
												className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12"
											/>
										) : (
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-ruby-700 text-base font-bold text-white sm:h-12 sm:w-12 sm:text-lg">
												{item.customer_name.charAt(0).toUpperCase()}
											</div>
										)}
										<div>
											<p className="text-sm font-semibold text-neutral-900 dark:text-white sm:text-base">
												{item.customer_name}
											</p>
											<p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize sm:text-sm">
												{item.source || t.fallbackSource}
											</p>
										</div>
									</div>
								</Card>
							</motion.div>
						))}
					</div>

					{/* Navigation - Hidden on mobile */}
					{testimonials.length > 2 && (
						<div className="hidden md:block">
							<Button
								variant="outline"
								size="sm"
								onClick={prevSlide}
								className="absolute -left-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full p-0 shadow-xl lg:-left-6"
							>
								<ArrowLeft className="h-5 w-5" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={nextSlide}
								className="absolute -right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full p-0 shadow-xl lg:-right-6"
							>
								<ArrowRight className="h-5 w-5" />
							</Button>
						</div>
					)}
				</div>

				{/* Bottom Link */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					className="mt-8 text-center sm:mt-12"
				>
					<Link to="/testimoni">
						<Button variant="ghost" rightIcon={<ArrowRight className="h-4 w-4" />}>
							{t.viewAll}
						</Button>
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
