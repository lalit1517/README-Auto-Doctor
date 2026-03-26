import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import FAQ from "@/components/landing/FAQ";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Readme Auto Doctor — Fix Your README in Seconds",
  description:
    "AI-powered tool to analyze, improve, and ship better README documentation instantly. Generate, preview, diff, and create pull requests in one click.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07070E]">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
        <FAQ />
      </main>
      <LandingFooter />
    </div>
  );
}
