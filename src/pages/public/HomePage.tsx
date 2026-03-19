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

export default function HomePage() {
	return (
		<main className="landing-page flex flex-col bg-transparent font-sans text-neutral-900 selection:bg-ruby-200">
			<AnnouncementModal />
			<HeroSection />
			<PromoSection />
			<HowItWorksSection />
			<PricingSection />
			<LocationsSection />
			<TestimonialsSection />
			<WhyUsSection />
			<GallerySection />
			<FAQSection />
			<BlogSection />
			<CTASection />
		</main>
	);
}
