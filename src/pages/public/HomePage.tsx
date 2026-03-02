import { useCallback, useState } from "react";
import { AnnouncementBar } from "@/components/public/home/AnnouncementBar";
import { BlogSection } from "@/components/public/home/BlogSection";
import { CabangSection } from "@/components/public/home/CabangSection";
import { CaraPakaiSection } from "@/components/public/home/CaraPakaiSection";
import { CTABanner } from "@/components/public/home/CTABanner";
import { GalleryPreviewSection } from "@/components/public/home/GalleryPreviewSection";
import { HargaSection } from "@/components/public/home/HargaSection";
import { HeroSection } from "@/components/public/home/HeroSection";
import { KalkulatorSection } from "@/components/public/home/KalkulatorSection";
import { MiniWasherSection } from "@/components/public/home/MiniWasherSection";
import { PromoCarousel } from "@/components/public/home/PromoCarousel";
import { PromoPopup } from "@/components/public/home/PromoPopup";
import { QuickChips } from "@/components/public/home/QuickChips";
import { RealisticWasherSection } from "@/components/public/home/RealisticWasherSection";
import { StatsSection } from "@/components/public/home/StatsSection";
import { SubscribeSection } from "@/components/public/home/SubscribeSection";
import { TestimoniMarquee } from "@/components/public/home/TestimoniMarquee";
import { WhyUsSection } from "@/components/public/home/WhyUsSection";

export default function HomePage() {
	const [prices, setPrices] = useState({ wash: 10000, dry: 10000 });

	const handlePriceChange = useCallback((wash: number, dry: number) => {
		setPrices((prev) => {
			if (prev.wash === wash && prev.dry === dry) return prev;
			return { wash, dry };
		});
	}, []);

	return (
		<>
			<AnnouncementBar />
			<PromoPopup />
			<HeroSection />
			<QuickChips />
			<HargaSection onPriceChange={handlePriceChange} />
			<KalkulatorSection washPrice={prices.wash} dryPrice={prices.dry} />
			<CabangSection />
			<RealisticWasherSection />
			<MiniWasherSection />
			<PromoCarousel />
			<CaraPakaiSection />
			<StatsSection />
			<TestimoniMarquee />
			<GalleryPreviewSection />
			<BlogSection />
			<WhyUsSection />
			<SubscribeSection />
			<CTABanner />
		</>
	);
}
