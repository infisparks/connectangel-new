"use client"

import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { countries } from "@/lib/data" // Assuming you have this data file
import ParticleEffect from "./particle-effect" // Assuming you have this component

export default function CountriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)

  // Auto-scroll specific refs and state
  const animationFrameId = useRef<number | null>(null)
  const scrollSpeed = 1 // Controls scroll speed
  const isScrollingPaused = useRef(false)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries.length])

  const handleExploreClick = () => {
    router.push("/countries")
  }

  // Auto-scroll logic
  const animateScroll = useCallback(() => {
    if (scrollRef.current && !isScrollingPaused.current) {
      scrollRef.current.scrollLeft += scrollSpeed

      const scrollWidth = scrollRef.current.scrollWidth
      const originalContentWidth = scrollWidth / 2

      if (scrollRef.current.scrollLeft >= originalContentWidth) {
        scrollRef.current.scrollLeft = scrollRef.current.scrollLeft - originalContentWidth
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
      stopAutoScroll()
      cardRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      })
      // Restart auto-scroll after a delay
      setTimeout(startAutoScroll, 3000)
    }
  }

  return (
    <section ref={sectionRef} className="relative py-12 md:py-20 bg-[#000A18] overflow-hidden">
      {/* AI Particle Effect */}
      <ParticleEffect />

      {/* Mouse Fog/Light Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(135, 0, 255, 0.15) 0%, transparent 50%)`,
          filter: "blur(50px)",
          opacity: mousePosition.x === -9999 ? 0 : 1,
          transition: "opacity 0.3s ease-out",
        }}
      />

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8">
          {/* Section Header */}
          <div className="flex justify-between items-center">
            <motion.h2
              className="font-semibold text-3xl md:text-4xl text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
              initial={{ opacity: 1, y: 0 }}
            >
              Explore by Countries
            </motion.h2>
            <Button
              variant="link"
              className="text-white flex items-center gap-2 text-base md:text-lg hover:text-purple-400 transition-colors duration-200"
              onClick={handleExploreClick}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Explore More
              <ArrowRightIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Countries Scroller */}
          <div className="w-full">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-[15px] pb-4 scroll-smooth"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE/Edge
              }}
              onMouseEnter={stopAutoScroll}
              onMouseLeave={startAutoScroll}
            >
              {loopedCountries.map(({ name, image }, idx) => (
                <motion.div
                  key={`${name}-${idx}`}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  data-original-index={idx % countries.length}
                  // 👇 **BORDER STYLE UPDATED HERE**
                  className="flex-shrink-0 flex items-center box-border w-[180px] h-[67px] pt-[10px] pb-[10px] pl-[15.2px] pr-[15.2px] rounded-[13.01px] border-[2.13px] border-[#FFFFFF] cursor-pointer bg-[#DDDDDD33]"
                  whileHover={{
                    scale: 1.05,
                    borderColor: "rgba(255, 255, 255, 0.6)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative w-[46.45px] h-[47px] rounded-full overflow-hidden flex-shrink-0">
                    <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
                  </div>
                  <span
                    className="font-semibold text-white text-base whitespace-nowrap inline-flex items-center justify-center w-[128px] h-[63px] ml-[15.15px]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {name}
                  </span>
                </motion.div>
              ))}
              {/* Inline style to hide scrollbar in WebKit browsers */}
              <style jsx>{`
                div[ref="scrollRef"]::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 pt-4">
            {countries.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToCard(index)}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  index === activeIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to country ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
