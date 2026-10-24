import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { getArticles } from "@/api/articles.api";
import { usePublicText } from "@/hooks/usePublicText";
import { formatDate } from "@/utils/format";

export function BlogSection() {
	const text = usePublicText();
	const t = text.home.blog;
	const { data: articles = [], isLoading } = useQuery({
		queryKey: ["home-article-preview"],
		queryFn: () => getArticles({ publishedOnly: true, limit: 3 }),
	});

	if (isLoading || articles.length === 0) return null;

	return (
		<section className="section-block bg-neutral-50 dark:bg-neutral-900">
			<div className="section-inner flex flex-col items-center">
				{/* HEADER */}
				<p className="section-kicker">{t.kicker}</p>
				<h2 className="section-title text-center">{t.title}</h2>
				<p className="section-subtitle text-center">{t.subtitle}</p>

				{/* CONTENT GRID */}
				<div className="mt-14 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
					{articles.map((article) => (
						<Link
							key={article.id}
							to={`/blog/${article.slug}`}
							className="group flex flex-col overflow-hidden rounded-[20px] bg-white border border-neutral-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-neutral-800 dark:border-neutral-700"
						>
							<div className="relative aspect-[16/10] w-full overflow-hidden">
								<img
									src={
										article.thumbnail ||
										"https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=2070&auto=format&fit=crop"
									}
									alt={article.title}
									className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
								/>
								<div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sapphire-700 shadow-sm dark:bg-neutral-900 dark:text-sapphire-300">
									{article.category || t.categoryFallback}
								</div>
							</div>

							<div className="flex flex-1 flex-col p-6">
								<h3 className="line-clamp-2 text-[20px] font-bold leading-[1.4] text-neutral-900 group-hover:text-sapphire-600 transition-colors dark:text-white dark:group-hover:text-sapphire-400">
									{article.title}
								</h3>
								<p className="mt-3 line-clamp-3 text-[14px] leading-[1.6] text-neutral-600 dark:text-neutral-300">
									{article.excerpt}
								</p>

								<div className="mt-auto pt-6 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-700">
									<span className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
										{formatDate(article.published_at || article.created || new Date().toISOString())}
									</span>
									<span className="flex items-center text-[12px] font-bold text-sapphire-600">
										{t.read} <ArrowRightIcon className="ml-1 h-3 w-3" />
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>

				{/* BOTTOM CTA */}
				<Link
					to="/blog"
					className="mt-12 inline-flex items-center justify-center rounded-xl border-2 border-sapphire-500 bg-transparent px-8 py-3 text-[16px] font-semibold text-sapphire-600 transition-colors hover:bg-sapphire-50 dark:border-sapphire-400 dark:text-sapphire-400 dark:hover:bg-sapphire-900/20"
				>
					{t.viewAll}
				</Link>
			</div>
		</section>
	);
}
