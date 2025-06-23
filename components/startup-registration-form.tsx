"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, CloudUpload, Eye, Play, RotateCcw, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function StartupFormAndPreview() {
  const [founderNames, setFounderNames] = useState([""])
  const [startupType, setStartupType] = useState("")
  const [startupName, setStartupName] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [language, setLanguage] = useState("")
  const [domain, setDomain] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const addFounderField = () => {
    setFounderNames([...founderNames, ""])
  }

  const handleFounderNameChange = (index: number, value: string) => {
    const newNames = [...founderNames]
    newNames[index] = value
    setFounderNames(newNames)
  }

  // Render function for the preview content, used both directly and in the dialog
  const renderPreviewContent = () => (
    <div className="p-6 lg:p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg relative">
      <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-gray-950 flex items-center justify-center">
        <Image
          src="/placeholder.svg?height=200&width=400" // Using generic placeholder
          alt="Video Thumbnail"
          fill
          objectFit="cover"
          className="opacity-70"
        />
        <Play className="absolute h-16 w-16 text-white cursor-pointer opacity-90 hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">0:00 / 1:28</div>
        <RotateCcw className="absolute top-1/2 left-4 -translate-y-1/2 h-8 w-8 text-white cursor-pointer bg-black/50 p-1 rounded-full" />
        <RotateCw className="absolute top-1/2 right-4 -translate-y-1/2 h-8 w-8 text-white cursor-pointer bg-black/50 p-1 rounded-full" />
      </div>

      <div className="space-y-4">
        {startupType && (
          <span className="inline-block bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            {startupType}
          </span>
        )}
        <h3 className="text-3xl font-bold text-white">{startupName || "Startup Name"}</h3>
        <div className="flex flex-wrap gap-2">
          {founderNames.filter(Boolean).map((name, index) => (
            <span
              key={index}
              className={`inline-block ${
                index === 0 ? "bg-purple-700" : "border border-gray-700"
              } text-white text-sm px-4 py-2 rounded-full font-medium`}
            >
              {name}
            </span>
          ))}
          {founderNames.filter(Boolean).length === 0 && (
            <span className="inline-block border border-gray-700 text-gray-300 text-sm px-4 py-2 rounded-full font-medium">
              Founder Name
            </span>
          )}
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          {description || "A brief description of the startup goes here, outlining its mission and impact."}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-400 text-sm">
          <span>{location || "Location"}</span>
          <span>•</span>
          <span>{language || "Language"}</span>
          <span>•</span>
          <span>{domain || "Domain"}</span>
        </div>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 lg:p-8">
        {/* Startup Registration Form */}
        <div className="p-6 lg:p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-white">Startup Registration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={startupType} onValueChange={setStartupType}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-50 placeholder:text-gray-400 h-12 rounded-lg focus:ring-purple-500 focus:border-purple-500">
                <SelectValue placeholder="Startup Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-gray-50 border-gray-700">
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="SaaS">SaaS</SelectItem>
                <SelectItem value="Fintech">Fintech</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Startup Name"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-50 placeholder:text-gray-400 h-12 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {founderNames.map((name, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Founder & Team Name"
                value={name}
                onChange={(e) => handleFounderNameChange(index, e.target.value)}
                className="flex-grow bg-gray-800 border-gray-700 text-gray-50 placeholder:text-gray-400 h-12 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
              {index === founderNames.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={addFounderField}
                  className="bg-purple-600 text-white rounded-lg h-12 w-12 hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              )}
            </div>
          ))}

          <Textarea
            placeholder="Description Here"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-50 placeholder:text-gray-400 min-h-[120px] rounded-lg focus:ring-purple-500 focus:border-purple-500"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-50 placeholder:text-gray-400 h-12 rounded-lg focus:ring-purple-500 focus:border-purple-500">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-gray-50 border-gray-700">
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-50 placeholder:text-gray-400 h-12 rounded-lg focus:ring-purple-500 focus:border-purple-500">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-gray-50 border-gray-700">
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Marathi">Marathi</SelectItem>
                <SelectItem value="Kannada">Kannada</SelectItem>
                <SelectItem value="Tamil">Tamil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-50 placeholder:text-gray-400 h-12 rounded-lg focus:ring-purple-500 focus:border-purple-500">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-gray-50 border-gray-700">
                <SelectItem value="AI">AI</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Fintech">Fintech</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 bg-gray-800 border-gray-700 text-gray-50 h-12 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <CloudUpload className="h-5 w-5" />
              Pitch Video
            </Button>
          </div>
          <p className="text-sm text-gray-400">* Video must be between (60s-3min)</p>

          <div className="flex justify-between items-center pt-4">
            <Button
              type="submit"
              className="bg-purple-600 text-white h-12 px-8 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Submit for review
            </Button>
            {/* Eye icon for mobile preview */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreviewModal(true)}
              className="text-gray-400 hover:text-white transition-colors lg:hidden"
            >
              <Eye className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Startup Preview Card (visible on large screens) */}
        <div className="hidden lg:block">{renderPreviewContent()}</div>

        {/* Mobile Preview Dialog */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Startup Preview</DialogTitle>
            </DialogHeader>
            {renderPreviewContent()}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
