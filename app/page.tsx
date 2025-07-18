import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import CountriesSection from '@/components/CountriesSection'
import CategoriesSection from '@/components/CategoriesSection'
import DomainSection from '@/components/DomainSection'
import EventsSection from '@/components/EventsSection'
import TrainingSection from '@/components/TrainingSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#000a18] text-white overflow-x-hidden">
      
      <div className="">
        <HeroSection />
        <CountriesSection />
        <CategoriesSection />
        <DomainSection />
        <EventsSection />
        <TrainingSection />
      </div>
      
    </main>
  )
}