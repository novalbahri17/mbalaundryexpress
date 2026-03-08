import { Gift } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePromos } from "@/hooks/usePromos";

type TimeLeft = {
	days: number;
	hours: number;
	minutes: number;
};

function getTimeLeft(target: string): TimeLeft {
	const end = new Date(target).getTime();
	const diff = Math.max(0, end - Date.now());
	const days = Math.floor(diff / (24 * 60 * 60 * 1000));
	const hours = Math.floor((diff / (60 * 60 * 1000)) % 24);
	const minutes = Math.floor((diff / (60 * 1000)) % 60);
	return { days, hours, minutes };
}

export function PromoSection() {
	const { data: promos = [], isLoading } = usePromos({ activeOnly: true, showOnHome: true });
	const visiblePromos = useMemo(() => promos.slice(0, 5), [promos]);

	if (isLoading || visiblePromos.length === 0) return null;

	return (
		<section className="overflow-hidden bg-neutral-50 px-6 py-20 md:px-12 md:py-24">
			<div className="mx-auto flex max-w-[1200px] flex-col items-center">
				{/* HEADER */}
				<span className="rounded-full bg-ruby-500 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white">
					Promo Terbaru
				</span>
				<h2 className="mt-3 text-center text-[32px] font-bold leading-[1.2] text-neutral-900 md:text-[40px]">
					Diskon & Penawaran Spesial
				</h2>

				{/* CAROUSEL */}
				<section className="relative mt-12 w-full max-w-[1000px]" aria-label="Promo Carousel">
					<div className="flex w-full overflow-x-auto snap-x snap-mandatory pb-8 px-4 hide-scrollbar">
						<div className="flex w-[max-content] gap-6">
							{visiblePromos.map((promo) => {
								const time = getTimeLeft(promo.end_date);
								const plainDescription = promo.description?.replace(/<[^>]*>/g, "").trim() ?? "";
								return (
									<div
										key={promo.id}
										className="w-[85vw] max-w-[400px] snap-center shrink-0 overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
									>
										<div className="relative h-56 w-full md:h-64">
											<img
												src={
													promo.image ||
													"https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?q=80&w=2070&auto=format&fit=crop"
												}
												alt={promo.title}
												className="h-full w-full object-cover"
											/>
											<div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-ruby-500 px-4 py-2 text-[12px] font-bold text-white shadow-sm">
												<Gift className="h-4 w-4" /> Promo Aktif
											</div>
										</div>

										<div className="space-y-4 p-5 md:p-6">
											<h3 className="line-clamp-2 text-[20px] font-bold text-neutral-900 md:text-[24px]">
												{promo.title}
											</h3>
											{plainDescription ? (
												<p className="line-clamp-2 text-sm text-neutral-600">{plainDescription}</p>
											) : null}

											{/* COUNTDOWN */}
											<div className="flex w-full justify-between gap-3 pt-2">
												{[
													{ label: "Hari", value: time.days },
													{ label: "Jam", value: time.hours },
													{ label: "Menit", value: time.minutes },
												].map((item) => (
													<div
														key={item.label}
														className="flex flex-1 flex-col items-center justify-center rounded-[16px] border border-neutral-200 bg-neutral-50 px-3 py-3 shadow-sm"
													>
														<span className="text-[20px] font-bold tabular-nums leading-none text-neutral-900">
															{item.value}
														</span>
														<span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
															{item.label}
														</span>
													</div>
												))}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</section>

				{/* BOTTOM LINK */}
				<div className="mt-12 flex items-center justify-center gap-4">
					<Link
						to="/promo"
						className="inline-flex items-center justify-center rounded-xl border-2 border-neutral-200 bg-transparent px-8 py-3 text-[16px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
					>
						Lihat Semua Promo
					</Link>
				</div>
			</div>
		</section>
	);
}
