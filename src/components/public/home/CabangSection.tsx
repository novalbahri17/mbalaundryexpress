import { useMemo } from "react";
import { Clock3, MapPin, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getBranchHoursByDay, getBranches } from "@/api/branches.api";
import { getPromos } from "@/api/promos.api";
import { GradientText } from "@/components/public/shared/GradientText";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import type { BranchHour } from "@/types/database.types";
import { dayNameId } from "@/utils/format";

const statusConfig: Record<string, { dot: string; text: string; badge: string }> = {
	buka: { dot: "bg-teal-500", text: "Buka", badge: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
	tutup: { dot: "bg-rose-500", text: "Tutup", badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
	ramai: { dot: "bg-amber-500", text: "Ramai", badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
};

export function CabangSection() {
	const today = dayNameId() as BranchHour["day"];
	const { data: branchRes, isLoading, isError } = useQuery({
		queryKey: ["home-branches-active"],
		queryFn: () => getBranches({ activeOnly: true, perPage: 6 }),
	});
	const branches = branchRes?.items ?? [];

	const { data: hours = [] } = useQuery({
		queryKey: ["home-branch-hours-day", today],
		queryFn: () => getBranchHoursByDay(today),
	});

	const { data: promoMap = {} } = useQuery<Record<string, boolean>>({
		queryKey: ["home-branch-promos", branches.map((branch) => branch.id).join(",")],
		enabled: branches.length > 0,
		queryFn: async () => {
			const entries = await Promise.all(
				branches.map(async (branch) => {
					const result = await getPromos({
						status: "published",
						activeOnly: true,
						showOnHome: true,
						branchId: branch.id,
						perPage: 1,
					});
					return [branch.id, result.items.length > 0] as const;
				}),
			);
			return Object.fromEntries(entries);
		},
	});

	const hoursMap = useMemo(() => new Map(hours.map((item) => [item.branch_id, item])), [hours]);

	return (
		<section className="section-wrap mt-24" id="cabang">
			<ScrollReveal className="mb-12 text-center">
				<p className="section-kicker">Lokasi</p>
				<h2 className="section-title">
					{branchRes?.totalItems ?? branches.length} Lokasi, <GradientText>Satu Standar Kualitas</GradientText>
				</h2>
				<p className="section-subtitle mx-auto max-w-3xl">
					Setiap cabang MBA Laundry dilengkapi mesin modern dan standar kebersihan tinggi.
				</p>
			</ScrollReveal>

			{isLoading ? (
				<p className="animate-pulse text-center text-sm font-semibold text-mba-subtext">
					Memuat lokasi cabang terdekat...
				</p>
			) : null}
			{isError ? <p className="text-center text-sm font-semibold text-rose-500">Terjadi kesalahan memuat data cabang.</p> : null}

			<div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
				{branches.map((branch, index) => {
					const status = statusConfig[branch.status] ?? statusConfig.buka;
					const todayHours = hoursMap.get(branch.id);
					const hoursText = todayHours?.is_closed
						? "Tutup Hari Ini"
						: `${todayHours?.open_time ?? "08:00"} - ${todayHours?.close_time ?? "22:00"}`;
					const hasPromo = promoMap[branch.id];

					return (
						<ScrollReveal key={branch.id} delay={index * 0.08}>
							<div className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-mba-border bg-white shadow-card-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover dark:border-mba-darkBorder dark:bg-mba-darkSurface">
								<div className="relative h-56 w-full overflow-hidden">
									<SafeImage
										src={branch.cover_image}
										fallbackLabel={branch.name}
										alt={branch.name}
										loading="lazy"
										className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

									<div className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${status.badge}`}>
										<span className={`h-2.5 w-2.5 rounded-full ${status.dot} animate-pulse`} />
										{status.text}
									</div>

									{hasPromo ? (
										<div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
											<Sparkles className="h-3.5 w-3.5 text-white" />
											Promo Aktif
										</div>
									) : null}

									<div className="absolute bottom-4 left-4 right-4 text-white">
										<h3 className="line-clamp-1 text-xl font-extrabold drop-shadow-md">{branch.name}</h3>
										<p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-white/90">
											<MapPin className="h-4 w-4 shrink-0" />
											<span className="line-clamp-1 truncate">{branch.address.split(",")[0]}</span>
										</p>
									</div>
								</div>

								<div className="flex flex-1 flex-col p-6">
									<p className="line-clamp-2 h-[44px] text-[15px] leading-relaxed text-mba-subtext dark:text-mba-darkSubtext">
										{branch.address}
									</p>

									<div className="mb-8 mt-5 flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
											<Clock3 className="h-[18px] w-[18px]" />
										</div>
										<div className="flex flex-col">
											<span className="text-[11px] font-bold uppercase tracking-wider text-mba-subtext/70 dark:text-mba-darkSubtext/70">
												Jam Operasional
											</span>
											<span className="text-sm font-bold text-mba-text dark:text-mba-darkText">{hoursText}</span>
										</div>
									</div>

									<div className="mt-auto">
										<Link
											to={`/cabang/${branch.slug}`}
											className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-6 py-3.5 text-sm font-bold text-brand-600 transition-all hover:border-transparent hover:bg-brand-600 hover:text-white dark:border-brand-500/20 dark:bg-brand-500/10 dark:hover:bg-brand-500"
										>
											Lihat Cabang
										</Link>
									</div>
								</div>
							</div>
						</ScrollReveal>
					);
				})}
			</div>

			<div className="mt-10 text-center">
				<Link to="/cabang" className="inline-flex items-center gap-2 font-bold text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
					Lihat Semua Cabang
				</Link>
			</div>
		</section>
	);
}
