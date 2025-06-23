"use client"

import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function HeroSection() {
  // Define animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Delay between each child animation
      },
    },
  }

  // Define animation variants for individual elements (fade in and slide up)
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <section id="home" className="pt-20 md:pt-32 pb-8 md:pb-16 bg-[#000A18]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center text-center space-y-8 md:space-y-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#b35dff33] rounded-full border border-[#b35dff] transition-all duration-300 ease-in-out hover:translate-y-[-5px] hover:shadow-xl"
            variants={itemVariants}
          >
            <span
              className="font-normal text-[#b35dff] text-sm md:text-base"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              🔥 Start. Grow. Belong. 🔥
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div className="space-y-4 md:space-y-6 max-w-4xl" variants={itemVariants}>
            <h1
              className="font-semibold text-[#dddddd] text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight [text-shadow:0px_4px_10px_rgba(0,0,0,0.3)]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Fresh Minds, <br className="hidden sm:block" />
              <span
                style={{
                  background: "linear-gradient(90deg, #8700ff, #b35dff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Fierce Missions
              </span>
              , <br className="sm:hidden" />
              All in One Place.
            </h1>

            <p
              className="font-light text-[#dddddd] text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Submit your startup, find the right opportunities, and get discovered by the right people.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <Button
              className="h-12 md:h-14 px-6 md:px-8 py-3 md:py-4 bg-[#8700ff] rounded-full text-base md:text-lg hover:bg-[#7300dd] transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
