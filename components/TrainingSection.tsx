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
    <section className="relative py-16 lg:py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col gap-12 lg:gap-16">
          
          {/* Section Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
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
              className="font-black text-white text-4xl lg:text-6xl xl:text-7xl leading-tight tracking-tight"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Trending
              </span>{" "}
              Industries
            </h2>
            
            <p
              className="text-slate-300 text-xl leading-relaxed max-w-3xl mx-auto"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Explore breakthrough innovations across the world's most dynamic startup ecosystems
            </p>
          </div>

          {/* Video Card Style Categories */}
          <div>
            {/* Desktop: All in one row */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-8 py-4">
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
              className="lg:hidden flex overflow-x-auto gap-4 pt-4 pb-6 snap-x snap-mandatory"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {categories.map((category, index) => (
                <div key={category.name} className="flex-shrink-0 w-80 snap-center">
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
            className="flex justify-center pt-8"
          >
            <Button
              onClick={handleExploreClick}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Explore All Categories
                <div className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRightIcon className="w-full h-full" />
                </div>
              </span>
              
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
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

  return (
    <div
      className="group relative cursor-pointer transition-all duration-300 transform hover:y-[-8px] hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(category.name)}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all duration-500">
        
        {/* Video-like Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <div
            className="absolute inset-0 transition-transform duration-600 group-hover:scale-105"
          >
            <Image 
              src={category.image || "/placeholder.svg"} 
              alt={category.name} 
              fill 
              className="object-cover"
              sizes={isMobile ? "320px" : "400px"}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          </div>

          {/* Play Button Overlay */}
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <PlayIcon className="w-6 h-6 text-white ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
              LIVE
            </div>
            <div 
              className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm border border-white/30 animate-pulse"
            >
              TRENDING
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded backdrop-blur-sm">
            2:45
          </div>
        </div>

        {/* Video Info Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            {/* Channel Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {category.name.charAt(0)}
              </div>
            </div>
            
            {/* Video Details */}
            <div className="flex-1 space-y-2">
              <h3
                className="font-bold text-white text-lg leading-tight group-hover:text-blue-300 transition-colors duration-300"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {category.name} Startups
              </h3>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <span>StartupHub</span>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed">
                Discover innovative {category.name.toLowerCase()} companies revolutionizing the industry
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div 
            className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <Button 
              size="sm" 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-full px-4 py-1.5 text-xs font-medium backdrop-blur-sm transition-all duration-200"
            >
              Watch Now
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-400 hover:text-white text-xs p-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
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