"use client"

import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { countries } from "@/lib/data"

export default function CountriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()

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
    router.push("/countries")
  }

  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8 md:space-y-12">
          {/* Countries Grid */}
          <div className="w-full">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 pb-4 scroll-snap-x-mandatory scroll-smooth"
              style={{
                scrollbarWidth: "none",      // Firefox
                msOverflowStyle: "none",     // IE/Edge
              }}
              // Hide scrollbar Chrome/Safari/Opera
              // See: https://stackoverflow.com/a/56116223
            >
              {countries.map(({ name, image }, idx) => (
                <Card
                  key={idx}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  className="flex-shrink-0
                    w-[calc((100%-theme(spacing.6)*2)/3)]
                    md:w-36 lg:w-40 glass-effect hover-lift transition-all duration-300 hover:scale-105
                    scroll-snap-align-center"
                  style={{
                    // For Safari (invisible scrollbar)
                    scrollbarWidth: "none",
                  }}
                >
                  <CardContent className="flex flex-col items-center gap-4 p-4">
                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden">
                      <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
                    </div>
                    <span className="font-poppins font-normal text-white text-lg lg:text-xl text-center">
                      {name}
                    </span>
                  </CardContent>
                </Card>
              ))}
              {/* Inline style for Chrome, Safari, Opera scrollbar hide */}
              <style jsx>{`
                div[ref="scrollRef"]::-webkit-scrollbar {
                  display: none !important;
                  width: 0px !important;
                  background: transparent !important;
                }
              `}</style>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {countries.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToCard(index)}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  index === activeIndex ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to country ${index + 1}`}
              />
            ))}
          </div>

          {/* Explore More Button */}
          <Button
            variant="link"
            className="text-white flex items-center gap-3 font-inter text-base md:text-lg hover:text-purple-400 transition-colors duration-200"
            onClick={handleExploreClick}
          >
            Explore More
            <ArrowRightIcon className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      </div>
    </section>
  )
}
