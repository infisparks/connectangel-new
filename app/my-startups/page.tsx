// app/my-startups/page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabaselib"
import { UserProfileCard } from "@/components/user-profile-card"
import { Loader2 } from "lucide-react"
import {
  ProfileData,
  ProfileRoleType,
  ApprovedStartup,
  PendingStartup,
  IncubationProfile,
  InvestorProfile,
  MentorProfile,
} from "@/types";

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
  const [activeMainTab, setActiveMainTab] = useState<ProfileRoleType>("startup") // State for main tabs

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

  const renderProfileList = (
    profiles: ProfileData[],
    type: "approved" | "pending" | "needs_update" | "rejected",
    roleType: ProfileRoleType,
  ) => {
    if (profiles.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          No {type.replace("_", " ")} {roleType} profiles found.
        </div>
      )
    }
    return (
      <div className="grid gap-6">
        {profiles.map((profile) => (
          <UserProfileCard key={profile.id} profile={profile} roleType={roleType} />
        ))}
      </div>
    )
  }

  const hasIncubationProfile = approvedIncubations.length > 0 || pendingIncubations.length > 0 || needsUpdateIncubations.length > 0;
  const hasApprovedIncubation = approvedIncubations.length > 0;

  return (
    <div className="max-w-4xl mx-auto py-8 mt-24 px-4 space-y-8 bg-gray-950 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-400">My Profiles</h1>
        {activeMainTab === "startup" && (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => router.push("/startup-registration")}
          >
            Add New Startup
          </Button>
        )}
        {activeMainTab === "incubation" && (
          <div className="flex flex-col items-end space-y-2">
            {hasApprovedIncubation && (
                <Button
                  className="bg-purple-600 text-white hover:bg-purple-700"
                  onClick={() => router.push(`/incubation-dashboard`)}
                >
                  Incubation Joined Startups
                </Button>
            )}
            {!hasIncubationProfile && (
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => router.push("/incubation-registration")}
              >
                Add New Incubation
              </Button>
            )}
            {hasIncubationProfile && (
              <p className="text-sm text-gray-400 text-right">You can only register one incubation center per account.</p>
            )}
          </div>
        )}
        {activeMainTab === "investor" && (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => router.push("/investor-registration")}
          >
            Add New Investor
          </Button>
        )}
        {activeMainTab === "mentor" && (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => router.push("/mentor-registration")}
          >
            Add New Mentor
          </Button>
        )}
      </div>
      <Tabs
        value={activeMainTab}
        onValueChange={(value) => setActiveMainTab(value as ProfileRoleType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 text-gray-300">
          <TabsTrigger value="startup" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Startups (
            {approvedStartups.length + pendingStartups.length + needsUpdateStartups.length + rejectedStartups.length})
          </TabsTrigger>
          <TabsTrigger value="incubation" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Incubations (
            {approvedIncubations.length +
              pendingIncubations.length +
              needsUpdateIncubations.length +
              rejectedIncubations.length}
            )
          </TabsTrigger>
          <TabsTrigger value="investor" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Investors (
            {approvedInvestors.length +
              pendingInvestors.length +
              needsUpdateInvestors.length +
              rejectedInvestors.length}
            )
          </TabsTrigger>
          <TabsTrigger value="mentor" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Mentors (
            {approvedMentors.length + pendingMentors.length + needsUpdateMentors.length + rejectedMentors.length})
          </TabsTrigger>
        </TabsList>

        {/* Content for Startups Tab */}
        <TabsContent value="startup" className="mt-6">
          <Tabs defaultValue="approved-startups" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 text-gray-300">
              <TabsTrigger
                value="approved-startups"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Approved ({approvedStartups.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending-startups"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Pending ({pendingStartups.length})
              </TabsTrigger>
              <TabsTrigger
                value="needs-update-startups"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Needs Update ({needsUpdateStartups.length})
              </TabsTrigger>
              <TabsTrigger
                value="rejected-startups"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Rejected ({rejectedStartups.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approved-startups" className="mt-6">
              {renderProfileList(approvedStartups, "approved", "startup")}
            </TabsContent>
            <TabsContent value="pending-startups" className="mt-6">
              {renderProfileList(pendingStartups, "pending", "startup")}
            </TabsContent>
            <TabsContent value="needs-update-startups" className="mt-6">
              {renderProfileList(needsUpdateStartups, "needs_update", "startup")}
            </TabsContent>
            <TabsContent value="rejected-startups" className="mt-6">
              {renderProfileList(rejectedStartups, "rejected", "startup")}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Content for Incubations Tab */}
        <TabsContent value="incubation" className="mt-6">
          <Tabs defaultValue="approved-incubations" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 text-gray-300">
              <TabsTrigger
                value="approved-incubations"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Approved ({approvedIncubations.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending-incubations"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Pending ({pendingIncubations.length})
              </TabsTrigger>
              <TabsTrigger
                value="needs-update-incubations"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Needs Update ({needsUpdateIncubations.length})
              </TabsTrigger>
              <TabsTrigger
                value="rejected-incubations"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Rejected ({rejectedIncubations.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approved-incubations" className="mt-6">
              {renderProfileList(approvedIncubations, "approved", "incubation")}
            </TabsContent>
            <TabsContent value="pending-incubations" className="mt-6">
              {renderProfileList(pendingIncubations, "pending", "incubation")}
            </TabsContent>
            <TabsContent value="needs-update-incubations" className="mt-6">
              {renderProfileList(needsUpdateIncubations, "needs_update", "incubation")}
            </TabsContent>
            <TabsContent value="rejected-incubations" className="mt-6">
              {renderProfileList(rejectedIncubations, "rejected", "incubation")}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Content for Investors Tab */}
        <TabsContent value="investor" className="mt-6">
          <Tabs defaultValue="approved-investors" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 text-gray-300">
              <TabsTrigger
                value="approved-investors"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Approved ({approvedInvestors.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending-investors"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Pending ({pendingInvestors.length})
              </TabsTrigger>
              <TabsTrigger
                value="needs-update-investors"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Needs Update ({needsUpdateInvestors.length})
              </TabsTrigger>
              <TabsTrigger
                value="rejected-investors"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Rejected ({rejectedInvestors.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approved-investors" className="mt-6">
              {renderProfileList(approvedInvestors, "approved", "investor")}
            </TabsContent>
            <TabsContent value="pending-investors" className="mt-6">
              {renderProfileList(pendingInvestors, "pending", "investor")}
            </TabsContent>
            <TabsContent value="needs-update-investors" className="mt-6">
              {renderProfileList(needsUpdateInvestors, "needs_update", "investor")}
            </TabsContent>
            <TabsContent value="rejected-investors" className="mt-6">
              {renderProfileList(rejectedInvestors, "rejected", "investor")}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Content for Mentors Tab */}
        <TabsContent value="mentor" className="mt-6">
          <Tabs defaultValue="approved-mentors" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 text-gray-300">
              <TabsTrigger
                value="approved-mentors"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Approved ({approvedMentors.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending-mentors"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Pending ({pendingMentors.length})
              </TabsTrigger>
              <TabsTrigger
                value="needs-update-mentors"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Needs Update ({needsUpdateMentors.length})
              </TabsTrigger>
              <TabsTrigger
                value="rejected-mentors"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
              >
                Rejected ({rejectedMentors.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approved-mentors" className="mt-6">
              {renderProfileList(approvedMentors, "approved", "mentor")}
            </TabsContent>
            <TabsContent value="pending-mentors" className="mt-6">
              {renderProfileList(pendingMentors, "pending", "mentor")}
            </TabsContent>
            <TabsContent value="needs-update-mentors" className="mt-6">
              {renderProfileList(needsUpdateMentors, "needs_update", "mentor")}
            </TabsContent>
            <TabsContent value="rejected-mentors" className="mt-6">
              {renderProfileList(rejectedMentors, "rejected", "mentor")}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}