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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.645, 0.045, 0.355, 1],
        type: "spring",
        stiffness: 100
      }
    },
  };

  const mobileButtonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.3 }
    }
  };

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
      {/* Enhanced CSS for animations and effects */}
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

        .shine-text-slow {
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
          animation: shine 6s ease-in-out infinite;
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

        .floating-animation {
          animation: floating 6s ease-in-out infinite;
        }

        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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

      {/* Enhanced Background with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: "url('/hero1.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/30 to-black/90"></div>
        {/* Animated particles effect */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full mobile-hero-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 py-8 lg:py-16">
            
            {/* Left Column: Enhanced Text and Search */}
            <motion.div
              className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[60%] space-y-6 lg:space-y-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {/* Enhanced Main Heading */}
              <motion.div className="space-y-3 lg:space-y-4" variants={itemVariants}>
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
                  <motion.span
                    className="block"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    Where Global Angels
                  </motion.span>
                  <motion.span
                    className="block"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    Discovers Tomorrow's
                  </motion.span>
                  <motion.span
                    className="shine-text block"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9, duration: 1, type: "spring" }}
                  >
                    Unicorns.
                  </motion.span>
                </h1>

                {/* Enhanced Subheading */}
                <motion.p
                  className="font-light text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "clamp(1rem, 3vw, 1.25rem)"
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                >
                  Stream stories, join events, invest in ideas – be part of the startup movement that's shaping the future.
                </motion.p>
              </motion.div>

              {/* Enhanced Category Selection */}
              <motion.div
                className="w-full max-w-4xl"
                variants={itemVariants}
              >
                {/* Mobile Category Selector */}
                <div className="block sm:hidden mb-6">
                  <motion.button
                    className="glass-morphism w-full p-4 rounded-2xl flex items-center justify-between text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">
                      {categoryButtons.find(btn => btn.active)?.label || 'Select Category'}
                    </span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${
                      isMobileMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {isMobileMenuOpen && (
                      <motion.div
                        className="glass-morphism mt-2 rounded-2xl overflow-hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {categoryButtons.map((button, index) => (
                          <motion.button
                            key={button.id}
                            className={`w-full p-4 text-left border-b border-white/10 last:border-b-0 transition-colors duration-200 ${
                              button.active ? 'bg-purple-600/30 text-purple-300' : 'text-white hover:bg-white/10'
                            }`}
                            variants={mobileButtonVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            custom={index}
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
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop Category Buttons */}
                <div className="hidden sm:flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  {categoryButtons.map((button, index) => (
                    <motion.div
                      key={button.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 + index * 0.1, duration: 0.6 }}
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
                    </motion.div>
                  ))}
                </div>

                {/* Enhanced Search Input */}
                <motion.div
                  className="relative w-full"
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.8 }}
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

                  {/* Enhanced Search Dropdown */}
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
                            <motion.div
                              key={item.id}
                              className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/10 transition-all duration-200 border-b border-white/5 last:border-b-0"
                              onClick={() => handleSelectResult(item.id)}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ x: 5 }}
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
                            </motion.div>
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
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column: Dynamic Graph Section - Desktop Only */}
            <motion.div
              className="hidden lg:flex flex-col items-center w-full lg:w-[40%] floating-animation"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 1,
                ease: [0.645, 0.045, 0.355, 1],
                delay: 0.5
              }}
              viewport={{ once: true, amount: 0.5 }}
            >
              {/* Enhanced Heading */}
              <motion.h2
                className="text-gray-100 text-lg lg:text-xl font-semibold mb-6 text-center leading-tight"
                style={{ fontFamily: "Poppins, sans-serif" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                The Global Symphony of{" "}
                <span className="shine-text-slow">Capacity Building</span>
              </motion.h2>

              {/* Dynamic Graph Container */}
              <motion.div
                className="relative group w-full max-w-[590px] h-auto aspect-[590/390] rounded-3xl shadow-2xl border border-purple-500/30 object-cover transition-all duration-500 p-4 glass-morphism"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                
                {/* The dynamically loaded chart component */}
                <DynamicGraph currentGraphIndex={currentGraphIndex} />

              </motion.div>

              {/* Enhanced Dot Slider */}
              <div className="flex justify-center mt-8 space-x-3">
                {graphTitles.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentGraphIndex === index
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 scale-125 shadow-lg"
                        : "bg-gray-600 hover:bg-gray-400 hover:scale-110"
                    }`}
                    onClick={() => setCurrentGraphIndex(index)}
                    aria-label={`Go to graph ${index + 1}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}