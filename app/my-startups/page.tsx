// app/my-startups/page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaselib"
import { UserProfileCard } from "@/components/user-profile-card"
import { 
  Loader2, 
  Plus, 
  Building2, 
  Rocket, 
  TrendingUp, 
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  LayoutDashboard
} from "lucide-react"
import {
  ProfileData,
  ProfileRoleType,
  ApprovedStartup,
  PendingStartup,
  IncubationProfile,
  InvestorProfile,
  MentorProfile,
} from "@/types"

export default function MyProfilesPage() {
  // State for each profile type, separated by approved/pending/needs_update/rejected
  const [approvedStartups, setApprovedStartups] = useState<ApprovedStartup[]>([])
  const [pendingStartups, setPendingStartups] = useState<PendingStartup[]>([])
  const [needsUpdateStartups, setNeedsUpdateStartups] = useState<PendingStartup[]>([])
  const [rejectedStartups, setRejectedStartups] = useState<PendingStartup[]>([])

  const [approvedIncubations, setApprovedIncubations] = useState<IncubationProfile[]>([])
  const [pendingIncubations, setPendingIncubations] = useState<IncubationProfile[]>([])
  const [needsUpdateIncubations, setNeedsUpdateIncubations] = useState<IncubationProfile[]>([])
  const [rejectedIncubations, setRejectedIncubations] = useState<IncubationProfile[]>([])

  const [approvedInvestors, setApprovedInvestors] = useState<InvestorProfile[]>([])
  const [pendingInvestors, setPendingInvestors] = useState<InvestorProfile[]>([])
  const [needsUpdateInvestors, setNeedsUpdateInvestors] = useState<InvestorProfile[]>([])
  const [rejectedInvestors, setRejectedInvestors] = useState<InvestorProfile[]>([])

  const [approvedMentors, setApprovedMentors] = useState<MentorProfile[]>([])
  const [pendingMentors, setPendingMentors] = useState<MentorProfile[]>([])
  const [needsUpdateMentors, setNeedsUpdateMentors] = useState<MentorProfile[]>([])
  const [rejectedMentors, setRejectedMentors] = useState<MentorProfile[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const fetchMyProfiles = useCallback(async () => {
    setLoading(true)
    setError(null)

    const {
      data: { user },
      error: userAuthError,
    } = await supabase.auth.getUser()

    if (userAuthError) {
      console.error("Supabase authentication error:", userAuthError.message)
      setError("Authentication error. Please log in again.")
      setLoading(false)
      router.push("/register")
      return
    }

    if (!user) {
      setError("You must be logged in to view your profiles. Redirecting to login.")
      setLoading(false)
      router.push("/register")
      return
    }

    const userId = user.id

    // --- Fetch Startups ---
    const { data: approvedStartupData, error: approvedStartupError } = await supabase
      .from("creator")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (approvedStartupError) {
      console.error("Error fetching approved startups:", approvedStartupError.message)
      setError((prev) => (prev ? prev + "\n" : "") + "Error loading approved startups: " + approvedStartupError.message)
    } else {
      setApprovedStartups(approvedStartupData as ApprovedStartup[])
    }

    const { data: pendingNeedsUpdateRejectedStartupData, error: pendingNeedsUpdateRejectedStartupError } =
      await supabase
        .from("creator_approval")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["pending", "needs_update", "rejected"])
        .order("created_at", { ascending: false })

    if (pendingNeedsUpdateRejectedStartupData) {
      setPendingStartups(
        pendingNeedsUpdateRejectedStartupData.filter((p) => p.status === "pending") as PendingStartup[],
      )
      setNeedsUpdateStartups(
        pendingNeedsUpdateRejectedStartupData.filter((p) => p.status === "needs_update") as PendingStartup[],
      )
      setRejectedStartups(
        pendingNeedsUpdateRejectedStartupData.filter((p) => p.status === "rejected") as PendingStartup[],
      )
    } else if (pendingNeedsUpdateRejectedStartupError) {
      console.error(
        "Error fetching pending/needs_update/rejected startups:",
        pendingNeedsUpdateRejectedStartupError.message,
      )
      setError(
        (prev) =>
          (prev ? prev + "\n" : "") +
          "Error loading pending/needs_update/rejected startups: " +
          pendingNeedsUpdateRejectedStartupError.message,
      )
    }

    // --- Fetch Incubations ---
    const { data: approvedIncubationData, error: approvedIncubationError } = await supabase
      .from("incubation")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (approvedIncubationError) {
      console.error("Error fetching approved incubations:", approvedIncubationError.message)
      setError(
        (prev) => (prev ? prev + "\n" : "") + "Error loading approved incubations: " + approvedIncubationError.message,
      )
    } else {
      setApprovedIncubations(approvedIncubationData as IncubationProfile[])
    }

    const { data: pendingNeedsUpdateRejectedIncubationData, error: pendingNeedsUpdateRejectedIncubationError } =
      await supabase
        .from("incubation_approval")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["pending", "needs_update", "rejected"])
        .order("created_at", { ascending: false })

    if (pendingNeedsUpdateRejectedIncubationData) {
      setPendingIncubations(
        pendingNeedsUpdateRejectedIncubationData.filter((p) => p.status === "pending") as IncubationProfile[],
      )
      setNeedsUpdateIncubations(
        pendingNeedsUpdateRejectedIncubationData.filter((p) => p.status === "needs_update") as IncubationProfile[],
      )
      setRejectedIncubations(
        pendingNeedsUpdateRejectedIncubationData.filter((p) => p.status === "rejected") as IncubationProfile[],
      )
    } else if (pendingNeedsUpdateRejectedIncubationError) {
      console.error(
        "Error fetching pending/needs_update/rejected incubations:",
        pendingNeedsUpdateRejectedIncubationError.message,
      )
      setError(
        (prev) =>
          (prev ? prev + "\n" : "") +
          "Error loading pending/needs_update/rejected incubations: " +
          pendingNeedsUpdateRejectedIncubationError.message,
      )
    }

    // --- Fetch Investors ---
    const { data: approvedInvestorData, error: approvedInvestorError } = await supabase
      .from("investor")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (approvedInvestorError) {
      console.error("Error fetching approved investors:", approvedInvestorError.message)
      setError(
        (prev) => (prev ? prev + "\n" : "") + "Error loading approved investors: " + approvedInvestorError.message,
      )
    } else {
      setApprovedInvestors(approvedInvestorData as InvestorProfile[])
    }

    const { data: pendingNeedsUpdateRejectedInvestorData, error: pendingNeedsUpdateRejectedInvestorError } =
      await supabase
        .from("investor_approval")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["pending", "needs_update", "rejected"])
        .order("created_at", { ascending: false })

    if (pendingNeedsUpdateRejectedInvestorData) {
      setPendingInvestors(
        pendingNeedsUpdateRejectedInvestorData.filter((p) => p.status === "pending") as InvestorProfile[],
      )
      setNeedsUpdateInvestors(
        pendingNeedsUpdateRejectedInvestorData.filter((p) => p.status === "needs_update") as InvestorProfile[],
      )
      setRejectedInvestors(
        pendingNeedsUpdateRejectedInvestorData.filter((p) => p.status === "rejected") as InvestorProfile[],
      )
    } else if (pendingNeedsUpdateRejectedInvestorError) {
      console.error(
        "Error fetching pending/needs_update/rejected investors:",
        pendingNeedsUpdateRejectedInvestorError.message,
      )
      setError(
        (prev) =>
          (prev ? prev + "\n" : "") +
          "Error loading pending/needs_update/rejected investors: " +
          pendingNeedsUpdateRejectedInvestorError.message,
      )
    }

    // --- Fetch Mentors ---
    const { data: approvedMentorData, error: approvedMentorError } = await supabase
      .from("mentor")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (approvedMentorError) {
      console.error("Error fetching approved mentors:", approvedMentorError.message)
      setError((prev) => (prev ? prev + "\n" : "") + "Error loading approved mentors: " + approvedMentorError.message)
    } else {
      setApprovedMentors(approvedMentorData as MentorProfile[])
    }

    const { data: pendingNeedsUpdateRejectedMentorData, error: pendingNeedsUpdateRejectedMentorError } = await supabase
      .from("mentor_approval")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["pending", "needs_update", "rejected"])
      .order("created_at", { ascending: false })

    if (pendingNeedsUpdateRejectedMentorData) {
      setPendingMentors(pendingNeedsUpdateRejectedMentorData.filter((p) => p.status === "pending") as MentorProfile[])
      setNeedsUpdateMentors(
        pendingNeedsUpdateRejectedMentorData.filter((p) => p.status === "needs_update") as MentorProfile[],
      )
      setRejectedMentors(pendingNeedsUpdateRejectedMentorData.filter((p) => p.status === "rejected") as MentorProfile[])
    } else if (pendingNeedsUpdateRejectedMentorError) {
      console.error(
        "Error fetching pending/needs_update/rejected mentors:",
        pendingNeedsUpdateRejectedMentorError.message,
      )
      setError(
        (prev) =>
          (prev ? prev + "\n" : "") +
          "Error loading pending/needs_update/rejected mentors: " +
          pendingNeedsUpdateRejectedMentorError.message,
      )
    }

    setLoading(false)

  }, [router])

  useEffect(() => {
    fetchMyProfiles()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchMyProfiles()
      } else {
        setApprovedStartups([])
        setPendingStartups([])
        setNeedsUpdateStartups([])
        setRejectedStartups([])
        setApprovedIncubations([])
        setPendingIncubations([])
        setNeedsUpdateIncubations([])
        setRejectedIncubations([])
        setApprovedInvestors([])
        setPendingInvestors([])
        setNeedsUpdateInvestors([])
        setRejectedInvestors([])
        setApprovedMentors([])
        setPendingMentors([])
        setNeedsUpdateMentors([])
        setRejectedMentors([])
        setLoading(false)
        setError("You have been logged out or your session expired. Please log in.")
        router.push("/register")
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [fetchMyProfiles, router])

  const renderStatusBadge = (count: number, status: string, icon: React.ReactNode) => {
    if (count === 0) return null
    
    const colorMap = {
      approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      needs_update: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      rejected: "bg-red-500/10 text-red-400 border-red-500/20"
    }
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${colorMap[status as keyof typeof colorMap]}`}>
        {icon}
        <span>{count}</span>
      </div>
    )
  }

  const renderProfileSection = (
    title: string,
    icon: React.ReactNode,
    approved: ProfileData[],
    pending: ProfileData[],
    needsUpdate: ProfileData[],
    rejected: ProfileData[],
    roleType: ProfileRoleType,
    canAddNew: boolean = true,
    onAddNew?: () => void,
    specialButtons?: React.ReactNode
  ) => {
    const totalCount = approved.length + pending.length + needsUpdate.length + rejected.length
    const allProfiles = [...approved, ...pending, ...needsUpdate, ...rejected]
    
    if (totalCount === 0 && !canAddNew) return null

    return (
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                {icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {renderStatusBadge(approved.length, "approved", <CheckCircle2 className="w-3 h-3" />)}
                  {renderStatusBadge(pending.length, "pending", <Clock className="w-3 h-3" />)}
                  {renderStatusBadge(needsUpdate.length, "needs_update", <AlertCircle className="w-3 h-3" />)}
                  {renderStatusBadge(rejected.length, "rejected", <XCircle className="w-3 h-3" />)}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {specialButtons}
              {canAddNew && onAddNew && (
                <Button
                  onClick={onAddNew}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {totalCount > 0 ? (
          <div className="p-6">
            <div className="grid gap-6">
              {allProfiles.map((profile) => (
                <UserProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  roleType={roleType} 
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-3">
              <Building2 className="w-12 h-12 mx-auto opacity-30" />
            </div>
            <p className="text-gray-400 text-sm">No {title.toLowerCase()} profiles yet</p>
            <p className="text-gray-500 text-xs mt-1">Get started by creating your first profile</p>
          </div>
        )}
      </div>
    )
  }

  const hasIncubationProfile = approvedIncubations.length > 0 || pendingIncubations.length > 0 || needsUpdateIncubations.length > 0
  const hasApprovedIncubation = approvedIncubations.length > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading your profiles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-red-400 font-semibold mb-2">Error Loading Profiles</h2>
          <p className="text-red-300/80 text-sm mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl border border-purple-500/30">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Profiles</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Manage all your professional profiles in one place. Track applications, approvals, and grow your network.
          </p>
        </div>

        {/* Profile Sections */}
        <div className="space-y-8">
          {/* Startups */}
          {renderProfileSection(
            "Startups",
            <Rocket className="w-5 h-5 text-purple-400" />,
            approvedStartups,
            pendingStartups,
            needsUpdateStartups,
            rejectedStartups,
            "startup",
            true,
            () => router.push("/startup-registration")
          )}

          {/* Incubations */}
          {renderProfileSection(
            "Incubation Center",
            <Building2 className="w-5 h-5 text-purple-400" />,
            approvedIncubations,
            pendingIncubations,
            needsUpdateIncubations,
            rejectedIncubations,
            "incubation",
            !hasIncubationProfile,
            () => router.push("/incubation-registration"),
            hasApprovedIncubation ? (
              <Button
                onClick={() => router.push(`/incubation-dashboard`)}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            ) : null
          )}

          {/* Investors */}
          {renderProfileSection(
            "Investors",
            <TrendingUp className="w-5 h-5 text-purple-400" />,
            approvedInvestors,
            pendingInvestors,
            needsUpdateInvestors,
            rejectedInvestors,
            "investor",
            true,
            () => router.push("/investor-registration")
          )}

          {/* Mentors */}
          {renderProfileSection(
            "Mentors",
            <Users className="w-5 h-5 text-purple-400" />,
            approvedMentors,
            pendingMentors,
            needsUpdateMentors,
            rejectedMentors,
            "mentor",
            true,
            () => router.push("/mentor-registration")
          )}
        </div>

        {/* Empty State */}
        {approvedStartups.length === 0 && pendingStartups.length === 0 && needsUpdateStartups.length === 0 && rejectedStartups.length === 0 &&
         approvedIncubations.length === 0 && pendingIncubations.length === 0 && needsUpdateIncubations.length === 0 && rejectedIncubations.length === 0 &&
         approvedInvestors.length === 0 && pendingInvestors.length === 0 && needsUpdateInvestors.length === 0 && rejectedInvestors.length === 0 &&
         approvedMentors.length === 0 && pendingMentors.length === 0 && needsUpdateMentors.length === 0 && rejectedMentors.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/10 rounded-full mb-6">
              <Users className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Welcome to Your Profile Hub!</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start building your professional presence by creating your first profile. Choose from startups, incubations, investors, or mentors.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => router.push("/startup-registration")}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Create Startup
              </Button>
              <Button
                onClick={() => router.push("/investor-registration")}
                variant="outline"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Become Investor
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}