"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { EyeOff, Eye, Chrome } from "lucide-react" // Added Eye icon

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AuthPage() {
  const [isRegisterMode, setIsRegisterMode] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const toggleMode = useCallback(() => {
    setIsRegisterMode((prevMode) => !prevMode)
  }, [])

  return (
    <div className="min-h-screen flex md:mt-20 mt-10 bg-[#000A18] items-center justify-center p-4" style={{ backgroundColor: "#000A18" }}>
      <div className="lg:grid lg:grid-cols-2 max-w-6xl mx-auto rounded-[33px] overflow-hidden shadow-2xl bg-gray-950">
        {/* Left Column: Image */}
        <div className="relative h-[600px] lg:h-auto lg:min-h-[700px] w-full hidden lg:block">
          <Image
            src="/img/login.png" // Using placeholder image
            alt="Abstract purple background"
            fill
            objectFit="cover"
            className="rounded-l-[33px]"
          />
        </div>

        {/* Right Column: Auth Form */}
        <div className="flex flex-col items-center justify-center p-8 lg:p-12 w-full text-white">
          <div className="mx-auto w-full max-w-md space-y-8">
            {isRegisterMode ? (
              // Register Form
              <>
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl font-bold">Create an Account</h1>
                  <p className="text-gray-400 text-lg">
                    Continue enjoying uninterrupted video and personalized experience
                  </p>
                </div>
                <div className="space-y-5">
                  <Input
                    id="register-name"
                    placeholder="Enter your name"
                    required
                    className="bg-transparent border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                  />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter email or mobile number"
                    required
                    className="bg-transparent border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                  />
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      className="bg-transparent border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg pr-10 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:bg-transparent hover:text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      required
                      className="bg-transparent border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg pr-10 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:bg-transparent hover:text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-lg bg-[#8B00FF] text-white font-semibold hover:bg-[#6A0DAD] transition-colors"
                  >
                    Sign Up
                  </Button>
                </div>
                <div className="text-center text-gray-400 text-sm relative my-6">
                  <span className="relative z-10 bg-gray-950 px-4">Or Login With</span>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-lg bg-transparent text-white border-gray-700 hover:bg-gray-800 transition-colors"
                  >
                    <Chrome className="mr-2 h-5 w-5" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-lg bg-transparent text-white border-gray-700 hover:bg-gray-800 transition-colors"
                  >
                    <Image
                      src="/placeholder.svg?height=20&width=20" // Placeholder for Apple/Facebook icon
                      alt="Apple Logo"
                      width={20}
                      height={20}
                      className="mr-2 filter invert" // Invert for dark mode visibility
                    />
                    Apple
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link href="#" onClick={toggleMode} className="underline text-purple-400 hover:text-purple-300">
                    Sign In
                  </Link>
                </div>
              </>
            ) : (
              // Login Form
              <>
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl font-bold">Sign In</h1>
                  <p className="text-gray-400 text-lg">
                    Access your account to continue enjoying uninterrupted video and personalized experience
                  </p>
                </div>
                <div className="space-y-5">
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter email or mobile number"
                    required
                    className="bg-transparent border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500"
                  />
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      className="bg-transparent border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg pr-10 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:bg-transparent hover:text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-lg bg-[#8B00FF] text-white font-semibold hover:bg-[#6A0DAD] transition-colors"
                  >
                    Sign In
                  </Button>
                </div>
                <div className="text-center text-gray-400 text-sm relative my-6">
                  <span className="relative z-10 bg-gray-950 px-4">Or Login With</span>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-lg bg-transparent text-white border-gray-700 hover:bg-gray-800 transition-colors"
                  >
                    <Chrome className="mr-2 h-5 w-5" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-lg bg-transparent text-white border-gray-700 hover:bg-gray-800 transition-colors"
                  >
                    <Image
                      src="/placeholder.svg?height=20&width=20" // Placeholder for Apple/Facebook icon
                      alt="Apple Logo"
                      width={20}
                      height={20}
                      className="mr-2 filter invert" // Invert for dark mode visibility
                    />
                    Apple
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link href="#" onClick={toggleMode} className="underline text-purple-400 hover:text-purple-300">
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
