'use client'

import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import logo from "@/public/img/logo.png"
const navLinks = [
  { title: "Home", href: "#home" },
  { title: "About Us", href: "#about" },
  { title: "Contact Us", href: "#contact" },
  { title: "Support Center", href: "#support" },
]

const footerLinks = [
  { title: "Privacy Policy", href: "#privacy" },
  { title: "Terms of Service", href: "#terms" },
  { title: "Cookies Settings", href: "#cookies" },
]

export default function Footer() {
  return (
    <footer className="flex flex-col w-full items-center gap-16 md:gap-24 px-4 sm:px-6 lg:px-8 py-16 md:py-20 bg-transparent">
      <div className="flex flex-col items-center gap-8 md:gap-12 max-w-4xl w-full">
        <Image
          src={logo}
          alt="ConnectAngles Logo"
          width={120}
          height={94}
          className="w-24 h-[75px] md:w-[146px] md:h-[114px] rounded-lg object-cover"
        />

        <nav className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-6 md:gap-11 w-full">
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="font-roboto font-semibold text-white text-lg md:text-2xl lg:text-[25px] leading-tight text-center hover:text-purple-400 transition-colors duration-200"
            >
              {link.title}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-6 md:gap-8 w-full max-w-6xl">
        <Separator className="w-full h-px bg-white/20" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
          <p className="font-roboto font-normal text-white text-base md:text-lg leading-relaxed text-center md:text-left">
            © 2025 ConnectAngles. All rights reserved.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
            {footerLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="font-roboto font-normal text-white text-base md:text-lg leading-relaxed underline hover:text-purple-400 transition-colors duration-200"
              >
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}