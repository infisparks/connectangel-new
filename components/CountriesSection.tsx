"use client"

import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { countries } from "@/lib/data"
import ParticleEffect from "./particle-effect"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const domainFilters = [
  "All",
  "IT & SaaS",
  "AgriTech",
  "HealthTech",
  "FinTech",
  "Manufacturing",
  "PropTech",
  "EdTech",
];

export default function CountriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)

  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("All")

  const animationFrameId = useRef<number | null>(null)
  const scrollSpeed = 1
  const isScrollingPaused = useRef(false)

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
  }, [countries.length])

  const handleExploreClick = () => {
    router.push("/allstartup")
  }

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

  const loopedCountries = [...countries, ...countries]

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
  
  const handleCountryCardClick = (countryName: string) => {
    setSelectedCountry(countryName);
    setSelectedDomain("All");
    setShowFilterDialog(true);
  };
  
  const handleFilterSubmit = () => {
    let query = "";
    if (selectedCountry && selectedCountry !== "All") {
        query += `country=${encodeURIComponent(selectedCountry)}`;
    }
    if (selectedDomain && selectedDomain !== "All") {
        query += query ? `&domain=${encodeURIComponent(selectedDomain)}` : `domain=${encodeURIComponent(selectedDomain)}`;
    }
    const path = query ? `/allstartup?${query}` : `/startups`;
    router.push(path);
    setShowFilterDialog(false);
  };

  return (
    <section ref={sectionRef} className="relative py-12 md:py-20 bg-[#000A18] overflow-hidden">
      <ParticleEffect />
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
          <div className="w-full">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-[15px] pb-4 scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              onMouseEnter={stopAutoScroll}
              onMouseLeave={startAutoScroll}
            >
              {loopedCountries.map(({ name, image }, idx) => (
                <motion.div
                  key={`${name}-${idx}`}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  data-original-index={idx % countries.length}
                  className="flex-shrink-0 flex items-center box-border w-[180px] h-[67px] pt-[10px] pb-[10px] pl-[15.2px] pr-[15.2px] rounded-[13.01px] border-[2.13px] border-[#FFFFFF] cursor-pointer bg-[#DDDDDD33]"
                  whileHover={{
                    scale: 1.05,
                    borderColor: "rgba(255, 255, 255, 0.6)",
                  }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleCountryCardClick(name)}
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
              <style jsx>{`
                div[ref="scrollRef"]::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>
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
      
      {/* Search Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-[425px] bg-[#0E0616] text-white border-[rgba(255,255,255,0.6)] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Search Filter</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-semibold text-gray-300">Country</Label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger className="w-full bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700">
                  {countries.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-sm font-semibold text-gray-300">Domain</Label>
              <Select
                value={selectedDomain}
                onValueChange={setSelectedDomain}
              >
                <SelectTrigger className="w-full bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4">
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700">
                  {domainFilters.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleFilterSubmit}
              className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-6 rounded-full text-base font-bold transition-colors"
            >
              Select
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}