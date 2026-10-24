/**
 * MBA Laundry Express - Card Component
 * Premium card with hover effects and motion
 */

import { type HTMLMotionProps, motion } from "framer-motion";
import { forwardRef } from "react";
import { transitions } from "@/design-system/tokens/animations";
import { cn } from "@/utils";

// ============================================
// TYPES
// ============================================
export interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
	/** Visual style variant */
	variant?: "default" | "elevated" | "outlined" | "ghost";
	/** Card size (padding) */
	size?: "sm" | "md" | "lg";
	/** Enable hover lift effect */
	hoverLift?: boolean;
	/** Enable hover glow */
	hoverGlow?: boolean;
	/** Clickable card (adds cursor pointer) */
	isClickable?: boolean;
	/** Card header content */
	header?: React.ReactNode;
	/** Card footer content */
	footer?: React.ReactNode;
	/** Remove padding from body */
	noPadding?: boolean;
}

// ============================================
// STYLES
// ============================================
const variants = {
	default: cn("bg-white dark:bg-neutral-800", "border border-neutral-200 dark:border-neutral-700"),

	elevated: cn(
		"bg-white dark:bg-neutral-800",
		"shadow-lg shadow-neutral-200/50 dark:shadow-black/20",
		"border border-transparent",
	),

	outlined: cn("bg-transparent", "border-2 border-neutral-200 dark:border-neutral-700"),

	ghost: cn("bg-neutral-50 dark:bg-neutral-900/50", "border border-transparent"),
};

const sizes = {
	sm: "p-4",
	md: "p-6",
	lg: "p-8",
};

// ============================================
// COMPONENT
// ============================================
export const Card = forwardRef<HTMLDivElement, CardProps>(
	(
		{
			variant = "default",
			size = "md",
			hoverLift = true,
			hoverGlow = false,
			isClickable = false,
			header,
			footer,
			noPadding = false,
			children,
			className,
			...props
		},
		ref,
	) => {
		const isInteractive = isClickable || hoverLift || hoverGlow;

		return (
			<motion.div
				ref={ref}
				className={cn(
					// Base styles
					"relative rounded-3xl overflow-hidden",
					"transition-colors duration-200",

					// Variant
					variants[variant],

					// Interactive states
					isClickable && "cursor-pointer",

					className,
				)}
				whileHover={
					isInteractive
						? {
								y: hoverLift ? -8 : 0,
								boxShadow: hoverGlow
									? "0 0 30px rgba(220, 38, 38, 0.15)"
									: variant === "elevated"
										? "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
										: undefined,
							}
						: undefined
				}
				whileTap={isClickable ? { scale: 0.98 } : undefined}
				transition={transitions.spring}
				{...props}
			>
				{/* Header */}
				{header && (
					<div className={cn("border-b border-neutral-200 dark:border-neutral-700", sizes[size], "pb-4")}>{header}</div>
				)}

				{/* Body */}
				<div className={!noPadding ? sizes[size] : undefined}>{children as React.ReactNode}</div>

				{/* Footer */}
				{footer && (
					<div className={cn("border-t border-neutral-200 dark:border-neutral-700", sizes[size], "pt-4")}>{footer}</div>
				)}
			</motion.div>
		);
	},
);

Card.displayName = "Card";

// ============================================
// CARD IMAGE
// ============================================
export interface CardImageProps {
	src: string;
	alt: string;
	aspectRatio?: "video" | "square" | "portrait" | "auto";
	overlay?: React.ReactNode;
	className?: string;
}

export function CardImage({ src, alt, aspectRatio = "video", overlay, className }: CardImageProps) {
	const aspectClasses = {
		video: "aspect-video",
		square: "aspect-square",
		portrait: "aspect-[3/4]",
		auto: "",
	};

	return (
		<div className={cn("relative overflow-hidden", aspectClasses[aspectRatio], className)}>
			<motion.img
				src={src}
				alt={alt}
				className="w-full h-full object-cover"
				whileHover={{ scale: 1.05 }}
				transition={{ duration: 0.4 }}
			/>
			{overlay && (
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">{overlay}</div>
			)}
		</div>
	);
}

// ============================================
// CARD BADGE
// ============================================
export interface CardBadgeProps {
	children: React.ReactNode;
	variant?: "default" | "primary" | "success" | "warning" | "error";
	className?: string;
}

export function CardBadge({ children, variant = "default", className }: CardBadgeProps) {
	const variantClasses = {
		default: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
		primary: "bg-ruby-100 text-ruby-700 dark:bg-ruby-900/30 dark:text-ruby-300",
		success: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
		warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
		error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center px-2.5 py-0.5 rounded-full",
				"text-xs font-medium",
				variantClasses[variant],
				className,
			)}
		>
			{children}
		</span>
	);
}

export default Card;
