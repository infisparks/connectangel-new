"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaselib"
import { AdminApprovalCard } from "@/components/admin-approval-card"
import { Button } from "@/components/ui/button"

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

const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
  { key: "need_update", label: "Need Update" }
] as const

type StatusKey = typeof STATUS_TABS[number]["key"]

export default function AdminApprovalsPage() {
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState<StatusKey>("pending")
  const [approvals, setApprovals] = useState<Record<StatusKey, CreatorApproval[]>>({
    pending: [],
    rejected: [],
    need_update: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchApprovals(status: StatusKey) {
      setLoading(true)
      setError(null)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        setUser(null)
        setError("User not authenticated.\n\nPlease ensure you are authenticated and have the necessary permissions.")
        setLoading(false)
        return
      }
      setUser(user)
      const { data, error: dataError } = await supabase
        .from("creator_approval")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false })
      if (dataError) {
        setError("Error loading approvals: " + dataError.message)
        setLoading(false)
        return
      }
      setApprovals((prev) => ({ ...prev, [status]: data as CreatorApproval[] }))
      setLoading(false)
    }
    fetchApprovals(tab)
  }, [tab])

  // Remove card on approval/reject/need update (for pending only, remove; for others you can reload tab or just remove)
  const handleStatusChange = (id: string) => {
    setApprovals((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((item) => item.id !== id),
    }))
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-2 space-y-8 bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-bold text-purple-400 mb-6">Creator Approvals</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded-lg font-semibold ${
              tab === t.key
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            } transition`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400">
          <div className="text-lg">Loading {STATUS_TABS.find((t) => t.key === tab)?.label.toLowerCase()} approvals...</div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400">
          <div className="text-red-400 mb-4 whitespace-pre-line">{error}</div>
          <Button onClick={() => router.push("/login")} className="bg-purple-600 hover:bg-purple-700 text-white">
            Login
          </Button>
        </div>
      ) : approvals[tab].length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400">
          <div className="text-lg">No {STATUS_TABS.find((t) => t.key === tab)?.label.toLowerCase()} creator approvals at this time.</div>
          <div className="text-sm text-gray-500 mt-2">Check back later!</div>
        </div>
      ) : (
        approvals[tab].map((approval) => (
          <AdminApprovalCard
            approval={approval}
            key={approval.id}
            onStatusChange={tab === "pending" ? handleStatusChange : undefined}
          />
        ))
      )}
    </div>
  )
}
