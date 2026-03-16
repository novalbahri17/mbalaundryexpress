import { useState, useEffect, useRef, useCallback } from "react";

interface OptimizedImageProps {
	src: string;
	alt: string;
	className?: string;
	width?: number;
	height?: number;
	placeholder?: string;
	priority?: boolean; // untuk gambar above-the-fold
}

// Generate CDN URL dengan transformasi
const getOptimizedUrl = (src: string, width?: number, format: "webp" | "avif" | "auto" = "webp"): string => {
	// Jika sudah URL absolut dari CDN
	if (src.startsWith("https://") || src.startsWith("http://")) {
		// Jika menggunakan Cloudflare Images
		if (src.includes("imagedelivery.net") || src.includes("cloudflare")) {
			const separator = src.includes("?") ? "&" : "?";
			return `${src}${separator}width=${width || "auto"}&format=${format}&quality=85`;
		}
		// Jika menggunakan Imgix atau similar
		if (src.includes("imgix.net") || src.includes("images.unsplash")) {
			const separator = src.includes("?") ? "&" : "?";
			return `${src}${separator}w=${width}&fm=${format}&q=85`;
		}
	}

	// Return as-is untuk gambar lokal
	return src;
};

// Generate blur placeholder
const generateBlurHash = (): string => {
	return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23f3f4f6' width='1' height='1'/%3E%3C/svg%3E";
};

export function OptimizedImage({
	src,
	alt,
	className = "",
	width,
	height,
	placeholder,
	priority = false,
}: OptimizedImageProps) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isInView, setIsInView] = useState(priority);
	const [error, setError] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Intersection Observer untuk lazy loading
	useEffect(() => {
		if (priority || isInView) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInView(true);
					observer.disconnect();
				}
			},
			{
				rootMargin: "50px", // Load 50px sebelum masuk viewport
				threshold: 0.01,
			},
		);

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => observer.disconnect();
	}, [priority, isInView]);

	// Generate srcset untuk responsive images
	const generateSrcSet = useCallback((): string | undefined => {
		if (!src || error) return undefined;

		const widths = [320, 640, 960, 1280, 1920];
		return widths.map((w) => `${getOptimizedUrl(src, w, "webp")} ${w}w`).join(", ");
	}, [src, error]);

	const optimizedSrc = getOptimizedUrl(src, width, "webp");
	const blurPlaceholder = placeholder || generateBlurHash();

	// Handle error dengan fallback
	const handleError = () => {
		setError(true);
		setIsLoaded(true);
	};

	if (error) {
		return (
			<div
				ref={containerRef}
				className={`bg-slate-100 flex items-center justify-center ${className}`}
				style={{ width, height }}
			>
				<span className="text-slate-400 text-sm">{alt}</span>
			</div>
		);
	}

	return (
		<div ref={containerRef} className={`relative overflow-hidden ${className}`} style={{ width, height }}>
			{/* Blur placeholder */}
			{!isLoaded && (
				<div
					className="absolute inset-0 bg-slate-100 animate-pulse"
					style={{
						backgroundImage: `url(${blurPlaceholder})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						filter: "blur(20px)",
					}}
				/>
			)}

			{/* Actual image - hanya load jika in view */}
			{(isInView || priority) && (
				<picture>
					{/* WebP source */}
					<source
						srcSet={generateSrcSet()}
						sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width || "800px"}`}
						type="image/webp"
					/>
					<img
						ref={imgRef}
						src={optimizedSrc}
						alt={alt}
						width={width}
						height={height}
						loading={priority ? "eager" : "lazy"}
						decoding={priority ? "sync" : "async"}
						className={`w-full h-full object-cover transition-opacity duration-300 ${
							isLoaded ? "opacity-100" : "opacity-0"
						}`}
						onLoad={() => setIsLoaded(true)}
						onError={handleError}
					/>
				</picture>
			)}
		</div>
	);
}

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve();
		img.onerror = reject;
		img.src = src;
	});
};

// Batch preload untuk gallery
export const preloadImages = async (srcs: string[], concurrency = 3): Promise<void> => {
	const queue = [...srcs];
	const inProgress: Promise<void>[] = [];

	while (queue.length > 0 || inProgress.length > 0) {
		while (inProgress.length < concurrency && queue.length > 0) {
			const src = queue.shift();
			if (src) {
				inProgress.push(preloadImage(src).catch(() => {}));
			}
		}

		if (inProgress.length > 0) {
			await Promise.race(inProgress);
		}
	}
};
