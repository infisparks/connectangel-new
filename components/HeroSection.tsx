// components/HeroSection.tsx
"use client"

import { SearchIcon, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaselib"
import dynamic from 'next/dynamic';

// Use a dynamic import for the chart component to prevent server-side rendering
const DynamicGraph = dynamic(() => import('./DynamicGraph'), { ssr: false });

// Define a type for the startup object
interface Startup {
  id: string
  startup_name: string
  logo_url?: string
}

// Define a type for the incubation object
interface Incubation {
  id: string
  incubator_accelerator_name: string
  logo_url?: string
}

const graphTitles = [
  "Quarterly Startup Creation vs. Incubation",
  "Monthly Funding Rounds and Events",
  "Projects and Mentors by Sector",
  "Global Startup Ecosystem Growth",
];

export default function HeroSection() {
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0);
  const [activeSearch, setActiveSearch] = useState<'startup' | 'incubation' | null>('startup');
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Startup[] | Incubation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-rotate graphs
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGraphIndex((prev) => (prev + 1) % graphTitles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getPublicImageUrl = (path: string | undefined) => {
    if (!path) return undefined;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
      return undefined;
    }
    const relativePath = path.replace('/storage/v1/object/public', '');
    return `${supabaseUrl}/storage/v1/object/public${relativePath}`;
  };

  const searchStartups = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    const { data, error } = await supabase
      .from('creator')
      .select('id, startup_name, logo_url')
      .ilike('startup_name', `%${query}%`)
      .limit(10);

    if (error) {
      console.error("Error searching startups:", error.message);
      setSearchResults([]);
      return;
    }

    const startupsWithUrls = data.map(startup => ({
      ...startup,
      logo_url: getPublicImageUrl(startup.logo_url)
    }));

    setSearchResults(startupsWithUrls || []);
    setShowDropdown((startupsWithUrls?.length || 0) > 0);
    setActiveSearch('startup');
  };

  const searchIncubations = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    const { data, error } = await supabase
      .from('incubation')
      .select('id, incubator_accelerator_name, logo_url')
      .ilike('incubator_accelerator_name', `%${query}%`)
      .limit(10);

    if (error) {
      console.error("Error searching incubations:", error.message);
      setSearchResults([]);
      return;
    }

    const incubationsWithUrls = data.map(incubation => ({
      ...incubation,
      logo_url: getPublicImageUrl(incubation.logo_url)
    }));

    setSearchResults(incubationsWithUrls || []);
    setShowDropdown((incubationsWithUrls?.length || 0) > 0);
    setActiveSearch('incubation');
  };

  useEffect(() => {
    if (searchTerm.length >= 2) {
      if (activeSearch === 'startup') {
        searchStartups(searchTerm);
      } else if (activeSearch === 'incubation') {
        searchIncubations(searchTerm);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [searchTerm, activeSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectResult = (id: string) => {
    if (activeSearch === 'startup') {
      router.push(`/startup/${id}`);
    } else if (activeSearch === 'incubation') {
      router.push(`/incubation-dashboard/${id}`);
    }
    setShowDropdown(false);
    setSearchTerm("");
    setActiveSearch(null);
  };

  const handleSearchSubmit = () => {
    if (searchResults.length > 0) {
      handleSelectResult(searchResults[0].id);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const categoryButtons = [
    { id: 'startup', label: 'Startups', active: activeSearch === 'startup' },
    { id: 'incubation', label: 'Incubations', active: activeSearch === 'incubation' },
    { id: 'events', label: 'Startup Events', active: false },
    { id: 'mentor', label: 'Mentor', active: false },
  ];

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <style jsx>{`
        .shine-text {
          background: linear-gradient(
            90deg,
            #a020f0 0%,
            #ff00ff 25%,
            #00d4ff 50%,
            #ff00ff 75%,
            #a020f0 100%
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s ease-in-out infinite;
        }

        @keyframes shine {
          0%, 100% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
        }

        .glass-morphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(135, 0, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(135, 0, 255, 0.6); }
        }

        @media (max-width: 768px) {
          .mobile-hero-padding {
            padding-top: max(env(safe-area-inset-top), 80px);
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>

      {/* Background with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: "url('/hero1.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/30 to-black/90"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full mobile-hero-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 py-8 lg:py-16">
            
            {/* Left Column: Text and Search */}
            <div
              className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[60%] space-y-6 lg:space-y-8"
            >
              {/* Main Heading */}
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mr-2 animate-pulse" />
                  <span className="text-purple-300 text-sm sm:text-base font-medium tracking-wider uppercase">
                    Discover Tomorrow
                  </span>
                </div>
                
                <h1
                  className="font-bold text-white leading-tight"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "clamp(1.75rem, 8vw, 4rem)",
                    lineHeight: "1.1"
                  }}
                >
                  <span
                    className="block"
                  >
                    Where Global Angels
                  </span>
                  <span
                    className="block"
                  >
                    Discovers Tomorrow's
                  </span>
                  <span
                    className="shine-text block"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Unicorns.
                  </span>
                </h1>

                {/* Subheading */}
                <p
                  className="font-light text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "clamp(1rem, 3vw, 1.25rem)"
                  }}
                >
                  Stream stories, join events, invest in ideas – be part of the startup movement that's shaping the future.
                </p>
              </div>

              {/* Category Selection */}
              <div
                className="w-full max-w-4xl"
              >
                {/* Mobile Category Selector */}
                <div className="block sm:hidden mb-6">
                  <button
                    className="glass-morphism w-full p-4 rounded-2xl flex items-center justify-between text-white transition-all"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    <span className="font-medium">
                      {categoryButtons.find(btn => btn.active)?.label || 'Select Category'}
                    </span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${
                      isMobileMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  <AnimatePresence>
                    {isMobileMenuOpen && (
                      <motion.div
                        className="glass-morphism mt-2 rounded-2xl overflow-hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {categoryButtons.map((button) => (
                          <button
                            key={button.id}
                            className={`w-full p-4 text-left border-b border-white/10 last:border-b-0 transition-colors duration-200 ${
                              button.active ? 'bg-purple-600/30 text-purple-300' : 'text-white hover:bg-white/10'
                            }`}
                            onClick={() => {
                              if (button.id === 'startup' || button.id === 'incubation') {
                                setActiveSearch(button.id as 'startup' | 'incubation');
                              }
                              setSearchTerm('');
                              setShowDropdown(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            {button.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop Category Buttons */}
                <div className="hidden sm:flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  {categoryButtons.map((button) => (
                    <div
                      key={button.id}
                    >
                      <Button
                        className={`px-6 py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 transform hover:scale-105 ${
                          button.active
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg pulse-glow'
                            : 'glass-morphism text-white hover:bg-white/20'
                        }`}
                        style={{ fontFamily: "Poppins, sans-serif" }}
                        onClick={() => {
                          if (button.id === 'startup' || button.id === 'incubation') {
                            setActiveSearch(button.id as 'startup' | 'incubation');
                          }
                          setSearchTerm('');
                          setShowDropdown(false);
                        }}
                      >
                        {button.label}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Search Input */}
                <div
                  className="relative w-full"
                  ref={dropdownRef}
                >
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder={`Search for ${activeSearch || 'startups'}...`}
                        className="glass-morphism h-14 pl-14 pr-4 rounded-2xl text-base text-white placeholder-gray-300 border border-purple-500/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 shadow-lg"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                      />
                      <SearchIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    </div>
                    
                    <Button
                      className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl text-base font-medium text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      onClick={handleSearchSubmit}
                    >
                      Search
                    </Button>
                  </div>

                  {/* Search Dropdown */}
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        className="absolute top-full left-0 mt-3 w-full max-h-80 overflow-y-auto glass-morphism rounded-2xl shadow-2xl z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {searchResults.length > 0 ? (
                          searchResults.map((item, index) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/10 transition-all duration-200 border-b border-white/5 last:border-b-0"
                              onClick={() => handleSelectResult(item.id)}
                            >
                              {item.logo_url && (
                                <img
                                  src={item.logo_url}
                                  alt={`Logo`}
                                  className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
                                />
                              )}
                              <span className="text-white font-medium">
                                {'startup_name' in item
                                  ? item.startup_name
                                  : 'incubator_accelerator_name' in item
                                    ? item.incubator_accelerator_name
                                    : ''}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="px-6 py-8 text-gray-400 text-center">
                            <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No {activeSearch || 'startups'} found.</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Graph Section - Desktop Only */}
            <div
              className="hidden lg:flex flex-col items-center w-full lg:w-[40%]"
            >
              {/* Heading */}
              <h2
                className="text-gray-100 text-lg lg:text-xl font-semibold mb-6 text-center leading-tight"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                The Global Symphony of{" "}
                <span className="shine-text">Capacity Building</span>
              </h2>

              {/* Dynamic Graph Container */}
              <div
                className="relative group w-full max-w-[590px] h-auto aspect-[590/390] rounded-3xl shadow-2xl border border-purple-500/30 object-cover transition-all duration-500 p-4 glass-morphism"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                
                {/* The dynamically loaded chart component */}
                <DynamicGraph currentGraphIndex={currentGraphIndex} />

              </div>

              {/* Dot Slider */}
              <div className="flex justify-center mt-8 space-x-3">
                {graphTitles.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentGraphIndex === index
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 scale-125 shadow-lg"
                        : "bg-gray-600 hover:bg-gray-400 hover:scale-110"
                    }`}
                    onClick={() => setCurrentGraphIndex(index)}
                    aria-label={`Go to graph ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}