'use client'

import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

// Import your local domain images
import AIMLImg               from '@/public/img/domain/deep-tech.png'
import BlockchainWeb3Img     from '@/public/img/domain/IT.png'
import FinTechSolutionsImg   from '@/public/img/domain/drone-tech.png'
import HealthTechInnovationImg from '@/public/img/domain/agriculture.png'

const domains = [
  { 
    title: "AI & Machine Learning",
    image: AIMLImg
  },
  { 
    title: "Blockchain & Web3",
    image: BlockchainWeb3Img
  },
  { 
    title: "FinTech Solutions",
    image: FinTechSolutionsImg
  },
  { 
    title: "HealthTech Innovation",
    image: HealthTechInnovationImg
  },
]

export default function DomainSection() {
  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8 md:space-y-11">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-poppins font-medium text-white text-2xl md:text-3xl lg:text-4xl">
              Domain
            </h2>

            <Button
              variant="link"
              className="text-white flex items-center gap-3 font-inter text-lg md:text-xl hover:text-purple-400 transition-colors duration-200 self-start sm:self-center"
            >
              Explore More
              <ArrowRightIcon className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </div>

          {/* Domains Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {domains.map(({ title, image }, index) => (
              <div
                key={index}
                className="group relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden hover-lift transition-all duration-300 hover:scale-105"
              >
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-poppins font-semibold text-white text-lg md:text-xl lg:text-2xl leading-tight">
                    {title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
