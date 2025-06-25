"use client"

import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react" // Added useCallback
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { countries } from "@/lib/data"
import ParticleEffect from "./particle-effect"

export default function CountriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)

  // Auto-scroll specific refs and state
  const animationFrameId = useRef<number | null>(null)
  const scrollSpeed = 1 // Increased from 0.5 to 1 for faster scroll
  const isScrollingPaused = useRef(false) // To manage pause/resume on hover

  // Mouse move effect for the "fog"
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        })
      }
    }

    const handleMouseLeave = () => {
      setMousePosition({ x: -9999, y: -9999 }) // Move off-screen
    }

    const currentSectionRef = sectionRef.current
    if (currentSectionRef) {
      currentSectionRef.addEventListener("mousemove", handleMouseMove)
      currentSectionRef.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (currentSectionRef) {
        currentSectionRef.removeEventListener("mousemove", handleMouseMove)
        currentSectionRef.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  // Intersection Observer for pagination dots
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find the index of the original country, not the duplicated one
            const originalIndex = cardRefs.current.findIndex(
              (ref) => ref === entry.target && ref?.dataset.originalIndex !== undefined,
            )
            if (originalIndex !== -1) {
              setActiveIndex(Number.parseInt(cardRefs.current[originalIndex]?.dataset.originalIndex || "0", 10))
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

  const handleExploreClick = () => {
    router.push("/countries")
  }

  // Auto-scroll logic
  const animateScroll = useCallback(() => {
    if (scrollRef.current && !isScrollingPaused.current) {
      scrollRef.current.scrollLeft += scrollSpeed

      // Check if we've scrolled past the original content length
      // The total scrollable width is roughly twice the original content width
      const scrollWidth = scrollRef.current.scrollWidth
      const clientWidth = scrollRef.current.clientWidth
      const originalContentWidth = scrollWidth / 2 // Assuming content is duplicated once

      if (scrollRef.current.scrollLeft >= originalContentWidth) {
        // Jump back to the start of the duplicated content
        scrollRef.current.scrollLeft = 0 // Or scrollRef.current.scrollLeft - originalContentWidth;
      }
    }
    animationFrameId.current = requestAnimationFrame(animateScroll)
  }, [scrollSpeed])

  const startAutoScroll = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
    isScrollingPaused.current = false
    animationFrameId.current = requestAnimationFrame(animateScroll)
  }, [animateScroll])

  const stopAutoScroll = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
    isScrollingPaused.current = true
  }, [])

  useEffect(() => {
    startAutoScroll()
    return () => stopAutoScroll()
  }, [startAutoScroll, stopAutoScroll])

  // Combine countries for infinite scroll effect
  const loopedCountries = [...countries, ...countries]

  const scrollToCard = (index: number) => {
    if (cardRefs.current[index]) {
      stopAutoScroll() // Stop auto-scroll for manual navigation
      cardRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
      })
      // Optionally, restart auto-scroll after a delay
      setTimeout(startAutoScroll, 2000)
    }
  }

  return (
    <section ref={sectionRef} className="relative py-8 md:py-16 bg-[#000A18] overflow-hidden">
      {/* Embedded CSS for shine effect */}
      

      {/* AI Particle Effect */}
      <ParticleEffect />

      {/* Mouse Fog/Light Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(135, 0, 255, 0.15) 0%, transparent 50%)`,
          filter: "blur(50px)",
          opacity: mousePosition.x === -9999 ? 0 : 1, // Hide when mouse leaves
          transition: "opacity 0.3s ease-out",
        }}
      />

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8 md:space-y-12">
          {/* Section Title */}
          <motion.h2
            className="font-semibold text-3xl md:text-4xl lg:text-5xl text-white text-center shine-text" // Added shine-text
            style={{ fontFamily: "Poppins, sans-serif" }}
            initial={{ opacity: 1, y: 0 }} // Removed whileInView, set initial to visible
          >
            Explore Countries
          </motion.h2>

          {/* Countries Grid */}
          <div className="w-full">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 pb-4 scroll-smooth" // Removed scroll-snap-x-mandatory
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
              }}
              onMouseEnter={stopAutoScroll} // Pause on hover
              onMouseLeave={startAutoScroll} // Resume on leave
            >
              {loopedCountries.map(({ name, image }, idx) => (
                <motion.div
                  key={`${name}-${idx}`} // Unique key for duplicated items
                  ref={(el) => (cardRefs.current[idx] = el)}
                  data-original-index={idx % countries.length} // Store original index for pagination
                  className="flex-shrink-0
                    w-[calc((100%-theme(spacing.6)*2)/3)]
                    md:w-36 lg:w-40
                    backdrop-blur-md bg-white/5 border border-white/10 {/* glass-effect */}
                    rounded-xl overflow-hidden"
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.03, y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                  transition={{ duration: 0.3 }}
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
            {countries.map(
              (
                _,
                index, // Use original countries array for dots
              ) => (
                <button
                  key={index}
                  onClick={() => scrollToCard(index)}
                  className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                    index === activeIndex ? "bg-white" : "bg-white/40"
                  }`}
                  aria-label={`Go to country ${index + 1}`}
                />
              ),
            )}
          </div>

          {/* Explore More Button */}
          <motion.div initial={{ opacity: 1, y: 0 }}>
            <Button
              variant="link"
              className="text-white flex items-center gap-3 text-base md:text-lg hover:text-purple-400 transition-colors duration-200"
              onClick={handleExploreClick}
              style={{ fontFamily: "Inter, sans-serif" }}
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
