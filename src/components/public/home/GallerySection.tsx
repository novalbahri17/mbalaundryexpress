import { PictureOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getGallery } from "@/api/gallery.api";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import { usePublicText } from "@/hooks/usePublicText";
import { useState } from "react";

const SKELETON_COUNT = 6;
const SKELETON_IDS = Array.from({ length: SKELETON_COUNT }, (_, i) => `gallery-skeleton-${i + 1}`);

// Simple image component dengan lazy loading
function GalleryImage({ src, alt }: { src?: string; alt: string }) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);

	if (error || !src) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
				<PictureOutlined className="h-8 w-8 text-neutral-400" />
			</div>
		);
	}

	return (
		<>
			{!loaded && <div className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-700" />}
			<img
				src={src}
				alt={alt}
				loading="lazy"
				className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
				onLoad={() => setLoaded(true)}
				onError={() => setError(true)}
			/>
		</>
	);
}

export function GallerySection() {
	const text = usePublicText();
	const t = text.home.gallery;
	const { data, isLoading, error } = useQuery({
		queryKey: ["home-gallery"],
		queryFn: () => getGallery(),
		staleTime: 5 * 60 * 1000,
	});

	const galleryItems = (data ?? []).filter((item) => Boolean(item.image && item.image.trim() !== "")).slice(0, 6);

	return (
		<section className="section-block relative overflow-hidden bg-neutral-50 dark:bg-neutral-900">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 overflow-hidden" />
			</div>

			<div className="section-inner relative flex flex-col items-center">
				<ScrollReveal>
					<p className="section-kicker">{t.kicker}</p>
				</ScrollReveal>

				<ScrollReveal delay={0.1}>
					<h2 className="section-title text-center">{t.title}</h2>
				</ScrollReveal>

				<ScrollReveal delay={0.2}>
					<p className="section-subtitle text-center">{t.subtitle}</p>
				</ScrollReveal>

				<div className="mt-16 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{isLoading &&
						SKELETON_IDS.map((skeletonId) => (
							<motion.div
								key={skeletonId}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="aspect-[4/3] w-full animate-pulse rounded-[20px] bg-neutral-200 dark:bg-neutral-800"
							/>
						))}

					{!isLoading &&
						galleryItems.length > 0 &&
						galleryItems.map((item, index) => (
							<motion.div
								key={item.id}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<motion.div
									whileHover={{ y: -4 }}
									transition={{ duration: 0.2 }}
									className="group relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-neutral-200 shadow-card dark:bg-neutral-800"
								>
									<div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]">
										<GalleryImage src={item.image} alt={item.caption ?? `${t.itemFallback} ${index + 1}`} />
									</div>

									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

									<div className="absolute left-4 top-4 rounded-full bg-ruby-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100">
										{t.badge}
									</div>

									<div className="absolute bottom-0 left-0 right-0 translate-y-full p-5 transition-transform duration-300 group-hover:translate-y-0">
										<p className="text-[16px] font-semibold text-white">
											{item.caption || `${t.itemFallback} ${index + 1}`}
										</p>
										<p className="mt-1 text-[13px] text-white/80">{t.clickHint}</p>
									</div>

									<div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-[14px] font-bold text-white">
										{String(index + 1).padStart(2, "0")}
									</div>
								</motion.div>
							</motion.div>
						))}

					{!isLoading && galleryItems.length === 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="col-span-full rounded-[20px] border border-neutral-200 bg-white px-6 py-16 text-center dark:border-neutral-700 dark:bg-neutral-800"
						>
							<PictureOutlined className="mx-auto h-16 w-16 text-neutral-300 dark:text-neutral-600" />
							<p className="mt-4 text-neutral-600 dark:text-neutral-300">{t.empty}</p>
							<p className="text-sm text-neutral-400 dark:text-neutral-500">{t.emptyHint}</p>
						</motion.div>
					)}
				</div>

				{error && (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="mt-6 text-sm font-medium text-ruby-600"
					>
						{t.loadError}
					</motion.p>
				)}

				<ScrollReveal delay={0.5}>
					<Link
						to="/galeri"
						className="mt-12 inline-flex items-center gap-2 rounded-full border-2 border-ruby-600 px-6 py-3 text-[14px] font-bold text-ruby-600 transition-all hover:bg-ruby-600 hover:text-white"
					>
						{t.viewAll} <ArrowRight className="h-4 w-4" />
					</Link>
				</ScrollReveal>
			</div>
		</section>
	);
}
