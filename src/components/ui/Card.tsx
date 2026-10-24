import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/index";

type CardVariant = "default" | "glass";

export interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
	variant?: CardVariant;
	interactive?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
	default: "border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900",
	glass: "border border-neutral-200 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-900",
};

export function Card({ variant = "default", interactive = true, className, children, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"rounded-glass p-5 transition-colors duration-200",
				interactive && "hover:border-neutral-300 dark:hover:border-neutral-700",
				variantClasses[variant],
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
