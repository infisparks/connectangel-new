'use client'

import { useState, useEffect } from 'react'
import { GlobeIcon, MenuIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import logo from "@/public/img/logo.png"
const navigationItems = [
  { label: "Home", href: "#home" },
  { label: "Events", href: "#events" },
  { label: "Speakers", href: "#speakers" },
  { label: "About", href: "#about" },
]

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }
    return () => document.body.classList.remove('mobile-menu-open')
  }, [isMenuOpen])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#000a18]/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src={logo}
                alt="ConnectAngles Logo"
                width={60}
                height={48}
                className="w-12 h-10 md:w-[70px] md:h-[56px] rounded-lg object-cover"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="font-poppins font-normal text-white text-base lg:text-lg hover:text-purple-400 transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-2">
                <GlobeIcon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                <span className="font-poppins font-normal text-white text-base lg:text-lg">
                  English
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  className="h-10 lg:h-12 px-4 lg:px-8 rounded-full bg-white/20 border border-white text-white font-poppins font-normal text-sm lg:text-base hover:bg-white/30 transition-all duration-200"
                >
                  Login
                </Button>

                <Button className="h-10 lg:h-12 px-4 lg:px-6 rounded-full bg-[#8700ff] text-white font-poppins font-normal text-sm lg:text-base hover:bg-[#7300dd] transition-all duration-200">
                  Get Started
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#000a18] border-l border-white/20 animate-slideIn">
            <div className="flex flex-col h-full pt-20 px-6">
              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-6 mb-8">
                {navigationItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="font-poppins font-normal text-white text-xl hover:text-purple-400 transition-colors duration-200 py-2"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Mobile Language Selector */}
              <div className="flex items-center space-x-3 mb-8 py-4 border-t border-white/20">
                <GlobeIcon className="w-6 h-6 text-white" />
                <span className="font-poppins font-normal text-white text-lg">
                  English
                </span>
              </div>

              {/* Mobile Actions */}
              <div className="flex flex-col space-y-4 mt-auto mb-8">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-full bg-white/20 border border-white text-white font-poppins font-normal text-base hover:bg-white/30 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Button>

                <Button 
                  className="h-12 w-full rounded-full bg-[#8700ff] text-white font-poppins font-normal text-base hover:bg-[#7300dd] transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}