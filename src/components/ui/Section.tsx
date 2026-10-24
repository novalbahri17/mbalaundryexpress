import { motion } from "framer-motion";
import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/utils/index";

type SectionSize = "sm" | "md" | "lg";

const sectionSizeClass: Record<SectionSize, string> = {
	sm: "py-section-sm",
	md: "py-section",
	lg: "py-[8rem]",
};

export interface SectionProps extends PropsWithChildren<HTMLAttributes<HTMLElement>> {
	size?: SectionSize;
	reveal?: boolean;
}

export function Section({ size = "md", reveal = false, className, children, ...props }: SectionProps) {
	const content = (
		<section className={cn(sectionSizeClass[size], className)} {...props}>
			{children}
		</section>
	);

	if (!reveal) {
		return content;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-10%" }}
		>
			{content}
		</motion.div>
	);
}
