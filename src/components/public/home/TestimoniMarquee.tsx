import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTestimonials } from "@/api/testimonials.api";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { GradientText } from "@/components/public/shared/GradientText";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import { useBranches } from "@/hooks/useBranches";

type TestimonialItem = {
	id: string;
	customer_name: string;
	comment: string;
	rating: number;
	branch_id?: string;
	source?: string;
};

function sourceLabel(source?: string): string {
	if (!source) return "Website";
	if (source === "google") return "Google";
	if (source === "instagram") return "Instagram";
	if (source === "manual") return "Manual";
	return "Website";
}

export function TestimoniMarquee() {
	const { data: testimonials = [] } = useQuery({
		queryKey: ["testimonials-approved-home"],
		queryFn: () => getTestimonials({ approvedOnly: true, limit: 50 }),
	});
	const { data: branches = [] } = useBranches({ activeOnly: true });

	const fallback = useMemo<TestimonialItem[]>(
		() => [
			{
				id: "f1",
				customer_name: "Nadia Putri",
				comment: "Mesinnya bersih, hasil kering rapi, dan tempat tunggu nyaman buat kerja.",
				rating: 5,
				branch_id: branches[0]?.id,
				source: "website",
			},
			{
				id: "f2",
				customer_name: "Bimo Ardi",
				comment: "Harga jelas dan cepat. Cocok untuk anak kos yang laundry rutin.",
				rating: 5,
				branch_id: branches[0]?.id,
				source: "google",
			},
			{
				id: "f3",
				customer_name: "Salsa Nabila",
				comment: "Proses praktis, tinggal datang pilih mesin dan beres.",
				rating: 4,
				branch_id: branches[1]?.id,
				source: "instagram",
			},
			{
				id: "f4",
				customer_name: "Rafi Maulana",
				comment: "Lokasi strategis dan pengeringnya cepat. Hemat waktu.",
				rating: 5,
				branch_id: branches[1]?.id,
				source: "website",
			},
			{
				id: "f5",
				customer_name: "Alya Rahma",
				comment: "Promo yang ditawarkan benar-benar kepakai dan worth it.",
				rating: 5,
				branch_id: branches[0]?.id,
				source: "manual",
			},
		],
		[branches],
	);

	const items: TestimonialItem[] = testimonials.length > 0 ? testimonials : fallback;
	const doubled = [...items, ...items];

	const renderRow = (reverse = false) => (
		<div
			className={`flex min-w-max gap-4 ${
				reverse ? "[animation-direction:reverse]" : ""
			} animate-[marquee_44s_linear_infinite] hover:[animation-play-state:paused]`}
		>
			{doubled.map((item, index) => {
				const branchName =
					branches.find((branch) => branch.id === item.branch_id)?.name ?? "MBA Laundry";
				const safeRating = Math.max(1, Math.min(5, Math.round(item.rating)));

				return (
					<GlassCard key={`${item.id}-${index}`} className="w-[340px]" hoverable={false}>
						<div className="flex items-start gap-3">
							<div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white">
								{item.customer_name.slice(0, 1)}
							</div>
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-2">
									<p className="text-sm font-semibold text-mba-text dark:text-white">
										{item.customer_name}
									</p>
									<span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-200">
										{sourceLabel(item.source)}
									</span>
								</div>
								<p className="text-xs text-[var(--text-muted)]">{branchName}</p>
								<p className="mt-1 text-xs font-semibold text-amber-500">{safeRating}/5 rating</p>
								<p className="mt-2 line-clamp-3 text-sm text-[var(--text-muted)]">{item.comment}</p>
							</div>
						</div>
					</GlassCard>
				);
			})}
		</div>
	);

	return (
		<section className="section-wrap mt-24">
			<ScrollReveal className="mb-10 text-center">
				<p className="section-kicker">Testimoni</p>
				<h2 className="section-title">
					Sudah <GradientText>Ribuan Pelanggan Puas</GradientText>
				</h2>
			</ScrollReveal>
			<div className="space-y-4 overflow-hidden">
				{renderRow(false)}
				{renderRow(true)}
			</div>
		</section>
	);
}
