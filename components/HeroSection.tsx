"use client"

import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useState } from "react" // Import useState for dot slider

export default function HeroSection() {
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0) // State for dot slider

  // Variants for text and elements animation
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

  // Dummy graph images (these won't be displayed on mobile/tablet, but kept for consistency)
  const graphImages = [
    "https://placehold.co/594x395/000a18/ffffff?text=Graph+1",
    "https://placehold.co/594x395/000a18/ffffff?text=Graph+2",
    "https://placehold.co/594x395/000a18/ffffff?text=Graph+3",
    "https://placehold.co/594x395/000a18/ffffff?text=Graph+4",
  ]

  return (
    <section id="home" className="relative h-screen min-h-screen flex flex-col justify-center overflow-hidden pt-[130px] pb-[0px]">
      {/* Embedded CSS for the shine effect on "Unicorns." text and "Capacity Building" */}
      <style jsx>{`
        .shine-text {
          background: linear-gradient(
            90deg,
            #a020f0 0%, /* Purple */
            #ff00ff 25%, /* Magenta */
            #a020f0 50%, /* Purple */
            #ff00ff 75%, /* Magenta */
            #a020f0 100% /* Purple */
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
          backgroundImage: "url('/hero1.png')", // Your background image path
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-70"></div> {/* Dark overlay */}
      </div>

      {/* Main content container with two-column layout */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-start justify-between h-full py-16 md:py-0">
        {/* Left Column: Text and Search elements */}
        <motion.div
          className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 md:space-y-12 w-full md:w-1/2 lg:w-[65%] mt-16 md:mt-0" // Adjusted for full width on smaller screens
          style={{ width: '712px', height: '213px' }} // Set fixed width and height for this section
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
                className="h-12 md:h-14 px-6 md:px-8 py-3 md:py-4 bg-[#8700ff] rounded-full text-base md:text-lg hover:bg-[#7300dd] transition-all duration-300 shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#8700ff] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Startups
              </Button>
              <Button
                variant="outline"
                className="h-12 md:h-14 px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ fontFamily: "Poppins, sans-serif" }}
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
            <div className="relative flex items-center w-full mt-4 pt-[20px]">
              <Input
                type="text"
                placeholder="Search for startups..."
                className="h-12 md:h-14 pl-12 pr-4 py-3 md:py-4 rounded-full text-base md:text-lg bg-gray-800 text-gray-100 border border-purple-700 focus:border-[#8700ff] focus:ring-0 transition-all duration-300 shadow-lg w-full"
                style={{ fontFamily: "Poppins, sans-serif" }}
              />
              <SearchIcon className="absolute left-4 h-5 w-5 md:h-6 md:w-6 text-gray-400" />
              {/* Button with solid white circle icon */}
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
              >
                Search
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Graph Image and Slider - Hidden on md (tablet) and smaller screens */}
        <motion.div
          className="hidden md:flex flex-col justify-center items-center mt-12 md:mt-0 pr-2 flex-shrink-0 lg:w-auto" // Added 'hidden md:flex'
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