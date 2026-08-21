import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
	ArrowLeft,
	ArrowUp,
	CalendarDays,
	Check,
	Clock3,
	Copy,
	Eye,
	Facebook,
	Maximize2,
	MessageCircle,
	Share2,
	Tag,
	Twitter,
	User,
	X,
} from "lucide-react";
import { getArticleBySlug, getArticles, incrementArticleViews } from "@/api/articles.api";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { formatDate, resolveImageUrl, sanitizeRichHtml } from "@/utils/format";
import type { ArticleCategory } from "@/types/database.types";

const CATEGORY_META: Record<ArticleCategory, { label: string; className: string }> = {
	"tips-mencuci": { label: "Tips Mencuci", className: "bg-sapphire-500/10 text-sapphire-600 dark:text-sapphire-400" },
	"tips-kering": { label: "Tips Kering", className: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
	"perawatan-bahan": { label: "Perawatan Bahan", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
	noda: { label: "Noda", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
	umum: { label: "Umum", className: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400" },
	berita: { label: "Berita", className: "bg-ruby-500/10 text-ruby-600 dark:text-ruby-400" },
	"promo-info": { label: "Promo", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
};

// Zoom button injected into every content image (Maximize icon + "Perbesar" label).
const ZOOM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
const ZOOM_BTN = `<button class="article-zoom-btn" type="button" aria-label="Perbesar gambar">${ZOOM_SVG}<span>Perbesar</span></button>`;

const IMAGE_WIDTH_MAP: Record<string, string> = { small: "25%", medium: "50%", large: "75%", full: "100%" };
const IMAGE_SHADOW_MAP: Record<string, string> = {
	sm: "0 2px 8px rgba(0, 0, 0, 0.10)",
	md: "0 4px 24px rgba(0, 0, 0, 0.12)",
	lg: "0 12px 40px rgba(0, 0, 0, 0.18)",
};

const readDataAttr = (attrs: string, name: string): string =>
	attrs.match(new RegExp(`\\sdata-${name}="([^"]*)"`, "i"))?.[1] || "";

// Wrap every content image into <figure> = title (ABOVE) + media (img + Perbesar button) + caption.
// All styling (width/height/radius/shadow/border/text sizes/alignment) is applied via inline
// styles so the public page renders EXACTLY what the admin editor shows.
const enhanceArticleHtml = (html: string): string =>
	html.replace(/<img([^>]*)>/gi, (_match, attrs: string) => {
		const caption = readDataAttr(attrs, "caption");
		const title = readDataAttr(attrs, "title");
		const width = readDataAttr(attrs, "width") || "medium";
		const widthValue = readDataAttr(attrs, "width-value");
		const height = readDataAttr(attrs, "height");
		const align = readDataAttr(attrs, "align") || "center";
		const textAlign = readDataAttr(attrs, "text-align") || "center";
		const titleSize = readDataAttr(attrs, "title-size");
		const captionSize = readDataAttr(attrs, "caption-size");
		const borderColor = readDataAttr(attrs, "border-color");
		// Backward compat with old boolean attrs (data-rounded / data-border / data-shadow true|false)
		const radius = readDataAttr(attrs, "radius") || (readDataAttr(attrs, "rounded") === "false" ? "0" : "");
		const shadowRaw = readDataAttr(attrs, "shadow");
		const shadow = shadowRaw === "true" ? "md" : shadowRaw === "false" ? "" : shadowRaw;
		const borderWidth = readDataAttr(attrs, "border-width") || (readDataAttr(attrs, "border") === "true" ? "1" : "");

		// Strip all image data-* attrs; styling moves to inline styles below
		const cleanAttrs = attrs.replace(
			/\sdata-(caption|title|title-size|caption-size|width|width-value|height|align|text-align|radius|rounded|shadow|border|border-width|border-color)="[^"]*"/gi,
			"",
		);

		const figureWidth = width === "custom" ? `${Number(widthValue) || 50}%` : IMAGE_WIDTH_MAP[width] || "50%";
		const figureMargin =
			align === "left" ? "32px auto 32px 0" : align === "right" ? "32px 0 32px auto" : "32px auto";
		const radiusPx = radius !== "" ? Number(radius) : 12;

		const mediaStyles = [
			`border-radius:${radiusPx}px`,
			shadow && IMAGE_SHADOW_MAP[shadow] ? `box-shadow:${IMAGE_SHADOW_MAP[shadow]}` : "",
			borderWidth ? `border:${Number(borderWidth)}px solid ${borderColor || "#e5e7eb"}` : "",
		]
			.filter(Boolean)
			.join(";");
		const imgStyleAttr = height ? ` style="height:${Number(height)}px;object-fit:cover"` : "";

		const titleHtml = title
			? `<div class="article-figure-title" style="font-size:${Number(titleSize) || 14}px;text-align:${textAlign}">${title}</div>`
			: "";
		const captionHtml = caption
			? `<figcaption style="font-size:${Number(captionSize) || 13}px;text-align:${textAlign}">${caption}</figcaption>`
			: "";

		return `<figure class="article-figure" data-align="${align}" style="width:${figureWidth};margin:${figureMargin}">${titleHtml}<div class="article-figure-media" style="${mediaStyles}"><img${cleanAttrs}${imgStyleAttr}>${ZOOM_BTN}</div>${captionHtml}</figure>`;
	});

export default function BlogDetailPage() {
	const { slug } = useParams();
	const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);
	const [progress, setProgress] = useState(0);
	const [showTop, setShowTop] = useState(false);
	const [copied, setCopied] = useState(false);

	const { data: article } = useQuery({
		queryKey: ["article", slug],
		queryFn: () => getArticleBySlug(slug ?? ""),
		enabled: Boolean(slug),
	});

	const { data: related = [] } = useQuery({
		queryKey: ["article-related", article?.id],
		queryFn: () => getArticles({ publishedOnly: true, limit: 5 }),
		enabled: Boolean(article?.id),
	});

	useEffect(() => {
		if (!article) return;
		void incrementArticleViews(article.id, article.views);
	}, [article]);

	const safeHtml = useMemo(() => enhanceArticleHtml(sanitizeRichHtml(article?.content ?? "")), [article?.content]);

	// Reading progress + back-to-top visibility
	useEffect(() => {
		const onScroll = () => {
			const doc = document.documentElement;
			const total = doc.scrollHeight - doc.clientHeight;
			setProgress(total > 0 ? Math.min(100, (doc.scrollTop / total) * 100) : 0);
			setShowTop(doc.scrollTop > 600);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	// Lightbox: Escape to close + lock body scroll
	useEffect(() => {
		if (!lightbox) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setLightbox(null);
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [lightbox]);

	if (!article) {
		return (
			<div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
				<p className="text-lg font-bold text-neutral-900 dark:text-white">Artikel tidak ditemukan</p>
				<p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Artikel mungkin sudah dihapus atau belum dipublikasikan.</p>
				<Link to="/blog" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ruby-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ruby-700">
					<ArrowLeft className="h-4 w-4" />
					Kembali ke Blog
				</Link>
			</div>
		);
	}

	const meta = CATEGORY_META[article.category] ?? CATEGORY_META.umum;
	const relatedItems = related.filter((item) => item.id !== article.id).slice(0, 4);
	const heroSrc = resolveImageUrl(article.thumbnail, article.title);
	const shareUrl = window.location.href;
	const shareText = article.title;

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			toast.success("Link artikel disalin!");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Gagal menyalin link");
		}
	};

	// Delegated click: open lightbox when clicking a content image or its "Perbesar" button
	const handleContentClick = (e: MouseEvent<HTMLDivElement>) => {
		const target = e.target as HTMLElement;
		const zoomBtn = target.closest(".article-zoom-btn");
		const imgEl = target.closest("img");
		const trigger = zoomBtn || imgEl;
		if (!trigger) return;
		const media = trigger.closest(".article-figure-media");
		const img = (media?.querySelector("img") || imgEl) as HTMLImageElement | null;
		if (!img) return;
		const caption = img.closest("figure")?.querySelector("figcaption")?.textContent || "";
		setLightbox({ src: img.src, caption });
	};

	return (
		<section className="pb-24">
			{/* Reading progress bar */}
			<div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1">
				<div
					className="h-full bg-gradient-to-r from-ruby-500 via-ruby-600 to-ruby-500 shadow-[0_0_8px_rgba(198,40,40,0.5)] transition-[width] duration-100 ease-out"
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* Image lightbox */}
			{lightbox ? (
				<div
					className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-10"
					onClick={() => setLightbox(null)}
					role="dialog"
					aria-modal="true"
					aria-label="Pratinjau gambar"
				>
					<button
						type="button"
						aria-label="Tutup pratinjau"
						onClick={() => setLightbox(null)}
						className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
					>
						<X className="h-5 w-5" />
					</button>
					<motion.img
						initial={{ opacity: 0, scale: 0.94 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.2 }}
						src={lightbox.src}
						alt={lightbox.caption || "Gambar artikel"}
						className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					/>
					{lightbox.caption ? (
						<p className="mt-4 max-w-2xl text-center text-sm italic leading-relaxed text-neutral-300">{lightbox.caption}</p>
					) : null}
				</div>
			) : null}

			{/* Hero header */}
			<header className="relative overflow-hidden pb-8 pt-14 md:pt-20">
				<div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-ruby-500/10 blur-3xl" />
				<div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-sapphire-500/10 blur-3xl" />
				<div className="relative mx-auto max-w-[820px] px-4 text-center md:px-6">
					<Link
						to="/blog"
						className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-ruby-600 dark:text-neutral-400 dark:hover:text-ruby-400"
					>
						<ArrowLeft className="h-4 w-4" />
						Semua Artikel
					</Link>
					<div>
						<span className={`inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${meta.className}`}>
							{meta.label}
						</span>
					</div>
					<h1 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-neutral-900 dark:text-white md:text-[44px]">
						{article.title}
					</h1>
					{article.excerpt ? (
						<p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300 md:text-lg">
							{article.excerpt}
						</p>
					) : null}

					{/* Meta bar */}
					<div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-4 text-sm">
						<span className="inline-flex items-center gap-2.5">
							<span className="flex h-10 w-10 items-center justify-center rounded-full bg-ruby-500/10 text-ruby-600 dark:text-ruby-400">
								<User className="h-[18px] w-[18px]" />
							</span>
							<span className="text-left leading-tight">
								<span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Penulis</span>
								<span className="block font-bold text-neutral-800 dark:text-neutral-100">{article.author || "MBA Laundry Express"}</span>
							</span>
						</span>
						<span className="hidden h-8 w-px bg-neutral-200 dark:bg-neutral-700 sm:block" />
						<span className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
							<CalendarDays className="h-4 w-4" />
							{formatDate(article.published_at ?? article.created ?? new Date())}
						</span>
						<span className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
							<Clock3 className="h-4 w-4" />
							{article.read_time ?? 5} menit baca
						</span>
						<span className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
							<Eye className="h-4 w-4" />
							{article.views + 1} views
						</span>
					</div>
				</div>
			</header>

			{/* Article body — centered reading column */}
			<div className="mx-auto max-w-[780px] px-4 md:px-6">
				<motion.article
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="min-w-0"
				>
					{/* Featured image with Perbesar button */}
					<div className="article-figure-media relative mb-10 shadow-lg">
						<SafeImage
							src={article.thumbnail}
							fallbackLabel={article.title}
							alt={article.title}
							className="aspect-[16/9] w-full object-cover"
							loading="eager"
						/>
						<button type="button" className="article-zoom-btn" onClick={() => setLightbox({ src: heroSrc, caption: article.title })}>
							<Maximize2 className="h-3.5 w-3.5" />
							<span>Perbesar</span>
						</button>
					</div>

					{/* Rich content */}
					<div className="article-prose" onClick={handleContentClick} dangerouslySetInnerHTML={{ __html: safeHtml }} />

					{/* Tags */}
					{article.tags && article.tags.length > 0 ? (
						<div className="mt-10 flex flex-wrap items-center gap-2">
							<span className="mr-1 inline-flex items-center gap-1.5 text-sm font-bold text-neutral-500 dark:text-neutral-400">
								<Tag className="h-4 w-4" />
								Tag:
							</span>
							{article.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
								>
									{tag}
								</span>
							))}
						</div>
					) : null}

					{/* Share bar */}
					<div className="mt-8 flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-5 dark:border-neutral-700/70 dark:bg-neutral-800/50 sm:flex-row sm:items-center sm:justify-between">
						<p className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700 dark:text-neutral-200">
							<Share2 className="h-4 w-4 text-ruby-600 dark:text-ruby-400" />
							Bagikan artikel ini
						</p>
						<div className="flex items-center gap-2">
							<a
								href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Bagikan ke Facebook"
								className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-sm transition-transform hover:-translate-y-0.5"
							>
								<Facebook className="h-[18px] w-[18px]" />
							</a>
							<a
								href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Bagikan ke X / Twitter"
								className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm transition-transform hover:-translate-y-0.5 dark:bg-black"
							>
								<Twitter className="h-[18px] w-[18px]" />
							</a>
							<a
								href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Bagikan ke WhatsApp"
								className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm transition-transform hover:-translate-y-0.5"
							>
								<MessageCircle className="h-[18px] w-[18px]" />
							</a>
							<button
								type="button"
								onClick={copyLink}
								aria-label="Salin link artikel"
								className="flex h-10 items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ruby-400 hover:text-ruby-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
							>
								{copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
								{copied ? "Tersalin" : "Salin Link"}
							</button>
						</div>
					</div>
				</motion.article>

				{/* Related articles */}
				{relatedItems.length > 0 ? (
					<div className="mt-16 border-t border-neutral-200 pt-10 dark:border-neutral-800">
						<h2 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white md:text-2xl">Artikel Terkait</h2>
						<div className="mt-6 grid gap-6 sm:grid-cols-2">
							{relatedItems.map((item) => {
								const itemMeta = CATEGORY_META[item.category] ?? CATEGORY_META.umum;
								return (
									<Link
										key={item.id}
										to={`/blog/${item.slug}`}
										className="group overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-700/70 dark:bg-neutral-800"
									>
										<div className="overflow-hidden">
											<SafeImage
												src={item.thumbnail}
												fallbackLabel={item.title}
												alt={item.title}
												className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
												loading="lazy"
											/>
										</div>
										<div className="p-4">
											<span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${itemMeta.className}`}>
												{itemMeta.label}
											</span>
											<p className="mt-2 line-clamp-2 text-[15px] font-bold leading-snug text-neutral-900 transition-colors group-hover:text-ruby-600 dark:text-white dark:group-hover:text-ruby-400">
												{item.title}
											</p>
											<p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
												{formatDate(item.published_at ?? item.created ?? new Date())}
											</p>
										</div>
									</Link>
								);
							})}
						</div>
					</div>
				) : null}

				<div className="mt-12 text-center">
					<Link
						to="/blog"
						className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-neutral-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-ruby-400 hover:text-ruby-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
					>
						<ArrowLeft className="h-4 w-4" />
						Lihat semua artikel
					</Link>
				</div>
			</div>

			{/* Back to top */}
			{showTop ? (
				<button
					type="button"
					aria-label="Kembali ke atas"
					onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
					className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-ruby-600 text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-ruby-700"
				>
					<ArrowUp className="h-5 w-5" />
				</button>
			) : null}
		</section>
	);
}
