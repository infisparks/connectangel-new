"use client" // This page needs to be a client component for scroll logic

import Image from "next/image"
import { useRef, useState, useEffect } from "react" // Import hooks
import { domains } from "@/lib/data" // Import from shared data

export default function DomainsPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

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

  return (
    <main className="py-8 md:py-16 min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-poppins font-semibold text-3xl md:text-4xl lg:text-5xl mb-8 md:mb-12 text-center">
          All Domains
        </h1>

        {/* Domains Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide
                     scroll-snap-x-mandatory scroll-smooth"
        >
          {domains.map(({ title, image }, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className="group relative flex-shrink-0
                         w-full                                 /* Mobile: 1 card at a time */
                         sm:w-[calc((100%-theme(spacing.4))/2)] /* Small screens: 2 cards */
                         md:w-[calc((100%-theme(spacing.6)*2)/3)] /* Medium screens: 3 cards */
                         lg:w-[calc((100%-theme(spacing.6)*3)/4)] /* Large screens: 4 cards */
                         h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden glass-effect hover-lift transition-all duration-300 hover:scale-105
                         scroll-snap-align-center"
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="font-poppins font-semibold text-lg md:text-xl lg:text-2xl leading-tight">{title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots (Visible on all screen sizes) */}
        <div className="flex justify-center gap-2 mt-4">
          {domains.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToCard(index)}
              className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                index === activeIndex ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`Go to domain ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
