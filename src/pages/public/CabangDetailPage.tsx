import { CalendarClock, ExternalLink, MapPin, Tag } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getBranchFacilities, getBranchGallery, getBranchHours } from "@/api/branches.api";
import { getPromos } from "@/api/promos.api";
import { CountdownTimer } from "@/components/public/shared/CountdownTimer";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { Lightbox } from "@/components/public/shared/Lightbox";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { useBranches } from "@/hooks/useBranches";
import {
	effectivePrice,
	formatCapacity,
	formatDuration,
	groupMachines,
	isCashEnabled,
	isQrisEnabled,
	useBranchMachines,
} from "@/hooks/useBranchMachines";
import { getFacilityIcon } from "@/lib/facility-icons";
import { usePublicText } from "@/hooks/usePublicText";
import type { BranchHour } from "@/types/database.types";
import {
	dayNameId,
	formatOpeningHours,
	formatRupiah,
	sanitizeRichHtml,
	sanitizeUrl,
	toWhatsappLink,
} from "@/utils/format";

const statusBadgeClass: Record<string, string> = {
	buka: "bg-emerald-500/90 text-white",
	tutup: "bg-[var(--danger)] text-[var(--danger-text)]",
	ramai: "bg-amber-500/90 text-white",
};

const dayOrder: BranchHour["day"][] = [
	"senin",
	"selasa",
	"rabu",
	"kamis",
	"jumat",
	"sabtu",
	"minggu",
];

const facilityIcon = (icon?: string, name?: string): ReactNode => {
	const Icon = getFacilityIcon(icon, name);
	return <Icon className="h-4 w-4 text-[var(--brand)]" />;
};

type TabKey = "info" | "mesin" | "jam" | "fasilitas" | "galeri" | "promo";

export default function CabangDetailPage() {
	const text = usePublicText();
	const t = text.pages.cabangDetail;
	const tabs: { key: TabKey; label: string }[] = [
		{ key: "info", label: t.tabs.info },
		{ key: "mesin", label: t.tabs.mesin },
		{ key: "jam", label: t.tabs.jam },
		{ key: "fasilitas", label: t.tabs.fasilitas },
		{ key: "galeri", label: t.tabs.galeri },
		{ key: "promo", label: t.tabs.promo },
	];
	const { slug } = useParams();
	const [activeTab, setActiveTab] = useState<TabKey>("info");
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const branch = useMemo(() => branches.find((item) => item.slug === slug), [branches, slug]);

	const { data: hours = [] } = useQuery({
		queryKey: ["branch-hours", branch?.id],
		queryFn: () => getBranchHours(branch?.id ?? ""),
		enabled: Boolean(branch?.id),
	});
	const { data: facilities = [] } = useQuery({
		queryKey: ["branch-facilities", branch?.id],
		queryFn: () => getBranchFacilities(branch?.id ?? ""),
		enabled: Boolean(branch?.id),
	});
	const { data: gallery = [] } = useQuery({
		queryKey: ["branch-gallery", branch?.id],
		queryFn: () => getBranchGallery(branch?.id),
		enabled: Boolean(branch?.id),
	});
	const { data: promos = [] } = useQuery({
		queryKey: ["branch-promos", branch?.id],
		queryFn: async () => {
			const result = await getPromos({ activeOnly: true, status: "published", branchId: branch?.id });
			return result.items;
		},
		enabled: Boolean(branch?.id),
	});

	// Mesin & tarif per cabang (sumber: tabel branch_machines).
	const { data: machines = [] } = useBranchMachines(branch?.id);
	const coinValue = branch?.coin_value ?? 10000;
	const qrisEnabled = isQrisEnabled(branch);
	const cashEnabled = isCashEnabled(branch);
	const machineRows = useMemo(() => groupMachines(machines), [machines]);

	// Tarif ringkas di header: termurah per jenis mesin, ikut QRIS kalau aktif.
	const headlinePrice = useMemo(() => {
		const cheapest = (kind: "wash" | "dry") => {
			const own = machineRows.filter((m) => m.kind === kind);
			if (own.length === 0) return 0;
			return Math.min(...own.map((m) => effectivePrice(m, coinValue, qrisEnabled)));
		};
		return {
			wash: cheapest("wash"),
			dry: cheapest("dry"),
		};
	}, [machineRows, coinValue, qrisEnabled]);

	const mapEmbedSrc = useMemo(() => {
		const raw = branch?.maps_embed?.trim();
		if (!raw) return undefined;
		const iframeSrc = raw.match(/src=["']([^"']+)["']/i)?.[1];
		return sanitizeUrl(iframeSrc ?? raw);
	}, [branch?.maps_embed]);

	if (!branch) {
		return <p className="px-4 py-20 text-center text-sm text-[var(--text-muted)]">{t.notFoundTitle}.</p>;
	}

	const today = dayNameId();
	const todayHours = hours.find((item) => item.day === today);
	const orderedHours = [...hours].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
	const statusKey = (branch.status ?? "buka") as keyof typeof text.branchStatus;
	const statusLabel = text.branchStatus[statusKey] ?? text.branchStatus.buka;
	const statusBadge = statusBadgeClass[branch.status] ?? statusBadgeClass.buka;
	const mapsUrl = sanitizeUrl(branch.maps_url);
	const descriptionHtml = sanitizeRichHtml(
		branch.description || `<p>${t.noDescription}</p>`,
	);

	return (
		<section className="pb-20">
			<PageHeader
				kicker={t.address}
				title={branch.name}
				description={branch.address}
				action={
					branch.whatsapp ? (
						<a
							href={toWhatsappLink(branch.whatsapp, text.nav.waMessage)}
							target="_blank"
							rel="noopener noreferrer"
							className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold"
						>
							{t.chatWa}
						</a>
					) : null
				}
			/>

			<div className="mx-auto max-w-7xl px-4 md:px-8">
				<GlassCard className="mb-5 overflow-hidden p-0">
					<div className="relative h-52 md:h-72">
						<SafeImage
							src={branch.cover_image}
							fallbackLabel="MBA Laundry Express"
							alt={branch.name}
							className="h-full w-full object-cover"
							loading="lazy"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
						<div className="absolute left-3 top-3 md:left-4 md:top-4">
							<span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}>{statusLabel}</span>
						</div>
						<div className="absolute bottom-4 left-4 right-4 hidden gap-2 text-xs text-white md:grid md:grid-cols-3">
							<div className="rounded-xl border border-white/20 bg-black/60 px-3 py-2">
								<div className="inline-flex items-center gap-1">
									<Tag className="h-3.5 w-3.5" />
									{t.wash}
								</div>
								<p className="mt-1 text-sm font-semibold">{formatRupiah(headlinePrice.wash)}</p>
							</div>
							<div className="rounded-xl border border-white/20 bg-black/60 px-3 py-2">
								<div className="inline-flex items-center gap-1">
									<Tag className="h-3.5 w-3.5" />
									{t.dry}
								</div>
								<p className="mt-1 text-sm font-semibold">{formatRupiah(headlinePrice.dry)}</p>
							</div>
							<div className="rounded-xl border border-white/20 bg-black/60 px-3 py-2">
								<div className="inline-flex items-center gap-1">
									<CalendarClock className="h-3.5 w-3.5" />
									{t.today}
								</div>
								<p className="mt-1 text-sm font-semibold">
									{todayHours?.is_closed
										? t.closed
										: formatOpeningHours(todayHours?.open_time ?? "08:00", todayHours?.close_time ?? "22:00", t.fullDay)}
								</p>
							</div>
						</div>
					</div>
					<div className="grid gap-2 p-3 text-xs md:hidden">
						<div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-white/15 dark:bg-white/5">
							<div className="inline-flex items-center gap-1 text-[var(--text-muted)]">
								<Tag className="h-3.5 w-3.5" />
								{t.wash}
							</div>
							<p className="mt-1 text-sm font-semibold text-[var(--text-main)] dark:text-[var(--text-main)]">
								{formatRupiah(headlinePrice.wash)}
							</p>
						</div>
						<div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-white/15 dark:bg-white/5">
							<div className="inline-flex items-center gap-1 text-[var(--text-muted)]">
								<Tag className="h-3.5 w-3.5" />
								{t.dry}
							</div>
							<p className="mt-1 text-sm font-semibold text-[var(--text-main)] dark:text-[var(--text-main)]">
								{formatRupiah(headlinePrice.dry)}
							</p>
						</div>
						<div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-white/15 dark:bg-white/5">
							<div className="inline-flex items-center gap-1 text-[var(--text-muted)]">
								<CalendarClock className="h-3.5 w-3.5" />
								{t.today}
							</div>
							<p className="mt-1 text-sm font-semibold text-[var(--text-main)] dark:text-[var(--text-main)]">
								{todayHours?.is_closed
									? t.closed
									: formatOpeningHours(todayHours?.open_time ?? "08:00", todayHours?.close_time ?? "22:00", t.fullDay)}
							</p>
						</div>
					</div>
				</GlassCard>

				<div className="mb-5 overflow-x-auto">
					<div className="flex min-w-max gap-2 pb-1">
						{tabs.map((tab) => (
							<button
								key={tab.key}
								type="button"
								onClick={() => setActiveTab(tab.key)}
								className={`rounded-full px-4 py-2 text-xs font-semibold transition ${activeTab === tab.key ? "bg-ruby-700 text-white" : "glass-card"}`}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				{activeTab === "info" ? (
					<GlassCard hoverable={false}>
						<div className="secure-richtext prose prose-slate max-w-none text-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
						<div className="mt-5 grid gap-3 md:grid-cols-2">
							<div className="rounded-xl border border-white/25 bg-white/40 p-3 dark:bg-white/5">
								<p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{t.address}</p>
								<p className="mt-2 inline-flex items-start gap-2 text-sm">
									<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
									<span>{branch.address}</span>
								</p>
							</div>
							<div className="rounded-xl border border-white/25 bg-white/40 p-3 dark:bg-white/5">
								<p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">{t.map}</p>
								{mapEmbedSrc ? (
									<div className="mt-2 overflow-hidden rounded-xl border border-white/25">
										<iframe
											src={mapEmbedSrc}
											title={`${t.mapTitle} ${branch.name}`}
											className="h-48 w-full"
											loading="lazy"
											referrerPolicy="no-referrer-when-downgrade"
										/>
									</div>
								) : mapsUrl ? (
									<a
										href={mapsUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] hover:underline"
									>
										{t.openMaps}
										<ExternalLink className="h-3.5 w-3.5" />
									</a>
								) : (
									<p className="mt-2 text-sm text-[var(--text-muted)]">{t.noMapLink}</p>
								)}
							</div>
						</div>
					</GlassCard>
				) : null}

				{activeTab === "mesin" ? (
					<GlassCard hoverable={false}>
						<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
							<p className="text-sm font-semibold">{t.machineTariff}</p>
							<p className="text-xs text-[var(--text-muted)]">
								{cashEnabled ? (
									<>
										{t.cashNote}{" "}
										<span className="font-semibold text-[var(--text-primary)]">{formatRupiah(coinValue)}</span>
									</>
								) : (
									<>{t.qrisOnly}</>
								)}
							</p>
						</div>
						{machineRows.length === 0 ? (
							<p className="text-sm text-[var(--text-muted)]">{t.noMachines}</p>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full min-w-[520px] text-left text-sm">
									<thead className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
										<tr>
											<th className="pb-2 pr-4 font-semibold">{t.machineHeader}</th>
											<th className="pb-2 pr-4 font-semibold">{t.capacity}</th>
											<th className="pb-2 pr-4 font-semibold">{t.duration}</th>
											<th className="pb-2 pr-4 font-semibold">{t.coins}</th>
											{cashEnabled ? (
												<th className="pb-2 pr-4 text-right font-semibold">{t.priceCash}</th>
											) : null}
											{qrisEnabled ? <th className="pb-2 text-right font-semibold">{t.priceQris}</th> : null}
										</tr>
									</thead>
									<tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
										{machineRows.map((m) => {
											const coinPrice = m.coins * coinValue;
											return (
												<tr key={m.key}>
													<td className="py-3 pr-4 font-semibold text-[var(--text-primary)]">
														{m.kind === "wash" ? text.pages.harga.washMachine : text.pages.harga.dryMachine}
														{m.note ? (
															<span className="block text-xs font-normal text-[var(--text-muted)]">{m.note}</span>
														) : null}
													</td>
													<td className="py-3 pr-4 text-[var(--text-secondary)]">
														{formatCapacity(m.capacity_min, m.capacity_max)}
													</td>
													<td className="py-3 pr-4 text-[var(--text-secondary)]">
														{formatDuration(m.duration_min, m.duration_max, text.common.minuteShort)}
													</td>
													<td className="py-3 pr-4 text-[var(--text-secondary)]">
												{m.coins} {t.coins}
											</td>
													{cashEnabled ? (
														<td className="py-3 pr-4 text-right font-bold text-[var(--brand)]">
															{formatRupiah(coinPrice)}
														</td>
													) : null}
													{qrisEnabled ? (
														<td className="py-3 text-right">
															{m.qris_price ? (
																<span className="font-bold text-emerald-600 dark:text-emerald-400">
																	{formatRupiah(m.qris_price)}
																</span>
															) : (
																<span className="text-[var(--text-muted)]">-</span>
															)}
														</td>
													) : null}
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</GlassCard>
				) : null}

				{activeTab === "jam" ? (
					<GlassCard hoverable={false}>
						<p className="mb-3 text-sm font-semibold">
							{t.today}:{" "}
							{todayHours?.is_closed
								? t.hoursClosed
								: formatOpeningHours(todayHours?.open_time ?? "08:00", todayHours?.close_time ?? "22:00", t.fullDay)}
						</p>
						<div className="grid gap-2">
							{orderedHours.map((item) => (
								<div key={item.id} className="flex items-center justify-between rounded-xl border border-white/25 bg-white/40 px-3 py-2 text-sm dark:bg-white/5">
									<span className="capitalize">{item.day}</span>
									<span>
										{item.is_closed ? t.hoursClosed : formatOpeningHours(item.open_time, item.close_time, t.fullDay)}
									</span>
								</div>
							))}
							{orderedHours.length === 0 ? <p className="text-sm text-[var(--text-muted)]">{t.noHours}</p> : null}
						</div>
					</GlassCard>
				) : null}

				{activeTab === "fasilitas" ? (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{facilities.map((item) => (
							<GlassCard key={item.id} hoverable={false}>
								<div className="flex items-center gap-2">
									{facilityIcon(item.icon ?? undefined, item.name)}
									<p className="font-semibold">{item.name}</p>
								</div>
							</GlassCard>
						))}
						{facilities.length === 0 ? <p className="text-sm text-[var(--text-muted)]">{t.facilitiesEmpty}</p> : null}
					</div>
				) : null}

				{activeTab === "galeri" ? (
					gallery.length > 0 ? (
						<Lightbox items={gallery.map((item) => ({ src: item.image, alt: item.caption }))} />
					) : (
						<p className="text-sm text-[var(--text-muted)]">{t.galleryEmpty}</p>
					)
				) : null}

				{activeTab === "promo" ? (
					<div className="grid gap-3 md:grid-cols-2">
						{promos.map((promo) => (
							<GlassCard key={promo.id} hoverable={false}>
								<p className="font-semibold">{promo.title}</p>
								{promo.description ? <p className="mt-1 line-clamp-3 text-sm text-[var(--text-muted)]">{promo.description.replace(/<[^>]*>/g, "")}</p> : null}
								{promo.end_date ? <CountdownTimer endDate={promo.end_date} className="mt-2 text-sm" /> : null}
								{promo.terms ? <p className="mt-2 text-xs text-[var(--text-muted)]">{t.terms} {promo.terms}</p> : null}
							</GlassCard>
						))}
						{promos.length === 0 ? <p className="text-sm text-[var(--text-muted)]">{t.promoEmpty}</p> : null}
					</div>
				) : null}
			</div>
		</section>
	);
}
