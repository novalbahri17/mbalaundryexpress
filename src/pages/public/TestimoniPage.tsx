import { useQuery } from "@tanstack/react-query";
import { getTestimonials } from "@/api/testimonials.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { useBranches } from "@/hooks/useBranches";
import { usePublicText } from "@/hooks/usePublicText";

export default function TestimoniPage() {
	const t = usePublicText().pages.testimoni;
	const { data: testimonials = [], isLoading } = useQuery({
		queryKey: ["testimonials-list"],
		queryFn: () => getTestimonials({ approvedOnly: true, limit: 200 }),
	});
	const { data: branches = [] } = useBranches({ activeOnly: true });

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			{isLoading ? (
				<p className="mx-auto max-w-7xl px-4 text-sm text-[var(--text-muted)] md:px-8">{t.loading}</p>
			) : null}
			<div className="mx-auto grid max-w-7xl gap-5 px-4 md:grid-cols-2 xl:grid-cols-3 md:px-8">
				{testimonials.map((item) => {
					const branchName = branches.find((branch) => branch.id === item.branch_id)?.name ?? "MBA Laundry";
					return (
						<GlassCard key={item.id}>
							<div className="flex items-start gap-3">
								<div className="grid h-11 w-11 place-items-center rounded-full bg-ruby-700 text-sm font-bold text-white">{item.customer_name.slice(0, 1)}</div>
								<div>
									<p className="font-semibold">{item.customer_name}</p>
									<p className="text-xs text-[var(--text-muted)]">{branchName}</p>
									<p className="mt-1 text-xs text-amber-500">{"*".repeat(Math.max(1, Math.min(5, item.rating)))}</p>
								</div>
							</div>
							<p className="mt-4 text-sm text-[var(--text-muted)]">{item.comment}</p>
							<p className="mt-3 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
								{t.source} {item.source}
							</p>
						</GlassCard>
					);
				})}
				{!isLoading && testimonials.length === 0 ? <p className="text-sm text-[var(--text-muted)]">{t.empty}</p> : null}
			</div>
		</section>
	);
}



