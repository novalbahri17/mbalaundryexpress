import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { getArticles } from "@/api/articles.api";

export function BlogSection() {
	const { data: articles = [], isLoading } = useQuery({
		queryKey: ["home-article-preview"],
		queryFn: () => getArticles({ publishedOnly: true, limit: 3 }),
	});

	if (isLoading || articles.length === 0) return null;

	const formatDate = (dateString?: string) => {
		return new Date(dateString || new Date().toISOString()).toLocaleDateString("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	return (
		<section className="bg-neutral-50 px-6 py-24 md:px-12 md:py-32">
			<div className="mx-auto flex max-w-[1200px] flex-col items-center">
				{/* HEADER */}
				<span className="rounded-full bg-sapphire-500 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white">
					Blog & Tips
				</span>
				<h2 className="mt-3 text-center text-[32px] font-bold leading-[1.2] text-neutral-900 md:text-[40px]">
					Tips Merawat Pakaian
				</h2>
				<p className="mt-4 max-w-[600px] text-center text-[18px] leading-[1.5] text-neutral-600">
					Dapatkan informasi terbaru seputar cara mencuci yang benar dan tips merawat mesin.
				</p>

				{/* CONTENT GRID */}
				<div className="mt-16 grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					{articles.map((article) => (
						<Link
							key={article.id}
							to={`/blog/${article.slug}`}
							className="group flex flex-col overflow-hidden rounded-[20px] bg-white border border-neutral-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
								<div className="absolute left-4 top-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sapphire-600 shadow-sm">
									{article.category || "Tips"}
								</div>
							</div>

							<div className="flex flex-1 flex-col p-6">
								<h3 className="line-clamp-2 text-[20px] font-bold leading-[1.4] text-neutral-900 group-hover:text-sapphire-600 transition-colors">
									{article.title}
								</h3>
								<p className="mt-3 line-clamp-3 text-[14px] leading-[1.6] text-neutral-600">{article.excerpt}</p>

								<div className="mt-auto pt-6 flex items-center justify-between border-t border-neutral-100">
									<span className="text-[12px] font-medium text-neutral-500">
										{formatDate(article.published_at || article.created || new Date().toISOString())}
									</span>
									<span className="flex items-center text-[12px] font-bold text-sapphire-600">
										Baca <ArrowRightIcon className="ml-1 h-3 w-3" />
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>

				{/* BOTTOM CTA */}
				<Link
					to="/blog"
					className="mt-12 inline-flex items-center justify-center rounded-xl border-2 border-sapphire-500 bg-transparent px-8 py-3 text-[16px] font-semibold text-sapphire-600 transition-colors hover:bg-sapphire-50"
				>
					Lihat Semua Artikel
				</Link>
			</div>
		</section>
	);
}
