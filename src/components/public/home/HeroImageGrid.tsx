import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getGallery } from "@/api/gallery.api";
import { useState } from "react";

// Simple image dengan lazy loading
function GridImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);

	if (error || !src) {
		return (
			<div className={`flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700 rounded-xl ${className}`}>
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
				className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
				onLoad={() => setLoaded(true)}
				onError={() => setError(true)}
			/>
		</div>
	);
}

// Default images jika galeri kosong
const defaultImages = [
	"https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=300&fit=crop",
	"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
	"https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop",
	"https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400&h=300&fit=crop",
	"https://images.unsplash.com/photo-1545173168-9f1947eebb7c?w=400&h=300&fit=crop",
	"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
];

export function HeroImageGrid() {
	const { data, isLoading } = useQuery({
		queryKey: ["hero-gallery"],
		queryFn: () => getGallery(),
		staleTime: 5 * 60 * 1000,
	});

	// Ambil gambar dari galeri atau gunakan default
	const galleryItems = (data ?? [])
		.filter((item) => Boolean(item.image && item.image.trim() !== ""))
		.slice(0, 6);

	// Buat array 6 gambar
	const images =
		galleryItems.length > 0
			? galleryItems.map((item) => item.image)
			: defaultImages;

	// Split untuk 2 kolom (3 gambar per kolom)
	const leftColumn = [images[0], images[2], images[4]].filter(Boolean);
	const rightColumn = [images[1], images[3], images[5]].filter(Boolean);

	// Duplicate untuk animasi seamless (desktop only)
	const leftItems = [...leftColumn, ...leftColumn];
	const rightItems = [...rightColumn, ...rightColumn];

	if (isLoading) {
		return (
			<div className="flex h-[400px] sm:h-[500px] w-full max-w-[500px] items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mx-auto lg:mx-0">
				<span className="text-neutral-400">Memuat...</span>
			</div>
		);
	}

	return (
		<div className="relative h-[400px] sm:h-[500px] w-full max-w-[500px] overflow-hidden mx-auto lg:mx-0">
			{/* Gradient masks */}
			<div className="absolute top-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none dark:from-neutral-900" />
			<div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none dark:from-neutral-900" />

			{/* Desktop: Animated scroll */}
			<div className="hidden lg:flex gap-3 sm:gap-4 h-full">
				{/* Left column - scroll down */}
				<div className="flex-1 overflow-hidden">
					<motion.div
						className="flex flex-col gap-3 sm:gap-4"
						animate={{ y: ["0%", "-50%"] }}
						transition={{
							y: {
								duration: 20,
								repeat: Infinity,
								ease: "linear",
							},
						}}
					>
						{leftItems.map((src, index) => (
							<div key={`left-${index}`} className="h-[120px] sm:h-[160px] shrink-0">
								<GridImage src={src} alt="Galeri MBA Laundry" />
							</div>
						))}
					</motion.div>
				</div>

				{/* Right column - scroll up */}
				<div className="flex-1 overflow-hidden">
					<motion.div
						className="flex flex-col gap-3 sm:gap-4"
						initial={{ y: "-50%" }}
						animate={{ y: ["-50%", "0%"] }}
						transition={{
							y: {
								duration: 20,
								repeat: Infinity,
								ease: "linear",
							},
						}}
					>
						{rightItems.map((src, index) => (
							<div key={`right-${index}`} className="h-[120px] sm:h-[160px] shrink-0">
								<GridImage src={src} alt="Galeri MBA Laundry" />
							</div>
						))}
					</motion.div>
				</div>
			</div>

			{/* Mobile/Tablet: Static grid 2 columns */}
			<div className="flex lg:hidden gap-3 h-full overflow-hidden">
				{/* Left column */}
				<div className="flex-1 flex flex-col gap-3">
					{leftColumn.map((src, index) => (
						<div key={`mobile-left-${index}`} className="flex-1 min-h-0">
							<GridImage src={src} alt="Galeri MBA Laundry" className="h-full" />
						</div>
					))}
				</div>

				{/* Right column */}
				<div className="flex-1 flex flex-col gap-3">
					{rightColumn.map((src, index) => (
						<div key={`mobile-right-${index}`} className="flex-1 min-h-0">
							<GridImage src={src} alt="Galeri MBA Laundry" className="h-full" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
