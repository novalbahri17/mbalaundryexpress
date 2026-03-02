import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getArticles } from "@/api/articles.api";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { formatDate } from "@/utils/format";

export default function BlogListPage() {
	const [search, setSearch] = useState("");
	const { data: articles = [] } = useQuery({
		queryKey: ["articles", search],
		queryFn: () => getArticles({ publishedOnly: true, search: search || undefined }),
	});

	return (
		<section className="pb-20">
			<PageHeader
				kicker="Blog"
				title="Tips dan"
				highlight="Artikel"
				description="Panduan merawat pakaian, tips hemat waktu, dan update promo MBA Laundry."
			/>
			<div className="mx-auto max-w-7xl px-4 md:px-8">
				<div className="relative mb-6 max-w-md">
					<Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
					<input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Cari artikel..."
						className="glass-card h-11 w-full rounded-xl pl-10 pr-3 text-sm focus:border-red-400 focus:outline-none"
					/>
				</div>

				<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{articles.map((article) => (
						<Link key={article.id} to={`/blog/${article.slug}`} className="block h-full">
							<GlassCard className="h-full overflow-hidden p-0">
								<SafeImage
									src={article.thumbnail}
									fallbackLabel={article.title}
									alt={article.title}
									className="h-44 w-full object-cover"
									loading="lazy"
								/>
								<div className="p-4">
									<p className="inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold capitalize text-slate-700 dark:text-slate-200">
										{article.category}
									</p>
									<p className="mt-2 line-clamp-2 text-lg font-bold">{article.title}</p>
									<p className="mt-2 line-clamp-3 text-sm text-[var(--text-muted)]">{article.excerpt}</p>
									<p className="mt-3 text-xs text-[var(--text-muted)]">
										{formatDate(article.published_at ?? article.created ?? new Date())} · {article.read_time ?? 5} menit baca
									</p>
								</div>
							</GlassCard>
						</Link>
					))}
				</div>
				{articles.length === 0 ? <p className="mt-6 text-sm text-[var(--text-muted)]">Belum ada artikel yang cocok.</p> : null}
			</div>
		</section>
	);
}
