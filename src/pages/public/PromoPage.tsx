import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CountdownTimer } from "@/components/public/shared/CountdownTimer";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { useBranches } from "@/hooks/useBranches";
import { usePromos } from "@/hooks/usePromos";
import { usePublicText } from "@/hooks/usePublicText";
import type { Promo } from "@/types/database.types";

/** Ambil teks polos dari deskripsi promo (admin bisa mengisinya dengan HTML). */
const plainText = (value?: string | null): string =>
	value
		? value
				.replace(/<[^>]*>/g, " ")
				.replace(/\s+/g, " ")
				.trim()
		: "";

export default function PromoPage() {
	const text = usePublicText();
	const t = text.pages.promo;
	const [branchId, setBranchId] = useState("");
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const { data: promos = [], isLoading } = usePromos({ activeOnly: true, branchId: branchId || undefined });

	const grouped = useMemo(() => {
		const globals = promos.filter((item) => item.is_global);
		const locals = promos.filter((item) => !item.is_global);
		return { globals, locals };
	}, [promos]);

	// Dipakai untuk tombol "Lihat cabang" pada promo yang hanya berlaku di satu cabang.
	// Rute publik memakai slug cabang (/cabang/:slug), bukan id.
	const branchSlugByName = useMemo(() => {
		const map = new Map<string, string>();
		for (const branch of branches) {
			if (branch.slug) map.set(branch.name, branch.slug);
		}
		return map;
	}, [branches]);

	const renderCard = (promo: Promo, scopeLabel: string, scopeClass: string) => {
		const description = plainText(promo.description);
		// Deskripsi yang isinya sama persis dengan judul hanya mengulang teks.
		const showDescription = Boolean(description) && description.toLowerCase() !== promo.title.trim().toLowerCase();
		const branchNames = promo.branch_names ?? [];
		const singleBranchSlug =
			!promo.is_global && branchNames.length === 1 ? branchSlugByName.get(branchNames[0]) : undefined;

		return (
			<GlassCard key={promo.id} className="flex h-full flex-col overflow-hidden p-0">
				<SafeImage
					src={promo.image}
					fallbackLabel={promo.title}
					alt={promo.title}
					className="h-44 w-full object-cover"
					loading="lazy"
				/>
				<div className="flex flex-1 flex-col p-4">
					<p
						className={`inline-flex self-start rounded-full px-2.5 py-1 text-xs font-semibold text-white ${scopeClass}`}
					>
						{scopeLabel}
					</p>
					<p className="mt-3 text-lg font-bold">{promo.title}</p>
					{showDescription ? (
						<p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{description}</p>
					) : null}
					{/* Promo tanpa tenggat tidak menampilkan hitung mundur sama sekali. */}
					{promo.end_date ? <CountdownTimer endDate={promo.end_date} className="mt-2 text-sm" /> : null}
					{singleBranchSlug ? (
						<Link
							to={`/cabang/${singleBranchSlug}`}
							className="mt-auto inline-flex items-center gap-1.5 self-start pt-4 text-sm font-semibold text-[var(--brand)] hover:underline"
						>
							{t.viewBranch}
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					) : null}
				</div>
			</GlassCard>
		);
	};

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			<div className="mx-auto max-w-7xl px-4 md:px-8">
				<div className="mb-6 max-w-sm">
					<select
						value={branchId}
						onChange={(event) => setBranchId(event.target.value)}
						className="glass-card h-11 w-full rounded-xl px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
					>
						<option value="">{t.allBranches}</option>
						{branches.map((branch) => (
							<option key={branch.id} value={branch.id}>
								{branch.name}
							</option>
						))}
					</select>
				</div>

				{isLoading ? <p className="text-sm text-[var(--text-muted)]">{t.loading}</p> : null}
				{!isLoading && promos.length === 0 ? (
					<p className="text-sm text-[var(--text-muted)]">{branchId ? t.emptyFiltered : t.empty}</p>
				) : null}

				{grouped.globals.length > 0 ? (
					<div className="mb-3">
						<p className="text-sm font-semibold">{t.globalTitle}</p>
						<p className="text-xs text-[var(--text-muted)]">{t.globalTitleHint}</p>
					</div>
				) : null}
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{grouped.globals.map((promo) => renderCard(promo, t.globalBadge, "bg-ruby-700"))}
				</div>

				{grouped.locals.length > 0 ? (
					<div className="mb-3 mt-8">
						<p className="text-sm font-semibold">{t.localTitle}</p>
						<p className="text-xs text-[var(--text-muted)]">{t.localTitleHint}</p>
					</div>
				) : null}
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{grouped.locals.map((promo) =>
						renderCard(
							promo,
							promo.branch_names && promo.branch_names.length > 0 ? promo.branch_names.join(", ") : t.localBadge,
							"bg-amber-600",
						),
					)}
				</div>
			</div>
		</section>
	);
}
