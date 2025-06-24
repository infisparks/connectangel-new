"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Cropper from "react-easy-crop"
import { Plus, CloudUpload, Eye, Play, ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabaselib"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const SUPABASE_VIDEO_BUCKET = "pitch-videos"
const SUPABASE_THUMBNAIL_BUCKET = "thumbnails"

// Updated getCroppedImg to use croppedAreaPixels directly
function getCroppedImg(imageSrc: string, croppedAreaPixels: any): Promise<Blob> {
  return new Promise(async (resolve) => {
    const image = new window.Image()
    image.crossOrigin = "anonymous"
    image.src = imageSrc
    image.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 400
      canvas.height = 225 // 16:9 aspect ratio

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        400,
        225,
      )

      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, "image/png")
    }
  })
}

// Thumbnail Cropper Dialog using react-easy-crop
const ThumbnailCropper = ({
  imageUrl,
  onCropComplete,
  onClose,
}: {
  imageUrl: string
  onCropComplete: (croppedBlob: Blob) => void
  onClose: () => void
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleApply = async () => {
    setLoading(true)
    // Pass croppedAreaPixels directly to getCroppedImg
    const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels)
    setLoading(false)
    onCropComplete(croppedBlob)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Crop Thumbnail (16:9)</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="flex flex-col space-y-3 pt-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
          <Button onClick={handleApply} disabled={loading}>
            {loading ? "Processing..." : "Apply Crop"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main component
export function StartupFormAndPreview() {
  const [founderNames, setFounderNames] = useState([""])
  const [startupType, setStartupType] = useState("")
  const [startupName, setStartupName] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [language, setLanguage] = useState("")
  const [domain, setDomain] = useState("")
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [selectedCustomThumbnailFile, setSelectedCustomThumbnailFile] = useState<File | null>(null)
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [showThumbnailCropModal, setShowThumbnailCropModal] = useState(false)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const router = useRouter()
  // Removed showFullscreenThumbnailPreview state

  // Video refs for generating a thumbnail
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const addFounderField = () => setFounderNames([...founderNames, ""])
  const handleFounderNameChange = (idx: number, val: string) => {
    const arr = [...founderNames]
    arr[idx] = val
    setFounderNames(arr)
  }

  // Helper for filename truncation
  const truncateFileName = (fileName: string, maxLength = 15) => {
    if (!fileName || fileName.length <= maxLength) return fileName
    const ext = fileName.split(".").pop()
    const base = fileName.slice(0, maxLength - (ext ? ext.length + 4 : 4))
    return `${base}...${ext ? `.${ext}` : ""}`
  }

  // Generate thumbnail from video at 1s
  const generateThumbnailFromVideo = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas && selectedVideoFile) {
      video.currentTime = 1
      video.onseeked = () => {
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        const aspect = video.videoWidth / video.videoHeight
        const w = 400
        const h = w / aspect
        canvas.width = 400
        canvas.height = h
        ctx.drawImage(video, 0, 0, w, h)
        setPreviewThumbnailUrl(canvas.toDataURL("image/png"))
      }
    }
  }, [selectedVideoFile])

  // Handle video selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedVideoFile(file || null)
    if (file) {
      setSelectedCustomThumbnailFile(null)
      setPreviewThumbnailUrl(null)
      const url = URL.createObjectURL(file)
      if (videoRef.current) {
        videoRef.current.src = url
        videoRef.current.load()
        videoRef.current.onloadedmetadata = () => generateThumbnailFromVideo()
      }
    }
  }

  // Validate 16:9 ratio
  function is16by9(file: File, cb: (result: boolean, url: string) => void) {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const aspect = img.width / img.height
      cb(Math.abs(aspect - 16 / 9) < 0.05, url)
    }
    img.src = url
  }

  // Handle custom thumbnail selection and open cropper if not 16:9
  const handleCustomThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      is16by9(file, (isValid, url) => {
        if (isValid) {
          setSelectedCustomThumbnailFile(file)
          setPreviewThumbnailUrl(url)
        } else {
          setCropImageUrl(url)
          setShowThumbnailCropModal(true)
        }
      })
    }
  }

  // Callback from cropper to set the cropped image as thumbnail
  const handleCroppedThumbnail = (blob: Blob) => {
    const croppedFile = new File([blob], "cropped_thumbnail.png", { type: "image/png", lastModified: Date.now() })
    setSelectedCustomThumbnailFile(croppedFile)
    setPreviewThumbnailUrl(URL.createObjectURL(croppedFile))
    // Removed setShowFullscreenThumbnailPreview(true)
  }

  // Main submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionError(null)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) throw new Error("User not authenticated.")
      let pitchVideoUrl: string | null = null
      let thumbnailUrl: string | null = null

      // Upload video
      if (selectedVideoFile) {
        const ext = selectedVideoFile.name.split(".").pop()
        const filePath = `${user.id}/videos/${Date.now()}.${ext}`
        const { error: videoError } = await supabase.storage
          .from(SUPABASE_VIDEO_BUCKET)
          .upload(filePath, selectedVideoFile, { cacheControl: "3600", upsert: false })
        if (videoError) throw new Error(`Video upload failed: ${videoError.message}`)
        pitchVideoUrl = supabase.storage.from(SUPABASE_VIDEO_BUCKET).getPublicUrl(filePath).data?.publicUrl
      }

      // Prepare thumbnail for upload
      let thumbnailFile: File | null = selectedCustomThumbnailFile
      if (!thumbnailFile && previewThumbnailUrl && previewThumbnailUrl.startsWith("data:")) {
        const blob = await (await fetch(previewThumbnailUrl)).blob()
        thumbnailFile = new File([blob], `${user.id}_video_thumbnail.png`, { type: "image/png" })
      }

      if (!thumbnailFile) throw new Error("Please upload a thumbnail image (16:9 ratio required).")

      const thumbExt = thumbnailFile.name.split(".").pop() || "png"
      const thumbPath = `${user.id}/thumbnails/${Date.now()}.${thumbExt}`
      const { error: thumbError } = await supabase.storage
        .from(SUPABASE_THUMBNAIL_BUCKET)
        .upload(thumbPath, thumbnailFile, { cacheControl: "3600", upsert: false })
      if (thumbError) throw new Error(`Thumbnail upload failed: ${thumbError.message}`)
      thumbnailUrl = supabase.storage.from(SUPABASE_THUMBNAIL_BUCKET).getPublicUrl(thumbPath).data?.publicUrl

      // Insert data in DB
      const { error: insertError } = await supabase.from("creator_approval").insert([
        {
          user_id: user.id,
          startup_type: startupType,
          startup_name: startupName,
          description,
          location,
          language,
          domain,
          founder_names: founderNames.filter((n) => n.trim() !== ""),
          pitch_video_url: pitchVideoUrl,
          thumbnail_url: thumbnailUrl,
        },
      ])
      if (insertError) throw new Error(insertError.message)
      setShowSuccessDialog(true)
      setTimeout(() => router.push("/"), 1800) // 1.8s redirect
    } catch (err: any) {
      setSubmissionError(err?.message || "Submission failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // -- Preview Render Function --
  const renderPreviewContent = () => (
    <div className="p-6 lg:p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg relative">
      <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-gray-950 flex items-center justify-center">
        {previewThumbnailUrl ? (
          <Image
            src={previewThumbnailUrl || "/img/login.png"}
            alt="Video Thumbnail"
            fill
            style={{ objectFit: "cover" }}
            className="opacity-70"
          />
        ) : (
          <Image
            src="/img/login.png"
            alt="Video Thumbnail Placeholder"
            fill
            style={{ objectFit: "cover" }}
            className="opacity-70"
          />
        )}
        <Play className="absolute h-16 w-16 text-white cursor-pointer opacity-90 hover:opacity-100 transition-opacity" />
      </div>
      <div className="space-y-4">
        {startupType && (
          <span className="inline-block bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            {startupType}
          </span>
        )}
        <h3 className="text-3xl font-bold text-white">{startupName || "Startup Name"}</h3>
        <div className="flex flex-wrap gap-2">
          {founderNames.filter(Boolean).map((name, idx) => (
            <span
              key={idx}
              className={`inline-block ${idx === 0 ? "bg-purple-700" : "border border-gray-700"} text-white text-sm px-4 py-2 rounded-full font-medium`}
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
        <p className="text-gray-300 text-sm leading-relaxed">{description || "A brief description goes here."}</p>
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
            {founderNames.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="Founder & Team Name"
                  value={name}
                  onChange={(e) => handleFounderNameChange(idx, e.target.value)}
                  className="flex-grow bg-gray-800 border-gray-700 text-gray-50 placeholder:text-gray-400 h-12 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
                {idx === founderNames.length - 1 && (
                  <Button
                    type="button"
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
              {/* Hidden video/canvas for generating video thumbnail */}
              <video ref={videoRef} style={{ display: "none" }} muted preload="metadata" />
              <canvas ref={canvasRef} style={{ display: "none" }} />

              <input
                type="file"
                id="pitch-video-upload"
                accept="video/*"
                className="hidden"
                onChange={handleVideoFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center gap-2 bg-gray-800 border-gray-700 text-gray-50 h-12 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={() => document.getElementById("pitch-video-upload")?.click()}
              >
                <CloudUpload className="h-5 w-5" />
                {selectedVideoFile ? truncateFileName(selectedVideoFile.name) : "Pitch Video"}
              </Button>

              <input
                type="file"
                id="custom-thumbnail-upload"
                accept="image/*"
                className="hidden"
                onChange={handleCustomThumbnailFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center gap-2 bg-gray-800 border-gray-700 text-gray-50 h-12 rounded-lg hover:bg-gray-700 transition-colors"
                onClick={() => document.getElementById("custom-thumbnail-upload")?.click()}
              >
                <ImageIcon className="h-5 w-5" />
                {selectedCustomThumbnailFile
                  ? truncateFileName(selectedCustomThumbnailFile.name)
                  : "Upload Thumbnail (16:9)"}
              </Button>
            </div>
            <p className="text-sm text-gray-400">* Thumbnail must be 16:9 ratio. Crop tool will appear if not.</p>
            {submissionError && <p className="text-red-500 text-sm">{submissionError}</p>}
            <div className="flex justify-between items-center pt-4">
              <Button
                type="submit"
                className="bg-purple-600 text-white h-12 px-8 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit for review"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPreviewModal(true)}
                className="text-gray-400 hover:text-white transition-colors lg:hidden"
              >
                <Eye className="h-6 w-6" />
              </Button>
            </div>
          </form>
        </div>

        {/* Desktop Preview */}
        <div className="hidden lg:block">{renderPreviewContent()}</div>

        {/* Mobile Preview */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Startup Preview</DialogTitle>
            </DialogHeader>
            {renderPreviewContent()}
          </DialogContent>
        </Dialog>

        {/* Thumbnail Crop Modal */}
        {showThumbnailCropModal && cropImageUrl && (
          <ThumbnailCropper
            imageUrl={cropImageUrl}
            onCropComplete={handleCroppedThumbnail}
            onClose={() => setShowThumbnailCropModal(false)}
          />
        )}

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog}>
          <DialogContent className="sm:max-w-[400px] bg-gray-900 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Registration Successful!</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-lg font-semibold text-center">
              Your registration has been submitted.
              <br />
              <span className="text-purple-400">Wait for approval.</span>
            </div>
            <div className="flex justify-center">
              <Button className="bg-purple-600 text-white" disabled>
                Redirecting to Home...
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
