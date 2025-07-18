"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabaselib"
import { UserProfileCard } from "@/components/user-profile-card"
import { Loader2 } from "lucide-react"

// --- Define Interfaces (Moved to top-level and comments fixed) ---

// For approved startup data (from 'creator' table)
export interface ApprovedStartup {
  id: string;
  user_id: string;
  startup_type: string;
  startup_name: string;
  description: string;
  location: string;
  language: string;
  domain: string;
  founder_names: string[];
  pitch_video_url: string;
  thumbnail_url: string;
  status: string; // 'approved'
  created_at: string;
  updated_at: string;
  approved_at?: string;
  revenue_model?: string;
  funding_stage?: string;
  employee_count?: string;
  establishment_year?: string;
  instagram_url?: string;
  linkedin_url?: string;
  website_url?: string;
  support_needed?: string[];
  major_challenges?: string;
  problem_being_solved?: string;
  future_plans?: string;
  full_name?: string; // Contact person's full name
  email_address?: string; // Contact person's email
  phone_number?: string; // Contact person's phone
  startup_stage?: string;
  team_members?: Array<{ name: string; designation: string; phoneCountryCode: string; localPhoneNumber: string }>;
}

// For pending startup data (from 'creator_approval' table)
export interface PendingStartup {
  id: string;
  user_id: string;
  startup_type: string;
  startup_name: string;
  description: string;
  location: string;
  language: string;
  domain: string;
  founder_names: string[];
  pitch_video_url: string;
  thumbnail_url: string;
  status: string; // 'pending'
  created_at: string;
  updated_at: string;
  revenue_model?: string;
  funding_stage?: string;
  employee_count?: string;
  establishment_year?: string;
  instagram_url?: string;
  linkedin_url?: string;
  website_url?: string;
  support_needed?: string[];
  major_challenges?: string;
  problem_being_solved?: string;
  future_plans?: string;
  full_name?: string; // Contact person's full name
  email_address?: string; // Contact person's email
  phone_number?: string; // Contact person's phone
  startup_stage?: string;
  team_members?: Array<{ name: string; designation: string; phoneCountryCode: string; localPhoneNumber: string }>;
}

// For Incubation data (from 'incubation_approval' table - handles both pending and approved via status)
export interface IncubationProfile {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    full_name: string;
    email_address: string;
    phone_country_code: string;
    local_phone_number: string;
    country: string;
    city: string;
    incubator_accelerator_name: string;
    type_of_incubator: string;
    year_established: number;
    website: string;
    linkedin_profile?: string;
    physical_address: string;
    affiliated_organization_university?: string;
    registration_number?: string;
    primary_focus_areas: string[];
    specify_other_focus_area?: string;
    services_offered_to_startups: string[];
    specify_other_services?: string;
    eligibility_criteria: string;
    total_funding_raised_by_alumni: string;
    percentage_startups_operational_after_3_yrs: number;
    notable_alumni_startups: Array<{ startupName: string; websiteUrl: string }>;
    unique_value_proposition: string;
    problem_gaps_solved_in_ecosystem: string;
    preferred_startup_stages: string[];
    interested_in_cross_border_collaborations: string; // "Yes" or "No"
    planned_expansions: string;
    key_challenges_you_face: string;
    first_goal_next_12_months: string;
    second_goal?: string;
    third_goal?: string;
    status: string; // 'pending', 'approved', 'rejected'
}

// For Investor data (from 'investor_approval' table - handles both pending and approved via status)
export interface InvestorProfile {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    full_name: string;
    email_address: string;
    phone_country_code: string;
    local_phone_number: string;
    country: string;
    city: string;
    linkedin_profile?: string;
    investor_type: string;
    typical_investment_range: string;
    investment_stage_preference: string[];
    preferred_sectors_industries: string[];
    other_sector_industry?: string;
    has_invested_before: boolean;
    number_of_startups_invested?: number;
    example_startups?: string;
    average_ticket_size?: string;
    looking_for_new_opportunities: boolean;
    investment_criteria: string;
    support_offered_apart_from_funding: string[];
    other_support_type?: string;
    require_specific_country_region: boolean;
    specific_country_region?: string;
    status: string; // 'pending', 'approved', 'rejected'
}

// For Mentor data (from 'mentor_approval' table - handles both pending and approved via status)
export interface MentorProfile {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    full_name: string;
    email_address: string;
    phone_number: string;
    gender: string;
    linkedin_profile?: string;
    city: string;
    personal_website?: string;
    country: string;
    current_position_title: string;
    organization_company: string;
    years_of_experience: number;
    key_areas_of_expertise: string[];
    other_expertise_area?: string;
    mentorship_domains: string[];
    other_mentorship_domain?: string;
    preferred_startup_stage: string;
    mentorship_mode: string;
    weekly_availability: string;
    languages_spoken: string[];
    why_mentor_startups: string;
    proud_mentoring_experience: string;
    industries_most_excited_to_mentor: string;
    open_to_other_contributions: string[];
    other_contribution_type?: string;
    status: string; // 'pending', 'approved', 'rejected'
}

// Union type for all possible profile data
export type ProfileData = ApprovedStartup | PendingStartup | IncubationProfile | InvestorProfile | MentorProfile;

// Type for the role of the profile being displayed
export type ProfileRoleType = "startup" | "incubation" | "investor" | "mentor";


export default function MyProfilesPage() { // Renamed from MyStartupsPage
  // State for each profile type, separated by approved/pending
  const [approvedStartups, setApprovedStartups] = useState<ApprovedStartup[]>([])
  const [pendingStartups, setPendingStartups] = useState<PendingStartup[]>([])

  const [approvedIncubations, setApprovedIncubations] = useState<IncubationProfile[]>([])
  const [pendingIncubations, setPendingIncubations] = useState<IncubationProfile[]>([])

  const [approvedInvestors, setApprovedInvestors] = useState<InvestorProfile[]>([])
  const [pendingInvestors, setPendingInvestors] = useState<InvestorProfile[]>([])

  const [approvedMentors, setApprovedMentors] = useState<MentorProfile[]>([])
  const [pendingMentors, setPendingMentors] = useState<MentorProfile[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeMainTab, setActiveMainTab] = useState<ProfileRoleType>("startup"); // State for main tabs

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

    const userId = user.id;

    // --- Fetch Startups ---
    // Fetch approved startups from 'creator' table
    const { data: approvedStartupData, error: approvedStartupError } = await supabase
      .from("creator")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (approvedStartupError) {
      console.error("Error fetching approved startups:", approvedStartupError.message)
      setError("Error loading approved startups: " + approvedStartupError.message)
    } else {
      setApprovedStartups(approvedStartupData as ApprovedStartup[])
    }

    // Fetch pending approvals from 'creator_approval' table
    const { data: pendingStartupData, error: pendingStartupError } = await supabase
      .from("creator_approval")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending") // Explicitly filter for pending status
      .order("created_at", { ascending: false })
    if (pendingStartupError) {
      console.error("Error fetching pending startups:", pendingStartupError.message)
      setError((prev) => (prev ? prev + "\n" : "") + "Error loading pending startups: " + pendingStartupError.message)
    } else {
      setPendingStartups(pendingStartupData as PendingStartup[])
    }

    // --- Fetch Incubations (from incubation_approval, filter by status) ---
    const { data: incubationData, error: incubationError } = await supabase
      .from("incubation_approval")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (incubationError) {
      console.error("Error fetching incubations:", incubationError.message)
      setError((prev) => (prev ? prev + "\n" : "") + "Error loading incubations: " + incubationError.message)
    } else {
      setApprovedIncubations(incubationData.filter(p => p.status === 'approved') as IncubationProfile[]);
      setPendingIncubations(incubationData.filter(p => p.status === 'pending') as IncubationProfile[]);
    }

    // --- Fetch Investors (from investor_approval, filter by status) ---
    const { data: investorData, error: investorError } = await supabase
      .from("investor_approval")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (investorError) {
      console.error("Error fetching investors:", investorError.message)
      setError((prev) => (prev ? prev + "\n" : "") + "Error loading investors: " + investorError.message)
    } else {
      setApprovedInvestors(investorData.filter(p => p.status === 'approved') as InvestorProfile[]);
      setPendingInvestors(investorData.filter(p => p.status === 'pending') as InvestorProfile[]);
    }

    // --- Fetch Mentors (from mentor_approval, filter by status) ---
    const { data: mentorData, error: mentorError } = await supabase
      .from("mentor_approval")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (mentorError) {
      console.error("Error fetching mentors:", mentorError.message)
      setError((prev) => (prev ? prev + "\n" : "") + "Error loading mentors: " + mentorError.message)
    } else {
      setApprovedMentors(mentorData.filter(p => p.status === 'approved') as MentorProfile[]);
      setPendingMentors(mentorData.filter(p => p.status === 'pending') as MentorProfile[]);
    }

    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchMyProfiles()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchMyProfiles()
      } else {
        // Clear all data on logout
        setApprovedStartups([])
        setPendingStartups([])
        setApprovedIncubations([])
        setPendingIncubations([])
        setApprovedInvestors([])
        setPendingInvestors([])
        setApprovedMentors([])
        setPendingMentors([])
        setLoading(false);
        setError("You have been logged out or your session expired. Please log in.")
        router.push("/register")
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [fetchMyProfiles, router])

  const renderProfileList = (profiles: ProfileData[], type: "approved" | "pending", roleType: ProfileRoleType) => {
    if (profiles.length === 0) {
      return <div className="text-center text-gray-500 py-10">No {type} {roleType} profiles found.</div>;
    }
    return (
      <div className="grid gap-6">
        {profiles.map((profile) => (
          <UserProfileCard key={profile.id} profile={profile} roleType={roleType} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <div className="text-lg">Loading your profiles...</div>
      </div>
    )
  }

  if (error && error.includes("logged in")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-400 p-4 text-center">
        <div className="text-red-400 mb-4 whitespace-pre-line">{error}</div>
        <Button onClick={() => router.push("/register")} className="bg-purple-600 hover:bg-purple-700 text-white">
          Go to Login / Register
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-400 p-4 text-center">
        <div className="text-red-400 mb-4 whitespace-pre-line">An error occurred: {error}</div>
        <Button onClick={fetchMyProfiles} className="bg-purple-600 hover:bg-purple-700 text-white">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 mt-24 px-4 space-y-8 bg-gray-950 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-400">My Profiles</h1>
        {/* Dynamic Add New Button based on active tab */}
        {activeMainTab === "startup" && (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => router.push("/startup-registration")}
          >
            Add New Startup
          </Button>
        )}
        {activeMainTab === "incubation" && (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => router.push("/incubation-registration")}
          >
            Add New Incubation
          </Button>
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

      <Tabs value={activeMainTab} onValueChange={(value) => setActiveMainTab(value as ProfileRoleType)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 text-gray-300">
          <TabsTrigger value="startup" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Startups ({approvedStartups.length + pendingStartups.length})
          </TabsTrigger>
          <TabsTrigger value="incubation" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Incubations ({approvedIncubations.length + pendingIncubations.length})
          </TabsTrigger>
          <TabsTrigger value="investor" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Investors ({approvedInvestors.length + pendingInvestors.length})
          </TabsTrigger>
          <TabsTrigger value="mentor" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Mentors ({approvedMentors.length + pendingMentors.length})
          </TabsTrigger>
        </TabsList>

        {/* Content for Startups Tab */}
        <TabsContent value="startup" className="mt-6">
          <Tabs defaultValue="approved-startups" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 text-gray-300">
              <TabsTrigger value="approved-startups" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Approved ({approvedStartups.length})
              </TabsTrigger>
              <TabsTrigger value="pending-startups" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Pending ({pendingStartups.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approved-startups" className="mt-6">
              {renderProfileList(approvedStartups, "approved", "startup")}
            </TabsContent>
            <TabsContent value="pending-startups" className="mt-6">
              {renderProfileList(pendingStartups, "pending", "startup")}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Content for Incubations Tab */}
        <TabsContent value="incubation" className="mt-6">
          <Tabs defaultValue="approved-incubations" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 text-gray-300">
              <TabsTrigger value="approved-incubations" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Approved ({approvedIncubations.length})
              </TabsTrigger>
              <TabsTrigger value="pending-incubations" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Pending ({pendingIncubations.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approved-incubations" className="mt-6">
              {renderProfileList(approvedIncubations, "approved", "incubation")}
            </TabsContent>
            <TabsContent value="pending-incubations" className="mt-6">
              {renderProfileList(pendingIncubations, "pending", "incubation")}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Content for Investors Tab */}
        <TabsContent value="investor" className="mt-6">
          <Tabs defaultValue="approved-investors" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 text-gray-300">
              <TabsTrigger value="approved-investors" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Approved ({approvedInvestors.length})
              </TabsTrigger>
              <TabsTrigger value="pending-investors" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Pending ({pendingInvestors.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approved-investors" className="mt-6">
              {renderProfileList(approvedInvestors, "approved", "investor")}
            </TabsContent>
            <TabsContent value="pending-investors" className="mt-6">
              {renderProfileList(pendingInvestors, "pending", "investor")}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Content for Mentors Tab */}
        <TabsContent value="mentor" className="mt-6">
          <Tabs defaultValue="approved-mentors" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 text-gray-300">
              <TabsTrigger value="approved-mentors" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Approved ({approvedMentors.length})
              </TabsTrigger>
              <TabsTrigger value="pending-mentors" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Pending ({pendingMentors.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approved-mentors" className="mt-6">
              {renderProfileList(approvedMentors, "approved", "mentor")}
            </TabsContent>
            <TabsContent value="pending-mentors" className="mt-6">
              {renderProfileList(pendingMentors, "pending", "mentor")}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
