"use client"

import { ArrowRightIcon, Star, TrendingUp, MapPin, Sparkles, Crown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaselib";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
    console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
    return "https://placehold.co/320x200/1a1a1a/ffffff?text=No+Image";
  }
  const fullUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  return fullUrl;
};

// Function to get a real flag URL based on the country
const getFlagUrl = (country: string | null) => {
  if (!country) return "https://flagcdn.com/w20/xx.png";
  
  // Country code mapping for better flag display
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
    // Add more as needed
  };
  
  const code = countryCodeMap[country] || country.toLowerCase().substring(0, 2);
  return `https://flagcdn.com/w20/${code}.png`;
};

// Generate star rating
const renderStarRating = (rating: number | null) => {
  if (!rating) return null;
  const stars = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
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
  <div className="flex-shrink-0 w-[300px] md:w-[320px] h-[380px] bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-4 animate-pulse">
    <div className="w-full h-48 bg-gray-700/50 rounded-2xl mb-4"></div>
    <div className="space-y-3">
      <div className="h-6 bg-gray-700/50 rounded-lg w-3/4"></div>
      <div className="h-4 bg-gray-700/50 rounded-lg w-1/2"></div>
      <div className="h-4 bg-gray-700/50 rounded-lg w-2/3"></div>
    </div>
  </div>
);

export default function StartupSection() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.645, 0.045, 0.355, 1]
      } 
    },
  };

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

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
          .limit(3);

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

  useEffect(() => {
    checkScrollButtons();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons);
      return () => scrollElement.removeEventListener('scroll', checkScrollButtons);
    }
  }, [startups]);

  return (
    <section className="relative bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900 w-full py-12 md:py-16 overflow-hidden">
      {/* Enhanced CSS */}
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .premium-card {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .glow-effect {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
        }

        .hover-glow:hover {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.2);
        }

        .shine-text {
          background: linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #a855f7 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s ease-in-out infinite;
        }

        @keyframes shine {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }

        .scroll-container {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .scroll-container::-webkit-scrollbar {
          display: none;
        }

        .card-hover-effect {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .card-hover-effect:hover {
          transform: translateY(-8px) scale(1.02);
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
        }

        .pulse-glow-animation {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-purple-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-pink-600/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Top Startups
              </h2>
              <p className="text-gray-400 text-sm md:text-base mt-1">
                Discover the next unicorns shaping tomorrow
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Desktop scroll buttons */}
            <div className="hidden md:flex items-center gap-2">
              <motion.button
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  canScrollLeft 
                    ? 'border-purple-500 hover:bg-purple-500/20 text-purple-400' 
                    : 'border-gray-700 text-gray-600 cursor-not-allowed'
                }`}
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                whileHover={{ scale: canScrollLeft ? 1.1 : 1 }}
                whileTap={{ scale: canScrollLeft ? 0.95 : 1 }}
              >
                <ArrowRightIcon className="w-5 h-5 rotate-180" />
              </motion.button>
              <motion.button
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  canScrollRight 
                    ? 'border-purple-500 hover:bg-purple-500/20 text-purple-400' 
                    : 'border-gray-700 text-gray-600 cursor-not-allowed'
                }`}
                onClick={scrollRight}
                disabled={!canScrollRight}
                whileHover={{ scale: canScrollRight ? 1.1 : 1 }}
                whileTap={{ scale: canScrollRight ? 0.95 : 1 }}
              >
                <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
            </div>

            {/* View All Button */}
            <Link href="/allstartup">
              <motion.div 
                className="group w-12 h-12 border-2 border-purple-500/50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-purple-500/20 hover:border-purple-500 glow-effect"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRightIcon className="w-6 h-6 text-purple-400 transition-all duration-300 group-hover:text-purple-300" />
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-container pb-4"
          >
            {[...Array(4)].map((_, i) => (
              <StartupCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Startup Cards Container */}
        {!loading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scroll-container pb-4"
              onScroll={checkScrollButtons}
            >
              <AnimatePresence>
                {startups.map((startup, index) => (
                  <motion.div
                    key={startup.id}
                    variants={cardVariants}
                    className="flex-shrink-0 w-[300px]"
                  >
                    <Link href={`/startup/${startup.id}`}>
                      <div className="group glass-card rounded-3xl p-5 card-hover-effect hover-glow h-[380px] flex flex-col">
                        {/* Image Container */}
                        <div className="relative w-full h-48 mb-4 overflow-hidden rounded-2xl">
                          <Image
                            src={getAbsoluteUrl(startup.thumbnail_url)}
                            alt={startup.startup_name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          
                          {/* Overlay Effects */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Top Badge */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            {startup.is_incubation && (
                              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 pulse-glow-animation">
                                <Crown className="w-3 h-3" />
                                {startup.incubator_accelerator_name || "Incubated"}
                              </span>
                            )}
                            {index === 0 && (
                              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                #1
                              </span>
                            )}
                          </div>

                          {/* Rating Badge */}
                          {startup.rating && (
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                              {renderStarRating(startup.rating)}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-white font-bold text-xl mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors duration-300">
                              {startup.startup_name}
                            </h3>
                            
                            <div className="flex items-center gap-2 text-gray-400 mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <Image
                                  src={getFlagUrl(startup.country)}
                                  alt={`${startup.country} flag`}
                                  width={16}
                                  height={12}
                                  className="rounded-sm"
                                />
                                <span className="text-sm">
                                  {startup.country || "Global"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Area */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-800 group-hover:border-purple-800 transition-colors duration-300">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">
                              View Details
                            </span>
                            <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300">
                              <ArrowRightIcon className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors duration-300" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {/* Premium CTA Card */}
                <motion.div
                  variants={cardVariants}
                  className="flex-shrink-0 w-[300px] md:w-auto md:flex-shrink"
                >
                  <div className="premium-card rounded-3xl p-6 card-hover-effect h-[380px] flex flex-col items-center justify-center text-center gap-6 pulse-glow-animation">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-2">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-white text-2xl font-bold mb-2">
                        <span className="shine-text">Discover More</span>
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Unlock premium features and get access to exclusive startup insights, detailed analytics, and investment opportunities.
                      </p>
                    </div>
                    
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-3 text-base font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/25">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Premium
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Mobile Scroll Indicator */}
        <div className="md:hidden flex justify-center mt-6 gap-2">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Scroll horizontally to explore more
          </div>
        </div>
      </div>
    </section>
  );
}