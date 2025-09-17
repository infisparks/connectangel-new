"use client";

import { ArrowRightIcon, MapPin, Sparkles, Crown, ChevronLeftIcon, ChevronRightIcon, Star, TrendingUpIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaselib";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Define a type for the incubation data fetched from Supabase
interface IncubationData {
  id: string;
  incubator_accelerator_name: string;
  country: string;
  logo_url?: string | null;
  thumbnail_url?: string | null;
  rating?: number | null;
  startups_count?: number;
  founded_year?: string | null;
}

// Function to construct a public URL from the database path
const getPublicImageUrl = (path: string | undefined | null) => {
  if (!path) return "https://placehold.co/280x160/1a1a1a/ffffff?text=No+Image";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
    return "https://placehold.co/280x160/1a1a1a/ffffff?text=No+Image";
  }
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
    'Indonesia': 'id'
  };
  
  const code = countryCodeMap[country] || country.toLowerCase().substring(0, 2);
  return `https://flagcdn.com/w20/${code}.png`;
};

// Get rating stars
const getRatingStars = (rating: number | null) => {
  const stars = [];
  // Convert the 1-100 rating to a 1-5 scale
  const ratingValue = (rating || 0) / 20;
  
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        size={12}
        className={i < Math.floor(ratingValue) ? "fill-yellow-400 text-yellow-400" : "text-gray-500"}
      />
    );
  }
  return stars;
};

// Skeleton loading component
const IncubationCardSkeleton = () => (
  <div className="flex-shrink-0 w-[280px] sm:w-[300px] bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-4 animate-pulse">
    <div className="w-full h-[140px] bg-gray-700/30 rounded-xl mb-4"></div>
    <div className="space-y-3">
      <div className="h-5 bg-gray-700/30 rounded w-3/4"></div>
      <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
      <div className="h-3 bg-gray-700/30 rounded w-2/3"></div>
    </div>
  </div>
);

export default function IncubationSection() {
  const [incubations, setIncubations] = useState<IncubationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchIncubationsWithCounts = async () => {
      setLoading(true);
      
      const { data: incubationData, error: incubationError } = await supabase
        .from('incubation')
        .select('id, incubator_accelerator_name, country, logo_url, thumbnail_url, year_established, rating')
        .limit(8);

      if (incubationError) {
        console.error("Error fetching incubations:", incubationError);
        setLoading(false);
        return;
      }

      // Fetch startup counts for each incubator
      const incubationsWithCounts = await Promise.all(
        incubationData.map(async (incubation) => {
          const { count, error: countError } = await supabase
            .from('creator')
            .select('id', { count: 'exact', head: true })
            .eq('incubation_id', incubation.id)
            .eq('status', 'approved'); // Only count approved startups

          if (countError) {
            console.error(`Error counting startups for incubator ${incubation.id}:`, countError);
          }

          return {
            ...incubation,
            startups_count: count || 0, // Set the actual count, defaulting to 0 on error
            founded_year: incubation.year_established?.toString() || 'N/A',
          };
        })
      );
      
      setIncubations(incubationsWithCounts as IncubationData[]);
      setLoading(false);
    };

    fetchIncubationsWithCounts();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Initial check
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 w-full py-8 sm:py-12 overflow-hidden">
      {/* Enhanced CSS */}
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .premium-card {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
          border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .scroll-container {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .scroll-container::-webkit-scrollbar {
          display: none;
        }

        .card-hover-effect {
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        .card-hover-effect:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
        }
      `}</style>
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div 
          className="flex justify-between items-center mb-6 sm:mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Top Incubators
              </h2>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm ml-11 sm:ml-13">
              Leading accelerators shaping tomorrow's startups
            </p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`w-10 h-10 border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollLeft 
                  ? 'hover:bg-white/10 hover:border-purple-500/50 text-white' 
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`w-10 h-10 border border-white/20 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollRight 
                  ? 'hover:bg-white/10 hover:border-purple-500/50 text-white' 
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
            <Link href="/incubation">
              <div className="w-10 h-10 border border-purple-500/50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-purple-500/20 hover:border-purple-500 ml-2">
                <ArrowRightIcon className="w-5 h-5 text-purple-400" />
              </div>
            </Link>
          </div>

          {/* Mobile View All */}
          <div className="sm:hidden">
            <Link href="/incubationupdateit">
              <Button variant="ghost" className="text-xs px-3 py-2 text-purple-400 hover:text-purple-300">
                View All
                <ArrowRightIcon className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Scroll Hint */}
        <div className="sm:hidden mb-4 flex items-center gap-2 text-gray-500">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-purple-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-xs">Swipe to explore</span>
        </div>

        {/* Incubation Cards Container */}
        {loading ? (
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scroll-container mobile-scroll-snap py-4"
            onScroll={checkScrollPosition}
          >
            {[...Array(4)].map((_, i) => <IncubationCardSkeleton key={i} />)}
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-container mobile-scroll-snap py-4"
            onScroll={checkScrollPosition}
          >
            {incubations.map((incubation, index) => (
              <div
                key={incubation.id}
                className="flex-shrink-0"
              >
                <Link href={`/incubation/${incubation.id}`}>
                  <div className="group glass-card rounded-2xl p-4 card-hover-effect w-[280px] sm:w-[300px]">
                    {/* Image Container */}
                    <div className="relative w-full h-[140px] sm:h-[160px] mb-4 overflow-hidden rounded-xl">
                      <Image
                        src={getPublicImageUrl(incubation.logo_url)}
                        alt={incubation.incubator_accelerator_name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-white font-bold text-lg sm:text-xl mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300 leading-tight">
                          {incubation.incubator_accelerator_name}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-0.5">
                            {/* Pass the rating from the database */}
                            {getRatingStars(incubation.rating ?? null)}
                          </div>
                          <span className="text-xs text-gray-400">
                            {/* Display the original 1-100 rating value */}
                            {(incubation.rating != null ? incubation.rating : 'N/A')}
                          </span>
                        </div>
                        
                        {/* Location */}
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                          <MapPin className="w-3 h-3" />
                          <Image
                            src={getFlagUrl(incubation.country)}
                            alt={`${incubation.country} flag`}
                            width={14}
                            height={10}
                            className="rounded-sm"
                          />
                          <span className="text-xs">
                            {incubation.country || "Global"}
                          </span>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1 text-gray-400">
                            <TrendingUpIcon className="w-3 h-3" />
                            <span>{incubation.startups_count}+ startups</span>
                          </div>
                          <div className="text-gray-500">
                            Since {incubation.founded_year}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {/* Premium CTA Card */}
            <div
              className="flex-shrink-0"
            >
              <div className="premium-card rounded-2xl p-6 card-hover-effect w-[280px] sm:w-[300px] h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                
                <div>
                  <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
                    Go Premium
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Unlock exclusive insights, detailed analytics, and premium networking opportunities.
                  </p>
                </div>
                
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Dots */}
        <div className="sm:hidden mt-4 flex justify-center">
          <div className="flex gap-1">
            {[...Array(Math.ceil((incubations.length + 1) / 2))].map((_, i) => (
              <div 
                key={i} 
                className="w-2 h-2 bg-white/20 rounded-full"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}