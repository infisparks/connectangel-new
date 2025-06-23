"use client" // This page needs to be a client component for scroll logic

import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion" // Import motion for animations
import { domains } from "@/lib/data" // Assuming this path is correct

export default function DomainsPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  // Animation variants for title
  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut" } },
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
        threshold: 0.7, // Adjust threshold to trigger when more of the card is visible
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
    <main className="py-2 md:py-16 bg-[#000A18] text-white pb-2 md:pb-1">
      {" "}
      {/* py-2 md:py-16 provides top and bottom padding, pb-2 md:pb-1 for a little extra space */}
      <div className="container mx-auto px-1 sm:px-1 lg:px-1">
        <motion.h1
          className="font-semibold text-3xl md:text-4xl lg:text-5xl mb-8 md:mb-12 text-center"
          style={{ fontFamily: "Poppins, sans-serif" }} // Inline font style
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }} // Animate when 50% in view
          variants={titleVariants}
        >
          All Domains
        </motion.h1>

        {/* Domains Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 md:gap-6 pb-1 scroll-snap-x-mandatory scroll-smooth"
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
        >
          {domains.map(({ title, image }, index) => (
            <motion.div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className="group relative flex-shrink-0
                w-full
                sm:w-[calc((100%-theme(spacing.4))/2)]
                md:w-[calc((100%-theme(spacing.6)*2)/3)]
                lg:w-[calc((100%-theme(spacing.6)*3)/4)]
                h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden
                backdrop-blur-md bg-white/5 border border-white/10 {/* glass-effect */}
                transition-all duration-300 hover:scale-105 {/* hover-lift */}
                scroll-snap-align-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }} // Animate when 30% in view
              variants={cardVariants}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3
                  className="font-semibold text-lg md:text-xl lg:text-2xl leading-tight"
                  style={{ fontFamily: "Poppins, sans-serif" }} // Inline font style
                >
                  {title}
                </h3>
              </div>
            </motion.div>
          ))}
          {/* Hide scrollbar for Chrome/Safari/Opera */}
          <style jsx>{`
            div[ref='scrollRef']::-webkit-scrollbar {
              display: none !important;
              width: 0px !important;
              background: transparent !important;
            }
          `}</style>
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