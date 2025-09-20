"use client"

import { ArrowRightIcon, TrendingUpIcon, ChevronRightIcon } from "lucide-react"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { categories } from "@/lib/data" 

export default function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const router = useRouter()

  // Auto-scroll configuration
  const scrollSpeed = useRef(1.2)
  const isScrollingPaused = useRef(false)
  const animationFrameId = useRef<number | null>(null)
  const scrollDirection = useRef(1)

  // Intersection observer
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

  const handleCategoryClick = (categoryName: string) => {
    const currentSearchParams = new URLSearchParams(window.location.search)
    currentSearchParams.set('category', categoryName.replace(/\s+/g, '-'))
    router.push(`/allstartup?${currentSearchParams.toString()}`)
  }

  // Improved auto-scroll with seamless looping
  const animateScroll = useCallback(() => {
    if (scrollRef.current && !isScrollingPaused.current) {
      const container = scrollRef.current
      const halfWidth = container.scrollWidth / 2

      container.scrollLeft += scrollSpeed.current * scrollDirection.current

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
      setTimeout(startAutoScroll, 3000)
    }
  }

  return (
    <section className="relative py-12 lg:py-20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">
      
      {/* Updated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col gap-8 lg:gap-12">
          
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div
                className="flex items-center gap-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <TrendingUpIcon className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-purple-300 text-sm font-semibold tracking-wider uppercase letter-spacing-wide">
                  Popular Categories
                </span>
              </div>
              
              <h2
                className="font-bold text-white text-3xl lg:text-4xl xl:text-5xl leading-tight tracking-tight"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Explore Industries
              </h2>
              
              <p
                className="text-slate-300 text-lg leading-relaxed max-w-2xl"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Discover innovative startups across the most dynamic sectors driving global transformation.
              </p>
            </div>
          </div>

          {/* Categories Scroller */}
          <div>
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
                
                return (
                  <div
                    key={`${name}-${idx}`}
                    ref={(el) => (cardRefs.current[idx] = el)}
                    data-original-index={originalIndex}
                    className="group flex-shrink-0 cursor-pointer"
                    onClick={() => handleCategoryClick(name)}
                  >
                    <div
                      className="relative flex items-center gap-4 w-[220px] lg:w-[240px] h-[80px] px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-[1.02] hover:translate-y-[-4px] hover:shadow-2xl"
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className="relative w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/20 bg-gradient-to-br from-white/10 to-white/5 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105"
                        >
                          <Image 
                            src={image || "/placeholder.svg"} 
                            alt={name} 
                            fill 
                            className="object-cover transition-transform duration-300"
                            sizes="48px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-white text-base lg:text-lg truncate mb-1"
                          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                        >
                          {name}
                        </h3>
                        <p
                          className="text-slate-400 text-sm"
                        >
                          Explore sector
                        </p>
                      </div>

                      <div
                        className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      >
                        <ChevronRightIcon className="w-5 h-5 text-slate-400 transition-colors duration-200 group-hover:text-white" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>

          {/* Pagination Dots */}
          <div 
            className="flex justify-center items-center gap-3 pt-4"
          >
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToCard(index)}
                className="group relative"
                aria-label={`Go to category ${index + 1}`}
              >
                <div
                  className={`transition-all duration-300 rounded-full ${
                    index === activeIndex 
                      ? "w-8 h-2 bg-gradient-to-r from-purple-500 to-pink-500" 
                      : "w-2 h-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}