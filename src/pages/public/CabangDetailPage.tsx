import {
	CalendarClock,
	Coffee,
	Droplets,
	ExternalLink,
	MapPin,
	ParkingSquare,
	ShieldCheck,
	Sofa,
	Tag,
	Tv,
	Wifi,
	Wind,
} from "lucide-react";
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
import type { BranchHour } from "@/types/database.types";
import { dayNameId, formatRupiah, sanitizeRichHtml, sanitizeUrl, toWhatsappLink } from "@/utils/format";

const tabs = [
	{ key: "info", label: "Info" },
	{ key: "jam", label: "Jam Operasional" },
	{ key: "fasilitas", label: "Fasilitas" },
	{ key: "galeri", label: "Galeri" },
	{ key: "promo", label: "Promo" },
] as const;

const dayOrder: BranchHour["day"][] = [
	"senin",
	"selasa",
	"rabu",
	"kamis",
	"jumat",
	"sabtu",
	"minggu",
];

const statusText: Record<string, { label: string; badgeClass: string }> = {
	buka: { label: "Buka", badgeClass: "bg-emerald-500/90 text-white" },
	tutup: { label: "Tutup", badgeClass: "bg-rose-500/90 text-white" },
	ramai: { label: "Ramai", badgeClass: "bg-amber-500/90 text-white" },
};

const facilityIcon = (name?: string): ReactNode => {
	const key = (name || "").toLowerCase();
	if (key.includes("wifi")) return <Wifi className="h-4 w-4 text-red-500" />;
	if (key.includes("sofa") || key.includes("tunggu")) return <Sofa className="h-4 w-4 text-amber-500" />;
	if (key.includes("park")) return <ParkingSquare className="h-4 w-4 text-emerald-500" />;
	if (key.includes("shield") || key.includes("aman")) return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
	if (key.includes("tv")) return <Tv className="h-4 w-4 text-violet-500" />;
	if (key.includes("coffee")) return <Coffee className="h-4 w-4 text-orange-500" />;
	if (key.includes("wind")) return <Wind className="h-4 w-4 text-red-400" />;
	if (key.includes("drop")) return <Droplets className="h-4 w-4 text-rose-500" />;
	if (key.includes("washing")) return <Droplets className="h-4 w-4 text-red-500" />;
	return <Tag className="h-4 w-4 text-rose-500" />;
};

export default function CabangDetailPage() {
	const { slug } = useParams();
	const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>("info");
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
	const mapEmbedSrc = useMemo(() => {
		const raw = branch?.maps_embed?.trim();
		if (!raw) return undefined;
		const iframeSrc = raw.match(/src=["']([^"']+)["']/i)?.[1];
		return sanitizeUrl(iframeSrc ?? raw);
	}, [branch?.maps_embed]);

	if (!branch) {
		return <p className="px-4 py-20 text-center text-sm text-[var(--text-muted)]">Cabang tidak ditemukan.</p>;
	}

	const today = dayNameId();
	const todayHours = hours.find((item) => item.day === today);
	const orderedHours = [...hours].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
	const status = statusText[branch.status] ?? statusText.buka;
	const mapsUrl = sanitizeUrl(branch.maps_url);
	const descriptionHtml = sanitizeRichHtml(
		branch.description || "<p>Cabang modern dengan mesin terawat dan area tunggu nyaman.</p>",
	);

	return (
		<section className="pb-20">
			<PageHeader
				kicker="Detail Cabang"
				title={branch.name}
				description={branch.address}
				action={
					branch.whatsapp ? (
						<a
							href={toWhatsappLink(branch.whatsapp, `Halo ${branch.name}, saya mau tanya layanan`)}
							target="_blank"
							rel="noopener noreferrer"
							className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold"
						>
							Chat Cabang
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
							<span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}>{status.label}</span>
						</div>
						<div className="absolute bottom-4 left-4 right-4 hidden gap-2 text-xs text-white md:grid md:grid-cols-3">
							<div className="rounded-xl border border-white/30 bg-black/35 px-3 py-2 backdrop-blur">
								<div className="inline-flex items-center gap-1">
									<Tag className="h-3.5 w-3.5" />
									Cuci
								</div>
								<p className="mt-1 text-sm font-semibold">{formatRupiah(branch.price_wash)}</p>
							</div>
							<div className="rounded-xl border border-white/30 bg-black/35 px-3 py-2 backdrop-blur">
								<div className="inline-flex items-center gap-1">
									<Tag className="h-3.5 w-3.5" />
									Kering
								</div>
								<p className="mt-1 text-sm font-semibold">{formatRupiah(branch.price_dry)}</p>
							</div>
							<div className="rounded-xl border border-white/30 bg-black/35 px-3 py-2 backdrop-blur">
								<div className="inline-flex items-center gap-1">
									<CalendarClock className="h-3.5 w-3.5" />
									Hari ini
								</div>
								<p className="mt-1 text-sm font-semibold">
									{todayHours?.is_closed ? "Tutup" : `${todayHours?.open_time ?? "08:00"} - ${todayHours?.close_time ?? "22:00"}`}
								</p>
							</div>
						</div>
					</div>
					<div className="grid gap-2 p-3 text-xs md:hidden">
						<div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-white/15 dark:bg-white/5">
							<div className="inline-flex items-center gap-1 text-[var(--text-muted)]">
								<Tag className="h-3.5 w-3.5" />
								Cuci
							</div>
							<p className="mt-1 text-sm font-semibold text-[var(--text-main)] dark:text-[var(--text-main)]">
								{formatRupiah(branch.price_wash)}
							</p>
						</div>
						<div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-white/15 dark:bg-white/5">
							<div className="inline-flex items-center gap-1 text-[var(--text-muted)]">
								<Tag className="h-3.5 w-3.5" />
								Kering
							</div>
							<p className="mt-1 text-sm font-semibold text-[var(--text-main)] dark:text-[var(--text-main)]">
								{formatRupiah(branch.price_dry)}
							</p>
						</div>
						<div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-white/15 dark:bg-white/5">
							<div className="inline-flex items-center gap-1 text-[var(--text-muted)]">
								<CalendarClock className="h-3.5 w-3.5" />
								Hari ini
							</div>
							<p className="mt-1 text-sm font-semibold text-[var(--text-main)] dark:text-[var(--text-main)]">
								{todayHours?.is_closed ? "Tutup" : `${todayHours?.open_time ?? "08:00"} - ${todayHours?.close_time ?? "22:00"}`}
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
								className={`rounded-full px-4 py-2 text-xs font-semibold transition ${activeTab === tab.key ? "bg-red-600 text-white" : "glass-card"}`}
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
								<p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Alamat</p>
								<p className="mt-2 inline-flex items-start gap-2 text-sm">
									<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
									<span>{branch.address}</span>
								</p>
							</div>
							<div className="rounded-xl border border-white/25 bg-white/40 p-3 dark:bg-white/5">
								<p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Peta Lokasi</p>
								{mapEmbedSrc ? (
									<div className="mt-2 overflow-hidden rounded-xl border border-white/25">
										<iframe
											src={mapEmbedSrc}
											title={`Map ${branch.name}`}
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
										className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline dark:text-red-300"
									>
										Buka Google Maps
										<ExternalLink className="h-3.5 w-3.5" />
									</a>
								) : (
									<p className="mt-2 text-sm text-[var(--text-muted)]">Belum ada tautan peta.</p>
								)}
							</div>
						</div>
					</GlassCard>
				) : null}

				{activeTab === "jam" ? (
					<GlassCard hoverable={false}>
						<p className="mb-3 text-sm font-semibold">
							Hari ini:{" "}
							{todayHours?.is_closed
								? "Tutup Hari Ini"
								: `${todayHours?.open_time ?? "08:00"} - ${todayHours?.close_time ?? "22:00"}`}
						</p>
						<div className="grid gap-2">
							{orderedHours.map((item) => (
								<div key={item.id} className="flex items-center justify-between rounded-xl border border-white/25 bg-white/40 px-3 py-2 text-sm dark:bg-white/5">
									<span className="capitalize">{item.day}</span>
									<span>{item.is_closed ? "Tutup" : `${item.open_time} - ${item.close_time}`}</span>
								</div>
							))}
							{orderedHours.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Jam operasional belum diatur.</p> : null}
						</div>
					</GlassCard>
				) : null}

				{activeTab === "fasilitas" ? (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{facilities.map((item) => (
							<GlassCard key={item.id} hoverable={false}>
								<div className="flex items-center gap-2">
									{facilityIcon(item.icon || item.name)}
									<p className="font-semibold">{item.name}</p>
								</div>
							</GlassCard>
						))}
						{facilities.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Belum ada fasilitas terdaftar.</p> : null}
					</div>
				) : null}

				{activeTab === "galeri" ? (
					gallery.length > 0 ? (
						<Lightbox items={gallery.map((item) => ({ src: item.image, alt: item.caption }))} />
					) : (
						<p className="text-sm text-[var(--text-muted)]">Galeri cabang masih kosong.</p>
					)
				) : null}

				{activeTab === "promo" ? (
					<div className="grid gap-3 md:grid-cols-2">
						{promos.map((promo) => (
							<GlassCard key={promo.id} hoverable={false}>
								<p className="font-semibold">{promo.title}</p>
								{promo.description ? <p className="mt-1 line-clamp-3 text-sm text-[var(--text-muted)]">{promo.description.replace(/<[^>]*>/g, "")}</p> : null}
								<CountdownTimer endDate={promo.end_date} className="mt-2 text-sm" />
								{promo.terms ? <p className="mt-2 text-xs text-[var(--text-muted)]">S&K: {promo.terms}</p> : null}
							</GlassCard>
						))}
						{promos.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Tidak ada promo aktif untuk cabang ini.</p> : null}
					</div>
				) : null}
			</div>
		</section>
	);
}
