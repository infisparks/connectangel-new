"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface VideoPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
}

export function VideoPlayerModal({ isOpen, onClose, videoUrl, title }: VideoPlayerModalProps) {
  if (!isOpen || !videoUrl) return null

  // More robust check for YouTube URL to get embed link
  const getEmbedUrl = (url: string) => {
    const youtubeRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/
    const match = url.match(youtubeRegex)
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` // Added rel=0 to prevent related videos
    }
    // Assume it's already an embeddable URL or direct video file
    return url
  }

  const embedUrl = getEmbedUrl(videoUrl)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-full p-0 overflow-hidden bg-gray-900 text-white border-gray-700">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg font-semibold text-gray-100">{title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full" style={{ paddingTop: "56.25%" /* 16:9 Aspect Ratio */ }}>
          {embedUrl.includes("youtube.com/embed") || embedUrl.includes("youtu.be/embed") ? (
            <iframe
              key={embedUrl} // Add key to force re-render if URL changes
              className="absolute top-0 left-0 w-full h-full rounded-b-lg"
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video className="absolute top-0 left-0 w-full h-full rounded-b-lg" controls autoPlay src={embedUrl}>
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
