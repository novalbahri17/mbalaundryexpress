import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientText } from "@/components/public/shared/GradientText";

export function CTABanner() {
	return (
		<section className="section-wrap mt-24 pb-20">
			<div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0F111A] px-8 py-16 text-center text-white">
				<div className="pointer-events-none absolute -left-20 top-6 h-[260px] w-[260px] rounded-full bg-ruby-500/30 blur-3xl" />
				<div className="pointer-events-none absolute -right-20 bottom-0 h-[260px] w-[260px] rounded-full bg-sapphire-500/30 blur-3xl" />
				<div className="pointer-events-none absolute left-1/2 top-8 h-[180px] w-[180px] -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />
				<div className="pointer-events-none absolute inset-0 dot-grid opacity-15" />

				<div className="relative z-10">
					<h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
						Yuk, <GradientText>Laundry Sekarang!</GradientText>
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-slate-200 md:text-lg">
						Pilih cabang terdekatmu dan rasakan proses laundry yang cepat, bersih, dan praktis.
					</p>
					<Link
						to="/cabang"
						className="btn-primary mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold"
					>
						Pilih Cabang
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</section>
	);
}

