"use client"

import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image" // Keep Image import for future use, but won't be used for flags
import { useRef, useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { countries } from "@/lib/countryflag" // Ensure this path is correct
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
  const sectionRef = useRef<HTMLElement>(null)

  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("All")

  const animationFrameId = useRef<number | null>(null)
  const scrollSpeed = 1
  const isScrollingPaused = useRef(false)

  // Intersection Observer for active state
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Find the original index from the data-original-index attribute
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
        threshold: 0.7, // Adjust threshold for better detection
      },
    )

    cardRefs.current.forEach((ref, index) => {
      // Only observe the original set of cards to calculate the active index correctly
      if (ref && index < countries.length) observer.observe(ref)
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

  // Auto-scroll animation logic
  const animateScroll = useCallback(() => {
    if (scrollRef.current && !isScrollingPaused.current) {
      scrollRef.current.scrollLeft += scrollSpeed

      const scrollWidth = scrollRef.current.scrollWidth
      // We loop the content by duplicating the countries array, so the original content width is half of the total scrollWidth
      const originalContentWidth = scrollWidth / 2

      if (scrollRef.current.scrollLeft >= originalContentWidth) {
        // Jump back to the start of the duplicated content seamlessly
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

  // Start and cleanup auto-scroll on mount
  useEffect(() => {
    startAutoScroll()
    return () => stopAutoScroll()
  }, [startAutoScroll, stopAutoScroll])

  // Handlers for manual interaction (Touch and Mouse)

  // Mobile/Touch Handlers
  const handleTouchStart = () => {
    stopAutoScroll()
  }

  const handleTouchEnd = () => {
    // Resume auto-scroll after a short delay to allow for finger lift/scroll momentum
    setTimeout(startAutoScroll, 3000) 
  }
  
  // PC/Mouse Drag Handlers (New addition for better manual control)
  const handleMouseDown = () => {
    stopAutoScroll()
  }
  
  const handleMouseUp = () => {
    // Resume auto-scroll after a short delay to allow for scroll momentum
    setTimeout(startAutoScroll, 3000)
  }

  const loopedCountries = [...countries, ...countries]

  const scrollToCard = (index: number) => {
    if (cardRefs.current[index]) {
      stopAutoScroll()
      cardRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      })
      setTimeout(startAutoScroll, 3000) // Resume auto-scroll after navigation
    }
  }
  
  const handleCountryCardClick = (countryName: string) => {
    setSelectedCountry(countryName);
    setSelectedDomain("All");
    setShowFilterDialog(true);
  };
  
  const handleFilterSubmit = () => {
    const isCountryFiltered = selectedCountry && selectedCountry !== "All";
    const isDomainFiltered = selectedDomain && selectedDomain !== "All";
    
    let query = "";

    if (isCountryFiltered) {
        query += `country=${encodeURIComponent(selectedCountry)}`;
    }
    if (isDomainFiltered) {
        query += query ? `&domain=${encodeURIComponent(selectedDomain)}` : `domain=${encodeURIComponent(selectedDomain)}`;
    }
    
    // Determine the base path
    let path = "/allstartup"; // Default path

    // Append query if filters are applied
    if (query) {
        path = `${path}?${query}`;
    }
    
    router.push(path);
    setShowFilterDialog(false);
  };

  return (
    <section ref={sectionRef} className="relative py-8 sm:py-12 lg:py-16 bg-[#000A18] overflow-hidden">
      <div className="relative z-20 container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        <div className="flex flex-col space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <h2
              className="font-semibold text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-white leading-tight"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Explore by Countries
            </h2>
            <Button
              variant="link"
              className="text-white/90 flex items-center gap-1.5 text-sm sm:text-base lg:text-lg hover:text-purple-400 transition-colors duration-200 p-0 h-auto font-medium self-start sm:self-center"
              onClick={handleExploreClick}
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Explore More
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          
          <div className="w-full">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-3 sm:gap-4 pb-3 scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              // Interaction handlers for auto-scroll
              onMouseEnter={stopAutoScroll} // PC: Pause on hover
              onMouseLeave={startAutoScroll} // PC: Resume on un-hover
              onTouchStart={handleTouchStart} // Mobile: Pause on touch start (scroll/drag)
              onTouchEnd={handleTouchEnd} // Mobile: Resume on touch end
              onMouseDown={handleMouseDown} // PC: Pause on mouse click down (start of drag/scroll)
              onMouseUp={handleMouseUp} // PC: Resume on mouse click up (end of drag/scroll)
            >
              {loopedCountries.map(({ name, image }, idx) => (
                <div
                  key={`${name}-${idx}`}
                  // The original content has countries.length cards. The duplicated content starts at countries.length.
                  ref={(el) => (cardRefs.current[idx] = el)}
                  data-original-index={idx % countries.length}
                  className="flex-shrink-0 flex items-center gap-2 sm:gap-3 w-[140px] sm:w-[160px] lg:w-[180px] h-[52px] sm:h-[60px] lg:h-[68px] px-3 sm:px-4 lg:px-[15px] py-2 sm:py-2.5 lg:py-[10px] rounded-lg sm:rounded-xl border border-white/20 cursor-pointer bg-white/[0.08] hover:bg-white/[0.12] hover:border-white/35 backdrop-blur-sm transition-all duration-200"
                  onClick={() => handleCountryCardClick(name)}
                >
                  <div className="relative w-[32px] sm:w-[36px] lg:w-[40px] h-[32px] sm:h-[36px] lg:h-[40px] rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {/* UPDATED: Display flag emoji directly as text */}
                    <span className="text-2xl sm:text-3xl leading-none">
                      {image}
                    </span>
                  </div>
                  <span
                    className="font-medium text-white text-xs sm:text-sm lg:text-base whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {name}
                  </span>
                </div>
              ))}
              <style jsx>{`
                /* Hide scrollbar for compliant browsers */
                div[ref="scrollRef"]::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>
          
          <div className="flex justify-center gap-1.5 pt-2 sm:pt-3">
            {countries.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToCard(index)}
                className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-200 ${
                  index === activeIndex 
                    ? "bg-white scale-110" 
                    : "bg-white/30 hover:bg-white/50 hover:scale-105"
                }`}
                aria-label={`Go to country ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Search Filter Dialog - Enhanced for Mobile */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[425px] max-w-none mx-auto bg-[#0A0F1C]/95 backdrop-blur-xl text-white border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-white text-lg sm:text-xl font-semibold" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
              Search Filters
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 sm:gap-5 py-2 sm:py-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-gray-300" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                Country
              </Label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e]/95 backdrop-blur-xl text-white border-white/20 rounded-lg">
                  {countries.map((c) => (
                    <SelectItem 
                      key={c.name} 
                      value={c.name}
                      className="hover:bg-white/10 focus:bg-white/10 text-sm sm:text-base"
                    >
                      <div className="flex items-center gap-2">
                         {/* Display flag emoji in the select item */}
                        <span className="text-xl leading-none">{c.image}</span> 
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-sm font-medium text-gray-300" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                Industry Domain
              </Label>
              <Select
                value={selectedDomain}
                onValueChange={setSelectedDomain}
              >
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e]/95 backdrop-blur-xl text-white border-white/20 rounded-lg">
                  {domainFilters.map((d) => (
                    <SelectItem 
                      key={d} 
                      value={d}
                      className="hover:bg-white/10 focus:bg-white/10 text-sm sm:text-base"
                    >
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2 sm:pt-4">
            <div className="flex gap-2 sm:gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilterDialog(false)}
                className="flex-1 sm:flex-none bg-transparent border-white/20 text-white hover:bg-white/10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleFilterSubmit}
                className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 px-4 sm:px-8 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}