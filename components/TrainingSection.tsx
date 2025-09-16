"use client"

import { ArrowRightIcon, TrendingUpIcon, SparklesIcon, ChevronRightIcon, PlayIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRef, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { categories } from "@/lib/data" 
import ParticleEffect from "./particle-effect"

export default function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const router = useRouter()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)

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

  const handleExploreClick = () => {
    router.push("/categories")
  }

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`)
  }

  return (
    <section ref={sectionRef} className="relative py-16 lg:py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">
      {/* Enhanced Particle Effect */}
      <ParticleEffect />

      {/* Cinematic Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.08) 30%, transparent 60%)`,
            filter: "blur(80px)",
            opacity: mousePosition.x === -9999 ? 0 : 1,
            transition: "opacity 0.6s ease-out",
          }}
        />
        
        {/* Animated Background Orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col gap-12 lg:gap-16">
          
          {/* Cinematic Section Header */}
          <div className="text-center space-y-6">
            <motion.div
              className="flex items-center justify-center gap-3 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <SparklesIcon className="w-5 h-5 text-blue-400" />
                <motion.div 
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                />
              </div>
              <span className="text-blue-300 text-sm font-bold tracking-[0.2em] uppercase">
                Featured Categories
              </span>
            </motion.div>
            
            <motion.h2
              className="font-black text-white text-4xl lg:text-6xl xl:text-7xl leading-tight tracking-tight"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Trending
              </span>{" "}
              Industries
            </motion.h2>
            
            <motion.p
              className="text-slate-300 text-xl leading-relaxed max-w-3xl mx-auto"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Explore breakthrough innovations across the world's most dynamic startup ecosystems
            </motion.p>
          </div>

          {/* Video Card Style Categories */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {/* Desktop: All in one row */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-8">
              {categories.slice(0, 4).map((category, index) => (
                <CategoryVideoCard 
                  key={category.name}
                  category={{
                    ...category,
                    image: typeof category.image === "string" ? category.image : (category.image.src ?? "")
                  }}
                  index={index}
                  isHovered={hoveredIndex === index}
                  onHover={setHoveredIndex}
                  onClick={handleCategoryClick}
                />
              ))}
            </div>

            {/* Mobile: Scrollable */}
            <div
              ref={scrollRef}
              className="lg:hidden flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory"
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
                    index={index}
                    isHovered={hoveredIndex === index}
                    onHover={setHoveredIndex}
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
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="flex justify-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Button
              onClick={handleExploreClick}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Explore All Categories
                <motion.div
                  className="w-5 h-5"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRightIcon className="w-full h-full" />
                </motion.div>
              </span>
              
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Video Card Component
function CategoryVideoCard({ 
  category, 
  index, 
  isHovered, 
  onHover, 
  onClick, 
  isMobile = false 
}: {
  category: { name: string; image: string }
  index: number
  isHovered: boolean
  onHover: (index: number | null) => void
  onClick: (name: string) => void
  isMobile?: boolean
}) {
  return (
    <motion.div
      className="group relative cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(category.name)}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all duration-500">
        
        {/* Video-like Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
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
          </motion.div>

          {/* Play Button Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                  <PlayIcon className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
              LIVE
            </div>
            <motion.div 
              className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-sm border border-white/30"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              TRENDING
            </motion.div>
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
              <motion.h3
                className="font-bold text-white text-lg leading-tight group-hover:text-blue-300 transition-colors duration-300"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {category.name} Startups
              </motion.h3>
              
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <span>StartupHub</span>
                {/* <div className="w-1 h-1 bg-slate-400 rounded-full" />
                <span>1.2M views</span>
                <div className="w-1 h-1 bg-slate-400 rounded-full" />
                <span>2 days ago</span> */}
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed">
                Discover innovative {category.name.toLowerCase()} companies revolutionizing the industry
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div 
            className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
            initial={{ y: 10 }}
            animate={{ y: isHovered ? 0 : 10 }}
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
          </motion.div>
        </div>

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? "200%" : "-100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Border Glow */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-white/20 group-hover:shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-500" />
      </div>
    </motion.div>
  )
}