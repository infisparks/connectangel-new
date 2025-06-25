"use client"

import type React from "react"
import Image from "next/image"
import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaselib"
import { VideoPlayerModal } from "./video-player-modal"

export interface CreatorApproval {
  id: string
  user_id: string
  startup_name: string
  startup_type: string
  domain: string
  description: string
  founder_names: string[]
  location: string
  language: string
  thumbnail_url: string
  pitch_video_url: string
  status: string
  reason?: string
  created_at: string
  updated_at: string
}

export function AdminApprovalCard({
  approval,
  onStatusChange,
}: {
  approval: CreatorApproval
  onStatusChange?: (id: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<"approved" | "rejected" | "need_update" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showReasonInput, setShowReasonInput] = useState<"rejected" | "need_update" | null>(null)
  const [reason, setReason] = useState("")

  // When opening reason input, initialize reason with existing approval.reason
  useEffect(() => {
    if (showReasonInput) {
      setReason(approval.reason ?? "")
      setError(null)
    }
  }, [showReasonInput, approval.reason])

  // ---- Supabase DB functions (in component) ----
  async function updateStatus(status: "approved" | "rejected" | "need_update", reasonValue: string = "") {
    setError(null)
    let updateObj: { status: string; reason?: string | null } = { status }
    if (status === "rejected" || status === "need_update") {
      updateObj.reason = reasonValue
    } else {
      updateObj.reason = null
    }
    const { error: dbError } = await supabase
      .from("creator_approval")
      .update(updateObj)
      .eq("id", approval.id)
    if (dbError) {
      setError(dbError.message)
      return false
    }
    setStatus(status)
    if (onStatusChange) onStatusChange(approval.id)
    return true
  }

  // Approve
  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(() => {
      updateStatus("approved")
    })
  }

  // Reject/Need Update: Open reason input
  const handleStatusChange = (type: "rejected" | "need_update") => {
    setShowReasonInput(type)
    // reason set by useEffect
    setError(null)
  }

  // Reason Submit
  const handleReasonSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError("Please provide a reason.")
      return
    }
    setError(null)
    setShowReasonInput(null)
    startTransition(() => {
      updateStatus(showReasonInput as any, reason)
    })
  }

  // Already handled?
  if (status === "approved") {
    return (
      <div className="relative flex flex-col md:flex-row items-start p-4 gap-4 border rounded-lg shadow-sm bg-green-900 border-green-700 opacity-80">
        <div className="relative w-full md:w-[240px] h-[160px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-950 flex items-center justify-center">
          <Image
            src={approval.thumbnail_url || "/placeholder.svg?height=160&width=240"}
            alt={`${approval.startup_name} Thumbnail`}
            fill
            style={{ objectFit: "cover" }}
            className="opacity-50"
          />
          <span className="absolute text-green-400 font-bold text-xl z-10">Approved!</span>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-green-300">{approval.startup_name}</h3>
          <p className="text-sm text-green-400">
            {approval.startup_type} • {approval.domain}
          </p>
          <p className="text-sm text-green-500 leading-relaxed line-clamp-2">{approval.description}</p>
        </div>
      </div>
    )
  }
  if (status === "rejected" || status === "need_update") {
    return (
      <div className="relative flex flex-col md:flex-row items-start p-4 gap-4 border rounded-lg shadow-sm bg-yellow-900 border-yellow-700 opacity-80">
        <div className="relative w-full md:w-[240px] h-[160px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-950 flex items-center justify-center">
          <Image
            src={approval.thumbnail_url || "/placeholder.svg?height=160&width=240"}
            alt={`${approval.startup_name} Thumbnail`}
            fill
            style={{ objectFit: "cover" }}
            className="opacity-50"
          />
          <span className="absolute text-yellow-300 font-bold text-lg z-10">
            {status === "rejected" ? "Rejected" : "Need Update"}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-yellow-300">{approval.startup_name}</h3>
          <p className="text-sm text-yellow-400">
            {approval.startup_type} • {approval.domain}
          </p>
          <p className="text-sm text-yellow-400 leading-relaxed line-clamp-2">{approval.description}</p>
          {approval.reason && (
            <p className="mt-2 text-xs italic text-yellow-200">Reason: {approval.reason}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col md:flex-row items-start p-4 gap-4 border rounded-lg shadow-sm bg-gray-900 border-gray-700 hover:shadow-lg transition-shadow">
      {/* Thumbnail/Video Preview */}
      <div
        className="relative w-full md:w-[240px] h-[160px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-950 cursor-pointer group"
        onClick={() => approval.pitch_video_url && setShowVideoModal(true)}
      >
        {approval.thumbnail_url ? (
          <Image
            src={approval.thumbnail_url || "/placeholder.svg"}
            alt={`${approval.startup_name} Thumbnail`}
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
        {approval.pitch_video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Play className="h-12 w-12 text-white" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-100">{approval.startup_name}</h3>
        <p className="text-sm text-gray-300">
          {approval.startup_type} • {approval.domain}
        </p>
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{approval.description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {approval.founder_names?.filter(Boolean).map((name, idx) => (
            <span
              key={idx}
              className="inline-block bg-purple-700 text-purple-100 text-xs px-3 py-1 rounded-full font-medium"
            >
              {name}
            </span>
          ))}
        </div>
        <div className="text-gray-500 text-xs mt-1">
          <span>Location: {approval.location}</span> • <span>Language: {approval.language}</span> •{" "}
          <span>Submitted: {new Date(approval.created_at).toLocaleDateString()}</span>
        </div>
        {error && <div className="text-red-400 text-xs font-semibold mt-2">{error}</div>}

        {/* Action Buttons */}
        {!showReasonInput && (
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              className="bg-purple-600 text-white hover:bg-purple-700 flex-1"
              onClick={handleApprove}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Approve"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-red-600 text-red-500 hover:bg-red-900/30 flex-1"
              onClick={() => handleStatusChange("rejected")}
              disabled={isPending}
            >
              Reject
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-900/30 flex-1"
              onClick={() => handleStatusChange("need_update")}
              disabled={isPending}
            >
              Need Update
            </Button>
          </div>
        )}

        {/* Reason Input */}
        {showReasonInput && (
          <form onSubmit={handleReasonSubmit} className="flex flex-col gap-2 mt-4">
            <textarea
              placeholder={`Enter reason for ${showReasonInput === "rejected" ? "rejection" : "update"}...`}
              value={reason}
              className="rounded-md bg-gray-950 border-gray-700 p-2 text-sm text-gray-100"
              rows={3}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                className={`flex-1 ${showReasonInput === "rejected" ? "bg-red-700" : "bg-yellow-600"} text-white`}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowReasonInput(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Video Player Modal */}
      {approval.pitch_video_url && (
        <VideoPlayerModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoUrl={approval.pitch_video_url}
          title={approval.startup_name}
        />
      )}
    </div>
  )
}
