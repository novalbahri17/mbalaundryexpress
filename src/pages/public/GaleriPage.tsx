import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGallery } from "@/api/gallery.api";
import { Lightbox } from "@/components/public/shared/Lightbox";
import { PageHeader } from "@/components/public/shared/PageHeader";

const filters = ["all", "interior", "exterior", "mesin", "fasilitas", "umum"] as const;

export default function GaleriPage() {
	const [filter, setFilter] = useState<(typeof filters)[number]>("all");
	const { data: images = [] } = useQuery({
		queryKey: ["gallery", filter],
		queryFn: () => getGallery({ type: filter === "all" ? undefined : filter }),
	});

	const items = useMemo(() => images.map((item) => ({ src: item.image, alt: item.caption })), [images]);

	return (
		<section className="pb-20">
			<PageHeader kicker="Galeri" title="Lihat" highlight="Suasana Cabang" description="Galeri interior, fasilitas, dan mesin dari seluruh cabang MBA Laundry." />
			<div className="mx-auto max-w-7xl px-4 md:px-8">
				<div className="mb-6 flex flex-wrap gap-2">
					{filters.map((key) => (
						<button key={key} type="button" onClick={() => setFilter(key)} className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${filter === key ? "bg-red-600 text-white" : "glass-card"}`}>
							{key === "all" ? "Semua" : key}
						</button>
					))}
				</div>
				{items.length > 0 ? <Lightbox items={items} /> : <p className="text-sm text-[var(--text-muted)]">Belum ada gambar galeri.</p>}
			</div>
		</section>
	);
}


