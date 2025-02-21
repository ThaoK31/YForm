import { HeroSection } from "@/components/marketing/hero"
import { FeaturesSection } from "@/components/marketing/features"
import { CtaSection } from "@/components/marketing/cta"

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
    </main>
  )
} 