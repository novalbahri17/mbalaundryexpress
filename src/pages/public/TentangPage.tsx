import { PageHeader } from "@/components/public/shared/PageHeader";
import { useBranches } from "@/hooks/useBranches";
import { usePublicText } from "@/hooks/usePublicText";

export default function TentangPage() {
	const text = usePublicText();
	const t = text.pages.tentang;
	const { data: branches = [] } = useBranches({ activeOnly: true });

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			<div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-2 md:px-8">
				<div className="glass-card rounded-2xl p-6">
					<p className="text-lg font-bold">{t.missionTitle}</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">{t.missionDesc}</p>
				</div>
				<div className="glass-card rounded-2xl p-6">
					<p className="text-lg font-bold">{t.growthTitle}</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">
						{text.fill(t.growthDesc, { count: branches.length })}
					</p>
				</div>
			</div>
		</section>
	);
}
