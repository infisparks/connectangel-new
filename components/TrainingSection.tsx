"use client"

import { ArrowRightIcon, SparklesIcon, PlayIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { categories } from "@/lib/data" 

export default function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleExploreClick = () => {
    router.push("/categories")
  }

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`)
  }

  return (
    <section className="relative py-12 lg:py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col gap-8 lg:gap-10">
          
          {/* Section Header */}
          <div className="text-center space-y-4"> {/* Reduced space-y from 6 to 4 */}
            <div className="flex items-center justify-center gap-3"> {/* Removed mb-4 */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <SparklesIcon className="w-5 h-5 text-blue-400" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              </div>
              <span className="text-blue-300 text-sm font-bold tracking-[0.2em] uppercase">
                Featured Categories
              </span>
            </div>
            
            <h2
              className="font-black text-white text-3xl lg:text-5xl xl:text-6xl leading-tight tracking-tight" // Reduced font size
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Trending
              </span>{" "}
              Industries
            </h2>
            
            <p
              className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto" // Reduced max-width and font size
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Explore breakthrough innovations across the world's most dynamic startup ecosystems
            </p>
          </div>

          {/* Video Card Style Categories */}
          <div>
            {/* Desktop: All in one row */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-5 py-2"> {/* Reduced gap and padding */}
              {categories.slice(0, 4).map((category, index) => (
                <CategoryVideoCard 
                  key={category.name}
                  category={{
                    ...category,
                    image: typeof category.image === "string" ? category.image : (category.image.src ?? "")
                  }}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>

            {/* Mobile: Scrollable */}
            <div
              ref={scrollRef}
              className="lg:hidden flex overflow-x-auto gap-4 pt-4 pb-4 snap-x snap-mandatory" // Reduced bottom padding
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {categories.map((category, index) => (
                // FIX: Removed the unnecessary w-80 and flex-shrink-0 from this wrapper div
                // The size constraints are now handled inside the CategoryVideoCard component itself for uniformity.
                <div key={category.name} className="snap-center"> 
                  <CategoryVideoCard 
                    category={{
                      ...category,
                      image: typeof category.image === "string" ? category.image : (category.image.src ?? "")
                    }}
                    onClick={handleCategoryClick}
                    isMobile={true}
                  />
                </div>
              ))}
              
              {/* Hide scrollbar */}
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>

          {/* CTA Section */}
          <div
            className="flex justify-center pt-4" // Reduced top padding
          >
            <Button
              onClick={handleExploreClick}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-base rounded-xl transition-all duration-300 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.03]" // Reduced size and scale effect
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore All Categories
                <div className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRightIcon className="w-full h-full" />
                </div>
              </span>
              
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Video Card Component
function CategoryVideoCard({ 
  category,
  onClick, 
  isMobile = false 
}: {
  category: { name: string; image: string }
  onClick: (name: string) => void
  isMobile?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Use explicit width for mobile cards to maintain uniformity in the scroll view
  const cardWidthClass = isMobile ? "w-[280px] flex-shrink-0" : "w-full"; 

  return (
    <div
      className={`${cardWidthClass} group relative cursor-pointer transition-all duration-300 transform hover:translate-y-[-4px] hover:scale-[1.01]`} // Reduced hover effect
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(category.name)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all duration-500"> {/* Reduced border radius and blur */}
        
        {/* Video-like Thumbnail */}
        <div className="relative aspect-[16/9] overflow-hidden"> {/* Uniform aspect ratio */}
          <div
            className="absolute inset-0 transition-transform duration-600 group-hover:scale-105"
          >
            <Image 
              src={category.image || "/placeholder.svg"} 
              alt={category.name} 
              fill 
              className="object-cover"
              sizes={isMobile ? "280px" : "400px"}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" /> {/* Lighter overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          </div>

          {/* Play Button Overlay */}
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30"> {/* Smaller play button */}
                <PlayIcon className="w-5 h-5 text-white ml-0.5" fill="currentColor" /> {/* Smaller icon */}
              </div>
            </div>
          )}

          {/* Top Badges (Reduced size and padding) */}
          <div className="absolute top-3 left-3 flex gap-1">
            <div className="px-2 py-0.5 bg-red-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
              LIVE
            </div>
            <div 
              className="px-2 py-0.5 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm border border-white/30 animate-pulse"
            >
              TRENDING
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 text-white text-xs font-medium rounded backdrop-blur-sm">
            2:45
          </div>
        </div>

        {/* Video Info Section */}
        <div className="p-4 space-y-3"> {/* Reduced padding and spacing */}
          <div className="flex items-start gap-3"> {/* Reduced gap */}
            {/* Channel Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base"> {/* Smaller avatar */}
                {category.name.charAt(0)}
              </div>
            </div>
            
            {/* Video Details */}
            <div className="flex-1 space-y-1"> {/* Reduced inner spacing */}
              <h3
                className="font-bold text-white text-base leading-tight group-hover:text-blue-300 transition-colors duration-300" // Reduced font size
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {category.name} Startups
              </h3>
              
              <div className="flex items-center gap-2 text-slate-400 text-xs"> {/* Smaller text */}
                <span>StartupHub</span>
              </div>
              
              <p className="text-slate-300 text-xs line-clamp-2"> {/* Smaller text and clamped lines */}
                Discover innovative {category.name.toLowerCase()} companies revolutionizing the industry
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div 
            className="flex items-center justify-between pt-2 border-t border-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <Button 
              size="sm" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-full px-3 h-8 text-xs font-medium backdrop-blur-sm transition-all duration-200" // Compact button size
            >
              View Startups
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-400 hover:text-white text-xs p-1 rounded-full hover:bg-white/10 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}