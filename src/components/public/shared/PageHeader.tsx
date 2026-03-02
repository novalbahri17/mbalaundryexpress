import type { ReactNode } from "react";
import { GradientText } from "@/components/public/shared/GradientText";

type PageHeaderProps = {
	kicker: string;
	title: string;
	highlight?: string;
	description?: string;
	action?: ReactNode;
};

export function PageHeader({ kicker, title, highlight, description, action }: PageHeaderProps) {
	return (
		<header className="section-wrap relative overflow-hidden pb-8 pt-16 md:pb-12 md:pt-24">
			<div className="pointer-events-none absolute -left-20 top-0 h-52 w-52 rounded-full bg-brand-500/10 blur-3xl" />
			<div className="pointer-events-none absolute -right-20 top-6 h-52 w-52 rounded-full bg-sapphire-500/10 blur-3xl" />
			<div className="pointer-events-none absolute inset-0 dot-grid opacity-10" />

			<div className="relative mx-auto max-w-5xl text-center">
				<p className="section-kicker">{kicker}</p>
				<h1 className="section-title text-mba-text dark:text-white">
					{title} {highlight ? <GradientText>{highlight}</GradientText> : null}
				</h1>
				{description ? (
					<p className="section-subtitle mx-auto max-w-3xl text-sm md:text-base">{description}</p>
				) : null}
				{action ? <div className="mt-7">{action}</div> : null}
			</div>
		</header>
	);
}
