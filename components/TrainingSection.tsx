'use client'

import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

const trainingSeries = [
  {
    title: "Idea to Innovation",
    description: "Learn how to validate and shape your tech idea.",
    image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200&h=250&fit=crop",
    instructor: "Esther Howard",
    instructorImage: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
  },
  {
    title: "Building the Stack",
    description: "Choose the right technologies, tools, and frameworks.",
    image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200&h=250&fit=crop",
    instructor: "Kathryn Murphy",
    instructorImage: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
  },
  {
    title: "From MVP to Demo Day",
    description: "Design, build, and present your minimum viable product.",
    image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200&h=250&fit=crop",
    instructor: "Ronald Richards",
    instructorImage: "https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
  },
  {
    title: "Deploy & Scale",
    description: "Cloud hosting, version control, CI/CD, and scalability planning.",
    image: "https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=200&h=250&fit=crop",
    instructor: "Marvin McKinney",
    instructorImage: "https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
  },
]

export default function TrainingSection() {
  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-poppins font-medium text-white text-2xl md:text-3xl lg:text-4xl">
              Free Training Series
            </h2>

            <Button
              variant="link"
              className="text-white flex items-center gap-3 font-inter text-lg md:text-xl hover:text-purple-400 transition-colors duration-200 self-start sm:self-center"
            >
              Explore More
              <ArrowRightIcon className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </div>

          {/* Training Series Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trainingSeries.map((series, index) => (
              <Card
                key={index}
                className="glass-effect hover-lift transition-all duration-300 hover:scale-105 border border-white/20"
              >
                <CardContent className="flex flex-col sm:flex-row gap-4 md:gap-6 p-4 md:p-6">
                  <div className="relative w-full sm:w-32 md:w-40 h-48 sm:h-32 md:h-40 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={series.image}
                      alt={series.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-col justify-between space-y-4 flex-1">
                    <div className="space-y-2">
                      <h3 className="font-poppins font-medium text-white text-lg md:text-xl lg:text-2xl leading-tight">
                        {series.title}
                      </h3>
                      <p className="font-poppins font-light text-white/90 text-sm md:text-base leading-relaxed">
                        {series.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
                        <Image
                          src={series.instructorImage}
                          alt={series.instructor}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-poppins font-light text-white text-sm md:text-base">
                        {series.instructor}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}