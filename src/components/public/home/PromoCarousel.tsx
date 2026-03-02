import { useMemo } from "react";
import { Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getArticles } from "@/api/articles.api";
import { CountdownTimer } from "@/components/public/shared/CountdownTimer";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { GradientText } from "@/components/public/shared/GradientText";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import { usePromos } from "@/hooks/usePromos";

export function PromoCarousel() {
	const { data: promos = [] } = usePromos({ activeOnly: true, showOnHome: true });
	const { data: featuredArticles = [] } = useQuery({
		queryKey: ["featured-article"],
		queryFn: () => getArticles({ publishedOnly: true, limit: 1 }),
	});

	const slides = useMemo(() => promos.slice(0, 10), [promos]);
	const marqueeSlides = useMemo(() => [...slides, ...slides], [slides]);

	return (
		<section className="section-wrap mt-24" id="promo">
			<ScrollReveal className="mb-10 text-center">
				<p className="section-kicker">Promo Aktif</p>
				<h2 className="section-title">
					Promo & <GradientText>Penawaran Terbaik</GradientText>
				</h2>
			</ScrollReveal>

			{slides.length > 0 ? (
				<div className="group overflow-hidden rounded-3xl">
					<div className="flex min-w-max gap-5 animate-[marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
						{marqueeSlides.map((promo, index) => (
							<div key={`${promo.id}-${index}`} className="w-[320px]">
								<div className="animated-gradient-border h-full rounded-3xl">
									<GlassCard className="h-full rounded-[23px] p-0">
										<SafeImage
											src={promo.image}
											fallbackLabel={promo.title}
											alt={promo.title}
											loading="lazy"
											className="h-48 w-full rounded-t-[23px] object-cover"
										/>

										<div className="p-5">
											<p className="inline-flex rounded-full bg-gradient-to-r from-brand-700 via-sapphire-600 to-teal-600 bg-[length:200%_100%] px-3 py-1 text-xs font-semibold text-white animate-[shimmer_3s_linear_infinite]">
												{promo.is_global ? "GLOBAL" : "Khusus Cabang"}
											</p>
											<p className="mt-3 line-clamp-2 text-lg font-bold text-mba-text dark:text-white">
												{promo.title}
											</p>
											<CountdownTimer endDate={promo.end_date} className="mt-2 text-sm" />
											<div className="mt-4 flex items-center justify-between">
												<Link
													to="/promo"
													className="text-sm font-semibold text-brand-700 dark:text-brand-300"
												>
													Lihat Detail
												</Link>
												<a
													href={`https://wa.me/?text=${encodeURIComponent(`Promo MBA Laundry: ${promo.title}`)}`}
													target="_blank"
													rel="noopener noreferrer"
													className="rounded-full border border-slate-300 p-2 transition hover:border-brand-400 dark:border-slate-600"
													aria-label={`Bagikan promo ${promo.title}`}
												>
													<Share2 className="h-4 w-4" />
												</a>
											</div>
										</div>
									</GlassCard>
								</div>
							</div>
						))}
					</div>
				</div>
			) : (
				<GlassCard className="rounded-3xl p-7">
					<p className="text-sm text-[var(--text-muted)]">
						Saat ini belum ada promo aktif. Sambil menunggu, baca artikel terbaru:
					</p>
					{featuredArticles[0] ? (
						<Link
							to={`/blog/${featuredArticles[0].slug}`}
							className="mt-2 block text-lg font-bold text-brand-700 dark:text-brand-300"
						>
							{featuredArticles[0].title}
						</Link>
					) : (
						<p className="mt-2 text-sm text-[var(--text-muted)]">Belum ada artikel terbaru.</p>
					)}
				</GlassCard>
			)}
		</section>
	);
}
