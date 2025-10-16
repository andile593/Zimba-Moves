import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "../../components/Hero/HeroSection";
import TopMovers from "../../components/FeaturedProviders/Providers";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Reviews from "../../components/Reviews/Reviews";

export default function Home() {
  const location = useLocation();
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.state?.scrollTo === "how-it-works" && howItWorksRef.current) {
      howItWorksRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <HeroSection />
      <TopMovers />
      <HowItWorks ref={howItWorksRef} />
      <Reviews />
    </div>
  );
}
