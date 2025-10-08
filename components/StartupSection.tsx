// components/HeroSection.tsx
"use client";

import { ArrowRightIcon, Star, TrendingUp, MapPin, Sparkles, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaselib";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define the type for the startup data
interface Startup {
  id: string;
  startup_name: string;
  country: string | null;
  thumbnail_url: string | null;
  is_incubation: boolean;
  incubation_id: string | null;
  rating: number | null;
  incubator_accelerator_name: string | null;
}

// Helper function to get the absolute URL from a relative path
const getAbsoluteUrl = (path: string | null | undefined): string => {
  if (!path) {
    return "https://placehold.co/320x200/1a1a1a/ffffff?text=No+Image";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; 
  if (!baseUrl) {
    return "https://placehold.co/320x200/1a1a1a/ffffff?text=No+Image";
  }
  // Ensure the base URL logic is correct
  const fullUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  return fullUrl;
};

// Function to get a real flag URL based on the country
const getFlagUrl = (country: string | null) => {
  if (!country) return "https://flagcdn.com/w20/xx.png";
  
  const countryCodeMap: { [key: string]: string } = {
    'India': 'in',
    'United States': 'us',
    'United Kingdom': 'gb',
    'Germany': 'de',
    'France': 'fr',
    'Japan': 'jp',
    'China': 'cn',
    'Canada': 'ca',
    'Australia': 'au',
    'Brazil': 'br',
    'Singapore': 'sg',
    'Netherlands': 'nl',
    'Switzerland': 'ch',
    'Sweden': 'se',
    'Israel': 'il',
    // Include the new countries from previous context for completeness
    'Malaysia': 'my', 
    'Philippines': 'ph',
    'Qatar': 'qa',
    'Iran': 'ir',
    'Bahrain': 'bh',
    'Serbia': 'rs',
    'Mexico': 'mx',
    'South Korea': 'kr',
    'Saudi Arabia': 'sa',
    'Egypt': 'eg',
    'Nigeria': 'ng',
    'South Africa': 'za',
    'Argentina': 'ar',
    'New Zealand': 'nz',
    'Belgium': 'be',
    'Austria': 'at',
    'Greece': 'gr',
    'Italy': 'it',
    'Spain': 'es',
    // Default fallback to 2-letter code if not in map
  };
  
  const code = countryCodeMap[country] || country.toLowerCase().substring(0, 2);
  // Using w20 ensures a small, fixed-size image optimized for small display
  return `https://flagcdn.com/w20/${code.toLowerCase()}.png`;
};

// Generate star rating
const renderStarRating = (rating: number | null) => {
  if (!rating) return null;
  const stars = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
          }`}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

// Skeleton loading component
const StartupCardSkeleton = () => (
  <div className="flex-shrink-0 w-[300px] md:w-[320px] h-[380px] bg-gray-800/70 border border-gray-700/50 rounded-2xl p-4 animate-pulse">
    <div className="w-full h-48 bg-gray-700/50 rounded-xl mb-4"></div>
    <div className="space-y-3">
      <div className="h-6 bg-gray-700/50 rounded-md w-3/4"></div>
      <div className="h-4 bg-gray-700/50 rounded-md w-1/2"></div>
      <div className="h-4 bg-gray-700/50 rounded-md w-2/3"></div>
    </div>
  </div>
);

export default function StartupSection() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Fetch data
  useEffect(() => {
    async function getTopStartups() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("creator")
          .select(`
            id,
            startup_name,
            country,
            thumbnail_url,
            is_incubation,
            incubation_id,
            rating,
            incubation:incubation_id (
              incubator_accelerator_name
            )
          `)
          .eq("status", "approved")
          .order("rating", { ascending: false })
          .limit(10); 

        if (error) {
          throw error;
        }

        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            startup_name: item.startup_name,
            country: item.country,
            thumbnail_url: item.thumbnail_url,
            is_incubation: item.is_incubation,
            incubation_id: item.incubation_id,
            rating: item.rating,
            incubator_accelerator_name: (item.incubation as any)?.incubator_accelerator_name || null
          }));
          setStartups(formattedData as Startup[]);
        }
      } catch (error) {
        console.error("Error fetching top startups:", error);
      } finally {
        setLoading(false);
      }
    }

    getTopStartups();
  }, []);

  // Scroll handler to check position and set button states
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      const scrollLeft = scrollElement.scrollLeft;
      const scrollWidth = scrollElement.scrollWidth;
      const clientWidth = scrollElement.clientWidth;
      
      // Check if scrolled past a threshold to show the "View All" button
      if (scrollLeft > 50) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
      
      // Check for start/end position (allowing a small buffer for fractional scrolling)
      setIsAtStart(scrollLeft < 10);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);
    }
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      // Run once on load to set initial state
      handleScroll(); 
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Function to scroll by a specific amount
  const scrollByAmount = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Scroll by the width of approximately one card plus gap (300px + 24px gap)
      const scrollAmount = 324; 
      
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const showScrollHint = !loading && startups.length > 3;

  return (
    <section className="relative bg-slate-950 w-full py-12 md:py-16 overflow-hidden">
      {/* Professional CSS Styling */}
      <style jsx>{`
        .glass-card-pro {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hover-effect-pro {
          transition: all 0.3s cubic-bezier(0.2, 0.6, 0.3, 1.1);
        }

        .hover-effect-pro:hover {
          transform: translateY(-4px); 
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          border-color: rgba(168, 85, 247, 0.5); 
        }

        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Background Effects (Subtle) */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex items-center justify-between sm:flex-row sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white">
                Top Startups
              </h2>
              <p className="text-gray-400 text-sm md:text-base mt-1">
                Discover the best innovators by ratings and traction.
              </p>
            </div>
          </div>
          
          {/* Default Explore Button */}
          <Link href="/allstartup" className="hidden sm:block">
            <Button variant="link" className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
              View All Startups
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Slider Container with Arrows (PC Only) */}
        <div className="relative">
          {/* Left Arrow (Hidden on Mobile/Small Screens) */}
          {!loading && startups.length > 3 && (
            <button
              onClick={() => scrollByAmount('left')}
              disabled={isAtStart}
              className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl transition-opacity duration-300 hover:bg-white/20
                ${isAtStart ? 'opacity-0 pointer-events-none' : 'opacity-100'}
              `}
              aria-label="Previous card"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Loading State */}
          {loading && (
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 hide-scrollbar py-4"
            >
              {[...Array(3)].map((_, i) => (
                <StartupCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Startup Cards Container */}
          {!loading && (
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-6 hide-scrollbar py-4 px-1 md:px-0" /* Added px-1 for mobile edge-to-edge feel */
            >
              {startups.map((startup, index) => (
                <div
                  key={startup.id}
                  className="flex-shrink-0 w-[300px]"
                >
                  <Link href={`/startup/${startup.id}`}>
                    <div className="group glass-card-pro rounded-2xl p-4 hover-effect-pro h-[380px] flex flex-col">
                      {/* Image Container */}
                      <div className="relative w-full h-48 mb-4 overflow-hidden rounded-xl">
                        <Image
                          src={getAbsoluteUrl(startup.thumbnail_url)}
                          alt={startup.startup_name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 300px, 320px"
                        />
                        
                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {index === 0 && (
                            <span className="bg-yellow-500 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                              <Sparkles className="w-3 h-3" />
                              #1 Top Rated
                            </span>
                          )}
                          {startup.is_incubation && (
                            <span className="bg-slate-700/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-slate-600">
                              <Crown className="w-3 h-3 text-purple-400" />
                              {startup.incubator_accelerator_name || "Incubated"}
                            </span>
                          )}
                        </div>

                        {/* Rating Badge */}
                        {startup.rating && (
                          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-full px-2 py-1 border border-gray-700">
                            {renderStarRating(startup.rating)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between pt-1">
                        <div>
                          <h3 className="text-white font-bold text-xl mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors duration-300">
                            {startup.startup_name}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-gray-400 mb-3">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            {/* FLAG FIX: Removed any clipping or overflow hidden from parent of Image */}
                            <div className="flex-shrink-0 p-0.5 rounded-sm border border-gray-600/50">
                              <Image
                                src={getFlagUrl(startup.country)}
                                alt={`${startup.country} flag`}
                                width={18} // Slightly increased size for better visibility
                                height={14} // Slightly increased size for better visibility (maintains aspect ratio)
                                className="rounded-sm" // Minimal rounding for a clean rectangle
                              />
                            </div>
                            <span className="text-sm">
                              {startup.country || "Global"}
                            </span>
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                          <span className="text-xs text-gray-500 uppercase tracking-wider">
                            View Profile
                          </span>
                          <div className="w-8 h-8 rounded-full bg-purple-600/10 flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300">
                            <ArrowRightIcon className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
          
          {/* Right Arrow (Hidden on Mobile/Small Screens) */}
          {!loading && startups.length > 3 && (
            <button
              onClick={() => scrollByAmount('right')}
              disabled={isAtEnd}
              className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl transition-opacity duration-300 hover:bg-white/20
                ${isAtEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'}
              `}
              aria-label="Next card"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Scroll-based "Show All Startups" CTA Button */}
        <div className="flex justify-center mt-8">
            <Button 
                onClick={() => router.push("/allstartup")}
                className={`w-full max-w-sm md:max-w-md bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-3 text-base font-bold transition-all duration-300 ease-in-out shadow-lg shadow-purple-500/30 ${
                    hasScrolled || loading || startups.length <= 3 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-4 pointer-events-none sm:opacity-100 sm:translate-y-0 sm:pointer-events-auto' 
                }`}
            >
                {startups.length > 3 ? `View All ${startups.length}+ Startups` : "View All Startups"}
                <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
        </div>

        {/* Mobile Scroll Hint (Only if more than 3 cards exist) */}
        {showScrollHint && (
            <div className="md:hidden flex justify-center mt-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-400">
                        Scroll horizontally for more
                    </span>
                    <ArrowRightIcon className="w-4 h-4 text-purple-400" />
                </div>
            </div>
        )}
      </div>
    </section>
  );
}