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
import Hero3D from "@/components/public/home/Hero3D";
import GamifiedOnboarding, { PointsBadge } from "@/components/public/onboarding/GamifiedOnboarding";
import { ScrollRevealGSAP, ParallaxSection } from "@/components/animate/ScrollAnimations";

export default function HomePage() {
	const { data: pageContents = {} } = usePageContentMap();

	return (
		<main className="landing-page flex flex-col bg-transparent font-sans text-neutral-900 selection:bg-ruby-200">
			<AnnouncementModal />
			<GamifiedOnboarding />
			<PointsBadge />
			
			{/* 3D Hero Section */}
			<section className="relative">
				<Hero3D />
			</section>
			
			{/* Original Hero as fallback/alternative */}
			{/* <HeroSection /> */}
			
			<ScrollRevealGSAP>
				{pageContents.module_promo !== "false" && <PromoSection />}
			</ScrollRevealGSAP>
			
			<ParallaxSection speed={0.3}>
				{pageContents.module_carapakai !== "false" && <HowItWorksSection />}
			</ParallaxSection>
			
			<ScrollRevealGSAP direction="left">
				{pageContents.module_harga !== "false" && <PricingSection />}
			</ScrollRevealGSAP>
			
			<ParallaxSection speed={-0.2}>
				{pageContents.module_cabang !== "false" && <LocationsSection />}
			</ParallaxSection>
			
			<ScrollRevealGSAP direction="up" delay={0.2}>
				<TestimonialsSection />
			</ScrollRevealGSAP>
			
			<ScrollRevealGSAP direction="right">
				<WhyUsSection />
			</ScrollRevealGSAP>
			
			<ParallaxSection speed={0.2}>
				{pageContents.module_galeri !== "false" && <GallerySection />}
			</ParallaxSection>
			
			<ScrollRevealGSAP>
				<FAQSection />
			</ScrollRevealGSAP>
			
			<ScrollRevealGSAP direction="up" delay={0.3}>
				{pageContents.module_blog !== "false" && <BlogSection />}
			</ScrollRevealGSAP>
			
			<CTASection />
		</main>
	);
}
