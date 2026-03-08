import { Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { usePageContentMap } from "@/hooks/usePageContent";

export function StickyBanner() {
	const { data: content = {} } = usePageContentMap();
	const [hidden, setHidden] = useState(false);
	const enabled = useMemo(() => {
		const flag = content.announcement_active ?? "false";
		return flag === "1" || flag === "true";
	}, [content.announcement_active]);

	if (hidden) return null;

	return (
		<div className="sticky top-0 z-[60] border-b border-neutral-200 bg-white/90 backdrop-blur-glass dark:border-neutral-800 dark:bg-neutral-950/80">
			<div className="section-wrap flex min-h-[40px] items-center justify-between gap-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-100">
				<p className="inline-flex items-center gap-2">
					<Sparkles className="h-3.5 w-3.5 text-ruby-500" aria-hidden />
					<span>{enabled && content.announcement_text ? content.announcement_text : "Diskon member baru hingga 20% minggu ini."}</span>
				</p>
				<button
					type="button"
					onClick={() => setHidden(true)}
					className="inline-flex h-7 min-w-[44px] items-center justify-center rounded-lg border border-neutral-300 px-2 text-neutral-500 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
					aria-label="Tutup banner"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}
