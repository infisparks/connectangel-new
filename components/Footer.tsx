"use client"

import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram, ArrowUp } from "lucide-react"
import { useCallback } from "react"

// Define colors directly in the component for clarity
const PRIMARY_BG_COLOR = "#000A18"
const TEXT_COLOR = "text-white"
const ACCENT_PURPLE = "text-purple-400"
const BORDER_COLOR = "bg-white/20"
const HOVER_BG_COLOR = "hover:bg-gray-800"

const navLinks = [
  { title: "Home", href: "#home" },
  { title: "About Us", href: "#about" },
  { title: "Contact Us", href: "#contact" },

]

const legalLinks = [
  { title: "Privacy Policy", href: "#privacy" },
  { title: "Terms of Service", href: "#terms" },
  { title: "Cookies Settings", href: "#cookies" },
]

const socialLinks = [
  { icon: Facebook, href: "#facebook", label: "Facebook" },
  { icon: Twitter, href: "#twitter", label: "Twitter" },
  { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
  { icon: Instagram, href: "#instagram", label: "Instagram" },
]

export default function Footer() {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <footer
      className={`flex flex-col w-full items-center gap-16 md:gap-24 px-4 sm:px-6 lg:px-8 py-16 md:py-20 ${PRIMARY_BG_COLOR}`}
    >
      <div className="flex flex-col items-center gap-8 md:gap-12 max-w-6xl w-full">
        {/* Logo and Description */}
        <div className="flex flex-col items-center text-center gap-6">
          <Image
            src="/img/logo.png" // Using placeholder for logo
            alt="ConnectAngels Logo"
            width={146}
            height={114}
            className="w-24 h-[75px] md:w-[146px] md:h-[114px] object-contain"
          />
          <p className={`text-lg md:text-xl leading-relaxed max-w-2xl ${TEXT_COLOR}`}>
            ConnectAngelsOTT connects founders, incubators, and investors across regions to drive innovation and growth.
          </p>
        </div>

        {/* Navigation and Social Media */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 w-full text-center sm:text-left">
          {/* Sitemap / Main Navigation */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <h3 className={`text-xl font-semibold mb-2 ${TEXT_COLOR}`}>Sitemap</h3>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className={`font-normal text-base md:text-lg leading-tight ${TEXT_COLOR} hover:${ACCENT_PURPLE} transition-colors duration-200`}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <h3 className={`text-xl font-semibold mb-2 ${TEXT_COLOR}`}>Legal</h3>
            <div className="flex flex-col gap-3">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className={`font-normal text-base md:text-lg leading-tight ${TEXT_COLOR} hover:${ACCENT_PURPLE} transition-colors duration-200`}
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center sm:items-start gap-4">
            <h3 className={`text-xl font-semibold mb-2 ${TEXT_COLOR}`}>Connect With Us</h3>
            <div className="flex gap-6">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  aria-label={link.label}
                  className={`p-2 rounded-full ${TEXT_COLOR} ${HOVER_BG_COLOR} transition-colors duration-200`}
                >
                  <link.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-6xl">
        <Separator className={`w-full h-px ${BORDER_COLOR}`} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
          <p className={`font-normal text-base md:text-lg leading-relaxed text-center md:text-left ${TEXT_COLOR}`}>
            © 2025 ConnectAngels. All rights reserved.
          </p>

          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${TEXT_COLOR} border border-gray-700 ${HOVER_BG_COLOR} transition-colors duration-200 text-base md:text-lg font-medium`}
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
            Back to Top
          </button>
        </div>
      </div>
    </footer>
  )
}
