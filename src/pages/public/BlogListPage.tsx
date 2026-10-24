import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3, Eye, Search, SearchX } from "lucide-react";
import { getArticles } from "@/api/articles.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { formatDate } from "@/utils/format";
import type { Article, ArticleCategory } from "@/types/database.types";
import { usePublicText } from "@/hooks/usePublicText";

const CATEGORY_CLASS: Record<ArticleCategory, string> = {
	"tips-mencuci": "bg-sapphire-500/10 text-sapphire-600 dark:text-sapphire-400",
	"tips-kering": "bg-teal-500/10 text-teal-600 dark:text-teal-400",
	"perawatan-bahan": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
	noda: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
	umum: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400",
	berita: "bg-ruby-500/10 text-ruby-600 dark:text-ruby-400",
	"promo-info": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const FILTERS: Array<ArticleCategory | "all"> = [
	"all",
	"tips-mencuci",
	"tips-kering",
	"perawatan-bahan",
	"noda",
	"berita",
	"promo-info",
];

function ArticleCard({ article, index }: { article: Article; index: number }) {
	const t = usePublicText().pages.blog;
	const className = CATEGORY_CLASS[article.category] ?? CATEGORY_CLASS.umum;
	const label = t.categories[article.category] ?? t.categories.umum;
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
		>
			<Link to={`/blog/${article.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-700/70 dark:bg-neutral-800">
				<div className="relative aspect-[16/10] w-full overflow-hidden">
					<SafeImage
						src={article.thumbnail}
						fallbackLabel={article.title}
						alt={article.title}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						loading="lazy"
					/>
					<span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${className}`}>
						{label}
					</span>
				</div>
				<div className="flex flex-1 flex-col p-5">
					<h3 className="line-clamp-2 text-lg font-bold leading-snug text-neutral-900 transition-colors group-hover:text-ruby-600 dark:text-white dark:group-hover:text-ruby-400">
						{article.title}
					</h3>
					<p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{article.excerpt}</p>
					<div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
						<span className="inline-flex items-center gap-1.5">
							<CalendarDays className="h-3.5 w-3.5" />
							{formatDate(article.published_at ?? article.created ?? new Date())}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Clock3 className="h-3.5 w-3.5" />
							{t.readTime.replace("{n}", String(article.read_time ?? 5))}
						</span>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}

function FeaturedCard({ article }: { article: Article }) {
	const t = usePublicText().pages.blog;
	const className = CATEGORY_CLASS[article.category] ?? CATEGORY_CLASS.umum;
	const label = t.categories[article.category] ?? t.categories.umum;
	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
			<Link to={`/blog/${article.slug}`} className="group grid overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-sm transition-all duration-300 hover:shadow-2xl dark:border-neutral-700/70 dark:bg-neutral-800 md:grid-cols-2">
				<div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:h-full">
					<SafeImage
						src={article.thumbnail}
						fallbackLabel={article.title}
						alt={article.title}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						loading="lazy"
					/>
					<span className={`absolute left-5 top-5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide ${className}`}>
						{label}
					</span>
				</div>
				<div className="flex flex-col justify-center p-7 md:p-10">
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-ruby-500">{t.featured}</p>
					<h2 className="mt-3 text-2xl font-bold leading-tight text-neutral-900 transition-colors group-hover:text-ruby-600 dark:text-white dark:group-hover:text-ruby-400 md:text-3xl">
						{article.title}
					</h2>
					<p className="mt-4 line-clamp-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 md:text-base">{article.excerpt}</p>
					<div className="mt-6 flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
						<span className="inline-flex items-center gap-1.5">
							<CalendarDays className="h-4 w-4" />
							{formatDate(article.published_at ?? article.created ?? new Date())}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Clock3 className="h-4 w-4" />
							{t.readTime.replace("{n}", String(article.read_time ?? 5))}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Eye className="h-4 w-4" />
							{article.views}
						</span>
					</div>
					<span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-ruby-600 dark:text-ruby-400">
						{t.readMore}
						<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
					</span>
				</div>
			</Link>
		</motion.div>
	);
}

function SkeletonCard() {
	return (
		<div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white dark:border-neutral-700/70 dark:bg-neutral-800">
			<div className="aspect-[16/10] w-full animate-pulse bg-neutral-200 dark:bg-neutral-700" />
			<div className="space-y-3 p-5">
				<div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
				<div className="h-3 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
				<div className="h-3 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
			</div>
		</div>
	);
}

export default function BlogListPage() {
	const t = usePublicText().pages.blog;
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<ArticleCategory | "all">("all");

	const { data: articles = [], isLoading } = useQuery({
		queryKey: ["articles", search],
		queryFn: () => getArticles({ publishedOnly: true, search: search || undefined }),
	});

	const filtered = useMemo(() => {
		if (category === "all") return articles;
		return articles.filter((item) => item.category === category);
	}, [articles, category]);

	const featured = filtered[0];
	const rest = filtered.slice(1);

	return (
		<section className="pb-24">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />

			<div className="mx-auto max-w-7xl px-4 md:px-8">
				{/* Search + Filter */}
				<div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="relative w-full md:max-w-sm">
						<Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
						<input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder={t.searchPlaceholder}
							className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 shadow-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-ruby-400 focus:ring-2 focus:ring-ruby-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
						/>
					</div>
					<div className="flex flex-wrap gap-2">
						{FILTERS.map((filter) => (
							<button
								key={filter}
								type="button"
								onClick={() => setCategory(filter)}
								className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
									category === filter
										? "bg-ruby-600 text-white shadow-md shadow-ruby-500/25"
										: "border border-neutral-200 bg-white text-neutral-600 hover:border-ruby-300 hover:text-ruby-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-ruby-400"
								}`}
							>
								{t.categories[filter]}
							</button>
						))}
					</div>
				</div>

				{/* Loading */}
				{isLoading ? (
					<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
							<SkeletonCard key={i} />
						))}
					</div>
				) : filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white/50 py-20 text-center dark:border-neutral-700 dark:bg-neutral-800/40">
						<SearchX className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
						<p className="mt-4 text-lg font-bold text-neutral-900 dark:text-white">{t.emptyTitle}</p>
						<p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
							{t.emptyBody}
						</p>
					</div>
				) : (
					<>
						{/* Featured */}
						{featured ? <FeaturedCard article={featured} /> : null}

						{/* Grid */}
						{rest.length > 0 ? (
							<div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
								{rest.map((article, index) => (
									<ArticleCard key={article.id} article={article} index={index} />
								))}
							</div>
						) : null}
					</>
				)}
			</div>
		</section>
	);
}

