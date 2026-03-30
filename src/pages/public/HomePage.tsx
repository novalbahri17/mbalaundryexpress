import { BlogSection } from "@/components/public/home/BlogSection";
import { CTASection } from "@/components/public/home/CTASection";
import { FAQSection } from "@/components/public/home/FAQSection";
import { GallerySection } from "@/components/public/home/GallerySection";
import { HeroSection } from "@/components/public/home/HeroSection";
import { HowItWorksSection } from "@/components/public/home/HowItWorksSection";
import { LocationsSection } from "@/components/public/home/LocationsSection";
import { PricingSection } from "@/components/public/home/PricingSection";
import { PromoSection } from "@/components/public/home/PromoSection";
import { TestimonialsSection } from "@/components/public/home/TestimonialsSection";
import { WhyUsSection } from "@/components/public/home/WhyUsSection";
import { AnnouncementModal } from "@/components/public/home/AnnouncementModal";
import { usePageContentMap } from "@/hooks/usePageContent";

export default function HomePage() {
	const { data: pageContents = {} } = usePageContentMap();

	return (
		<main className="landing-page flex flex-col bg-transparent font-sans text-neutral-900 selection:bg-ruby-200">
			<AnnouncementModal />
			<HeroSection />
			{pageContents.module_promo !== "false" && <PromoSection />}
			{pageContents.module_carapakai !== "false" && <HowItWorksSection />}
			{pageContents.module_harga !== "false" && <PricingSection />}
			{pageContents.module_cabang !== "false" && <LocationsSection />}
			<TestimonialsSection />
			<WhyUsSection />
			{pageContents.module_galeri !== "false" && <GallerySection />}
			<FAQSection />
			{pageContents.module_blog !== "false" && <BlogSection />}
			<CTASection />
		</main>
	);
}
