import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/index";

type CardVariant = "default" | "glass";

export interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
	variant?: CardVariant;
	interactive?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
	default:
		"border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80",
	glass:
		"border border-white/30 bg-white/70 shadow-lg backdrop-blur-glass dark:border-white/20 dark:bg-neutral-900/60",
};

export function Card({
	variant = "default",
	interactive = true,
	className,
	children,
	...props
}: CardProps) {
	return (
		<div
			className={cn(
				"rounded-glass p-5 transition-all duration-300",
				interactive && "hover:-translate-y-1.5 hover:shadow-xl",
				variantClasses[variant],
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

