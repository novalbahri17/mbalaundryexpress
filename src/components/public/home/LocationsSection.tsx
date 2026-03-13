import { ChevronLeft, ChevronRight, Clock, MapPin, Phone } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { useBranches } from "@/hooks/useBranches";

const FALLBACK_BRANCH_IMAGE =
	"https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2071&auto=format&fit=crop";

const scrollStepPx = 420;

export function LocationsSection() {
	const { data: branches = [], isLoading } = useBranches({ activeOnly: true });
	const railRef = useRef<HTMLDivElement | null>(null);

	const handleScroll = (direction: "left" | "right") => {
		const target = railRef.current;
		if (!target) return;

		target.scrollBy({
			left: direction === "left" ? -scrollStepPx : scrollStepPx,
			behavior: "smooth",
		});
	};

	return (
		<section className="bg-neutral-50 px-6 py-24 md:px-12 md:py-32 dark:bg-neutral-900">
			<div className="mx-auto flex max-w-[1200px] flex-col items-center">
				<span className="rounded-full bg-teal-500 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white">
					Lokasi
				</span>
				<h2 className="mt-3 text-center text-[32px] font-bold leading-[1.2] text-neutral-900 md:text-[40px] dark:text-white">
					Lokasi Kami, Satu Standar Kualitas
				</h2>
				<p className="mt-4 max-w-[700px] text-center text-[18px] leading-[1.5] text-neutral-600 dark:text-neutral-300">
					Setiap cabang MBA Laundry dilengkapi mesin modern dan standar kebersihan tinggi.
				</p>

				<div className="mt-16 w-full">
					{isLoading ? (
						<p className="text-center text-neutral-500 dark:text-neutral-400">Memuat cabang...</p>
					) : branches.length === 0 ? (
						<p className="text-center text-neutral-500 dark:text-neutral-400">Belum ada cabang aktif saat ini.</p>
					) : (
						<>
							<div className="mb-4 flex items-center justify-between gap-3">
								<p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
									Geser kanan-kiri untuk lihat semua cabang ({branches.length} cabang aktif)
								</p>
								<div className="hidden items-center gap-2 md:flex">
									<button
										type="button"
										onClick={() => handleScroll("left")}
										className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:border-ruby-500 hover:text-ruby-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-ruby-500"
										aria-label="Geser ke kiri"
									>
										<ChevronLeft className="h-5 w-5" />
									</button>
									<button
										type="button"
										onClick={() => handleScroll("right")}
										className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition hover:border-ruby-500 hover:text-ruby-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-ruby-500"
										aria-label="Geser ke kanan"
									>
										<ChevronRight className="h-5 w-5" />
									</button>
								</div>
							</div>

							<div ref={railRef} className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2">
								{branches.map((branch) => (
									<article
										key={branch.id}
										className="flex w-[86vw] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(239,83,80,0.12)] sm:w-[360px] lg:w-[380px] dark:border-neutral-700 dark:bg-neutral-800"
									>
										<div className="relative h-[220px] w-full overflow-hidden">
											<SafeImage
												src={branch.cover_image || FALLBACK_BRANCH_IMAGE}
												fallbackLabel={branch.name}
												alt={branch.name}
												className="h-full w-full object-cover"
												loading="lazy"
											/>
										</div>

										<div className="flex flex-1 flex-col p-6 sm:p-7">
											<h3 className="line-clamp-1 text-[24px] font-bold text-neutral-900 dark:text-white">{branch.name}</h3>
											<div className="mt-3 flex items-start gap-2">
												<MapPin className="mt-1 h-5 w-5 shrink-0 text-ruby-500" />
												<p className="line-clamp-2 text-[16px] text-neutral-600 dark:text-neutral-300">{branch.address}</p>
											</div>

											<hr className="my-5 border-neutral-200 dark:border-neutral-700" />

											<div className="flex flex-col gap-3">
												<div className="flex items-start gap-2">
													<Clock className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
													<span className="text-[14px] font-medium text-neutral-800 dark:text-neutral-200">07:00 - 23:00</span>
												</div>
												<div className="flex items-center gap-2">
													<Phone className="h-4 w-4 shrink-0 text-neutral-400" />
													<span className="line-clamp-1 text-[14px] font-medium text-neutral-800 dark:text-neutral-200">
														{branch.whatsapp || "Tidak ada telepon"}
													</span>
												</div>
											</div>

											<div className="mt-7">
												<Link
													to={`/cabang/${branch.slug}`}
													className="flex w-full items-center justify-center rounded-xl border-2 border-ruby-500 bg-transparent py-3 text-[16px] font-semibold text-ruby-500 transition-colors hover:bg-ruby-50 dark:border-ruby-400 dark:text-ruby-400 dark:hover:bg-ruby-900/20"
												>
													Lihat Detail Cabang
												</Link>
											</div>
										</div>
									</article>
								))}
							</div>
						</>
					)}
				</div>

				<Link
					to="/cabang"
					className="mt-12 inline-flex items-center justify-center rounded-xl bg-ruby-500 px-8 py-4 text-[16px] font-semibold text-white shadow-ruby-glow transition-all hover:scale-[1.02] hover:bg-ruby-600"
				>
					Lihat Semua Cabang (Peta)
				</Link>
			</div>
		</section>
	);
}
