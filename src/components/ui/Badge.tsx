import type { HTMLAttributes } from "react";
import { cn } from "@/utils/index";

type BadgeTone = "success" | "warning" | "error" | "info";

const toneClasses: Record<BadgeTone, string> = {
	success: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
	warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
	error: "bg-ruby-100 text-ruby-700 dark:bg-ruby-500/15 dark:text-ruby-300",
	info: "bg-sapphire-100 text-sapphire-700 dark:bg-sapphire-500/15 dark:text-sapphire-300",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	tone?: BadgeTone;
}

export function Badge({ tone = "info", className, children, ...props }: BadgeProps) {
	return (
		<span
			role="status"
			className={cn(
				"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
				toneClasses[tone],
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
