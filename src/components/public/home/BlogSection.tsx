import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getArticles } from "@/api/articles.api";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { GradientText } from "@/components/public/shared/GradientText";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import { formatDate } from "@/utils/format";

const categoryStyle: Record<string, string> = {
	"tips-mencuci": "bg-brand-500/15 text-brand-700 dark:text-brand-300",
	"tips-kering": "bg-sapphire-500/15 text-sapphire-700 dark:text-sapphire-300",
	"perawatan-bahan": "bg-teal-500/15 text-teal-700 dark:text-teal-300",
	noda: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
	umum: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
	berita: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
	"promo-info": "bg-pink-500/15 text-pink-700 dark:text-pink-300",
};

export function BlogSection() {
	const { data: articles = [] } = useQuery({
		queryKey: ["home-articles"],
		queryFn: () => getArticles({ publishedOnly: true, limit: 3 }),
	});

	return (
		<section className="section-wrap mt-24">
			<ScrollReveal className="mb-10 text-center">
				<p className="section-kicker">Blog</p>
				<h2 className="section-title">
					Tips & Trik <GradientText>Merawat Pakaian</GradientText>
				</h2>
			</ScrollReveal>

			<div className="grid gap-5 md:grid-cols-3">
				{articles.map((article, index) => (
					<ScrollReveal key={article.id} delay={index * 0.08}>
						<Link to={`/blog/${article.slug}`} className="block h-full">
							<GlassCard className="h-full overflow-hidden rounded-3xl p-0">
								<div className="relative h-44 overflow-hidden">
									<SafeImage
										src={article.thumbnail}
										fallbackLabel={article.title}
										alt={article.title}
										className="h-full w-full object-cover transition duration-500 hover:scale-105"
										loading="lazy"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-0 transition hover:opacity-100" />
								</div>
								<div className="p-4">
									<p
										className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
											categoryStyle[article.category] ?? categoryStyle.umum
										}`}
									>
										{article.category.replace("-", " ")}
									</p>
									<p className="mt-3 line-clamp-2 font-bold text-mba-text dark:text-white">
										{article.title}
									</p>
									<p className="mt-2 line-clamp-3 text-sm text-[var(--text-muted)]">
										{article.excerpt}
									</p>
									<p className="mt-3 text-xs text-[var(--text-muted)]">
										{article.read_time ?? 5} menit baca ·{" "}
										{article.published_at ? formatDate(article.published_at) : "Baru"}
									</p>
								</div>
							</GlassCard>
						</Link>
					</ScrollReveal>
				))}
			</div>

			<div className="mt-8 text-center">
				<Link to="/blog" className="btn-primary inline-flex rounded-full px-6 py-2.5 text-sm font-semibold">
					Lihat Semua Tips
				</Link>
			</div>
		</section>
	);
}
