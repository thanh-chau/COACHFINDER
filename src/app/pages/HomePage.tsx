import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { SportCategories } from "../components/SportCategories";
import { HowItWorks } from "../components/HowItWorks";
import { AIVideoAnalysis } from "../components/AIVideoAnalysis";
import { CoachStudio } from "../components/CoachStudio";
import { FeaturedCoaches } from "../components/FeaturedCoaches";
import { Pricing } from "../components/Pricing";
import { Testimonials } from "../components/Testimonials";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div id="home"><Hero /></div>
      <div id="coaches"><FeaturedCoaches /></div>
      <div id="sports"><SportCategories /></div>
      <div id="how-it-works"><HowItWorks /></div>
      <div id="ai-analysis"><AIVideoAnalysis /></div>
      <div id="video-360"><CoachStudio /></div>
      <div id="pricing"><Pricing /></div>
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}
