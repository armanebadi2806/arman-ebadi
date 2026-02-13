import { HeroSection } from '@/components/sections/hero'
import { ServicesSection } from '@/components/sections/services'
import { WhySection } from '@/components/sections/why'
import { ProcessSection } from '@/components/sections/process'
import { AboutSection } from '@/components/sections/about'
import { FinalCtaSection } from '@/components/sections/final-cta'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <WhySection />
      <ProcessSection />
      <AboutSection />
      <FinalCtaSection />
    </>
  )
}
