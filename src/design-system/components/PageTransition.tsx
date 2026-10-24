/**
 * MBA Laundry Express - Page Transition
 * Smooth page transitions with AnimatePresence
 */

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useLocation } from "react-router-dom";
import { transitions } from "@/design-system/tokens/animations";
import { cn } from "@/utils";

// ============================================
// TYPES
// ============================================
export interface PageTransitionProps {
	/** Page content */
	children: React.ReactNode;
	/** Transition variant */
	variant?: "fade" | "slide" | "scale" | "slideUp";
	/** Custom className */
	className?: string;
	/** Mode for AnimatePresence */
	mode?: "wait" | "sync" | "popLayout";
}

// ============================================
// TRANSITION VARIANTS
// ============================================
const variants: Record<string, Variants> = {
	fade: {
		initial: { opacity: 0 },
		animate: { opacity: 1, transition: transitions.normal },
		exit: { opacity: 0, transition: transitions.fast },
	},

	slide: {
		initial: { opacity: 0, x: 20 },
		animate: { opacity: 1, x: 0, transition: transitions.spring },
		exit: { opacity: 0, x: -20, transition: transitions.fast },
	},

	scale: {
		initial: { opacity: 0, scale: 0.95 },
		animate: { opacity: 1, scale: 1, transition: transitions.spring },
		exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
	},

	slideUp: {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0, transition: transitions.spring },
		exit: { opacity: 0, y: -20, transition: transitions.fast },
	},
};

// ============================================
// COMPONENT
// ============================================
export function PageTransition({ children, variant = "fade", className, mode = "wait" }: PageTransitionProps) {
	const location = useLocation();
	const selectedVariant = variants[variant];

	return (
		<AnimatePresence mode={mode}>
			<motion.div
				key={location.pathname}
				className={cn("w-full", className)}
				initial="initial"
				animate="animate"
				exit="exit"
				variants={selectedVariant}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}

// ============================================
// STAGGER CONTAINER (for lists/grids)
// ============================================
export interface StaggerContainerProps {
	children: React.ReactNode;
	/** Stagger delay between children */
	staggerDelay?: number;
	/** Initial delay before animation starts */
	initialDelay?: number;
	className?: string;
}

export function StaggerContainer({ children, staggerDelay = 0.1, initialDelay = 0, className }: StaggerContainerProps) {
	return (
		<motion.div
			className={className}
			initial="hidden"
			animate="visible"
			variants={{
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: {
						delayChildren: initialDelay,
						staggerChildren: staggerDelay,
					},
				},
			}}
		>
			{children}
		</motion.div>
	);
}

// ============================================
// STAGGER ITEM
// ============================================
export interface StaggerItemProps {
	children: React.ReactNode;
	className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
	return (
		<motion.div
			className={className}
			variants={{
				hidden: { opacity: 0, y: 20 },
				visible: {
					opacity: 1,
					y: 0,
					transition: transitions.spring,
				},
			}}
		>
			{children}
		</motion.div>
	);
}

// ============================================
// SCROLL REVEAL
// ============================================
export interface ScrollRevealProps {
	children: React.ReactNode;
	/** Animation direction */
	direction?: "up" | "down" | "left" | "right" | "none";
	/** Distance to move (px) */
	distance?: number;
	/** Delay before animation (s) */
	delay?: number;
	/** Duration of animation (s) */
	duration?: number;
	/** Once or every scroll */
	once?: boolean;
	className?: string;
}

export function ScrollReveal({
	children,
	direction = "up",
	distance = 30,
	delay = 0,
	duration = 0.5,
	once = true,
	className,
}: ScrollRevealProps) {
	const directions = {
		up: { y: distance },
		down: { y: -distance },
		left: { x: distance },
		right: { x: -distance },
		none: {},
	};

	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, ...directions[direction] }}
			whileInView={{ opacity: 1, x: 0, y: 0 }}
			viewport={{ once, margin: "-50px" }}
			transition={{
				duration,
				delay,
				ease: [0.25, 0.1, 0.25, 1],
			}}
		>
			{children}
		</motion.div>
	);
}

// ============================================
// PARALLAX WRAPPER
// ============================================
export interface ParallaxProps {
	children: React.ReactNode;
	/** Parallax speed (0.1 = slow, 1 = fast) */
	speed?: number;
	className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
	return (
		<motion.div className={className} style={{ y: 0 }} whileInView={{ y: 0 }} viewport={{ once: false }}>
			<motion.div
				style={{
					translateY: speed * 100,
				}}
			>
				{children}
			</motion.div>
		</motion.div>
	);
}

export default PageTransition;
