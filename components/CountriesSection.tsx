"use client"

import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion" // Import motion
import { countries } from "@/lib/data" // Assuming this path is correct

export default function CountriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()

  // Animation variants for individual cards
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
  }

  // Animation variants for the "Explore More" button
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
  }

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
    <section className="py-8 md:py-16 bg-[#000A18]">
      {" "}
      {/* Added background color for consistency */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8 md:space-y-12">
          {/* Section Title (Optional, but good for context) */}
          <motion.h2
            className="font-semibold text-3xl md:text-4xl lg:text-5xl text-white text-center"
            style={{ fontFamily: "Poppins, sans-serif" }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
          >
            Explore Countries
          </motion.h2>

          {/* Countries Grid */}
          <div className="w-full">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 pb-4 scroll-snap-x-mandatory scroll-smooth"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
              }}
            >
              {countries.map(({ name, image }, idx) => (
                <motion.div
                  key={idx}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  className="flex-shrink-0
                    w-[calc((100%-theme(spacing.6)*2)/3)]
                    md:w-36 lg:w-40
                    backdrop-blur-md bg-white/5 border border-white/10 {/* glass-effect */}
                    transition-all duration-300 hover:scale-105 {/* hover-lift */}
                    scroll-snap-align-center rounded-xl overflow-hidden"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={cardVariants}
                >
                  <CardContent className="flex flex-col items-center gap-4 p-4">
                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden">
                      <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
                    </div>
                    <span
                      className="font-normal text-white text-lg lg:text-xl text-center"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {name}
                    </span>
                  </CardContent>
                </motion.div>
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
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={buttonVariants}
          >
            <Button
              variant="link"
              className="text-white flex items-center gap-3 text-base md:text-lg hover:text-purple-400 transition-colors duration-200"
              onClick={handleExploreClick}
              style={{ fontFamily: "Inter, sans-serif" }} // Assuming Inter font for this button
            >
              Explore More
              <ArrowRightIcon className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
