import { motion } from "framer-motion";
import { cn } from "@/utils";

type AnimatedOrbProps = {
	className?: string;
	color: "ruby" | "blue" | "teal";
	size?: number;
	delay?: number;
};

const colorMap: Record<AnimatedOrbProps["color"], string> = {
	ruby: "rgba(198,40,40,var(--orb-opacity))",
	blue: "rgba(21,101,192,var(--orb-opacity))",
	teal: "rgba(0,105,92,var(--orb-opacity))",
};

export function AnimatedOrb({ className, color, size = 280, delay = 0 }: AnimatedOrbProps) {
	return (
		<motion.span
			aria-hidden
			initial={{ opacity: 0, scale: 0.92 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.8, delay }}
			style={{
				width: size,
				height: size,
				background: colorMap[color],
				filter: "blur(60px)",
			}}
			className={cn("absolute rounded-full animate-orb", className)}
		/>
	);
}

