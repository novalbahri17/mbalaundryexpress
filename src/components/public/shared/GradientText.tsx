import type { PropsWithChildren } from "react";
import { cn } from "@/utils";

type GradientTextProps = PropsWithChildren<{
	className?: string;
}>;

export function GradientText({ children, className }: GradientTextProps) {
	return <span className={cn("gradient-text", className)}>{children}</span>;
}

