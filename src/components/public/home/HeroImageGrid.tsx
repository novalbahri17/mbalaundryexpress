import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { WashingMachine } from "lucide-react";
import { getGallery } from "@/api/gallery.api";
import { usePublicText } from "@/hooks/usePublicText";
import { useState, useEffect, useRef } from "react";

// Simple image dengan lazy loading
function GridImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);

	if (error || !src) {
		return (
			<div
				className={`flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700 rounded-xl ${className}`}
			>
				<span className="text-neutral-400 text-xs">{alt}</span>
			</div>
		);
	}

	return (
		<div className={`relative h-full w-full overflow-hidden rounded-xl ${className}`}>
			{!loaded && <div className="absolute inset-0 animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-xl" />}
			<img
				src={src}
				alt={alt}
				loading="lazy"
				decoding="async"
				className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
				onLoad={() => setLoaded(true)}
				onError={() => setError(true)}
			/>
		</div>
	);
}

// Tidak ada foto stok. Kalau galeri kosong, tampil panel brand, bukan foto
// mesin laundry milik orang lain yang bisa membuat pelanggan salah sangka.
const defaultImages: string[] = [];

export function HeroImageGrid() {
	const text = usePublicText();
	const t = text.home.heroGrid;
	const { data, isLoading } = useQuery({
		queryKey: ["hero-gallery"],
		queryFn: () => getGallery(),
		staleTime: 5 * 60 * 1000,
	});

	const containerRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	// Pause animation when not visible
	useEffect(() => {
		if (isLoading || !containerRef.current) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsVisible(entry.isIntersecting);
			},
			{ threshold: 0.1 },
		);

		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, [isLoading]);

	// Ambil gambar dari galeri atau gunakan default
	const galleryItems = (data ?? []).filter((item) => Boolean(item.image && item.image.trim() !== "")).slice(0, 6);

	const images = galleryItems.length > 0 ? galleryItems.map((item) => item.image) : defaultImages;

	// Split untuk 2 kolom (3 gambar per kolom).
	// Galeri < 3 foto tidak cukup untuk animasi marquee yang mulus, jadi cukup ditampilkan statis.
	const leftColumn = [images[0], images[2], images[4]].filter(Boolean);
	const rightColumn = [images[1], images[3], images[5]].filter(Boolean);

	// Duplicate untuk animasi seamless
	const leftItems = [...leftColumn, ...leftColumn, ...leftColumn];
	const rightItems = [...rightColumn, ...rightColumn, ...rightColumn];

	if (isLoading) {
		return (
			<div className="mx-auto flex h-[400px] w-full max-w-[500px] items-center justify-center rounded-2xl bg-neutral-100 sm:h-[500px] lg:mx-0 dark:bg-neutral-800">
				<span className="text-neutral-400">{text.common.loading}</span>
			</div>
		);
	}

	// Galeri belum ada isinya: jangan pakai foto stok. Tampilkan panel brand.
	if (images.length === 0) {
		return (
			<div className="relative mx-auto flex h-[400px] w-full max-w-[500px] flex-col items-center justify-center overflow-hidden rounded-[24px] border border-neutral-200 bg-white p-8 text-center shadow-sm sm:h-[500px] lg:mx-0 dark:border-neutral-800 dark:bg-neutral-900">
				<div
					className="pointer-events-none absolute inset-0 opacity-[0.04]"
					style={{
						backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
						backgroundSize: "22px 22px",
					}}
					aria-hidden
				/>
				<div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--brand-bg)]">
					<WashingMachine className="h-10 w-10 text-[var(--brand)]" aria-hidden />
				</div>
				<p className="relative mt-6 text-lg font-bold text-[var(--text-primary)]">{t.emptyTitle}</p>
				<p className="relative mt-2 max-w-[280px] text-sm leading-relaxed text-[var(--text-muted)]">{t.emptyBody}</p>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="relative h-[400px] sm:h-[500px] w-full max-w-[500px] overflow-hidden mx-auto lg:mx-0"
		>
			{/* Gradient masks */}
			<div className="absolute top-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none dark:from-neutral-900" />
			<div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none dark:from-neutral-900" />

			<div className="flex gap-3 sm:gap-4 h-full">
				{/* Left column - scroll down */}
				<div className="flex-1 overflow-hidden">
					<motion.div
						className="flex flex-col gap-3 sm:gap-4"
						animate={isVisible ? { y: ["0%", "-33.33%"] } : { y: "0%" }}
						transition={{
							y: {
								duration: 15,
								repeat: Infinity,
								ease: "linear",
							},
						}}
					>
						{leftItems.map((src, index) => (
							<div key={`left-${src.slice(-10)}-${index}`} className="h-[130px] sm:h-[160px] shrink-0">
								<GridImage src={src} alt={t.alt} />
							</div>
						))}
					</motion.div>
				</div>

				{/* Right column - scroll up */}
				<div className="flex-1 overflow-hidden">
					<motion.div
						className="flex flex-col gap-3 sm:gap-4"
						initial={{ y: "-33.33%" }}
						animate={isVisible ? { y: ["-33.33%", "0%"] } : { y: "-33.33%" }}
						transition={{
							y: {
								duration: 15,
								repeat: Infinity,
								ease: "linear",
							},
						}}
					>
						{rightItems.map((src, index) => (
							<div key={`right-${src.slice(-10)}-${index}`} className="h-[130px] sm:h-[160px] shrink-0">
								<GridImage src={src} alt={t.alt} />
							</div>
						))}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
