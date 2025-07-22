import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import CountriesSection from '@/components/CountriesSection'
import StartupSection from '@/components/StartupSection'
import CategoriesSection from '@/components/CategoriesSection'
import IncubationSection from '@/components/IncubationSection'

import EventsSection from '@/components/EventsSection'
import TrainingSection from '@/components/TrainingSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#000a18] text-white overflow-x-hidden">
      {/* Navigation component added here as seen in the image */}
      <Navigation />

      <div className="">
        <HeroSection />
        <CountriesSection />
        <StartupSection />
        <CategoriesSection />
        <IncubationSection />
        <EventsSection />
        <TrainingSection />
      </div>
      {/* Assuming Footer should be rendered at the end of the page */}
      {/* <Footer /> */}
    </main>
  )
}
