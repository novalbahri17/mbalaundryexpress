import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { resolveImageUrl } from "@/utils/format";

type LightboxItem = {
	src: string;
	alt?: string;
};

type LightboxProps = {
	items: LightboxItem[];
};

export function Lightbox({ items }: LightboxProps) {
	return (
		<PhotoProvider>
			<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
				{items.map((item) => {
					const safeSrc = resolveImageUrl(item.src, item.alt ?? "MBA Laundry");
					return (
						<PhotoView key={item.src} src={safeSrc}>
							<button type="button" className="group overflow-hidden rounded-xl border border-white/30">
								<img
									src={safeSrc}
									alt={item.alt ?? "Galeri MBA Laundry"}
									loading="lazy"
									className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
								/>
							</button>
						</PhotoView>
					);
				})}
			</div>
		</PhotoProvider>
	);
}
