"use client"

import { ArrowRightIcon, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { events } from "@/lib/data" // Import from shared data

export default function EventsSection() {
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
    router.push("/events") // Navigate to the new events page
  }

  return (
    <section id="events" className="py-8 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-poppins font-medium text-white text-2xl md:text-3xl lg:text-4xl">Events</h2>

            <Button
              variant="link"
              className="text-white flex items-center gap-3 font-inter text-lg md:text-xl hover:text-purple-400 transition-colors duration-200 self-start sm:self-center"
              onClick={handleExploreClick} // Add onClick handler
            >
              Explore More
              <ArrowRightIcon className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </div>

          {/* Events Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide
                       scroll-snap-x-mandatory scroll-smooth"
          >
            {events.map((event, index) => (
              <Card
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className="flex-shrink-0
                           w-full                                 /* Mobile: 1 card at a time */
                           sm:w-[calc((100%-theme(spacing.6))/2)] /* Small screens: 2 cards */
                           md:w-[calc((100%-theme(spacing.6)*2)/3)] /* Medium screens: 3 cards */
                           lg:w-[calc((100%-theme(spacing.6)*2)/3)] /* Large screens: 3 cards */
                           glass-effect hover-lift transition-all duration-300 hover:scale-105 border border-white/20
                           scroll-snap-align-center"
              >
                <CardContent className="flex flex-col space-y-6 p-6 md:p-8">
                  <div className="flex flex-col space-y-4">
                    <h3 className="font-poppins font-medium text-white text-lg md:text-xl leading-tight">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
                        <Image
                          src={event.organizerImage || "/placeholder.svg"}
                          alt={event.organizer}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-poppins font-medium text-white text-sm md:text-base">
                        {event.organizer}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      <span className="font-poppins font-medium text-white text-sm md:text-base">{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button className="h-10 md:h-12 px-4 md:px-6 py-2 bg-[#8700ff] rounded-full font-poppins text-sm md:text-base hover:bg-[#7300dd] transition-all duration-200">
                      Register
                    </Button>
                    <span className="font-inter font-medium text-white/80 text-xs md:text-sm">{event.timeAgo}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Dots (Visible on all screen sizes) */}
          <div className="flex justify-center gap-2 mt-4">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToCard(index)}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  index === activeIndex ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to event ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
