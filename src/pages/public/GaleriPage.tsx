import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGallery } from "@/api/gallery.api";
import { Lightbox } from "@/components/public/shared/Lightbox";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { usePublicText } from "@/hooks/usePublicText";

export default function GaleriPage() {
	const t = usePublicText().pages.galeri;
	const { data: images = [] } = useQuery({
		queryKey: ["gallery"],
		queryFn: () => getGallery(),
	});

	const items = useMemo(() => images.map((item) => ({ src: item.image, alt: item.caption })), [images]);

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			<div className="mx-auto max-w-7xl px-4 md:px-8">
				{items.length > 0 ? (
					<Lightbox items={items} />
				) : (
					<p className="text-sm text-[var(--text-muted)]">{t.empty}</p>
				)}
			</div>
		</section>
	);
}
