"use client"

import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaselib"

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

export default function HeroSection() {
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0)
  const [activeSearch, setActiveSearch] = useState<'startup' | 'incubation' | null>('startup')
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Startup[] | Incubation[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const graphImages = [
    "https://placehold.co/594x395/000a18/ffffff?text=Graph+1",
    "https://placehold.co/594x395/000a18/ffffff?text=Graph+2",
    "https://placehold.co/594x395/000a18/ffffff?text=Graph+3",
    "https://placehold.co/594x395/000a18/ffffff?text=Graph+4",
  ]

  // Fixed: The function now constructs the public URL using the Supabase URL from environment variables
  const getPublicImageUrl = (path: string | undefined) => {
    if (!path) return undefined
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not defined')
      return undefined
    }
    // Remove the leading '/storage/v1/object/public' part as the base URL already includes this.
    const relativePath = path.replace('/storage/v1/object/public', '')
    return `${supabaseUrl}/storage/v1/object/public${relativePath}`
  }

  // Search function to query Supabase for startups
  const searchStartups = async (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }
    const { data, error } = await supabase
      .from('creator')
      .select('id, startup_name, logo_url')
      .ilike('startup_name', `%${query}%`)
      .limit(10)

    if (error) {
      console.error("Error searching startups:", error.message)
      setSearchResults([])
      return
    }

    // Map over the data to get the public URL for each logo
    const startupsWithUrls = data.map(startup => ({
      ...startup,
      logo_url: getPublicImageUrl(startup.logo_url)
    }))

    setSearchResults(startupsWithUrls || [])
    setShowDropdown((startupsWithUrls?.length || 0) > 0)
    setActiveSearch('startup')
  }

  // Search function to query Supabase for incubations
  const searchIncubations = async (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }
    // Fixed: Changed column to `incubator_accelerator_name`
    const { data, error } = await supabase
      .from('incubation')
      .select('id, incubator_accelerator_name, logo_url')
      .ilike('incubator_accelerator_name', `%${query}%`)
      .limit(10)

    if (error) {
      console.error("Error searching incubations:", error.message)
      setSearchResults([])
      return
    }

    // Map over the data to get the public URL for each logo
    const incubationsWithUrls = data.map(incubation => ({
      ...incubation,
      logo_url: getPublicImageUrl(incubation.logo_url)
    }))

    setSearchResults(incubationsWithUrls || [])
    setShowDropdown((incubationsWithUrls?.length || 0) > 0)
    setActiveSearch('incubation')
  }

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
    setSearchTerm(e.target.value)
  }

  const handleSelectResult = (id: string) => {
    if (activeSearch === 'startup') {
      router.push(`/startup/${id}`)
    } else if (activeSearch === 'incubation') {
      router.push(`/incubation-dashboard/${id}`)
    }
    setShowDropdown(false)
    setSearchTerm("")
    setActiveSearch(null)
  }

  const handleSearchSubmit = () => {
    if (searchResults.length > 0) {
      handleSelectResult(searchResults[0].id)
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  return (
    <section id="home" className="relative h-screen min-h-screen flex flex-col justify-center overflow-hidden pt-[130px] pb-[0px]">
      {/* Embedded CSS for the shine effect on "Unicorns." text and "Capacity Building" */}
      <style jsx>{`
        .shine-text {
          background: linear-gradient(
            90deg,
            #a020f0 0%,
            #ff00ff 25%,
            #a020f0 50%,
            #ff00ff 75%,
            #a020f0 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 8s linear infinite;
        }

        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
      `}</style>

      {/* Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 h-full bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: "url('/hero1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div>
      </div>

      {/* Main content container with two-column layout */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-start justify-between h-full py-16 md:py-0">
        {/* Left Column: Text and Search elements */}
        <motion.div
          className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 md:space-y-12 w-full md:w-1/2 lg:w-[65%] mt-16 md:mt-0"
          style={{ width: '712px', height: '213px' }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* Main Heading */}
          <motion.div className="space-y-2 md:space-y-4" variants={itemVariants}>
            <h1
              className="font-semibold text-gray-100 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight [text-shadow:0px_4px_10px_rgba(0,0,0,0.3)]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <span className="block">Where Global Angels</span>
              <span className="block">Discovers Tomorrow's</span>
              <span
                className="shine-text block"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Unicorns.
              </span>
            </h1>

            {/* Subheading */}
            <p
              className="font-light text-gray-300 text-lg md:text-xl lg:text-2xl mx-auto md:mx-0 leading-relaxed"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <span className="block">Stream stories, join events, invest in ideas – be part</span>
              <span className="block">of the startup movement.</span>
            </p>
          </motion.div>

          {/* CTA Buttons and Search Input */}
          <motion.div variants={itemVariants} className="flex flex-col space-y-4 w-full max-w-2xl pt-[50px]">
            {/* Buttons Row: "Startups", "Incubations", "Startup Events", "Mentor" */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:flex-nowrap">
              <Button
                className={`h-12 md:h-14 px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${activeSearch === 'startup' ? 'bg-[#8700ff] hover:bg-[#7300dd] focus-visible:ring-[#8700ff]' : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'}`}
                style={{ fontFamily: "Poppins, sans-serif" }}
                onClick={() => {
                  setActiveSearch('startup');
                  setSearchTerm('');
                  setShowDropdown(false);
                }}
              >
                Startups
              </Button>
              <Button
                className={`h-12 md:h-14 px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${activeSearch === 'incubation' ? 'bg-[#8700ff] hover:bg-[#7300dd] focus-visible:ring-[#8700ff]' : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'}`}
                style={{ fontFamily: "Poppins, sans-serif" }}
                onClick={() => {
                  setActiveSearch('incubation');
                  setSearchTerm('');
                  setShowDropdown(false);
                }}
              >
                Incubations
              </Button>
              <Button
                variant="outline"
                className="h-12 md:h-14 px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Startup Events
              </Button>
              <Button
                variant="outline"
                className="h-12 md:h-14 px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Mentor
              </Button>
            </div>

            {/* Search Input with Search Icon and two buttons to its right */}
            <div className="relative flex items-center w-full mt-4 pt-[20px]" ref={dropdownRef}>
              <Input
                type="text"
                placeholder={`Search for ${activeSearch || 'startups'}...`}
                className="h-12 md:h-14 pl-12 pr-4 py-3 md:py-4 rounded-full text-base md:text-lg bg-gray-800 text-gray-100 border border-purple-700 focus:border-[#8700ff] focus:ring-0 transition-all duration-300 shadow-lg w-full"
                style={{ fontFamily: "Poppins, sans-serif" }}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
              />
              <SearchIcon className="absolute left-4 h-5 w-5 md:h-6 md:w-6 text-gray-400" />
              
              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => handleSelectResult(item.id)}
                      >
                        {item.logo_url && (
                          <img 
                            src={item.logo_url} 
                            alt={`${
                              'startup_name' in item
                                ? item.startup_name
                                : 'incubator_accelerator_name' in item
                                  ? item.incubator_accelerator_name
                                  : 'logo'
                            } logo`} 
                            className="w-8 h-8 rounded-full object-cover" 
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
                    <div className="px-4 py-3 text-gray-400 text-center">
                      No {activeSearch || 'startups'} found.
                    </div>
                  )}
                </div>
              )}

              <Button
                className="ml-2 h-12 md:h-14 w-12 md:w-14 p-0 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <img
                  src="uploaded:image_ac1e28.png-1441e491-2f3d-4f92-a7d4-918a8c9eb29d"
                  alt="Solid White Circle"
                  className="w-6 h-6"
                />
              </Button>
              <Button
                className="ml-2 h-12 md:h-14 px-4 py-3 md:py-4 bg-[#8700ff] rounded-full text-base md:text-lg hover:bg-[#7300dd] transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontFamily: "Poppins, sans-serif" }}
                onClick={handleSearchSubmit}
              >
                Search
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Graph Image and Slider - Hidden on md (tablet) and smaller screens */}
        <motion.div
          className="hidden md:flex flex-col justify-center items-center mt-12 md:mt-0 pr-2 flex-shrink-0 lg:w-auto"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* Heading above the graph */}
          <h2 className="text-gray-100 text-lg font-semibold mb-4 text-center w-[440px] h-[20px] flex items-center justify-center" style={{ fontFamily: "Poppins, sans-serif" }}>
            The Global Symphony of <span className="shine-text ml-1">Capacity Building</span>
          </h2>

          {/* Graph Image */}
          <img
            src={graphImages[currentGraphIndex]}
            alt="The Global Symphony of Capacity Building Graph"
            className="w-[590px] h-[390px] rounded-[2rem] shadow-2xl border border-gray-700 object-cover"
          />

          {/* Dot Slider */}
          <div className="flex justify-center mt-6 space-x-[9px] w-[84px] h-[8px] mx-auto">
            {graphImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentGraphIndex === index ? "bg-[#8700ff] scale-125" : "bg-gray-600 hover:bg-gray-400"
                }`}
                onClick={() => setCurrentGraphIndex(index)}
                aria-label={`Go to graph ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}