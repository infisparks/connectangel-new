"use client"

import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram, ArrowUp, Mail, Phone, MapPin } from "lucide-react"
import { useCallback } from "react"

// Professional color scheme
const PRIMARY_BG_COLOR = "#0F172A" // Darker, more sophisticated
const SECONDARY_BG_COLOR = "#1E293B"
const TEXT_COLOR = "text-slate-100"
const MUTED_TEXT_COLOR = "text-slate-400"
const ACCENT_COLOR = "text-blue-400"
const HOVER_ACCENT_COLOR = "hover:text-blue-300"
const BORDER_COLOR = "border-slate-700"
const HOVER_BG_COLOR = "hover:bg-slate-800/50"
const BUTTON_BG_COLOR = "bg-gradient-to-r from-blue-600 to-purple-600"
const BUTTON_HOVER_COLOR = "hover:from-blue-500 hover:to-purple-500"

const navLinks = [
  { title: "Home", href: "#home" },
  { title: "About Us", href: "#about" },
  { title: "Services", href: "#services" },
  { title: "Portfolio", href: "#portfolio" },
  { title: "Contact Us", href: "#contact" },
]

const legalLinks = [
  { title: "Privacy Policy", href: "#privacy" },
  { title: "Terms of Service", href: "#terms" },
  { title: "Cookie Policy", href: "#cookies" },
  { title: "Disclaimer", href: "#disclaimer" },
]

const contactInfo = [
  { icon: Mail, text: "hello@connectangelsott.com", href: "mailto:hello@connectangelsott.com" },
  { icon: Phone, text: "+1 (555) 123-4567", href: "tel:+15551234567" },
  { icon: MapPin, text: "Mumbai, Maharashtra, India", href: "#location" },
]

const socialLinks = [
  { 
    icon: Facebook, 
    href: "https://facebook.com/connectangelsott", 
    label: "Facebook",
    hoverColor: "hover:text-blue-500"
  },
  { 
    icon: Twitter, 
    href: "https://twitter.com/connectangelsott", 
    label: "Twitter",
    hoverColor: "hover:text-sky-400"
  },
  { 
    icon: Linkedin, 
    href: "https://linkedin.com/company/connectangelsott", 
    label: "LinkedIn",
    hoverColor: "hover:text-blue-600"
  },
  { 
    icon: Instagram, 
    href: "https://instagram.com/connectangelsott", 
    label: "Instagram",
    hoverColor: "hover:text-pink-500"
  },
]

export default function Footer() {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <footer className={`relative ${PRIMARY_BG_COLOR} border-t ${BORDER_COLOR}`}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none" />
      
      <div className="relative">
        {/* Main footer content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Company info - spans 4 columns on large screens */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex flex-col items-start space-y-4">
                <Image
                  src="/img/logo.png"
                  alt="ConnectAngels Logo"
                  width={160}
                  height={64}
                  className="h-12 w-auto object-contain"
                />
                <p className={`text-lg leading-relaxed ${MUTED_TEXT_COLOR} max-w-md`}>
                  Bridging the gap between visionary founders, innovative incubators, and strategic investors to fuel the next generation of breakthrough startups.
                </p>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-3">
                {contactInfo.map((contact, index) => (
                  <Link
                    key={index}
                    href={contact.href}
                    className={`flex items-center gap-3 text-sm ${MUTED_TEXT_COLOR} ${HOVER_ACCENT_COLOR} transition-colors duration-200 group`}
                  >
                    <contact.icon className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <span>{contact.text}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Navigation Links - spans 3 columns */}
            <div className="lg:col-span-3">
              <h3 className={`text-lg font-semibold mb-6 ${TEXT_COLOR} relative`}>
                Quick Links
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mt-2"></div>
              </h3>
              <nav className="space-y-3">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className={`block text-sm ${MUTED_TEXT_COLOR} ${HOVER_ACCENT_COLOR} transition-all duration-200 hover:translate-x-1`}
                  >
                    {link.title}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal Links - spans 3 columns */}
            <div className="lg:col-span-3">
              <h3 className={`text-lg font-semibold mb-6 ${TEXT_COLOR} relative`}>
                Legal
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mt-2"></div>
              </h3>
              <div className="space-y-3">
                {legalLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className={`block text-sm ${MUTED_TEXT_COLOR} ${HOVER_ACCENT_COLOR} transition-all duration-200 hover:translate-x-1`}
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Media & Newsletter - spans 2 columns */}
            <div className="lg:col-span-2">
              <h3 className={`text-lg font-semibold mb-6 ${TEXT_COLOR} relative`}>
                Connect
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mt-2"></div>
              </h3>
              
              {/* Social Links */}
              <div className="flex flex-wrap gap-3 mb-6">
                {socialLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    aria-label={link.label}
                    className={`p-3 rounded-xl bg-slate-800/50 border ${BORDER_COLOR} ${TEXT_COLOR} ${link.hoverColor} hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <link.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
              
              {/* Newsletter Signup */}
              <div className="space-y-3">
                <p className={`text-sm ${MUTED_TEXT_COLOR}`}>
                  Stay updated with our latest insights
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <button className={`px-4 py-2 ${BUTTON_BG_COLOR} ${BUTTON_HOVER_COLOR} text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg whitespace-nowrap`}>
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className={`border-t ${BORDER_COLOR} bg-slate-900/50`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-center sm:text-left">
                <p className={`text-sm ${MUTED_TEXT_COLOR}`}>
                  © 2025 ConnectAngelsOTT. All rights reserved.
                </p>
                <div className="hidden sm:block w-1 h-1 bg-slate-600 rounded-full"></div>
                <p className={`text-sm ${MUTED_TEXT_COLOR}`}>
                  Made with ❤️ in India
                </p>
              </div>

              {/* Back to Top Button */}
              <button
                onClick={scrollToTop}
                className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border ${BORDER_COLOR} ${TEXT_COLOR} rounded-lg ${HOVER_BG_COLOR} hover:border-slate-600 transition-all duration-200 text-sm font-medium hover:shadow-md group`}
                aria-label="Back to top"
              >
                <ArrowUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}