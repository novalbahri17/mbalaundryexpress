import { CaraPakaiSection } from "@/components/public/home/CaraPakaiSection";
import { CTABanner } from "@/components/public/home/CTABanner";
import { PageHeader } from "@/components/public/shared/PageHeader";

export default function CaraPakaiPage() {
	return (
		<section className="pb-20">
			<PageHeader
				kicker="Panduan"
				title="Cara"
				highlight="Pakai"
				description="Panduan self-service dari pilih mesin hingga selesai cuci dalam 3 langkah."
			/>
			<CaraPakaiSection />
			<CTABanner />
		</section>
	);
}
