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
      <Navigation />

      <div className="">
        <HeroSection />
        <CountriesSection />
        {/* Added id="startups" here */}
        <div id="startups">
          <StartupSection />
        </div>
        <CategoriesSection />
        {/* Added id="incubations" here */}
        <div id="incubations">
          <IncubationSection />
        </div>
        <EventsSection />
        <TrainingSection />
      </div>
      {/* <Footer /> */}
    </main>
  )
}