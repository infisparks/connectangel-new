"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabaselib"
import { UserStartupCard } from "@/components/user-startup-card"
import { Loader2 } from "lucide-react"

// Define interfaces for both approved and pending startups
export interface ApprovedStartup {
  user_id: string
  startup_type: string
  startup_name: string
  description: string
  location: string
  language: string
  domain: string
  founder_names: string[]
  pitch_video_url: string
  thumbnail_url: string
  created_at: string
  approved_at: string
}

export interface PendingApproval {
  id: string
  user_id: string
  startup_type: string
  startup_name: string
  description: string
  location: string
  language: string
  domain: string
  founder_names: string[]
  pitch_video_url: string
  status: string
  created_at: string
  updated_at: string
  thumbnail_url: string
}

export default function MyStartupsPage() {
  const [approvedStartups, setApprovedStartups] = useState<ApprovedStartup[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchMyStartups() {
      setLoading(true)
      setError(null)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("You must be logged in to view your startups.")
        setLoading(false)
        router.push("/register") // Redirect to login/register if not authenticated
        return
      }

      // Fetch approved startups from 'creator' table
      const { data: approvedData, error: approvedError } = await supabase
        .from("creator")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (approvedError) {
        setError("Error loading approved startups: " + approvedError.message)
      } else {
        setApprovedStartups(approvedData as ApprovedStartup[])
      }

      // Fetch pending approvals from 'creator_approval' table
      const { data: pendingData, error: pendingError } = await supabase
        .from("creator_approval")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (pendingError) {
        setError((prev) => (prev ? prev + "\n" : "") + "Error loading pending approvals: " + pendingError.message)
      } else {
        setPendingApprovals(pendingData as PendingApproval[])
      }

      setLoading(false)
    }

    fetchMyStartups()
  }, [router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <div className="text-lg">Loading your startups...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-400 p-4 text-center">
        <div className="text-red-400 mb-4 whitespace-pre-line">{error}</div>
        <Button onClick={() => router.push("/register")} className="bg-purple-600 hover:bg-purple-700 text-white">
          Login / Register
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 mt-24 px-4 space-y-8 bg-gray-950 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-400">My Startups</h1>
        <Button
          className="bg-purple-600 text-white hover:bg-purple-700"
          onClick={() => router.push("/startup-registration")}
        >
          Add New Startup
        </Button>
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 text-gray-300">
          <TabsTrigger value="approved" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Approved Startups ({approvedStartups.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Pending Approvals ({pendingApprovals.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="approved" className="mt-6">
          {approvedStartups.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No approved startups found.</div>
          ) : (
            <div className="grid gap-6">
              {approvedStartups.map((startup) => (
                <UserStartupCard key={startup.user_id} startup={startup} type="approved" />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          {pendingApprovals.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No pending approvals at this time.</div>
          ) : (
            <div className="grid gap-6">
              {pendingApprovals.map((approval) => (
                <UserStartupCard key={approval.id} startup={approval} type="pending" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
