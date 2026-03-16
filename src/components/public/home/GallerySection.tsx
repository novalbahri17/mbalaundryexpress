import { PictureOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getGallery } from "@/api/gallery.api";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import type { GalleryType } from "@/types/database.types";
import { useState } from "react";

const typeLabels: Record<GalleryType, string> = {
	interior: "Interior",
	exterior: "Eksterior",
	mesin: "Mesin",
	fasilitas: "Fasilitas",
	umum: "Umum",
};

const typeColors: Record<GalleryType, string> = {
	interior: "bg-purple-500",
	exterior: "bg-green-500",
	mesin: "bg-blue-500",
	fasilitas: "bg-orange-500",
	umum: "bg-gray-500",
};

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
	const { data, isLoading, error } = useQuery({
		queryKey: ["home-gallery"],
		queryFn: () => getGallery(),
		staleTime: 5 * 60 * 1000,
	});

	const galleryItems = (data ?? [])
		.filter((item) => Boolean(item.image && item.image.trim() !== ""))
		.slice(0, 6);

	return (
		<section className="relative overflow-hidden bg-neutral-50 px-6 py-24 md:px-12 md:py-32 dark:bg-neutral-900">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-20 top-1/3 h-[300px] w-[300px] rounded-full bg-sapphire-200/30 blur-[100px]" />
				<div className="absolute -right-20 bottom-1/3 h-[300px] w-[300px] rounded-full bg-ruby-200/30 blur-[100px]" />
			</div>

			<div className="relative mx-auto flex max-w-[1200px] flex-col items-center">
				<ScrollReveal>
					<span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sapphire-500 to-sapphire-600 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white shadow-md">
						<PictureOutlined /> Galeri Outlet
					</span>
				</ScrollReveal>

				<ScrollReveal delay={0.1}>
					<h2 className="mt-3 text-center text-[32px] font-bold leading-[1.2] text-neutral-900 md:text-[40px] dark:text-white">
						Intip Keseruan Cuci di Sini!
					</h2>
				</ScrollReveal>

				<ScrollReveal delay={0.2}>
					<p className="mt-4 max-w-[600px] text-center text-[16px] leading-[1.6] text-neutral-600 dark:text-neutral-300">
						Didesain untuk kenyamanan optimal Anda, setiap outlet kami bersih, terang, dan ber-AC penuh sambil
						menunggu cucian selesai.
					</p>
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
									whileHover={{ y: -8, scale: 1.02 }}
									transition={{ duration: 0.3 }}
									className="group relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-neutral-200 shadow-lg dark:bg-neutral-800"
								>
									<div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-110">
										<GalleryImage
											src={item.image}
											alt={item.caption ?? `Galeri ${typeLabels[item.type]}`}
										/>
									</div>

									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

									<div
										className={`absolute left-4 top-4 rounded-full ${typeColors[item.type]} px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100`}
									>
										{typeLabels[item.type]}
									</div>

									<div className="absolute bottom-0 left-0 right-0 translate-y-full p-5 transition-transform duration-300 group-hover:translate-y-0">
										<p className="text-[16px] font-semibold text-white">
											{item.caption || typeLabels[item.type]}
										</p>
										<p className="mt-1 text-[13px] text-white/80">Klik untuk melihat detail</p>
									</div>

									<div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-[14px] font-bold text-white backdrop-blur-md">
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
							<p className="mt-4 text-neutral-600 dark:text-neutral-300">Belum ada foto galeri outlet.</p>
							<p className="text-sm text-neutral-400 dark:text-neutral-500">Silakan upload dari dashboard admin.</p>
						</motion.div>
					)}
				</div>

				{error && (
					<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-sm font-medium text-ruby-600">
						Galeri outlet belum bisa dimuat. Silakan cek koneksi.
					</motion.p>
				)}

				<ScrollReveal delay={0.5}>
					<Link
						to="/galeri"
						className="group mt-12 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-200 bg-white px-8 py-4 text-[16px] font-semibold text-neutral-700 shadow-sm transition-all hover:border-sapphire-300 hover:bg-sapphire-50 hover:text-sapphire-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-sapphire-500 dark:hover:bg-sapphire-900/20 dark:hover:text-sapphire-400"
					>
						Lihat Semua Galeri
						<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Link>
				</ScrollReveal>
			</div>
		</section>
	);
}
