import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getGallery } from "@/api/gallery.api";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { GradientText } from "@/components/public/shared/GradientText";
import { Lightbox } from "@/components/public/shared/Lightbox";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import { SkeletonCard } from "@/components/public/shared/SkeletonCard";

const typeLabel: Record<string, string> = {
	interior: "Interior",
	exterior: "Eksterior",
	mesin: "Mesin",
	fasilitas: "Fasilitas",
	umum: "Umum",
};

export function GalleryPreviewSection() {
	const { data: gallery = [], isLoading } = useQuery({
		queryKey: ["home-gallery-preview"],
		queryFn: () => getGallery(),
	});

	const previewItems = useMemo(
		() =>
			gallery.slice(0, 8).map((item) => ({
				src: item.image,
				alt: item.caption || `Galeri ${typeLabel[item.type] ?? "MBA Laundry"}`,
			})),
		[gallery],
	);

	const typeStats = useMemo(() => {
		const countMap = new Map<string, number>();
		for (const item of gallery) {
			const key = typeLabel[item.type] ?? "Lainnya";
			countMap.set(key, (countMap.get(key) ?? 0) + 1);
		}
		return [...countMap.entries()].slice(0, 4);
	}, [gallery]);

	return (
		<section className="section-wrap mt-24">
			<ScrollReveal className="mb-8 text-center">
				<p className="section-kicker">Galeri</p>
				<h2 className="section-title">
					Preview <GradientText>Suasana Cabang</GradientText>
				</h2>
				<p className="section-subtitle mx-auto max-w-2xl text-sm md:text-base">
					Lihat sekilas kondisi mesin, interior, dan fasilitas cabang MBA Laundry yang baru diupdate.
				</p>
			</ScrollReveal>

			{isLoading ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 8 }).map((_, index) => (
						<ScrollReveal key={`gallery-skeleton-${index}`} delay={index * 0.05}>
							<SkeletonCard />
						</ScrollReveal>
					))}
				</div>
			) : previewItems.length === 0 ? (
				<GlassCard className="rounded-3xl p-8 text-center">
					<p className="text-sm text-[var(--text-muted)]">Belum ada foto galeri yang dipublikasikan.</p>
					<Link
						to="/galeri"
						className="btn-primary mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
					>
						Buka Halaman Galeri
						<ArrowRight className="h-4 w-4" />
					</Link>
				</GlassCard>
			) : (
				<>
					<Lightbox items={previewItems} />

					<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
						<div className="flex flex-wrap gap-2">
							{typeStats.map(([type, count]) => (
								<span
									key={type}
									className="inline-flex rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
								>
									{type}: {count}
								</span>
							))}
						</div>
						<Link
							to="/galeri"
							className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
						>
							Lihat Galeri Lengkap
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</>
			)}
		</section>
	);
}
