"use client"

import { ArrowUpRightIcon } from "lucide-react"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { categories } from "@/lib/data"
import { motion, useScroll, useTransform } from "framer-motion"
import { gsap } from "gsap" // Import GSAP

export default function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null) // Ref for the section to track scroll
  const cardTimelines = useRef<{ [key: number]: gsap.core.Timeline }>({}) // Store GSAP timelines for each card

  // Scroll animation for the floating object
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"], // Animate as the section enters/leaves viewport
  })
  const yObject = useTransform(scrollYProgress, [0, 1], ["-50%", "150%"]) // Moves from top to bottom of its container

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    // Set initial state for all text content to be hidden
    cardRefs.current.forEach((cardEl) => {
      if (cardEl) {
        const textEl = cardEl.querySelector(".category-text-content")
        if (textEl) {
          gsap.set(textEl, { opacity: 0, y: 20 }) // Initially hide text and move it down
        }
      }
    })

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
    router.push("/categories")
  }

  const handleMouseEnter = (index: number) => {
    const cardEl = cardRefs.current[index]
    if (!cardEl) return

    const textEl = cardEl.querySelector(".category-text-content")
    const imageEl = cardEl.querySelector("img") // Get the image element

    if (!cardTimelines.current[index]) {
      const tl = gsap.timeline({ paused: true })

      // Animate the card itself (lift and scale)
      tl.to(
        cardEl,
        {
          scale: 1.05,
          y: -5,
          boxShadow: "0px 10px 20px rgba(0,0,0,0.3)",
          duration: 0.3,
          ease: "power2.out",
        },
        0,
      ) // Start at 0

      // Animate the image scale
      if (imageEl) {
        tl.to(
          imageEl,
          {
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out",
          },
          0,
        ) // Start at 0
      }

      // Animate the text content (fade in and slide up)
      if (textEl) {
        tl.to(
          textEl,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          "<0.1",
        ) // Start text animation slightly after card animation
      }

      cardTimelines.current[index] = tl
    }

    cardTimelines.current[index].play()
  }
  const handleMouseLeave = (index: number) => {
    if (cardTimelines.current[index] !== undefined) {
      cardTimelines.current[index].reverse(0.2) // Faster reverse
    }
  }

  return (
    <section ref={sectionRef} className="relative py-8 md:py-16 bg-[#000A18] overflow-hidden">
      {/* Animated object */}
      <motion.div
        style={{ y: yObject }}
        className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-purple-500/30 blur-xl z-0"
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8 md:space-y-14">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-poppins font-semibold text-white text-2xl md:text-3xl lg:text-4xl">
              Explore by Categories
            </h2>
            <div
              className="flex w-12 h-12 md:w-16 md:h-16 items-center justify-center glass-effect rounded-full border-2 border-white hover-lift cursor-pointer transition-all duration-300 hover:scale-110"
              onClick={handleExploreClick}
              role="button"
              tabIndex={0}
              aria-label="Explore all categories"
            >
              <ArrowUpRightIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>

          {/* Categories Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scroll-snap-x-mandatory scroll-smooth"
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
          >
            {categories.map(({ title, image, description }, index) => (
              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                className="group relative flex-shrink-0
                  w-full
                  sm:w-[calc((100%-theme(spacing.4))/2)]
                  md:w-[calc((100%-theme(spacing.6)*2)/3)]
                  lg:w-[calc((100%-theme(spacing.6)*3)/4)]
                  overflow-hidden rounded-xl
                  scroll-snap-align-center"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                <div className="relative h-48 md:h-52 lg:h-56">
                  <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 category-text-content">
                    <h3 className="font-poppins font-semibold text-white text-lg md:text-xl mb-1">{title}</h3>
                    <p className="font-poppins font-light text-white/80 text-sm">{description}</p>
                  </div>
                </div>
              </div>
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

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToCard(index)}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  index === activeIndex ? "bg-white" : "bg-white/40"
                }`}
                aria-label={`Go to category ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
