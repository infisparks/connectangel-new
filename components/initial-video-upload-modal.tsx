"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CloudUpload } from "lucide-react"
import { toast } from "sonner"

interface InitialVideoUploadModalProps {
  onUploadComplete: (videoFile: File, thumbnailFile: File | null) => void
}

export function InitialVideoUploadModal({ onUploadComplete }: InitialVideoUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateThumbnailFromVideo = useCallback((video: HTMLVideoElement, file: File): Promise<File | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current
      if (video && canvas) {
        video.currentTime = 1 // Try to get a frame from 1 second in
        video.onseeked = () => {
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            resolve(null)
            return
          }
          const aspect = video.videoWidth / video.videoHeight
          const w = 400
          const h = w / aspect
          canvas.width = 400
          canvas.height = h
          ctx.drawImage(video, 0, 0, w, h)
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `${file.name}_thumbnail.png`, { type: "image/png" })
              resolve(thumbnailFile)
            } else {
              resolve(null)
            }
          }, "image/png")
        }
        video.onerror = () => {
          console.error("Error loading video for thumbnail generation.")
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  }, [])

  const handleFileChange = async (file: File | null) => {
    if (file && file.type.startsWith("video/")) {
      const videoUrl = URL.createObjectURL(file)
      if (videoRef.current) {
        videoRef.current.src = videoUrl
        videoRef.current.load()
        videoRef.current.onloadedmetadata = async () => {
          const thumbnail = await generateThumbnailFromVideo(videoRef.current!, file)
          onUploadComplete(file, thumbnail)
          toast.success("Video uploaded successfully!")
        }
      }
    } else {
      toast.error("Please select a valid video file.")
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChange(e.dataTransfer.files[0])
      }
    },
    [], // Removed handleFileChange from dependencies
  )

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[600px] bg-[#2A0050] text-white border-[#4A0080] p-8 rounded-xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-white text-2xl font-bold">Upload Startup Pitch</DialogTitle>
        </DialogHeader>
        <div
          className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg transition-colors ${
            isDragging ? "border-purple-500 bg-purple-900/20" : "border-[#4A0080] bg-[#3A0060]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CloudUpload className="h-24 w-24 text-purple-400 mb-4" />
          <p className="text-lg font-semibold text-gray-300 mb-2">Drag and drop videos to upload</p>
          <p className="text-sm text-gray-400 mb-6">Your videos will be private until you publish them.</p>
          <input
            type="file"
            ref={fileInputRef}
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />
          <Button
            onClick={handleButtonClick}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-base font-semibold"
          >
            Select Files
          </Button>
        </div>
        {/* Hidden video and canvas for thumbnail generation */}
        <video ref={videoRef} style={{ display: "none" }} muted preload="metadata" />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </DialogContent>
    </Dialog>
  )
}
