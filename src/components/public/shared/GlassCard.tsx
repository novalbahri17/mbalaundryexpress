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
			whileHover={hoverable ? { y: -6, boxShadow: "0 0 60px rgba(21,101,192,0.1)" } : undefined}
			transition={{ type: "spring", stiffness: 250, damping: 20 }}
			className={cn(
				"glass-card rounded-2xl border border-white/20 p-5 transition-all duration-300",
				hoverable && "hover:border-ruby-400/30",
				className,
			)}
		>
			{children}
		</motion.div>
	);
}

