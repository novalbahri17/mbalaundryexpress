import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin, PhoneCall, Search, Tag, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getDistricts, getProvinces, getRegencies, getVillages } from "@/api/wilayah.api";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { ScrollReveal } from "@/components/public/shared/ScrollReveal";
import { useBranches } from "@/hooks/useBranches";
import { effectivePrice, groupMachines, isQrisEnabled, useAllBranchMachines } from "@/hooks/useBranchMachines";
import { usePublicText } from "@/hooks/usePublicText";
import type { Branch, BranchMachine } from "@/types/database.types";
import { formatRupiah, toWhatsappLink } from "@/utils/format";

const statusClassName: Record<string, string> = {
	buka: "bg-emerald-500/90 text-white",
	tutup: "bg-[var(--danger)] text-[var(--danger-text)]",
	ramai: "bg-amber-500/90 text-white",
};

const normalizeText = (value: string): string =>
	value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toUpperCase()
		.replace(/\s+/g, " ")
		.trim();

/**
 * Harga termurah tiap jenis mesin di satu cabang.
 * Sumbernya tabel branch_machines, bukan kolom harga di tabel branches.
 */
function cheapestPrices(branch: Branch, allMachines: BranchMachine[]): { wash: number; dry: number } {
	const coinValue = branch.coin_value ?? 10000;
	const qrisOn = isQrisEnabled(branch);
	const rows = groupMachines(allMachines.filter((m) => m.branch_id === branch.id));
	const cheapest = (kind: "wash" | "dry") => {
		const own = rows.filter((m) => m.kind === kind);
		if (own.length === 0) return 0;
		return Math.min(...own.map((m) => effectivePrice(m, coinValue, qrisOn)));
	};
	return { wash: cheapest("wash"), dry: cheapest("dry") };
}

export default function CabangListPage() {
	const text = usePublicText();
	const t = text.pages.cabang;
	const { data: branches = [], isLoading, isError } = useBranches({ activeOnly: true });
	const { data: allMachines = [] } = useAllBranchMachines();

	// Tarif termurah per cabang, dihitung dari data mesin (bukan angka statis).
	const priceLookup = useMemo(() => {
		const map = new Map<string, { wash: number; dry: number }>();
		for (const branch of branches) {
			map.set(branch.id, cheapestPrices(branch, allMachines));
		}
		return map;
	}, [branches, allMachines]);

	const [provinceId, setProvinceId] = useState<string>("");
	const [regencyId, setRegencyId] = useState<string>("");
	const [districtId, setDistrictId] = useState<string>("");
	const [villageId, setVillageId] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState<string>("");

	const {
		data: provinces = [],
		isLoading: loadingProvinces,
		isError: errorProvinces,
	} = useQuery({
		queryKey: ["wilayah", "provinces"],
		queryFn: getProvinces,
		staleTime: 24 * 60 * 60 * 1000,
	});

	const {
		data: regencies = [],
		isLoading: loadingRegencies,
		isError: errorRegencies,
	} = useQuery({
		queryKey: ["wilayah", "regencies", provinceId],
		queryFn: () => getRegencies(provinceId),
		enabled: Boolean(provinceId),
		staleTime: 24 * 60 * 60 * 1000,
	});

	const {
		data: districts = [],
		isLoading: loadingDistricts,
		isError: errorDistricts,
	} = useQuery({
		queryKey: ["wilayah", "districts", regencyId],
		queryFn: () => getDistricts(regencyId),
		enabled: Boolean(regencyId),
		staleTime: 24 * 60 * 60 * 1000,
	});

	const {
		data: villages = [],
		isLoading: loadingVillages,
		isError: errorVillages,
	} = useQuery({
		queryKey: ["wilayah", "villages", districtId],
		queryFn: () => getVillages(districtId),
		enabled: Boolean(districtId),
		staleTime: 24 * 60 * 60 * 1000,
	});

	const selectedProvinceName = useMemo(
		() => provinces.find((item) => item.id === provinceId)?.name ?? "",
		[provinceId, provinces],
	);
	const selectedRegencyName = useMemo(
		() => regencies.find((item) => item.id === regencyId)?.name ?? "",
		[regencies, regencyId],
	);
	const selectedDistrictName = useMemo(
		() => districts.find((item) => item.id === districtId)?.name ?? "",
		[districtId, districts],
	);
	const selectedVillageName = useMemo(
		() => villages.find((item) => item.id === villageId)?.name ?? "",
		[villageId, villages],
	);

	const filteredBranches = useMemo(() => {
		const requiredTerms = [selectedProvinceName, selectedRegencyName, selectedDistrictName, selectedVillageName]
			.filter(Boolean)
			.map(normalizeText);
		const normalizedSearch = normalizeText(searchQuery);

		return branches.filter((branch) => {
			const haystack = normalizeText(`${branch.address} ${branch.name} ${branch.description ?? ""}`);
			const passRegion = requiredTerms.length === 0 || requiredTerms.every((term) => haystack.includes(term));
			const passSearch = !normalizedSearch || haystack.includes(normalizedSearch);
			return passRegion && passSearch;
		});
	}, [branches, searchQuery, selectedProvinceName, selectedRegencyName, selectedDistrictName, selectedVillageName]);

	const resetFilters = () => {
		setProvinceId("");
		setRegencyId("");
		setDistrictId("");
		setVillageId("");
		setSearchQuery("");
	};

	const hasAnyFilter = Boolean(provinceId || regencyId || districtId || villageId || searchQuery.trim());
	const hasRegionApiError = errorProvinces || errorRegencies || errorDistricts || errorVillages;

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />

			<div className="mx-auto mb-6 max-w-7xl px-4 md:px-8">
				<div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
					<div className="mb-3 flex items-center justify-between gap-3">
						<p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{t.filterTitle}</p>
						<button
							type="button"
							onClick={resetFilters}
							disabled={!hasAnyFilter}
							className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-ruby-500 hover:text-ruby-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
						>
							{text.common.reset}
						</button>
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
						<label className="flex flex-col gap-1 md:col-span-2 xl:col-span-2">
							<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">{t.searchLabel}</span>
							<div className="relative">
								<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
								<input
									type="text"
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
									placeholder={t.searchPlaceholder}
									className="h-11 w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-10 text-sm outline-none transition focus:border-ruby-500 dark:border-neutral-700 dark:bg-neutral-950"
								/>
								{searchQuery ? (
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 text-neutral-400 transition hover:text-ruby-500"
										aria-label={t.clearSearch}
									>
										<X className="h-4 w-4" />
									</button>
								) : null}
							</div>
						</label>

						<label className="flex flex-col gap-1">
							<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">{t.province}</span>
							<select
								value={provinceId}
								onChange={(event) => {
									setProvinceId(event.target.value);
									setRegencyId("");
									setDistrictId("");
									setVillageId("");
								}}
								className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-ruby-500 dark:border-neutral-700 dark:bg-neutral-950"
							>
								<option value="">{t.allProvinces}</option>
								{provinces.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>

						<label className="flex flex-col gap-1">
							<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">{t.regency}</span>
							<select
								value={regencyId}
								onChange={(event) => {
									setRegencyId(event.target.value);
									setDistrictId("");
									setVillageId("");
								}}
								disabled={!provinceId || loadingRegencies}
								className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-ruby-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950"
							>
								<option value="">{loadingRegencies ? t.loadingRegencies : t.allRegencies}</option>
								{regencies.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>

						<label className="flex flex-col gap-1">
							<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">{t.district}</span>
							<select
								value={districtId}
								onChange={(event) => {
									setDistrictId(event.target.value);
									setVillageId("");
								}}
								disabled={!regencyId || loadingDistricts}
								className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-ruby-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950"
							>
								<option value="">{loadingDistricts ? t.loadingDistricts : t.allDistricts}</option>
								{districts.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>

						<label className="flex flex-col gap-1">
							<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">{t.village}</span>
							<select
								value={villageId}
								onChange={(event) => setVillageId(event.target.value)}
								disabled={!districtId || loadingVillages}
								className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-ruby-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950"
							>
								<option value="">{loadingVillages ? t.loadingVillages : t.allVillages}</option>
								{villages.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>
					</div>

					{hasRegionApiError ? (
						<p className="mt-3 text-xs font-medium text-[var(--brand)]">{t.regionError}</p>
					) : null}

					{loadingProvinces ? <p className="mt-3 text-xs text-neutral-500">Memuat data provinsi...</p> : null}
				</div>
			</div>

			<div className="mx-auto mb-4 max-w-7xl px-4 md:px-8">
				<p className="text-sm text-[var(--text-muted)]">
					{t.showingPrefix} <span className="font-semibold">{filteredBranches.length}</span> {t.showingMiddle}{" "}
					{branches.length} {t.showingSuffix}
				</p>
			</div>

			<div className="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 px-4 md:px-8">
				{isLoading ? (
					<p className="col-span-full text-center text-sm text-[var(--text-muted)]">{t.loadingBranches}</p>
				) : null}
				{isError ? (
					<p className="col-span-full text-center text-sm text-[var(--brand)]">{t.errorBranches}</p>
				) : null}
				{!isLoading && branches.length === 0 ? (
					<p className="col-span-full text-center text-sm text-[var(--text-muted)]">{t.emptyBranches}</p>
				) : null}
				{!isLoading && branches.length > 0 && filteredBranches.length === 0 ? (
					<p className="col-span-full text-center text-sm text-[var(--text-muted)]">{t.emptyFilter}</p>
				) : null}

				{filteredBranches.map((branch, index) => {
					const statusKey = (branch.status ?? "buka") as keyof typeof text.branchStatus;
					const statusLabel = text.branchStatus[statusKey] ?? text.branchStatus.buka;
					const statusClass = statusClassName[branch.status] ?? statusClassName.buka;
					const prices = priceLookup.get(branch.id) ?? { wash: 0, dry: 0 };
					return (
						<ScrollReveal key={branch.id} delay={index * 0.05} className="h-full min-w-0">
							<GlassCard className="group flex h-full min-w-0 flex-col overflow-hidden p-0">
								<div className="relative h-48 overflow-hidden">
									<SafeImage
										src={branch.cover_image}
										fallbackLabel={branch.name}
										alt={branch.name}
										className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
										loading="lazy"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
									<div className="absolute left-3 top-3 flex items-center gap-2">
										<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}>
											{statusLabel}
										</span>
									</div>
								</div>

								<div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
									<div className="min-h-[3.75rem]">
										<p className="line-clamp-1 text-lg font-bold">{branch.name}</p>
										{/*
										 * `min-h` pada paragraf ini penting: `line-clamp` membuat
										 * elemen menciut setinggi isinya, sehingga alamat 1 baris
										 * membuat kartu lebih pendek dari tetangganya.
										 */}
										<p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-[var(--text-muted)]">
											{branch.address || t.addressEmpty}
										</p>
									</div>
									<div className="rounded-xl border border-white/30 bg-white/40 p-3 text-sm dark:bg-white/5">
										<p className="flex items-center justify-between gap-3">
											<span className="inline-flex items-center gap-1">
												<Tag className="h-3.5 w-3.5 text-[var(--brand)]" />
												{t.wash}
											</span>
												<span className="font-semibold text-[var(--brand)]">
													{prices.wash > 0 ? `${text.home.hero.startFrom} ${formatRupiah(prices.wash)}` : "-"}
												</span>
										</p>
										<p className="mt-2 flex items-center justify-between gap-3">
											<span className="inline-flex items-center gap-1">
												<Tag className="h-3.5 w-3.5 text-sapphire-500" />
												{t.dry}
											</span>
												<span className="font-semibold text-sapphire-700 dark:text-sapphire-300">
													{prices.dry > 0 ? `${text.home.hero.startFrom} ${formatRupiah(prices.dry)}` : "-"}
												</span>
										</p>
									</div>

									<div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
										<MapPin className="h-3.5 w-3.5" />
										<span className="line-clamp-1">{branch.address}</span>
									</div>

									{/*
									 * Tinggi baris aksi dikunci 40px supaya kartu yang punya tombol
									 * WhatsApp (36px) tidak lebih tinggi dari yang tidak punya.
									 */}
									<div className="mt-auto flex h-10 items-center gap-3">
										<Link
											to={`/cabang/${branch.slug}`}
											className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
										>
											{t.viewBranch}
											<ArrowRight className="h-3.5 w-3.5" />
										</Link>
										{branch.whatsapp ? (
											<a
												href={toWhatsappLink(branch.whatsapp)}
												target="_blank"
												rel="noopener noreferrer"
												title={`${t.waTitle} ${branch.name}`}
												className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 transition hover:border-[var(--brand)] hover:text-[var(--brand)] dark:border-slate-600"
											>
												<PhoneCall className="h-4 w-4" />
											</a>
										) : null}
									</div>
								</div>
							</GlassCard>
						</ScrollReveal>
					);
				})}
			</div>
		</section>
	);
}
