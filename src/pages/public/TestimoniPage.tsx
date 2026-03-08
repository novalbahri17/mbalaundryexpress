import { useQuery } from "@tanstack/react-query";
import { getTestimonials } from "@/api/testimonials.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { useBranches } from "@/hooks/useBranches";

export default function TestimoniPage() {
	const { data: testimonials = [] } = useQuery({
		queryKey: ["testimonials-list"],
		queryFn: () => getTestimonials({ approvedOnly: true, limit: 200 }),
	});
	const { data: branches = [] } = useBranches({ activeOnly: true });

	return (
		<section className="pb-20">
			<PageHeader kicker="Testimoni" title="Suara" highlight="Pelanggan" description="Ulasan pelanggan dari website, Google, dan Instagram yang sudah disetujui admin." />
			<div className="mx-auto grid max-w-7xl gap-5 px-4 md:grid-cols-2 xl:grid-cols-3 md:px-8">
				{testimonials.map((item) => {
					const branchName = branches.find((branch) => branch.id === item.branch_id)?.name ?? "MBA Laundry";
					return (
						<GlassCard key={item.id}>
							<div className="flex items-start gap-3">
								<div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">{item.customer_name.slice(0, 1)}</div>
								<div>
									<p className="font-semibold">{item.customer_name}</p>
									<p className="text-xs text-[var(--text-muted)]">{branchName}</p>
									<p className="mt-1 text-xs text-amber-500">{"*".repeat(Math.max(1, Math.min(5, item.rating)))}</p>
								</div>
							</div>
							<p className="mt-4 text-sm text-[var(--text-muted)]">{item.comment}</p>
							<p className="mt-3 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">Sumber: {item.source}</p>
						</GlassCard>
					);
				})}
				{testimonials.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Belum ada testimoni disetujui.</p> : null}
			</div>
		</section>
	);
}



