"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { useState } from "react"
import { VideoPlayerModal } from "./video-player-modal"
import type { ApprovedStartup, PendingApproval } from "@/app/admin/approvals/page" // Import types

interface UserStartupCardProps {
  startup: ApprovedStartup | PendingApproval
  type: "approved" | "pending"
}

export function UserStartupCard({ startup, type }: UserStartupCardProps) {
  const [showVideoModal, setShowVideoModal] = useState(false)

  const isApproved = type === "approved"
  const statusText = isApproved ? "Approved" : (startup as PendingApproval).status || "Pending"
  const statusColor = isApproved ? "bg-green-600" : "bg-yellow-600"

  return (
    <div className="relative flex flex-col md:flex-row items-start p-4 gap-4 border rounded-lg shadow-sm bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
      {/* Thumbnail/Video Preview */}
      <div
        className="relative w-full md:w-[240px] h-[160px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-950 cursor-pointer group"
        onClick={() => startup.pitch_video_url && setShowVideoModal(true)}
      >
        {startup.thumbnail_url ? (
          <Image
            src={startup.thumbnail_url || "/placeholder.svg"}
            alt={`${startup.startup_name} Thumbnail`}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Image
            src="/placeholder.svg?height=160&width=240"
            alt="Thumbnail Placeholder"
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {startup.pitch_video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Play className="h-12 w-12 text-white" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-100">{startup.startup_name}</h3>
        <p className="text-sm text-gray-300">
          {startup.startup_type} • {startup.domain}
        </p>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{startup.description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {startup.founder_names?.filter(Boolean).map((name, idx) => (
            <span
              key={idx}
              className="inline-block bg-purple-700 text-purple-100 text-xs px-3 py-1 rounded-full font-medium"
            >
              {name}
            </span>
          ))}
        </div>
        <div className="text-gray-500 text-xs mt-1">
          <span>Location: {startup.location}</span> • <span>Language: {startup.language}</span> •{" "}
          <span>Submitted: {new Date(startup.created_at).toLocaleDateString()}</span>
        </div>
        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold w-fit ${statusColor} text-white`}>
          Status: {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
        </div>
      </div>

      {/* Video Player Modal */}
      {startup.pitch_video_url && (
        <VideoPlayerModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoUrl={startup.pitch_video_url}
          title={startup.startup_name}
        />
      )}
    </div>
  )
}
