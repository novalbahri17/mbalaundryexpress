import { PageHeader } from "@/components/public/shared/PageHeader";
import { useBranches } from "@/hooks/useBranches";
import { usePublicText } from "@/hooks/usePublicText";

export default function KorporatPage() {
	const text = usePublicText();
	const t = text.pages.korporat;
	const { data: branches = [], isLoading } = useBranches({ activeOnly: true });

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			<div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-3 md:px-8">
				<div className="glass-card rounded-2xl p-6">
					<p className="font-semibold">{t.packageTitle}</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">{t.packageDesc}</p>
				</div>
				<div className="glass-card rounded-2xl p-6">
					<p className="font-semibold">{t.activationTitle}</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">{t.activationDesc}</p>
				</div>
				<div className="glass-card rounded-2xl p-6">
					<p className="font-semibold">{t.branchesTitle}</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">
						{isLoading ? t.branchesLoading : text.fill(t.branchesCount, { count: branches.length })}
					</p>
				</div>
			</div>
		</section>
	);
}
