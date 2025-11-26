import DesignedForSection from "@/components/sections/designed-for-section";
import FaqSection from "@/components/sections/faq-section";
import FinalCtaSection from "@/components/sections/final-cta-section";
import HeroSection from "@/components/sections/hero-section";
import HowItWorks from "@/components/sections/how-it-works";
import PricingSection from "@/components/sections/pricing-section";
import SocialProofSection from "@/components/sections/social-proof-section";
import TestimonialsSection from "@/components/sections/testimonials-section";

export default function HomePage() {
  return (
    <main>
      <HeroSection />

      <SocialProofSection />

      <HowItWorks />

      <DesignedForSection />

      <TestimonialsSection />

      <PricingSection />

      <FaqSection />

      <FinalCtaSection />
    </main>
  );
}
