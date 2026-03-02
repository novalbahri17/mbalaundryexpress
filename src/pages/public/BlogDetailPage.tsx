import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getArticleBySlug, getArticles, incrementArticleViews } from "@/api/articles.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { formatDate, sanitizeRichHtml } from "@/utils/format";

export default function BlogDetailPage() {
	const { slug } = useParams();
	const { data: article } = useQuery({
		queryKey: ["article", slug],
		queryFn: () => getArticleBySlug(slug ?? ""),
		enabled: Boolean(slug),
	});

	const { data: related = [] } = useQuery({
		queryKey: ["article-related", article?.id],
		queryFn: () => getArticles({ publishedOnly: true, limit: 4 }),
		enabled: Boolean(article?.id),
	});

	useEffect(() => {
		if (!article) return;
		void incrementArticleViews(article.id, article.views);
	}, [article]);

	const safeHtml = useMemo(() => sanitizeRichHtml(article?.content ?? ""), [article?.content]);

	if (!article) {
		return <p className="px-4 py-20 text-center text-sm text-[var(--text-muted)]">Artikel tidak ditemukan.</p>;
	}

	return (
		<section className="pb-20">
			<PageHeader kicker="Blog Detail" title={article.title} description={article.excerpt} />
			<div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[1fr_300px] md:px-8">
				<article className="glass-card rounded-2xl p-6">
					<SafeImage
						src={article.thumbnail}
						fallbackLabel={article.title}
						alt={article.title}
						className="mb-6 h-64 w-full rounded-xl object-cover"
						loading="lazy"
					/>
					<div className="mb-4 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
						<span>{formatDate(article.published_at ?? article.created ?? new Date())}</span>
						<span>•</span>
						<span>{article.read_time ?? 5} menit baca</span>
						<span>•</span>
						<span>{article.views + 1} views</span>
					</div>
					<div className="secure-richtext prose prose-slate max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: safeHtml }} />
				</article>

				<aside className="space-y-4">
					<p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Artikel Terkait</p>
					{related.filter((item) => item.id !== article.id).map((item) => (
						<Link key={item.id} to={`/blog/${item.slug}`} className="glass-card block rounded-2xl p-4">
							<p className="line-clamp-2 text-sm font-bold">{item.title}</p>
							<p className="mt-2 text-xs text-[var(--text-muted)]">
								{formatDate(item.published_at ?? item.created ?? new Date())}
							</p>
						</Link>
					))}
				</aside>
			</div>
		</section>
	);
}
