import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { usePageContentMap } from "@/hooks/usePageContent";

const colorMap: Record<string, string> = {
	red: "bg-brand-700",
	blue: "bg-sapphire-700",
	teal: "bg-teal-700",
	amber: "bg-amber-500 text-slate-900",
};

export function AnnouncementBar() {
	const { data: content = {} } = usePageContentMap();
	const [closed, setClosed] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.sessionStorage.getItem("mba-announcement-closed") === "1";
	});

	const active = useMemo(() => {
		const raw = content.announcement_active ?? "false";
		return raw === "true" || raw === "1";
	}, [content.announcement_active]);

	if (!active || !content.announcement_text || closed) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: -50, opacity: 0 }}
				className={`${colorMap[content.announcement_color] ?? colorMap.red} sticky top-0 z-[70]`}
			>
				<div className="section-wrap flex items-center justify-between gap-4 py-2.5 text-sm font-medium text-white">
					<p>{content.announcement_text}</p>
					<button
						type="button"
						onClick={() => {
							setClosed(true);
							window.sessionStorage.setItem("mba-announcement-closed", "1");
						}}
						aria-label="Tutup pengumuman"
						className="rounded-full p-1 transition hover:bg-white/15"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
