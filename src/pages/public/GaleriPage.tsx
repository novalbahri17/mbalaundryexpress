import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGallery } from "@/api/gallery.api";
import { Lightbox } from "@/components/public/shared/Lightbox";
import { PageHeader } from "@/components/public/shared/PageHeader";

export default function GaleriPage() {
	const { data: images = [] } = useQuery({
		queryKey: ["gallery"],
		queryFn: () => getGallery(),
	});

	const items = useMemo(() => images.map((item) => ({ src: item.image, alt: item.caption })), [images]);

	return (
		<section className="pb-20">
			<PageHeader
				kicker="Galeri"
				title="Lihat"
				highlight="Suasana Cabang"
				description="Galeri interior, fasilitas, dan mesin dari seluruh cabang MBA Laundry."
			/>
			<div className="mx-auto max-w-7xl px-4 md:px-8">
				{items.length > 0 ? (
					<Lightbox items={items} />
				) : (
					<p className="text-sm text-[var(--text-muted)]">Belum ada gambar galeri.</p>
				)}
			</div>
		</section>
	);
}
