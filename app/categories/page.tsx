"use client"

import { useState } from "react"
import { ArrowLeftIcon, SparklesIcon, SearchIcon, XIcon, PlayIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Assuming the categories data is accessible here or imported
const categories = [
    { name: "FinTech", image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=400&h=225&fit=crop" },
    { name: "HealthTech", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=225&fit=crop" },
    { name: "EdTech", image: "https://images.unsplash.com/photo-1541339907198-e087561f77ac?w=400&h=225&fit=crop" },
    { name: "AI/ML", image: "https://images.unsplash.com/photo-1574853043257-191a61c5a93e?w=400&h=225&fit=crop" },
    { name: "Cybersecurity", image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=225&fit=crop" },
    { name: "SaaS", image: "https://images.unsplash.com/photo-1550518712-4c2789617d1e?w=400&h=225&fit=crop" },
    { name: "CleanTech", image: "https://images.unsplash.com/photo-1517524005116-2581691a6c4b?w=400&h=225&fit=crop" },
    { name: "BioTech", image: "https://images.unsplash.com/photo-1581456108151-24876b50e3fe?w=400&h=225&fit=crop" },
];

export default function CategoriesPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCategoryClick = (categoryName: string) => {
        router.push(`/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}`)
    }
    
    // Video Card Component (reused from CategoriesSection)
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
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        </div>

                        {isHovered && (
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                    <PlayIcon className="w-6 h-6 text-white ml-1" fill="currentColor" />
                                </div>
                            </div>
                        )}

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

                        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded backdrop-blur-sm">
                            2:45
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {category.name.charAt(0)}
                                </div>
                            </div>
                            
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-16 lg:py-24 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-12 lg:gap-16">
                    {/* Header & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-4">
                        <div className="space-y-2">
                            <h1 className="font-black text-4xl lg:text-6xl xl:text-7xl leading-tight tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                                All Categories
                            </h1>
                            <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-md" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                                Explore breakthrough innovations across the world's most dynamic startup ecosystems.
                            </p>
                        </div>
                        <div className="relative w-full sm:w-80">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-full py-3 pl-10 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                    aria-label="Clear search"
                                >
                                    <XIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categories Grid */}
                    {filteredCategories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                            {filteredCategories.map((category) => (
                                <CategoryVideoCard
                                    key={category.name}
                                    category={category}
                                    onClick={handleCategoryClick}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-white/50">
                            <SearchIcon className="w-16 h-16 mb-4" />
                            <p className="text-xl sm:text-2xl font-bold">No categories found.</p>
                            <p className="text-sm sm:text-base mt-2">Try a different search query.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}