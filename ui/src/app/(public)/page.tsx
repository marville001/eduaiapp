import HeroSection from "@/components/sections/hero-section";
import HowItWorks from "@/components/sections/how-it-works";
import SubjectsSection from "@/components/sections/subjects-section";
import AiToolsSection from "@/components/sections/ai-tools-section";
import FaqSection from "@/components/sections/faq-section";
import BlogSection from "@/components/sections/blog-section";
import UpgradeCta from "@/components/sections/upgrade-cta";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      
      <HowItWorks />

      <SubjectsSection />

      <AiToolsSection />

      <FaqSection />

      <BlogSection />

      <UpgradeCta />
    </main>
  );
}
