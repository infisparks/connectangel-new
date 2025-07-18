"use client"

import { ArrowRightIcon, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { events } from "@/lib/data"
import { motion, useScroll, useTransform } from "framer-motion" // Import motion and scroll hooks

export default function EventsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null) // Ref for the section to track scroll

  // Scroll animation for the floating object
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"], // Animate as the section enters/leaves viewport
  })
  const yObject = useTransform(scrollYProgress, [0, 1], ["-50%", "150%"]) // Moves from top to bottom of its container

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
        threshold: 0.7,
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
    router.push("/events")
  }

  return (
    <section ref={sectionRef} id="events" className="relative py-8 md:py-16 bg-[#000A18] overflow-hidden">
      {/* Animated object */}
      <motion.div
        style={{ y: yObject }}
        className="absolute top-0 left-3/4 w-32 h-32 rounded-full bg-pink-500/30 blur-xl z-0"
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-poppins font-medium text-white text-2xl md:text-3xl lg:text-4xl">Events</h2>
            <Button
              variant="link"
              className="text-white flex items-center gap-3 font-inter text-lg md:text-xl hover:text-purple-400 transition-colors duration-200 self-start sm:self-center"
              onClick={handleExploreClick}
            >
              Explore More
              <ArrowRightIcon className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </div>

          {/* Events Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-4 scroll-snap-x-mandatory scroll-smooth"
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
          >
            {events.map((event, index) => (
              <Card
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className="flex-shrink-0
                  w-full
                  sm:w-[calc((100%-theme(spacing.6))/2)]
                  md:w-[calc((100%-theme(spacing.6)*2)/3)]
                  lg:w-[calc((100%-theme(spacing.6)*2)/3)]
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
            {/* Hide scrollbar for Chrome/Safari/Opera */}
            <style>{`
              div[ref='scrollRef']::-webkit-scrollbar {
                display: none !important;
                width: 0px !important;
                background: transparent !important;
              }
            `}</style>
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
