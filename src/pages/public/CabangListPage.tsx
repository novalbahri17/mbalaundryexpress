import { ArrowRight, MapPin, PhoneCall, Tag } from "lucide-react";
import { Link } from "react-router-dom";
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

export default function CabangListPage() {
	const { data: branches = [], isLoading, isError } = useBranches({ activeOnly: true });

	return (
		<section className="pb-20">
			<PageHeader
				kicker="Cabang"
				title="Pilih"
				highlight="Cabang Terdekat"
				description="Semua cabang aktif tampil otomatis dari database dan selalu up to date."
			/>

			<div className="mx-auto grid max-w-7xl grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 px-4 md:px-8">
				{isLoading ? <p className="col-span-full text-center text-sm text-[var(--text-muted)]">Memuat data cabang...</p> : null}
				{isError ? <p className="col-span-full text-center text-sm text-red-500">Gagal mengambil data cabang.</p> : null}
				{!isLoading && branches.length === 0 ? (
					<p className="col-span-full text-center text-sm text-[var(--text-muted)]">Belum ada cabang aktif.</p>
				) : null}

				{branches.map((branch, index) => {
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
										<Link to={`/cabang/${branch.slug}`} className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
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
