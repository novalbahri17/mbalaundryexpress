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
import { formatRupiah, toWhatsappLink } from "@/utils/format";

const statusConfig: Record<string, { label: string; className: string }> = {
	buka: { label: "Buka", className: "bg-emerald-500/90 text-white" },
	tutup: { label: "Tutup", className: "bg-rose-500/90 text-white" },
	ramai: { label: "Ramai", className: "bg-amber-500/90 text-white" },
};

const normalizeText = (value: string): string =>
	value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toUpperCase()
		.replace(/\s+/g, " ")
		.trim();

export default function CabangListPage() {
	const { data: branches = [], isLoading, isError } = useBranches({ activeOnly: true });

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
			<PageHeader
				kicker="Cabang"
				title="Pilih"
				highlight="Cabang Terdekat"
				description="Semua cabang aktif tampil otomatis dari database. Gunakan filter wilayah Indonesia untuk mempercepat pencarian."
			/>

			<div className="mx-auto mb-6 max-w-7xl px-4 md:px-8">
				<div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/70">
					<div className="mb-3 flex items-center justify-between gap-3">
						<p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Filter Wilayah Indonesia</p>
						<button
							type="button"
							onClick={resetFilters}
							disabled={!hasAnyFilter}
							className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-ruby-500 hover:text-ruby-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200"
						>
							Reset
						</button>
					</div>

					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
						<label className="flex flex-col gap-1 md:col-span-2 xl:col-span-2">
							<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
								Cari Nama/Alamat Cabang
							</span>
							<div className="relative">
								<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
								<input
									type="text"
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
									placeholder="Contoh: bohar, pagesangan, surabaya..."
									className="h-11 w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-10 text-sm outline-none transition focus:border-ruby-500 dark:border-neutral-700 dark:bg-neutral-950"
								/>
								{searchQuery ? (
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 text-neutral-400 transition hover:text-ruby-500"
										aria-label="Hapus kata pencarian"
									>
										<X className="h-4 w-4" />
									</button>
								) : null}
							</div>
						</label>

						<label className="flex flex-col gap-1">
							<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Provinsi</span>
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
								<option value="">Semua Provinsi</option>
								{provinces.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>

						<label className="flex flex-col gap-1">
							<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Kabupaten/Kota</span>
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
								<option value="">{loadingRegencies ? "Memuat kab/kota..." : "Semua Kab/Kota"}</option>
								{regencies.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>

						<label className="flex flex-col gap-1">
							<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Kecamatan</span>
							<select
								value={districtId}
								onChange={(event) => {
									setDistrictId(event.target.value);
									setVillageId("");
								}}
								disabled={!regencyId || loadingDistricts}
								className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-ruby-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950"
							>
								<option value="">{loadingDistricts ? "Memuat kecamatan..." : "Semua Kecamatan"}</option>
								{districts.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>

						<label className="flex flex-col gap-1">
							<span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Kelurahan</span>
							<select
								value={villageId}
								onChange={(event) => setVillageId(event.target.value)}
								disabled={!districtId || loadingVillages}
								className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-ruby-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950"
							>
								<option value="">{loadingVillages ? "Memuat kelurahan..." : "Semua Kelurahan"}</option>
								{villages.map((item) => (
									<option key={item.id} value={item.id}>
										{item.name}
									</option>
								))}
							</select>
						</label>
					</div>

					{hasRegionApiError ? (
						<p className="mt-3 text-xs font-medium text-red-500">
							Sebagian data wilayah gagal dimuat. Coba refresh halaman atau cek koneksi internet.
						</p>
					) : null}

					{loadingProvinces ? <p className="mt-3 text-xs text-neutral-500">Memuat data provinsi...</p> : null}
				</div>
			</div>

			<div className="mx-auto mb-4 max-w-7xl px-4 md:px-8">
				<p className="text-sm text-[var(--text-muted)]">
					Menampilkan <span className="font-semibold">{filteredBranches.length}</span> dari {branches.length} cabang.
				</p>
			</div>

			<div className="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 px-4 md:px-8">
				{isLoading ? <p className="col-span-full text-center text-sm text-[var(--text-muted)]">Memuat data cabang...</p> : null}
				{isError ? <p className="col-span-full text-center text-sm text-red-500">Gagal mengambil data cabang.</p> : null}
				{!isLoading && branches.length === 0 ? (
					<p className="col-span-full text-center text-sm text-[var(--text-muted)]">Belum ada cabang aktif.</p>
				) : null}
				{!isLoading && branches.length > 0 && filteredBranches.length === 0 ? (
					<p className="col-span-full text-center text-sm text-[var(--text-muted)]">
						Tidak ada cabang yang cocok dengan filter/pencarian saat ini.
					</p>
				) : null}

				{filteredBranches.map((branch, index) => {
					const status = statusConfig[branch.status] ?? statusConfig.buka;
					return (
						<ScrollReveal key={branch.id} delay={index * 0.05}>
							<GlassCard className="group overflow-hidden p-0">
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
										<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}>
											{status.label}
										</span>
									</div>
								</div>

								<div className="space-y-3 p-5">
									<div>
										<p className="text-lg font-bold">{branch.name}</p>
										<p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">{branch.address}</p>
									</div>

									<div className="rounded-xl border border-white/30 bg-white/40 p-3 text-sm dark:bg-white/5">
										<p className="flex items-center justify-between gap-3">
											<span className="inline-flex items-center gap-1">
												<Tag className="h-3.5 w-3.5 text-red-500" />
												Cuci
											</span>
											<span className="font-semibold text-red-600 dark:text-red-300">{formatRupiah(branch.price_wash)}</span>
										</p>
										<p className="mt-2 flex items-center justify-between gap-3">
											<span className="inline-flex items-center gap-1">
												<Tag className="h-3.5 w-3.5 text-rose-500" />
												Kering
											</span>
											<span className="font-semibold text-rose-600 dark:text-rose-300">{formatRupiah(branch.price_dry)}</span>
										</p>
									</div>

									<div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
										<MapPin className="h-3.5 w-3.5" />
										<span className="line-clamp-1">{branch.address}</span>
									</div>

									<div className="flex items-center gap-3">
										<Link
											to={`/cabang/${branch.slug}`}
											className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
										>
											Lihat Cabang
											<ArrowRight className="h-3.5 w-3.5" />
										</Link>
										{branch.whatsapp ? (
											<a
												href={toWhatsappLink(branch.whatsapp)}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 transition hover:border-red-400 hover:text-red-500 dark:border-slate-600"
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
