import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	direction?: "up" | "down" | "left" | "right";
}

const directionVariants = {
	up: { y: 40, x: 0 },
	down: { y: -40, x: 0 },
	left: { y: 0, x: 40 },
	right: { y: 0, x: -40 },
};

export function ScrollReveal({ 
	children, 
	className = "", 
	delay = 0,
	direction = "up" 
}: ScrollRevealProps) {
	const initial = directionVariants[direction];

	return (
		<motion.div
			initial={{ opacity: 0, ...initial }}
			whileInView={{ opacity: 1, y: 0, x: 0 }}
			viewport={{ once: true, margin: "-50px" }}
			transition={{ 
				duration: 0.6, 
				delay,
				ease: [0.25, 0.1, 0.25, 1]
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Stagger container untuk animasi bertingkat
interface StaggerContainerProps {
	children: ReactNode;
	className?: string;
	staggerDelay?: number;
}

export function StaggerContainer({ 
	children, 
	className = "",
	staggerDelay = 0.1 
}: StaggerContainerProps) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-50px" }}
			variants={{
				hidden: {},
				visible: {
					transition: {
						staggerChildren: staggerDelay,
					},
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Stagger item untuk digunakan dalam StaggerContainer
interface StaggerItemProps {
	children: ReactNode;
	className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, y: 30 },
				visible: { 
					opacity: 1, 
					y: 0,
					transition: {
						duration: 0.5,
						ease: [0.25, 0.1, 0.25, 1]
					}
				},
			}}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Counter animation untuk stats
interface CounterProps {
	from?: number;
	to: number;
	duration?: number;
	suffix?: string;
	prefix?: string;
	className?: string;
}

export function Counter({ 
	from: _from = 0, 
	to, 
	duration: _duration = 2,
	suffix = "",
	prefix = "",
	className = ""
}: CounterProps) {
	return (
		<motion.span
			className={className}
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			viewport={{ once: true }}
		>
			{prefix}
			<motion.span
				initial={{ opacity: 1 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
			>
				{to.toLocaleString()}
			</motion.span>
			{suffix}
		</motion.span>
	);
}
