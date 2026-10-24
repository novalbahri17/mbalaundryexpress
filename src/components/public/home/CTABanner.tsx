import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientText } from "@/components/public/shared/GradientText";
import { usePublicText } from "@/hooks/usePublicText";

export function CTABanner() {
	const text = usePublicText();
	const t = text.home.banner;
	return (
		<section className="section-wrap mt-24 pb-20">
			<div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0F111A] px-8 py-16 text-center text-white">
				<div className="relative z-10">
					<h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
						{t.titlePrefix} <GradientText>{t.titleHighlight}</GradientText>
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-slate-200 md:text-lg">{t.description}</p>
					<Link
						to="/cabang"
						className="btn-primary mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold"
					>
						{t.button}
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</section>
	);
}
