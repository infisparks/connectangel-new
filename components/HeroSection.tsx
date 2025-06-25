"use client"

import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import ParticleEffect from "./particle-effect"
import { useIsMobile } from "@/hooks/use-is-mobile" // Import the new hook

export default function HeroSection() {
  const [isSearching, setIsSearching] = useState(false)
  const isMobile = useIsMobile() // Use the hook

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

  // Variants for the floating background shapes
  const shapeVariants = {
    animate: (i: number) => ({
      y: [0, i % 2 === 0 ? 20 : -20, 0], // Float up/down
      x: [0, i % 2 === 0 ? -10 : 10, 0], // Float left/right
      scale: [1, 1.05, 1], // Subtle pulse
      opacity: [0.5, 0.7, 0.5], // Opacity change
      transition: {
        duration: 8 + i * 2, // Vary duration
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      },
    }),
  }

  return (
    <section id="home" className="relative h-screen min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Embedded CSS for shine effect */}
     

      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 h-full bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: "url('/hero1.png')", // Your background image path
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div> {/* Dark overlay */}
      </div>

      {/* Animated Background Shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-purple-500/20"
        style={{ filter: "blur(80px)" }}
        variants={shapeVariants}
        custom={0}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/20"
        style={{ filter: "blur(80px)" }}
        variants={shapeVariants}
        custom={1}
        animate="animate"
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-pink-500/15"
        style={{ filter: "blur(90px)" }}
        variants={shapeVariants}
        custom={2}
        animate="animate"
      />

      {/* AI Particle Effect */}
      <ParticleEffect />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center text-center space-y-8 md:space-y-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible" // Scroll animation trigger
          viewport={{ once: true, amount: 0.5 }} // Trigger when 50% in view, only once
        >
          {/* Logo only on mobile */}
          {isMobile && (
            <motion.img
              src="/img/logo.png" // Replace with your logo path
              alt="Company Logo"
              className="w-44 h-44 md:w-32 md:h-32 object-contain mb-4"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: [0, -10, 0] }} // Bounce animation on mobile
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeInOut" }}
            />
          )}

          {/* Badge */}
          <motion.div
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-900/30 rounded-full border border-purple-700 transition-all duration-300 ease-in-out hover:shadow-lg"
            variants={itemVariants}
          >
            <span
              className="font-normal text-purple-400 text-sm md:text-base"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {"🔥 Start. Grow. Belong. 🔥"}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div className="space-y-4 md:space-y-6 max-w-4xl" variants={itemVariants}>
            <h1
              className="font-semibold text-gray-100 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight [text-shadow:0px_4px_10px_rgba(0,0,0,0.3)]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Fresh Minds, <br className="hidden sm:block" />
              <span
                className="shine-text" // Applied the new class here
                style={{ fontFamily: "Poppins, sans-serif" }} // Keep font family
              >
                Fierce Missions
              </span>
              , <br className="sm:hidden" />
              All in One Place.
            </h1>

            <p
              className="font-light text-gray-300 text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Submit your startup, find the right opportunities, and get discovered by the right people.
            </p>
          </motion.div>

          {/* CTA Button / Search Input */}
          <motion.div variants={itemVariants} layout>
            <AnimatePresence mode="wait">
              {!isSearching ? (
                <motion.div
                  key="searchButton"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <Button
                    onClick={() => setIsSearching(true)}
                    className="h-12 md:h-14 px-6 md:px-8 py-3 md:py-4 bg-[#8700ff] rounded-full text-base md:text-lg hover:bg-[#7300dd] transition-all duration-300 shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#8700ff] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Search Startup
                    <SearchIcon className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="searchInput"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className="relative flex items-center w-full max-w-md"
                >
                  <Input
                    type="text"
                    placeholder="Search for startups..."
                    className="h-12 md:h-14 pl-12 pr-4 py-3 md:py-4 rounded-full text-base md:text-lg bg-gray-800 text-gray-100 border border-purple-700 focus:border-[#8700ff] focus:ring-0 transition-all duration-300 shadow-lg w-full"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsSearching(false)
                      }
                    }}
                  />
                  <SearchIcon className="absolute left-4 h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
