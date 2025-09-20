"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaselib";
import { AdminApprovalCard } from "@/components/admin-approval-card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// --- START: All Profile types consolidated here ---
// The key fix is making the type definitions consistent.
export interface ApprovedStartup {
  id: string;
  user_id: string;
  startup_type: string | null; // This must match the props
  startup_name: string;
  description: string;
  location: string | null;
  language: string | null;
  domain: string | null;
  founder_names: string[] | null;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
  logo_url: string | null;
  full_name: string | null;
  email_address: string | null;
  phone_number: string | null;
  country: string | null;
  city: string | null;
  establishment_year: string | null;
  employee_count: string | null;
  startup_stage: string | null;
  revenue_model: string | null;
  funding_stage: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  support_needed: string[] | null;
  major_challenges: string | null;
  one_sentence_description: string | null;
  problem_being_solved: string | null;
  future_plans: string[] | null;
  team_members: Array<{
    name: string;
    designation: string;
    phoneCountryCode: string;
    localPhoneNumber: string;
    linkedin_url: string;
    profile_url?: string;
  }> | null;
  pitch_video_url: string | null;
  status: "approved";
  approved_at: string;
  rating: number | null;
}

export interface PendingStartup {
  id: string;
  user_id: string;
  startup_type: string | null; // This is the core fix. It should be nullable.
  startup_name: string;
  description: string;
  location: string | null;
  language: string | null;
  domain: string | null;
  founder_names: string[] | null;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
  logo_url: string | null;
  status: "pending" | "needs_update" | "rejected";
  reason: string | null;
  revenue_model?: string;
  funding_stage?: string;
  employee_count?: string;
  establishment_year?: string;
  instagram_url?: string;
  linkedin_url?: string;
  website_url?: string;
  support_needed?: string[];
  major_challenges?: string;
  one_sentence_description?: string;
  problem_being_solved?: string;
  future_plans?: string[];
  full_name?: string;
  email_address?: string;
  phone_number?: string;
  startup_stage?: string;
  team_members?: Array<{
    name: string;
    designation: string;
    phoneCountryCode: string;
    localPhoneNumber: string;
    linkedin_url: string;
    profile_url?: string;
  }> | null;
  pitch_video_url: string | null;
  rating?: number | null;
}

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
  interested_in_cross_border_collaborations: string;
  planned_expansions: string;
  key_challenges_you_face: string;
  first_goal_next_12_months: string;
  second_goal?: string;
  third_goal?: string;
  status: "pending" | "approved" | "rejected" | "needs_update";
  reason?: string;
  thumbnail_url: string | null;
  logo_url: string | null;
  rating?: number | null;
}

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
  status: "pending" | "approved" | "rejected" | "needs_update";
  reason?: string;
  bucket_amount?: number;
}

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
  status: "pending" | "approved" | "rejected" | "needs_update";
  reason?: string;
}

// These type aliases are crucial for the component logic
export type CreatorApproval = PendingStartup;
export type IncubationApproval = IncubationProfile;
export type InvestorApproval = InvestorProfile;
export type MentorApproval = MentorProfile;

export type AdminApprovalProfile =
  | CreatorApproval
  | IncubationApproval
  | InvestorApproval
  | MentorProfile;

export type ProfileRoleType = "startup" | "incubation" | "investor" | "mentor";
// --- END: All Profile types consolidated here ---

// Mapping of role type to Supabase approval table name
const APPROVAL_TABLE_MAP: Record<ProfileRoleType, string> = {
  startup: "creator_approval",
  incubation: "incubation_approval",
  investor: "investor_approval",
  mentor: "mentor_approval",
};

// Mapping of role type to Supabase main table name (for approval action and fetching approved data)
const MAIN_TABLE_MAP: Record<ProfileRoleType, string> = {
  startup: "creator",
  incubation: "incubation",
  investor: "investor",
  mentor: "mentor",
};

// Sub-tabs for status within each role tab
const STATUS_TABS = [
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
  { key: "needs_update", label: "Need Update" },
] as const;

type StatusKey = (typeof STATUS_TABS)[number]["key"];

// Main tabs for different profile roles
const ROLE_TABS = [
  { key: "startup", label: "Startups" },
  { key: "incubation", label: "Incubations" },
  { key: "investor", label: "Investors" },
  { key: "mentor", label: "Mentors" },
] as const;

export default function AdminApprovalsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeRoleTab, setActiveRoleTab] =
    useState<ProfileRoleType>("startup");
  const [activeStatusTab, setActiveStatusTab] = useState<StatusKey>("pending");
  const [approvals, setApprovals] = useState<AdminApprovalProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        setUser(null);
        throw new Error("User not authenticated. Please log in with an admin account.");
      }
      setUser(currentUser);

      let fetchedData: AdminApprovalProfile[] = [];
      let dataError: any = null;

      if (activeStatusTab === "approved") {
        const mainTableName = MAIN_TABLE_MAP[activeRoleTab];
        const { data, error } = await supabase
          .from(mainTableName)
          .select("*")
          .order("created_at", { ascending: false });
        fetchedData = (data as AdminApprovalProfile[]) || [];
        dataError = error;
      } else {
        const approvalTableName = APPROVAL_TABLE_MAP[activeRoleTab];
        const { data, error } = await supabase
          .from(approvalTableName)
          .select("*")
          .eq("status", activeStatusTab)
          .order("created_at", { ascending: false });
        fetchedData = (data as AdminApprovalProfile[]) || [];
        dataError = error;
      }

      if (dataError) {
        throw new Error(dataError.message);
      }
      setApprovals(fetchedData);
    } catch (err: any) {
      console.error("Error loading approvals:", err);
      setError(err.message || "Failed to load approvals.");
    } finally {
      setLoading(false);
    }
  }, [activeRoleTab, activeStatusTab]);

  useEffect(() => {
    fetchApprovals();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          router.push("/login");
        } else {
          fetchApprovals();
        }
      }
    );

    const handleWindowFocus = () => {
      fetchApprovals();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [fetchApprovals, router]);

  const handleApprovalAction = useCallback(
    async (
      profileId: string,
      actionType: "approve" | "reject" | "needs_update" | "rate",
      reason?: string,
      rating?: number | null
    ) => {
      setLoading(true);
      setError(null);
      try {
        const approvalProfile = approvals.find((p) => p.id === profileId);
        if (!approvalProfile) {
          throw new Error("Profile not found in current list for action.");
        }

        const approvalTableName = APPROVAL_TABLE_MAP[activeRoleTab];
        const mainTableName = MAIN_TABLE_MAP[activeRoleTab];

        if (actionType === "approve") {
          const { status, created_at, updated_at, ...mainTablePayload } =
            approvalProfile;

          const payloadForMainTable: any = {
            ...mainTablePayload,
            created_at: new Date(created_at).toISOString(),
            updated_at: new Date().toISOString(),
            approved_at: new Date().toISOString(),
            status: "approved",
          };

          if (activeRoleTab === "startup" || activeRoleTab === "incubation") {
              payloadForMainTable.rating = rating || (approvalProfile as CreatorApproval | IncubationApproval).rating || null;
          }

          if (activeRoleTab === "startup") {
            payloadForMainTable.Category = (approvalProfile as CreatorApproval).startup_type; // Include Category for startup profiles
          }

          const { error: insertError } = await supabase.from(mainTableName).insert(payloadForMainTable);
          if (insertError) {
            throw new Error(
              `Failed to insert into ${mainTableName}: ${insertError.message}`
            );
          }

          const { error: deleteError } = await supabase
            .from(approvalTableName)
            .delete()
            .eq("id", profileId);
          if (deleteError) {
            throw new Error(
              `Failed to delete from ${approvalTableName}: ${deleteError.message}`
            );
          }
          toast.success(`${activeRoleTab} profile approved successfully!`);
        } else if (actionType === "rate") {
            if (activeRoleTab !== "startup" && activeRoleTab !== "incubation") {
                throw new Error("Rating is only applicable for startup and incubation profiles.");
            }
            if (rating === undefined || rating === null) {
                throw new Error("Rating value is required for 'rate' action.");
            }
            const { error: updateError } = await supabase
                .from(approvalTableName)
                .update({
                    rating: rating,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", profileId);
            if (updateError) {
                throw new Error(`Failed to update rating in ${approvalTableName}: ${updateError.message}`);
            }
            toast.success(`${activeRoleTab} rating updated successfully!`);
        } else {
          const statusToStore =
            actionType === "reject" ? "rejected" : "needs_update";
          const { error: updateError } = await supabase
            .from(approvalTableName)
            .update({
              status: statusToStore,
              reason: reason || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profileId);
          if (updateError) {
            throw new Error(
              `Failed to update status in ${approvalTableName}: ${updateError.message}`
            );
          }
          toast.success(
            `${activeRoleTab} profile status updated to ${statusToStore.replace("_", " ")}!`
          );
        }
        
        // Re-fetch only the current tab's data after a successful action
        fetchApprovals();
      } catch (err: any) {
        console.error("Admin action error:", err);
        setError(err.message || "An unexpected error occurred during the action.");
        toast.error(err.message || "Action failed. Check console for details.");
        setLoading(false); // Make sure to turn off loading state on failure
      }
    },
    [activeRoleTab, approvals, fetchApprovals]
  );

  const renderApprovalList = (
    profiles: AdminApprovalProfile[],
    roleType: ProfileRoleType,
    status: StatusKey
  ) => {
    if (profiles.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          No {status.replace("_", " ")} {roleType} profiles found.
        </div>
      );
    }
    return (
      <div className="grid gap-6">
        {profiles.map((approval) => (
          <AdminApprovalCard
            approval={approval}
            roleType={roleType}
            key={approval.id}
            onApprove={(id, rating) => handleApprovalAction(id, "approve", undefined, rating)}
            onReject={(id, reason) => handleApprovalAction(id, "reject", reason)}
            onNeedUpdate={(id, reason) => handleApprovalAction(id, "needs_update", reason)}
            onRate={(id, rating) => handleApprovalAction(id, "rate", undefined, rating)}
            currentStatus={status}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <div className="text-lg">Loading admin approvals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-400 p-4 text-center">
        <div className="text-red-400 mb-4 whitespace-pre-line">{error}</div>
        <Button
          onClick={() => router.push("/login")}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 mt-24 px-4 space-y-8 bg-gray-950 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-400">Admin Approvals</h1>
      </div>
      <Tabs
        value={activeRoleTab}
        onValueChange={(value) => {
          setActiveRoleTab(value as ProfileRoleType);
          // Reset status tab to pending to show new data
          setActiveStatusTab("pending");
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 text-gray-300">
          {ROLE_TABS.map((roleTab) => (
            <TabsTrigger
              key={roleTab.key}
              value={roleTab.key}
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              {roleTab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {ROLE_TABS.map((roleTab) => (
          <TabsContent key={roleTab.key} value={roleTab.key} className="mt-6">
            <Tabs
              value={activeStatusTab}
              onValueChange={(value) => setActiveStatusTab(value as StatusKey)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 bg-gray-800 text-gray-300">
                {STATUS_TABS.map((statusTab) => (
                  <TabsTrigger
                    key={statusTab.key}
                    value={statusTab.key}
                    className={`data-[state=active]:bg-purple-600 data-[state=active]:text-white ${
                      statusTab.key === "rejected" ? "data-[state=active]:bg-red-600" : ""
                    }`}
                  >
                    {statusTab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {STATUS_TABS.map((statusTab) => (
                <TabsContent key={statusTab.key} value={statusTab.key} className="mt-6">
                  {renderApprovalList(
                    approvals.filter(a => a.status === statusTab.key), // Filter data based on the current tab
                    roleTab.key,
                    statusTab.key
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}