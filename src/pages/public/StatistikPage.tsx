import { useQuery } from "@tanstack/react-query";
import { getBranches } from "@/api/branches.api";
import { getPromos } from "@/api/promos.api";
import { getTestimonials } from "@/api/testimonials.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { CountUp } from "@/components/public/shared/CountUp";
import { usePublicText } from "@/hooks/usePublicText";

export default function StatistikPage() {
	const t = usePublicText().pages.statistik;
	const { data: branchRes } = useQuery({
		queryKey: ["stat-branches"],
		queryFn: () => getBranches({ activeOnly: true, perPage: 100 }),
	});
	const { data: promoRes } = useQuery({
		queryKey: ["stat-promos"],
		queryFn: () => getPromos({ activeOnly: true, status: "published", perPage: 100 }),
	});
	const { data: testimonials = [] } = useQuery({
		queryKey: ["stat-testimonials"],
		queryFn: () => getTestimonials({ approvedOnly: true, limit: 1000 }),
	});

	const rating =
		testimonials.length > 0 ? testimonials.reduce((sum, item) => sum + item.rating, 0) / testimonials.length : 0;

	const stats = [
		{ label: t.activeBranches, value: branchRes?.totalItems ?? 0 },
		{ label: t.runningPromos, value: promoRes?.totalItems ?? 0 },
		{ label: t.approvedTestimonials, value: testimonials.length },
		{ label: t.averageRating, value: Number(rating.toFixed(1)) },
	];

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			<div className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 md:px-8">
				{stats.map((item) => (
					<div key={item.label} className="glass-card rounded-2xl p-6">
						<p className="text-sm text-[var(--text-muted)]">{item.label}</p>
						<p className="mt-2 text-4xl font-extrabold text-[var(--brand)]">
							<CountUp value={item.value} />
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
