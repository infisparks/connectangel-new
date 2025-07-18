// components/layout/Navigation.tsx (or wherever your Navigation component is located)

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GlobeIcon, MenuIcon, XIcon, LogOutIcon } from "lucide-react" // Import LogOutIcon
import { Button } from "@/components/ui/button"
import Image from "next/image"
import logo from "@/public/img/logo.png"
import { supabase } from "@/lib/supabaselib" // Assuming this is your client-side Supabase client

const navigationItems = [
  { label: "Home", href: "#home" },
  { label: "Events", href: "#events" },
  { label: "Speakers", href: "#speakers" },
  { label: "About", href: "#about" },
]

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<any | null>(null) // State to hold user info
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      // Correctly unsubscribe from the auth listener
      authListener?.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("mobile-menu-open")
    } else {
      document.body.classList.remove("mobile-menu-open")
    }
    return () => document.body.classList.remove("mobile-menu-open")
  }, [isMenuOpen])

  const handleLoginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/my-startups`, // Redirect to my-startups after login
      },
    })
    if (error) {
      console.error("Error logging in with Google:", error.message)
      alert("Error logging in with Google: " + error.message)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error logging out:", error.message)
      alert("Error logging out: " + error.message)
    } else {
      router.push("/") // Redirect to home page after logout
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#000A18] ${
          isScrolled ? "bg-[#000a18]/95 backdrop-blur-md border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src={logo || "/placeholder.svg"}
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
                <span className="font-poppins font-normal text-white text-base lg:text-lg">English</span>
              </div>

              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      className="h-10 lg:h-12 px-4 lg:px-8 rounded-full bg-white/20 border border-white text-white font-poppins font-normal text-sm lg:text-base hover:bg-white/30 transition-all duration-200"
                      onClick={() => router.push("/my-startups")}
                    >
                      My Startup
                    </Button>
                    <Button
                      className="h-10 lg:h-12 px-4 lg:px-6 rounded-full bg-[#8700ff] text-white font-poppins font-normal text-sm lg:text-base hover:bg-[#7300dd] transition-all duration-200"
                      // --- MODIFICATION HERE ---
                      onClick={() => router.push("/role?role=creator")} // Pass role=creator
                    >
                      Add Startup
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-10 lg:h-12 px-4 lg:px-6 rounded-full text-white font-poppins font-normal text-sm lg:text-base hover:bg-white/10 hover:text-red-400 transition-all duration-200 flex items-center gap-1"
                      onClick={handleLogout}
                    >
                      <LogOutIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="h-10 lg:h-12 px-4 lg:px-8 rounded-full bg-white/20 border border-white text-white font-poppins font-normal text-sm lg:text-base hover:bg-white/30 transition-all duration-200"
                      onClick={() => router.push("/register")}
                    >
                      Login
                    </Button>
                    <Button className="h-10 lg:h-12 px-4 lg:px-6 rounded-full bg-[#8700ff] text-white font-poppins font-normal text-sm lg:text-base hover:bg-[#7300dd] transition-all duration-200">
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
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
                <span className="font-poppins font-normal text-white text-lg">English</span>
              </div>

              {/* Mobile Actions */}
              <div className="flex flex-col space-y-4 mt-auto mb-8">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      className="h-12 w-full rounded-full bg-white/20 border border-white text-white font-poppins font-normal text-base hover:bg-white/30 transition-all duration-200"
                      onClick={() => {
                        setIsMenuOpen(false)
                        router.push("/my-startups")
                      }}
                    >
                      My Startup
                    </Button>
                    <Button
                      className="h-12 w-full rounded-full bg-[#8700ff] text-white font-poppins font-normal text-base hover:bg-[#7300dd] transition-all duration-200"
                      onClick={() => {
                        setIsMenuOpen(false)
                        // --- MODIFICATION HERE ---
                        router.push("/role?role=creator") // Pass role=creator
                      }}
                    >
                      Add Startup
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-12 w-full rounded-full text-white font-poppins font-normal text-base hover:bg-white/10 hover:text-red-400 transition-all duration-200 flex items-center gap-2 justify-center"
                      onClick={() => {
                        setIsMenuOpen(false)
                        handleLogout()
                      }}
                    >
                      <LogOutIcon className="w-6 h-6" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="h-12 w-full rounded-full bg-white/20 border border-white text-white font-poppins font-normal text-base hover:bg-white/30 transition-all duration-200"
                      onClick={() => {
                        setIsMenuOpen(false)
                        router.push("/register")
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      className="h-12 w-full rounded-full bg-[#8700ff] text-white font-poppins font-normal text-base hover:bg-[#7300dd] transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}