'use client'

import { ArrowUpRightIcon } from 'lucide-react'
import Image from 'next/image'

// Import your local category images
import StartupsImg    from '@/public/img/categories/startups.png'
import TechnologyImg  from '@/public/img/categories/incubator.png'
import BusinessImg    from '@/public/img/categories/venture-captital.png'
import InnovationImg  from '@/public/img/categories/angel-investors.png'

const categories = [
  { 
    title: "Startups",
    image: StartupsImg,
    description: "Innovative startup ideas"
  },
  { 
    title: "Technology",
    image: TechnologyImg,
    description: "Latest tech trends"
  },
  { 
    title: "Business",
    image: BusinessImg,
    description: "Business development"
  },
  { 
    title: "Innovation",
    image: InnovationImg,
    description: "Creative solutions"
  },
]

export default function CategoriesSection() {
  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8 md:space-y-14">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-poppins font-semibold text-white text-2xl md:text-3xl lg:text-4xl">
              Explore by Categories
            </h2>

            <div className="flex w-12 h-12 md:w-16 md:h-16 items-center justify-center glass-effect rounded-full border-2 border-white hover-lift cursor-pointer transition-all duration-300 hover:scale-110">
              <ArrowUpRightIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map(({ title, image, description }, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl hover-lift transition-all duration-300 hover:scale-105"
              >
                <div className="relative h-48 md:h-52 lg:h-56">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-poppins font-semibold text-white text-lg md:text-xl mb-1">
                      {title}
                    </h3>
                    <p className="font-poppins font-light text-white/80 text-sm">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
