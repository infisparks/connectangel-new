"use client"

import { ArrowRightIcon, TrendingUpIcon, SparklesIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { categories } from "@/lib/data" 
import ParticleEffect from "./particle-effect"

export default function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)

  // Auto-scroll configuration
  const scrollSpeed = useRef(1.2) // Increased speed
  const isScrollingPaused = useRef(false)
  const animationFrameId = useRef<number | null>(null)
  const scrollDirection = useRef(1) // 1 for right, -1 for left

  // Enhanced mouse move effect
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
      setMousePosition({ x: -9999, y: -9999 })
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

  // Enhanced intersection observer
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLDivElement
            const originalIndex = element.dataset.originalIndex
            if (originalIndex !== undefined) {
              setActiveIndex(Number.parseInt(originalIndex, 10))
            }
          }
        })
      },
      {
        root: scrollElement,
        rootMargin: "0px",
        threshold: 0.6,
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
  }, [categories.length])

  const handleExploreClick = () => {
    router.push("/categories")
  }

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`)
  }

  // Improved auto-scroll with seamless looping
  const animateScroll = useCallback(() => {
    if (scrollRef.current && !isScrollingPaused.current) {
      const container = scrollRef.current
      const currentScroll = container.scrollLeft
      const maxScroll = container.scrollWidth - container.clientWidth
      const halfWidth = container.scrollWidth / 2

      // Move the scroll position
      container.scrollLeft += scrollSpeed.current * scrollDirection.current

      // Seamless loop - when we reach the end of duplicated content, jump back
      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft = container.scrollLeft - halfWidth
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft = halfWidth + container.scrollLeft
      }
    }
    animationFrameId.current = requestAnimationFrame(animateScroll)
  }, [])

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

  // Start auto-scroll on mount
  useEffect(() => {
    // Add a small delay to ensure everything is rendered
    const timer = setTimeout(() => {
      startAutoScroll()
    }, 1000)

    return () => {
      clearTimeout(timer)
      stopAutoScroll()
    }
  }, [startAutoScroll, stopAutoScroll])

  // Create multiple copies for seamless looping
  const loopedCategories = [...categories, ...categories, ...categories]

  const scrollToCard = (index: number) => {
    if (cardRefs.current[index]) {
      stopAutoScroll()
      cardRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      })
      // Resume auto-scroll after user interaction
      setTimeout(startAutoScroll, 3000)
    }
  }

  return (
    <section ref={sectionRef} className="relative py-12 lg:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 overflow-hidden">
      {/* Enhanced Particle Effect */}
      <ParticleEffect />

      {/* Professional Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.08) 0%, rgba(59, 130, 246, 0.04) 30%, transparent 60%)`,
            filter: "blur(60px)",
            opacity: mousePosition.x === -9999 ? 0 : 1,
            transition: "opacity 0.5s ease-out",
          }}
        />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col gap-8 lg:gap-12">
          
          {/* Professional Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <TrendingUpIcon className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-blue-300 text-sm font-semibold tracking-wider uppercase letter-spacing-wide">
                  Popular Categories
                </span>
              </motion.div>
              
              <motion.h2
                className="font-bold text-white text-3xl lg:text-4xl xl:text-5xl leading-tight tracking-tight"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Explore Industries
              </motion.h2>
              
              <motion.p
                className="text-slate-300 text-lg leading-relaxed max-w-2xl"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Discover innovative startups across the most dynamic sectors driving global transformation
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* <Button
                variant="outline"
                className="group text-white border-slate-600 hover:border-blue-400 hover:bg-blue-500/10 flex items-center gap-3 text-base px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm"
                onClick={handleExploreClick}
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                View All Categories
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button> */}
            </motion.div>
          </div>

          {/* Enhanced Categories Scroller */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-4 lg:gap-6 pb-6 scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              onMouseEnter={stopAutoScroll}
              onMouseLeave={startAutoScroll}
              onTouchStart={stopAutoScroll}
              onTouchEnd={() => setTimeout(startAutoScroll, 2000)}
            >
              {loopedCategories.map(({ name, image }, idx) => {
                const originalIndex = idx % categories.length
                const isHovered = hoveredIndex === originalIndex
                
                return (
                  <motion.div
                    key={`${name}-${idx}`}
                    ref={(el) => (cardRefs.current[idx] = el)}
                    data-original-index={originalIndex}
                    className="group flex-shrink-0 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 1) }}
                    onMouseEnter={() => setHoveredIndex(originalIndex)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => handleCategoryClick(name)}
                  >
                    <motion.div
                      className="relative flex items-center gap-4 w-[220px] lg:w-[240px] h-[80px] px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                      whileHover={{
                        scale: 1.02,
                        y: -4,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Professional Image Container */}
                      <div className="relative flex-shrink-0">
                        <motion.div
                          className="relative w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/20 bg-gradient-to-br from-white/10 to-white/5"
                          whileHover={{ rotate: 3, scale: 1.05 }}
                        >
                          <Image 
                            src={image || "/placeholder.svg"} 
                            alt={name} 
                            fill 
                            className="object-cover transition-transform duration-300"
                            sizes="48px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                        </motion.div>
                      </div>

                      {/* Professional Text Content */}
                      <div className="flex-1 min-w-0">
                        <motion.h3
                          className="font-semibold text-white text-base lg:text-lg truncate mb-1"
                          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                        >
                          {name}
                        </motion.h3>
                        <motion.p
                          className="text-slate-400 text-sm"
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: isHovered ? 1 : 0.7 }}
                        >
                          Explore sector
                        </motion.p>
                      </div>

                      {/* Arrow Icon */}
                      <motion.div
                        className="flex-shrink-0"
                        initial={{ x: 0, opacity: 0.5 }}
                        animate={{ x: isHovered ? 4 : 0, opacity: isHovered ? 1 : 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                      </motion.div>

                      {/* Professional Hover Effect */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Subtle Shine Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full rounded-2xl"
                        animate={{ x: isHovered ? "240px" : "-240px" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>

            {/* Hide scrollbar styles */}
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </motion.div>

          {/* Professional Pagination Dots */}
          <motion.div 
            className="flex justify-center items-center gap-3 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {categories.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => scrollToCard(index)}
                className="group relative"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to category ${index + 1}`}
              >
                <div
                  className={`transition-all duration-300 rounded-full ${
                    index === activeIndex 
                      ? "w-8 h-2 bg-gradient-to-r from-blue-500 to-indigo-500" 
                      : "w-2 h-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}