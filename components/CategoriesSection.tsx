"use client"

import { ArrowUpRightIcon } from "lucide-react"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { categories } from "@/lib/data" // Import from shared data

export default function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter() // Initialize useRouter

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardRefs.current.indexOf(entry.target as HTMLDivElement)
            if (index !== -1) {
              setActiveIndex(index)
            }
          }
        })
      },
      {
        root: scrollElement,
        rootMargin: "0px",
        threshold: 0.7, // 70% of the item must be visible to be considered "active"
      },
    )

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  const scrollToCard = (index: number) => {
    if (cardRefs.current[index]) {
      cardRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
      })
    }
  }

  const handleExploreClick = () => {
    router.push("/categories") // Navigate to the new categories page
  }

  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8 md:space-y-14">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-poppins font-semibold text-white text-2xl md:text-3xl lg:text-4xl">
              Explore by Categories
            </h2>

            <div
              className="flex w-12 h-12 md:w-16 md:h-16 items-center justify-center glass-effect rounded-full border-2 border-white hover-lift cursor-pointer transition-all duration-300 hover:scale-110"
              onClick={handleExploreClick} // Add onClick handler
              role="button"
              tabIndex={0}
              aria-label="Explore all categories"
            >
              <ArrowUpRightIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>

          {/* Categories Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide
                       scroll-snap-x-mandatory scroll-smooth"
          >
            {categories.map(({ title, image, description }, index) => (
              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className="group relative flex-shrink-0
                           w-full                                 /* Mobile: 1 card at a time */
                           sm:w-[calc((100%-theme(spacing.4))/2)] /* Small screens: 2 cards */
                           md:w-[calc((100%-theme(spacing.6)*2)/3)] /* Medium screens: 3 cards */
                           lg:w-[calc((100%-theme(spacing.6)*3)/4)] /* Large screens: 4 cards */
                           overflow-hidden rounded-xl hover-lift transition-all duration-300 hover:scale-105
                           scroll-snap-align-center"
              >
                <div className="relative h-48 md:h-52 lg:h-56">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-poppins font-semibold text-white text-lg md:text-xl mb-1">{title}</h3>
                    <p className="font-poppins font-light text-white/80 text-sm">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots (Visible on all screen sizes) */}
          <div className="flex justify-center gap-2 mt-4">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToCard(index)}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  index === activeIndex ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to category ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
