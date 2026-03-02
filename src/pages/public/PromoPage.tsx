import { useMemo, useState } from "react";
import { CountdownTimer } from "@/components/public/shared/CountdownTimer";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { useBranches } from "@/hooks/useBranches";
import { usePromos } from "@/hooks/usePromos";

export default function PromoPage() {
	const [branchId, setBranchId] = useState("");
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const { data: promos = [], isLoading } = usePromos({ activeOnly: true, branchId: branchId || undefined });

	const grouped = useMemo(() => {
		const globals = promos.filter((item) => item.is_global);
		const locals = promos.filter((item) => !item.is_global);
		return { globals, locals };
	}, [promos]);

	return (
		<section className="pb-20">
			<PageHeader
				kicker="Promo"
				title="Promo"
				highlight="Hari Ini"
				description="Filter promo berdasarkan cabang. Seluruh data ditarik real time dari database."
			/>
			<div className="mx-auto max-w-7xl px-4 md:px-8">
				<div className="mb-6 max-w-sm">
					<select
						value={branchId}
						onChange={(event) => setBranchId(event.target.value)}
						className="glass-card h-11 w-full rounded-xl px-3 text-sm focus:border-red-400 focus:outline-none"
					>
						<option value="">Semua Cabang</option>
						{branches.map((branch) => (
							<option key={branch.id} value={branch.id}>
								{branch.name}
							</option>
						))}
					</select>
				</div>

				{isLoading ? <p className="text-sm text-[var(--text-muted)]">Memuat promo...</p> : null}
				{!isLoading && promos.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Tidak ada promo aktif saat ini.</p> : null}

				{grouped.globals.length > 0 ? <p className="mb-3 text-sm font-semibold">Promo Global</p> : null}
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{grouped.globals.map((promo) => (
						<GlassCard key={promo.id} className="overflow-hidden p-0">
							<div className="animated-gradient-border rounded-none">
								<SafeImage
									src={promo.image}
									fallbackLabel={promo.title}
									alt={promo.title}
									className="h-44 w-full object-cover"
									loading="lazy"
								/>
							</div>
							<div className="p-4">
								<p className="inline-flex rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
									GLOBAL
								</p>
								<p className="mt-3 text-lg font-bold">{promo.title}</p>
								<CountdownTimer endDate={promo.end_date} className="mt-2 text-sm" />
							</div>
						</GlassCard>
					))}
				</div>

				{grouped.locals.length > 0 ? <p className="mb-3 mt-8 text-sm font-semibold">Promo Cabang Tertentu</p> : null}
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{grouped.locals.map((promo) => (
						<GlassCard key={promo.id} className="overflow-hidden p-0">
							<SafeImage
								src={promo.image}
								fallbackLabel={promo.title}
								alt={promo.title}
								className="h-44 w-full object-cover"
								loading="lazy"
							/>
							<div className="p-4">
								<p className="inline-flex rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
									Khusus Cabang
								</p>
								<p className="mt-3 text-lg font-bold">{promo.title}</p>
								<CountdownTimer endDate={promo.end_date} className="mt-2 text-sm" />
							</div>
						</GlassCard>
					))}
				</div>
			</div>
		</section>
	);
}
