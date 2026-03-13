import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ArrowRightIcon, Quote, Star } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { getTestimonials } from "@/api/testimonials.api";

export function TestimonialsSection() {
	const scrollRef = useRef<HTMLDivElement>(null);

	const { data: testimonials = [], isLoading } = useQuery({
		queryKey: ["home-testimonials"],
		queryFn: () => getTestimonials({ approvedOnly: true, limit: 10 }),
	});

	const nextSlide = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: 380, behavior: "smooth" });
		}
	};

	const prevSlide = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollBy({ left: -380, behavior: "smooth" });
		}
	};

	if (isLoading || testimonials.length === 0) return null;

	return (
		<section className="overflow-hidden bg-white px-6 py-24 md:px-12 md:py-32 dark:bg-neutral-950">
			<div className="mx-auto flex max-w-[1400px] flex-col items-center">
				{/* HEADER */}
				<span className="rounded-full bg-sapphire-500 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white">
					Testimoni
				</span>
				<h2 className="mt-3 text-center text-[32px] font-bold leading-[1.2] text-neutral-900 md:text-[40px] dark:text-white">
					Review Pelanggan Kami
				</h2>

				{/* CAROUSEL */}
				<div className="relative mt-16 w-full max-w-[1240px]">
					<div ref={scrollRef} className="flex w-full overflow-x-auto snap-x snap-mandatory pb-8 px-4 hide-scrollbar">
						<div className="flex w-[max-content] gap-6">
							{testimonials.map((item) => (
								<div
									key={item.id}
									className="flex w-[85vw] max-w-[360px] snap-center shrink-0 flex-col rounded-[24px] border border-neutral-200 bg-white p-8 transition-all hover:border-ruby-200 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
									style={{ minHeight: "280px" }}
								>
									<Quote className="h-8 w-8 text-ruby-500" />
									<div className="mt-4 flex items-center gap-1">
										{Array.from({ length: item.rating }).map((_, idx) => (
											<Star key={`${item.id}-star-${idx}`} className="h-5 w-5 fill-amber-400 text-amber-400" />
										))}
									</div>
									<p className="mt-4 text-[18px] leading-[1.75] text-neutral-700 dark:text-neutral-300">"{item.comment}"</p>

									<hr className="mb-6 mt-auto border-neutral-200 dark:border-neutral-700" />

									<div className="flex items-center gap-4">
										{item.photo ? (
											<img src={item.photo} alt={item.customer_name} className="h-12 w-12 rounded-full object-cover" />
										) : (
											<div className="flex h-12 w-12 items-center justify-center rounded-full bg-ruby-500 text-[20px] font-bold text-white">
												{item.customer_name.charAt(0).toUpperCase()}
											</div>
										)}
										<div className="flex flex-col">
											<span className="text-[16px] font-semibold text-neutral-900 dark:text-white">{item.customer_name}</span>
											<span className="max-w-[150px] truncate text-[14px] capitalize text-neutral-500 dark:text-neutral-400">
												{item.source || "Pelanggan"}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* NAVIGATION ARROWS */}
					{testimonials.length > 2 && (
						<div className="hidden md:block">
							<button
								type="button"
								onClick={prevSlide}
								className="absolute -left-6 top-[40%] z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-ruby-500 shadow-xl transition-all hover:scale-110 hover:bg-ruby-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
								aria-label="Previous testimonial"
							>
								<ArrowLeft className="h-6 w-6" />
							</button>
							<button
								type="button"
								onClick={nextSlide}
								className="absolute -right-6 top-[40%] z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-ruby-500 shadow-xl transition-all hover:scale-110 hover:bg-ruby-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
								aria-label="Next testimonial"
							>
								<ArrowRight className="h-6 w-6" />
							</button>
						</div>
					)}
				</div>

				{/* BOTTOM LINK */}
				<Link
					to="/testimoni"
					className="mt-12 flex items-center text-[16px] font-semibold text-ruby-500 hover:underline"
				>
					Lihat Semua Review <ArrowRightIcon className="ml-2 h-4 w-4" />
				</Link>
			</div>
		</section>
	);
}
