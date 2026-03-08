import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/index";

type ContainerSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<ContainerSize, string> = {
	sm: "max-w-3xl",
	md: "max-w-5xl",
	lg: "max-w-6xl",
	xl: "max-w-7xl",
};

export interface ContainerProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
	size?: ContainerSize;
}

export function Container({ size = "xl", className, children, ...props }: ContainerProps) {
	return (
		<div className={cn("mx-auto w-full px-container-x md:px-8", sizeMap[size], className)} {...props}>
			{children}
		</div>
	);
}

