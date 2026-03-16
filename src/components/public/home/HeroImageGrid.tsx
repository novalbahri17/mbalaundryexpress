import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getGallery } from "@/api/gallery.api";
import { useState, useEffect } from "react";

// Simple image dengan lazy loading
function GridImage({ src, alt }: { src?: string; alt: string }) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);

	if (error || !src) {
		return (
			<div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700 rounded-xl">
				<span className="text-neutral-400 text-xs">{alt}</span>
			</div>
		);
	}

	return (
		<div className="relative h-full w-full overflow-hidden rounded-xl">
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

export function HeroImageGrid() {
	const { data } = useQuery({
		queryKey: ["hero-gallery"],
		queryFn: () => getGallery(),
		staleTime: 5 * 60 * 1000,
	});

	// Ambil 6 gambar dari galeri
	const galleryItems = (data ?? [])
		.filter((item) => Boolean(item.image && item.image.trim() !== ""))
		.slice(0, 6);

	// Jika kurang dari 6, duplicate gambar terakhir
	const images = [...galleryItems];
	while (images.length < 6) {
		images.push(...galleryItems.slice(0, 6 - images.length));
	}

	// Split untuk 2 kolom
	const leftColumn = images.filter((_, i) => i % 2 === 0).slice(0, 3);
	const rightColumn = images.filter((_, i) => i % 2 === 1).slice(0, 3);

	// Duplicate untuk animasi seamless
	const leftItems = [...leftColumn, ...leftColumn];
	const rightItems = [...rightColumn, ...rightColumn];

	if (galleryItems.length === 0) {
		return (
			<div className="hidden lg:flex h-[500px] w-full max-w-[500px] items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
				<span className="text-neutral-400">Loading...</span>
			</div>
		);
	}

	return (
		<div className="hidden lg:block relative h-[500px] w-full max-w-[500px] overflow-hidden">
			{/* Gradient masks */}
			<div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none dark:from-neutral-900" />
			<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none dark:from-neutral-900" />

			<div className="flex gap-4 h-full">
				{/* Left column - scroll down */}
				<div className="flex-1 overflow-hidden">
					<motion.div
						className="flex flex-col gap-4"
						animate={{ y: ["0%", "-50%"] }}
						transition={{
							y: {
								duration: 20,
								repeat: Infinity,
								ease: "linear",
							},
						}}
					>
						{leftItems.map((item, index) => (
							<div key={`left-${item.id}-${index}`} className="h-[160px] shrink-0">
								<GridImage src={item.image} alt={item.caption || "Galeri MBA Laundry"} />
							</div>
						))}
					</motion.div>
				</div>

				{/* Right column - scroll up */}
				<div className="flex-1 overflow-hidden">
					<motion.div
						className="flex flex-col gap-4"
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
						{rightItems.map((item, index) => (
							<div key={`right-${item.id}-${index}`} className="h-[160px] shrink-0">
								<GridImage src={item.image} alt={item.caption || "Galeri MBA Laundry"} />
							</div>
						))}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
