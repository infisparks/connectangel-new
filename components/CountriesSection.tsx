"use client"

import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

// Import all your country images
import IndiaImg from "@/public/img/country/india.png"
import PakistanImg from "@/public/img/country/pakistan.png"
import MalaysiaImg from "@/public/img/country/Malaysia.png"
import PhilippinesImg from "@/public/img/country/Philippines.png"
import UAEImg from "@/public/img/country/UAE.png"
import CanadaImg from "@/public/img/country/Canada.png"
import IranImg from "@/public/img/country/Iran.png"

const countries = [
  { name: "India", image: IndiaImg },
  { name: "Pakistan", image: PakistanImg },
  { name: "Malaysia", image: MalaysiaImg },
  { name: "Philippines", image: PhilippinesImg },
  { name: "UAE", image: UAEImg },
  { name: "Canada", image: CanadaImg },
  { name: "Iran", image: IranImg },
]

export default function CountriesSection() {
  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8 md:space-y-12">
          {/* Countries Grid */}
          <div className="w-full">
            {/* Desktop & Mobile: Horizontal scroll */}
            <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {countries.map(({ name, image }, idx) => (
                <Card
                  key={idx}
                  className="flex-shrink-0 w-36 lg:w-40 glass-effect hover-lift transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="flex flex-col items-center gap-4 p-4">
                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden">
                      <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
                    </div>
                    <span className="font-poppins font-normal text-white text-lg lg:text-xl text-center">{name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Explore More Button */}
          <Button
            variant="link"
            className="text-white flex items-center gap-3 font-inter text-base md:text-lg hover:text-purple-400 transition-colors duration-200"
          >
            Explore More
            <ArrowRightIcon className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      </div>
    </section>
  )
}
