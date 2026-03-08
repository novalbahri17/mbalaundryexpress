import { motion } from "framer-motion";
import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/index";

type HeadingVariant = "display" | "h1" | "h2" | "h3" | "h4";
type HeadingTag = "h1" | "h2" | "h3" | "h4";

const variantClass: Record<HeadingVariant, string> = {
	display: "text-display",
	h1: "text-h1",
	h2: "text-h2",
	h3: "text-h3",
	h4: "text-h4",
};

const variantTag: Record<HeadingVariant, HeadingTag> = {
	display: "h1",
	h1: "h1",
	h2: "h2",
	h3: "h3",
	h4: "h4",
};

export interface HeadingProps extends PropsWithChildren<HTMLAttributes<HTMLHeadingElement>> {
	variant?: HeadingVariant;
	as?: HeadingTag;
	gradient?: boolean;
	reveal?: boolean;
}

export function Heading({
	variant = "h2",
	as,
	gradient = false,
	reveal = false,
	className,
	children,
	...props
}: HeadingProps) {
	const Tag = as ?? variantTag[variant];
	const content = (
		<Tag
			className={cn(
				"font-extrabold tracking-[-0.02em] text-[var(--text-main)]",
				variantClass[variant],
				gradient && "bg-gradient-primary bg-clip-text text-transparent",
				className,
			)}
			{...props}
		>
			{children}
		</Tag>
	);

	if (!reveal) {
		return content;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 18 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-10%" }}
		>
			{content}
		</motion.div>
	);
}

