import { CaraPakaiSection } from "@/components/public/home/CaraPakaiSection";
import { CTABanner } from "@/components/public/home/CTABanner";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { usePublicText } from "@/hooks/usePublicText";

export default function CaraPakaiPage() {
	const t = usePublicText().pages.caraPakai;

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			<CaraPakaiSection />
			<CTABanner />
		</section>
	);
}
