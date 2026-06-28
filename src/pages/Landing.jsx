import React from "react";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingBand from "@/components/landing/LandingBand";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingDualValue from "@/components/landing/LandingDualValue";
import LandingTiers from "@/components/landing/LandingTiers";
import LandingTrust from "@/components/landing/LandingTrust";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div style={{ backgroundColor: "#0A0E14", color: "#EAF1F7", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      <LandingNav />
      <LandingHero />
      <LandingBand />
      <LandingHowItWorks />
      <LandingDualValue />
      <LandingTiers />
      <LandingTrust />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}