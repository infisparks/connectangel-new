'use client'

import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  return (
    <section id="home" className="pt-20 md:pt-32 pb-8 md:pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12 animate-fadeIn">
          {/* Badge */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#b35dff33] rounded-full border border-[#b35dff] hover-lift">
            <span className="font-poppins font-normal text-[#b35dff] text-sm md:text-base">
              🔥 Start. Grow. Belong. 🔥
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 md:space-y-6 max-w-4xl">
            <h1 className="font-poppins font-semibold text-[#dddddd] text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-shadow">
              Fresh Minds, <br className="hidden sm:block" />
              <span className="gradient-text">Fierce Missions</span>, <br className="sm:hidden" />
              All in One Place.
            </h1>

            <p className="font-poppins font-light text-[#dddddd] text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed">
              Submit your startup, find the right opportunities, and get discovered by the right people.
            </p>
          </div>

          {/* CTA Button */}
          <Button className="h-12 md:h-14 px-6 md:px-8 py-3 md:py-4 bg-[#8700ff] rounded-full font-poppins text-base md:text-lg hover:bg-[#7300dd] hover-lift transition-all duration-300 shadow-lg hover:shadow-xl">
            Get Started
            <ArrowRightIcon className="ml-2 h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      </div>
    </section>
  )
}