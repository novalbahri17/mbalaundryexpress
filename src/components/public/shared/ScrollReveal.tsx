import type { PropsWithChildren } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type ScrollRevealProps = PropsWithChildren<{
	className?: string;
	delay?: number;
	once?: boolean;
}>;

export function ScrollReveal({ children, className, delay = 0, once = true }: ScrollRevealProps) {
	const ref = useRef<HTMLDivElement | null>(null);
	const inView = useInView(ref, { once, margin: "-15%" });

	return (
		<motion.div
			ref={ref}
			className={className}
			initial={{ opacity: 0, y: 24 }}
			animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
			transition={{ duration: 0.6, delay }}
		>
			{children}
		</motion.div>
	);
}

