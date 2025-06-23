"use client"

import { useState } from "react"
import Image from "next/image"
import { Video, UserPlus, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function UserRoleSelection() {
  const [selectedRole, setSelectedRole] = useState<"viewer" | "creator" | null>(null)

  const handleRoleSelect = (role: "viewer" | "creator") => {
    setSelectedRole(role)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-8 px-4"
      style={{ backgroundColor: "#0A0A23" }}
    >
      {/* Top Section: Logo and Help Icon */}
      <div className="w-full flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
              </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 rounded-full">
          <HelpCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Middle Section: Title and Role Selection Cards */}
      <div className="flex flex-col items-center justify-center flex-grow text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Who You Are</h1>
        <p className="text-lg md:text-xl text-gray-300 mb-12">Please choose your plan below</p>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Viewer Card */}
          <div
            className={`flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer transition-all duration-300 w-64 h-64 md:w-72 md:h-72
              ${selectedRole === "viewer" ? "bg-[#8B00FF] shadow-lg shadow-[#8B00FF]/40" : "bg-[#8B00FF]"}
            `}
            onClick={() => handleRoleSelect("viewer")}
          >
            <Video className="h-24 w-24 text-white mb-4" />
            <span className="text-white text-2xl font-semibold">Viewer</span>
          </div>

          {/* Creator Card */}
          <div
            className={`flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer transition-all duration-300 w-64 h-64 md:w-72 md:h-72
              ${selectedRole === "creator" ? "bg-gray-800 border-2 border-[#8B00FF] shadow-lg shadow-[#8B00FF]/40" : "bg-gray-800 border-2 border-gray-700"}
            `}
            onClick={() => handleRoleSelect("creator")}
          >
            <UserPlus className="h-24 w-24 text-white mb-4" />
            <span className="text-white text-2xl font-semibold">Creator</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Navigation Buttons */}
      <div className="w-full flex justify-between items-center max-w-7xl mx-auto mt-auto pt-8">
        <Button variant="ghost" className="text-gray-300 hover:text-white text-lg font-semibold">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <Button
          className="bg-[#8B00FF] text-white h-12 px-8 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors"
          disabled={selectedRole === null}
        >
          Continue
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
