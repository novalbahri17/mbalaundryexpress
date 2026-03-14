/**
 * MBA Laundry Express - Skeleton Component
 * Premium loading states with shimmer effect
 */

import { motion } from "framer-motion";
import { cn } from "@/utils";

// ============================================
// TYPES
// ============================================
export interface SkeletonProps {
	/** Skeleton shape */
	variant?: "text" | "circular" | "rectangular" | "rounded";
	/** Width (can be number for px or string) */
	width?: number | string;
	/** Height (can be number for px or string) */
	height?: number | string;
	/** Animation type */
	animation?: "pulse" | "shimmer" | "none";
	/** Custom className */
	className?: string;
}

// ============================================
// SKELETON ITEM
// ============================================
export function Skeleton({ variant = "text", width, height, animation = "shimmer", className }: SkeletonProps) {
	const baseClasses = cn(
		"bg-neutral-200 dark:bg-neutral-700",
		variant === "text" && "rounded-md",
		variant === "circular" && "rounded-full",
		variant === "rectangular" && "rounded-none",
		variant === "rounded" && "rounded-xl",
	);

	const style: React.CSSProperties = {
		width: typeof width === "number" ? `${width}px` : width,
		height: typeof height === "number" ? `${height}px` : height,
	};

	// Pulse animation
	if (animation === "pulse") {
		return (
			<motion.div
				className={cn(baseClasses, className)}
				style={style}
				animate={{ opacity: [0.5, 1, 0.5] }}
				transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
			/>
		);
	}

	// Shimmer animation
	if (animation === "shimmer") {
		return (
			<div className={cn("relative overflow-hidden", className)} style={style}>
				<div className={cn(baseClasses, "absolute inset-0")} />
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
					animate={{ x: ["-100%", "100%"] }}
					transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
				/>
			</div>
		);
	}

	// No animation
	return <div className={cn(baseClasses, className)} style={style} />;
}

// ============================================
// SKELETON TEXT (multiple lines)
// ============================================
export interface SkeletonTextProps {
	/** Number of lines */
	lines?: number;
	/** Last line width percentage */
	lastLineWidth?: string;
	/** Space between lines */
	gap?: number;
	/** Line height */
	lineHeight?: number;
	className?: string;
}

export function SkeletonText({
	lines = 3,
	lastLineWidth = "60%",
	gap = 8,
	lineHeight = 16,
	className,
}: SkeletonTextProps) {
	return (
		<div className={cn("flex flex-col", className)} style={{ gap }}>
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton key={i} variant="text" height={lineHeight} width={i === lines - 1 ? lastLineWidth : "100%"} />
			))}
		</div>
	);
}

// ============================================
// SKELETON CARD
// ============================================
export interface SkeletonCardProps {
	/** Show image skeleton */
	hasImage?: boolean;
	/** Image aspect ratio */
	imageAspect?: "video" | "square" | "portrait";
	/** Number of text lines */
	textLines?: number;
	/** Show action buttons */
	hasActions?: boolean;
	className?: string;
}

export function SkeletonCard({
	hasImage = true,
	imageAspect = "video",
	textLines = 3,
	hasActions = true,
	className,
}: SkeletonCardProps) {
	const aspectClasses = {
		video: "aspect-video",
		square: "aspect-square",
		portrait: "aspect-[3/4]",
	};

	return (
		<div
			className={cn(
				"rounded-3xl overflow-hidden",
				"bg-white dark:bg-neutral-800",
				"border border-neutral-200 dark:border-neutral-700",
				className,
			)}
		>
			{/* Image */}
			{hasImage && <Skeleton variant="rectangular" className={aspectClasses[imageAspect]} animation="shimmer" />}

			{/* Content */}
			<div className="p-6 space-y-4">
				{/* Title */}
				<Skeleton variant="text" height={24} width="70%" />

				{/* Text lines */}
				<SkeletonText lines={textLines} lineHeight={12} gap={6} />

				{/* Actions */}
				{hasActions && (
					<div className="flex gap-3 pt-2">
						<Skeleton variant="rounded" height={40} width={100} />
						<Skeleton variant="rounded" height={40} width={100} />
					</div>
				)}
			</div>
		</div>
	);
}

// ============================================
// SKELETON AVATAR
// ============================================
export interface SkeletonAvatarProps {
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	className?: string;
}

export function SkeletonAvatar({ size = "md", className }: SkeletonAvatarProps) {
	const sizes = {
		xs: 24,
		sm: 32,
		md: 40,
		lg: 56,
		xl: 80,
	};

	return <Skeleton variant="circular" width={sizes[size]} height={sizes[size]} className={className} />;
}

// ============================================
// SKELETON LIST
// ============================================
export interface SkeletonListProps {
	/** Number of items */
	items?: number;
	/** Show avatar */
	hasAvatar?: boolean;
	/** Number of text lines per item */
	textLines?: number;
	className?: string;
}

export function SkeletonList({ items = 4, hasAvatar = true, textLines = 2, className }: SkeletonListProps) {
	return (
		<div className={cn("space-y-4", className)}>
			{Array.from({ length: items }).map((_, i) => (
				<div key={i} className="flex items-center gap-4">
					{hasAvatar && <SkeletonAvatar size="md" />}
					<div className="flex-1">
						<SkeletonText lines={textLines} lineHeight={12} gap={6} />
					</div>
				</div>
			))}
		</div>
	);
}

// ============================================
// SKELETON GRID
// ============================================
export interface SkeletonGridProps {
	/** Number of items */
	items?: number;
	/** Columns on desktop */
	columns?: 2 | 3 | 4;
	className?: string;
}

export function SkeletonGrid({ items = 6, columns = 3, className }: SkeletonGridProps) {
	const gridCols = {
		2: "grid-cols-1 md:grid-cols-2",
		3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<div className={cn("grid gap-6", gridCols[columns], className)}>
			{Array.from({ length: items }).map((_, i) => (
				<SkeletonCard key={i} />
			))}
		</div>
	);
}

export default Skeleton;
