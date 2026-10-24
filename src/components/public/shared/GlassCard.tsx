import type { PropsWithChildren } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/index";

type GlassCardProps = PropsWithChildren<{
	className?: string;
	hoverable?: boolean;
}>;

export function GlassCard({ children, className, hoverable = true }: GlassCardProps) {
	return (
		<motion.div
			whileHover={hoverable ? { y: -4 } : undefined}
			transition={{ duration: 0.18, ease: "easeOut" }}
			className={cn(
				"glass-card rounded-2xl p-5",
				hoverable && "transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]",
				className,
			)}
		>
			{children}
		</motion.div>
	);
}
