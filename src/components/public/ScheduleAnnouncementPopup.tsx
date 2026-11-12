import { ChevronLeft, ChevronRight, Megaphone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SchedulePopupConfig } from "@/api/publicSchedule.api";

interface ScheduleAnnouncementPopupProps {
	open: boolean;
	onClose: () => void;
	popup: SchedulePopupConfig | null | undefined;
}

export function ScheduleAnnouncementPopup({ open, onClose, popup }: ScheduleAnnouncementPopupProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const touchStartX = useRef<number | null>(null);

	const images = popup?.images ?? [];
	const totalImages = images.length;

	useEffect(() => {
		if (open) {
			setActiveIndex(0);
		}
	}, [open, popup?.updatedAt]);

	useEffect(() => {
		if (!open) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "ArrowLeft" && totalImages > 1) {
				setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
			} else if (e.key === "ArrowRight" && totalImages > 1) {
				setActiveIndex((prev) => (prev + 1) % totalImages);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = prevOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, onClose, totalImages]);

	if (!open || !popup) return null;

	const safeIndex = totalImages > 0 ? Math.min(activeIndex, totalImages - 1) : 0;
	const currentImage = images[safeIndex];

	const goPrev = () => {
		if (totalImages <= 1) return;
		setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
	};

	const goNext = () => {
		if (totalImages <= 1) return;
		setActiveIndex((prev) => (prev + 1) % totalImages);
	};

	return (
		<div
			className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:p-6"
			role="dialog"
			aria-modal="true"
			aria-labelledby="schedule-popup-title"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="relative flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
				{/* Header Tetap dengan Tombol Silang (X) Jelas */}
				<div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
					<div className="flex min-w-0 items-center gap-2.5">
						<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-[#C62828] dark:bg-red-950/60 dark:text-red-400">
							<Megaphone size={18} />
						</span>
						<div className="min-w-0">
							<span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#C62828] dark:text-red-400">
								Info &amp; Pengumuman
							</span>
							<h2
								id="schedule-popup-title"
								className="truncate text-[15px] font-black text-slate-900 dark:text-white"
							>
								{popup.title?.trim() || "Pengumuman Karyawan"}
							</h2>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						aria-label="Tutup pop-up"
						className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-red-100 hover:text-[#C62828] active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-950/60 dark:hover:text-red-400"
					>
						<X size={19} strokeWidth={2.5} />
					</button>
				</div>

				{/* Konten Scrollable (Aman untuk Mobile & Desktop) */}
				<div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-5">
					{totalImages > 0 && currentImage && (
						<div className="space-y-2.5">
							<div
								className="relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950"
								onTouchStart={(e) => {
									touchStartX.current = e.touches[0]?.clientX ?? null;
								}}
								onTouchEnd={(e) => {
									if (touchStartX.current === null || totalImages <= 1) return;
									const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
									const diff = touchStartX.current - endX;
									if (Math.abs(diff) > 40) {
										if (diff > 0) goNext();
										else goPrev();
									}
									touchStartX.current = null;
								}}
							>
								<img
									src={currentImage.url}
									alt={`Lampiran pengumuman ${safeIndex + 1}`}
									className="max-h-[46dvh] w-full select-none object-contain"
									loading="eager"
								/>

								{totalImages > 1 && (
									<>
										<button
											type="button"
											onClick={goPrev}
											aria-label="Gambar sebelumnya"
											className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm transition hover:bg-black/75 active:scale-95"
										>
											<ChevronLeft size={20} />
										</button>
										<button
											type="button"
											onClick={goNext}
											aria-label="Gambar berikutnya"
											className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm transition hover:bg-black/75 active:scale-95"
										>
											<ChevronRight size={20} />
										</button>
										<span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
											{safeIndex + 1} / {totalImages}
										</span>
									</>
								)}
							</div>

							{/* Strip Thumbnail jika Gambar Lebih dari 1 */}
							{totalImages > 1 && (
								<div className="flex items-center gap-2 overflow-x-auto pb-1">
									{images.map((img, idx) => {
										const isActive = idx === safeIndex;
										return (
											<button
												type="button"
												key={img.id || `${img.url}-${idx}`}
												onClick={() => setActiveIndex(idx)}
												aria-label={`Lihat gambar ${idx + 1}`}
												className="relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all"
												style={{
													borderColor: isActive ? "#C62828" : "transparent",
													opacity: isActive ? 1 : 0.65,
												}}
											>
												<img
													src={img.url}
													alt={`Thumbnail ${idx + 1}`}
													className="h-full w-full object-cover"
												/>
											</button>
										);
									})}
								</div>
							)}
						</div>
					)}

					{popup.content?.trim() && (
						<div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-[14px] leading-relaxed text-slate-800 whitespace-pre-line break-words dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 sm:text-[15px]">
							{popup.content}
						</div>
					)}
				</div>

				{/* Footer Tutup */}
				<div className="flex shrink-0 items-center justify-end border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
					<button
						type="button"
						onClick={onClose}
						className="w-full cursor-pointer rounded-xl bg-[#C62828] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#B71C1C] active:scale-[0.99] sm:w-auto"
					>
						Mengerti &amp; Tutup
					</button>
				</div>
			</div>
		</div>
	);
}
