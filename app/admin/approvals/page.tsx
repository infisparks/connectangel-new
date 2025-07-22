"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaselib";
import { AdminApprovalCard } from "@/components/admin-approval-card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// --- Import all profile types from my-startups/page.tsx or a shared types file ---
import type {
  PendingStartup,
  IncubationProfile,
  InvestorProfile,
  MentorProfile,
} from "@/app/my-startups/page";

// Define specific Approval types that match the _approval tables.
export interface CreatorApproval extends PendingStartup {}
export interface IncubationApproval extends IncubationProfile {}
export interface InvestorApproval extends InvestorProfile {}
export interface MentorApproval extends MentorProfile {}

// Union type for any approval profile that the admin will manage
export type AdminApprovalProfile =
  | CreatorApproval
  | IncubationApproval
  | InvestorApproval
  | MentorApproval;

// Type for the role of the profile being approved/managed
export type ProfileRoleType = "startup" | "incubation" | "investor" | "mentor";

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
  const [approvals, setApprovals] = useState<
    Record<ProfileRoleType, Record<StatusKey, AdminApprovalProfile[]>>
  >({
    startup: { approved: [], pending: [], rejected: [], needs_update: [] },
    incubation: { approved: [], pending: [], rejected: [], needs_update: [] },
    investor: { approved: [], pending: [], rejected: [], needs_update: [] },
    mentor: { approved: [], pending: [], rejected: [], needs_update: [] },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // New function to fetch ALL approvals for ALL roles and statuses
  // This function now only fetches data and throws errors, it doesn't manage loading/error states directly.
  const fetchAllApprovals = useCallback(async (currentUserId: string | null) => {
    if (!currentUserId) {
      throw new Error("Not authenticated. Cannot fetch data.");
    }

    const newApprovals: Record<
      ProfileRoleType,
      Record<StatusKey, AdminApprovalProfile[]>
    > = {
      startup: { approved: [], pending: [], rejected: [], needs_update: [] },
      incubation: { approved: [], pending: [], rejected: [], needs_update: [] },
      investor: { approved: [], pending: [], rejected: [], needs_update: [] },
      mentor: { approved: [], pending: [], rejected: [], needs_update: [] },
    };
    let hasError = false;
    let errorMessage = "";

    for (const roleTab of ROLE_TABS) {
      for (const statusTab of STATUS_TABS) {
        let fetchedData: AdminApprovalProfile[] = [];
        let dataError: any = null;

        if (statusTab.key === "approved") {
          const mainTableName = MAIN_TABLE_MAP[roleTab.key];
          const { data, error } = await supabase
            .from(mainTableName)
            .select("*")
            .order("created_at", { ascending: false });
          fetchedData = (data as AdminApprovalProfile[]) || [];
          dataError = error;
        } else {
          const approvalTableName = APPROVAL_TABLE_MAP[roleTab.key];
          const { data, error } = await supabase
            .from(approvalTableName)
            .select("*")
            .eq("status", statusTab.key) // Use the statusTab.key directly
            .order("created_at", { ascending: false });
          fetchedData = (data as AdminApprovalProfile[]) || [];
          dataError = error;
        }

        if (dataError) {
          console.error(
            `Error fetching ${roleTab.key} ${statusTab.key} approvals:`,
            dataError.message,
          );
          errorMessage += `Error loading ${roleTab.key} ${statusTab.key}: ${dataError.message}\n`;
          hasError = true;
        } else {
          newApprovals[roleTab.key][statusTab.key] = fetchedData;
        }
      }
    }
    if (hasError) {
      throw new Error(errorMessage);
    }
    return newApprovals;
  }, []); // Empty dependency array for useCallback, as it only uses constants and the supabase client

  // Helper function to load data, wrapped in useCallback, managing loading/error states
  const loadData = useCallback(
    async (userId: string | null) => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const fetchedApprovals = await fetchAllApprovals(userId);
        setApprovals(fetchedApprovals);
      } catch (err: any) {
        console.error("Error loading approvals:", err);
        setError(err.message || "Failed to load approvals.");
      } finally {
        setLoading(false);
      }
    },
    [fetchAllApprovals],
  ); // Depends on fetchAllApprovals

  // Effect to manage user authentication and trigger initial data fetch
  useEffect(() => {
    const checkUserAndLoad = async () => {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        setUser(null);
        setError("User not authenticated. Please log in with an admin account.");
        setLoading(false);
        return;
      }
      setUser(currentUser);
      await loadData(currentUser.id);
    };

    checkUserAndLoad();

    // Listener for auth state changes (e.g., user logs in/out)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadData(session.user.id); // Re-fetch all on auth change
        } else {
          setUser(null);
          setApprovals({
            // Clear all data on logout
            startup: { approved: [], pending: [], rejected: [], needs_update: [] },
            incubation: { approved: [], pending: [], rejected: [], needs_update: [] },
            investor: { approved: [], pending: [], rejected: [], needs_update: [] },
            mentor: { approved: [], pending: [], rejected: [], needs_update: [] },
          });
          setError("You have been logged out or your session expired. Please log in.");
          setLoading(false);
        }
      },
    );

    // Add event listener for window focus to re-fetch data
    // This ensures data is fresh when the user returns to the tab.
    const handleWindowFocus = async () => {
      console.log("Window focused, re-fetching data...");
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (currentUser) {
        await loadData(currentUser.id);
      }
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener("focus", handleWindowFocus); // Clean up event listener
    };
  }, [loadData]); // Dependencies for useEffect now only include loadData

  const handleApprovalAction = useCallback(
    async (
      profileId: string,
      actionType: "approve" | "reject" | "needs_update",
      reason?: string,
    ) => {
      setLoading(true); // Set global loading for the action
      setError(null);
      try {
        const approvalProfile = approvals[activeRoleTab][activeStatusTab].find(
          (p) => p.id === profileId,
        );
        if (!approvalProfile) {
          throw new Error("Profile not found in current list for action.");
        }

        const approvalTableName = APPROVAL_TABLE_MAP[activeRoleTab];
        const mainTableName = MAIN_TABLE_MAP[activeRoleTab];

        if (actionType === "approve") {
          // Destructure to exclude 'status', 'created_at', 'updated_at' from direct insertion
          // as they are handled explicitly or are part of the approval table, not main table.
          // Ensure 'id' is included for the main table.
          const { status, created_at, updated_at, ...mainTablePayload } =
            approvalProfile;
          const { error: insertError } = await supabase.from(mainTableName).insert({
            ...mainTablePayload,
            created_at: new Date(created_at).toISOString(),
            updated_at: new Date().toISOString(),
            approved_at: new Date().toISOString(),
            status: "approved", // Explicitly set status to approved for the main table
          });
          if (insertError) {
            throw new Error(
              `Failed to insert into ${mainTableName}: ${insertError.message}`,
            );
          }

          const { error: deleteError } = await supabase
            .from(approvalTableName)
            .delete()
            .eq("id", profileId);
          if (deleteError) {
            throw new Error(
              `Failed to delete from ${approvalTableName}: ${deleteError.message}`,
            );
          }
          toast.success(`${activeRoleTab} profile approved successfully!`);
        } else {
          // For 'reject' and 'needs_update' actions, ensure the status stored matches the frontend keys
          const statusToStore =
            actionType === "reject" ? "rejected" : "needs_update"; // Fix: Store "rejected"
          const { error: updateError } = await supabase
            .from(approvalTableName)
            .update({
              status: statusToStore, // Use the corrected status key
              reason: reason || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profileId);
          if (updateError) {
            throw new Error(
              `Failed to update status in ${approvalTableName}: ${updateError.message}`,
            );
          }
          toast.success(
            `${activeRoleTab} profile status updated to ${statusToStore.replace("_", " ")}!`,
          );
        }

        // After any successful action, re-fetch all data to ensure consistency across tabs
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (currentUser) {
          await loadData(currentUser.id); // Use the new loadData helper to refresh all data
        }
      } catch (err: any) {
        console.error("Admin action error:", err);
        setError(err.message || "An unexpected error occurred during the action.");
        toast.error(err.message || "Action failed. Check console for details.");
      } finally {
        setLoading(false); // End global loading
      }
    },
    [activeRoleTab, activeStatusTab, approvals, loadData], // Ensure loadData is a dependency
  );

  const renderApprovalList = (
    profiles: AdminApprovalProfile[],
    roleType: ProfileRoleType,
    status: StatusKey,
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
            onApprove={handleApprovalAction}
            onReject={handleApprovalAction}
            onNeedUpdate={handleApprovalAction}
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
        {/* No "Add New" button here as this is an approval page */}
      </div>
      <Tabs
        value={activeRoleTab}
        onValueChange={(value) => setActiveRoleTab(value as ProfileRoleType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 text-gray-300">
          {ROLE_TABS.map((roleTab) => (
            <TabsTrigger
              key={roleTab.key}
              value={roleTab.key}
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              {roleTab.label} ({Object.values(approvals[roleTab.key]).flat().length})
            </TabsTrigger>
          ))}
        </TabsList>
        {ROLE_TABS.map((roleTab) => (
          <TabsContent key={roleTab.key} value={roleTab.key} className="mt-6">
            <Tabs
              defaultValue={activeStatusTab}
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
                    {statusTab.label} (
                    {approvals[roleTab.key][statusTab.key]?.length || 0})
                  </TabsTrigger>
                ))}
              </TabsList>
              {STATUS_TABS.map((statusTab) => (
                <TabsContent key={statusTab.key} value={statusTab.key} className="mt-6">
                  {renderApprovalList(
                    approvals[roleTab.key][statusTab.key],
                    roleTab.key,
                    statusTab.key,
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