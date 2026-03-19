import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { usePageContentMap } from "@/hooks/usePageContent";

export function AnnouncementModal() {
	const { data: content = {} } = usePageContentMap();
	const [isOpen, setIsOpen] = useState(false);

	const enabled = content.announcement_active === "1" || content.announcement_active === "true";
	const text = content.announcement_text ?? "";

	useEffect(() => {
		// Show once per session if enabled and has text
		if (enabled && text) {
			const hasSeen = sessionStorage.getItem("has_seen_announcement");
			if (!hasSeen) {
				// Gentle delay before pop up
				const timer = setTimeout(() => setIsOpen(true), 1200);
				return () => clearTimeout(timer);
			}
		}
	}, [enabled, text]);

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
						exit={{ scale: 0.9, opacity: 0, y: 20 }}
						transition={{ type: "spring", stiffness: 350, damping: 25 }}
						className="relative z-10 w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
					>
						{/* Header - Gradient Bar */}
						<div className="relative h-24 w-full overflow-hidden bg-gradient-to-r from-ruby-600 to-ruby-400">
							<div className="absolute inset-0 bg-white/10" />
						</div>

						{/* Close button */}
						<button
							type="button"
							onClick={handleClose}
							className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-white transition-colors hover:bg-black/20"
							aria-label="Tutup Pengumuman"
						>
							<X className="h-4 w-4" />
						</button>

						{/* Content */}
						<div className="px-6 pb-8 pt-6 text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 -translate-y-12 items-center justify-center rounded-full border-4 border-white bg-white shadow-md dark:border-neutral-900 dark:bg-neutral-800">
								<span className="text-2xl leading-none">📢</span>
							</div>

							<div className="-mt-6 space-y-4">
								<h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
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
