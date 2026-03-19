import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { usePageContentMap } from "@/hooks/usePageContent";
import dayjs from "dayjs";

export function AnnouncementModal() {
	const { data: content = {} } = usePageContentMap();
	const [isOpen, setIsOpen] = useState(false);

	const enabled = content.announcement_active === "1" || content.announcement_active === "true";
	const text = content.announcement_text ?? "";
	const image = content.announcement_image ?? "";
	const start = content.announcement_start ? dayjs(content.announcement_start) : null;
	const end = content.announcement_end ? dayjs(content.announcement_end) : null;

	useEffect(() => {
		// Only proceed if enabled and text exists
		if (!enabled || !text) return;

		// Check scheduling
		const now = dayjs();
		if (start && now.isBefore(start)) return;
		if (end && now.isAfter(end)) return;

		const hasSeen = sessionStorage.getItem("has_seen_announcement");
		if (!hasSeen) {
			// Gentle delay before pop up
			const timer = setTimeout(() => setIsOpen(true), 1200);
			return () => clearTimeout(timer);
		}
	}, [enabled, text, start, end]);

	const handleClose = () => {
		setIsOpen(false);
		sessionStorage.setItem("has_seen_announcement", "true");
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
				>
					<button
						type="button"
						className="absolute inset-0 w-full h-full cursor-default"
						onClick={handleClose}
						onKeyDown={(e) => {
							if (e.key === "Escape") handleClose();
						}}
						aria-label="Tutup Overlay"
						tabIndex={0}
					/>
					<motion.div
						initial={{ scale: 0.9, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.85, opacity: 0, y: -10 }}
						transition={{ type: "spring", stiffness: 350, damping: 25, exit: { duration: 0.2 } }}
						className="relative z-10 w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-neutral-900"
					>
						{/* Header - Banner or Gradient */}
						<div className="relative h-32 sm:h-40 w-full bg-gradient-to-r from-ruby-600 to-ruby-400 overflow-hidden">
							{image ? (
								<img src={image} alt="Pengumuman Banner" className="absolute inset-0 h-full w-full object-cover" />
							) : (
								<div className="absolute inset-0 bg-white/10" />
							)}
						</div>

						{/* Close button */}
						<button
							type="button"
							onClick={handleClose}
							className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white transition-colors hover:bg-black/50"
							aria-label="Tutup Pengumuman"
						>
							<X className="h-4 w-4" />
						</button>

						{/* Content */}
						<div className="px-6 pb-8 text-center">
							{/* Lottie-style Animated Bell SVG */}
							<div className="mx-auto mb-4 flex h-20 w-20 -translate-y-10 items-center justify-center rounded-full border-4 border-white bg-white shadow-xl dark:border-neutral-900 dark:bg-neutral-800">
								<motion.svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-10 w-10 text-ruby-500"
									animate={{ rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0] }}
									transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
								>
									<title>Lonceng Animasi</title>
									<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
									<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
								</motion.svg>
							</div>

							<div className="-mt-8 space-y-4">
								<h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-neutral-900 to-neutral-600 bg-clip-text text-transparent dark:from-white dark:to-neutral-300">
									Pengumuman Penting
								</h3>
								<div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
									{text}
								</div>
								
								<button
									type="button"
									onClick={handleClose}
									className="mt-6 w-full rounded-xl bg-ruby-500 py-3.5 sm:py-3 font-semibold text-white shadow-lg shadow-ruby-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
								>
									Baik, Mengerti
								</button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
