"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- START: All Profile types consolidated here ---
// This ensures the component is self-contained and avoids import errors.

export interface ApprovedStartup {
  id: string;
  user_id: string;
  startup_type: string | null; // Corrected to be nullable
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
  pitch_video_url: string | null; // Corrected to be nullable
  status: "approved";
  approved_at: string;
  rating: number | null;
}

export interface PendingStartup {
  id: string;
  user_id: string;
  startup_type: string | null; // Corrected to be nullable
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
  pitch_video_url: string | null; // Corrected to be nullable
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

export interface CreatorApproval extends PendingStartup {}
export interface IncubationApproval extends IncubationProfile {}
export interface InvestorApproval extends InvestorProfile {}
export interface MentorApproval extends MentorProfile {}

export type AdminApprovalProfile =
  | CreatorApproval
  | IncubationApproval
  | InvestorApproval
  | MentorApproval;

export type ProfileRoleType = "startup" | "incubation" | "investor" | "mentor";

// --- END: Profile types ---

import { VideoPlayerModal } from "./video-player-modal";
import { ProfileDetailModal } from "@/components/profile-detail-model";

interface AdminApprovalCardProps {
  approval: AdminApprovalProfile;
  roleType: ProfileRoleType;
  onApprove: (id: string, rating: number | null) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onNeedUpdate: (id: string, reason: string) => Promise<void>;
  onRate: (id: string, rating: number) => Promise<void>;
  currentStatus: string;
}

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("/storage/")) {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.endsWith('/')
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}${path}`;
  }
  return path;
};

const getVideoUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith("/storage/")) {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.endsWith('/')
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}${path}`;
  }
  return path;
};

export function AdminApprovalCard({
  approval,
  roleType,
  onApprove,
  onReject,
  onNeedUpdate,
  onRate,
  currentStatus,
}: AdminApprovalCardProps) {
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [actionToConfirm, setActionToConfirm] = useState<
    "reject" | "needs_update" | "rate" | "pre_approve_rate" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [ratingInput, setRatingInput] = useState<string>("");
  const [showVideoModal, setShowVideoModal] = useState(false);

  const profileStatus = approval.status;
  const profileReason = (approval as any).reason;
  const profileRating = (approval as CreatorApproval | IncubationApproval).rating;

  const getProfileTitle = () => {
    switch (roleType) {
      case "startup":
        return (approval as CreatorApproval).startup_name;
      case "incubation":
        return (approval as IncubationApproval).incubator_accelerator_name;
      case "investor":
        return (approval as InvestorProfile).full_name;
      case "mentor":
        return (approval as MentorProfile).full_name;
      default:
        return "Unknown Profile";
    }
  };

  const getProfileSubtitle = () => {
    switch (roleType) {
      case "startup":
        const startup = approval as CreatorApproval;
        return `${startup.startup_type || ""} • ${startup.domain || ""}`;
      case "incubation":
        const incubation = approval as IncubationProfile;
        return `${incubation.type_of_incubator || ""} • ${incubation.city || ""}, ${incubation.country || ""}`;
      case "investor":
        const investor = approval as InvestorProfile;
        return `${investor.investor_type || ""} • ${investor.typical_investment_range || ""}`;
      case "mentor":
        const mentor = approval as MentorProfile;
        return `${mentor.current_position_title || ""} at ${mentor.organization_company || ""}`;
      default:
        return "";
    }
  };

  const getProfileDescription = () => {
    switch (roleType) {
      case "startup":
        return (approval as CreatorApproval).description;
      case "incubation":
        const incubation = approval as IncubationProfile;
        return incubation.unique_value_proposition;
      case "investor":
        const investor = approval as InvestorProfile;
        return investor.investment_criteria;
      case "mentor":
        const mentor = approval as MentorProfile;
        return mentor.why_mentor_startups;
      default:
        return "No description available.";
    }
  };

  const getThumbnailPath = () => {
    if (roleType === "startup") {
      return (approval as CreatorApproval).thumbnail_url || null;
    }
    if (roleType === "incubation") {
      return (approval as IncubationProfile).thumbnail_url || null;
    }
    return null;
  };

  const getLogoPath = () => {
    if (roleType === "startup") {
      return (approval as CreatorApproval).logo_url || null;
    }
    if (roleType === "incubation") {
      return (approval as IncubationProfile).logo_url || null;
    }
    return null;
  };

  const getPitchVideoPath = () => {
    if (roleType === "startup") {
      return (approval as CreatorApproval).pitch_video_url || null;
    }
    return null;
  };
  
  const fullThumbnailUrl = getImageUrl(getThumbnailPath());
  const fullLogoUrl = getImageUrl(getLogoPath());
  const fullVideoUrl = getVideoUrl(getPitchVideoPath());

  useEffect(() => {
    if (showReasonDialog && actionToConfirm) {
      if (actionToConfirm === "rate" || actionToConfirm === "pre_approve_rate") {
        setRatingInput(profileRating?.toString() || "");
      } else {
        setReason(profileReason || "");
      }
    } else if (!showReasonDialog) {
      setReason("");
      setRatingInput("");
      setActionToConfirm(null);
    }
  }, [showReasonDialog, actionToConfirm, profileReason, profileRating]);

  const handleDialogSubmit = async () => {
    setIsProcessing(true);
    try {
      if (actionToConfirm === "reject") {
        if (!reason.trim()) {
          toast.error("Please provide a reason for rejection.");
          return;
        }
        await onReject(approval.id, reason);
      } else if (actionToConfirm === "needs_update") {
        if (!reason.trim()) {
          toast.error("Please provide a reason for needing an update.");
          return;
        }
        await onNeedUpdate(approval.id, reason);
      } else if (actionToConfirm === "rate") {
        const parsedRating = parseInt(ratingInput);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 100) {
          toast.error("Please enter a rating between 1 and 100.");
          return;
        }
        await onRate(approval.id, parsedRating);
      } else if (actionToConfirm === "pre_approve_rate") {
        const parsedRating = parseInt(ratingInput);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 100) {
          toast.error("Please enter a rating between 1 and 100.");
          return;
        }
        await onApprove(approval.id, parsedRating);
      }
      setShowReasonDialog(false);
    } catch (err) {
      console.error("Action submission error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveClick = () => {
    if (roleType === "startup" || roleType === "incubation") {
      if (profileRating === null || profileRating === undefined) {
        setActionToConfirm("pre_approve_rate");
        setShowReasonDialog(true);
      } else {
        onApprove(approval.id, profileRating);
      }
    } else {
      onApprove(approval.id, null);
    }
  };

  const handleRejectClick = () => {
    setActionToConfirm("reject");
    setShowReasonDialog(true);
  };

  const handleNeedUpdateClick = () => {
    setActionToConfirm("needs_update");
    setShowReasonDialog(true);
  };

  const handleRateClick = () => {
    setActionToConfirm("rate");
    setShowReasonDialog(true);
  };

  const getStatusColorClass = (status: string | undefined) => {
    switch (status) {
      case "approved":
        return "bg-green-600 text-white";
      case "pending":
        return "bg-yellow-600 text-white";
      case "rejected":
        return "bg-red-600 text-white";
      case "needs_update":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div
      className={`relative flex flex-col p-4 gap-4 border rounded-lg shadow-sm bg-gray-900 border-gray-700 hover:shadow-lg transition-shadow ${roleType === "startup" || roleType === "incubation" ? "md:flex-row items-start" : "items-start"}`}
    >
      <div
        className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(profileStatus)} z-20`}
      >
        {roleType.charAt(0).toUpperCase() + roleType.slice(1)}:{" "}
        {profileStatus
          ? profileStatus.replace("_", " ").charAt(0).toUpperCase() +
            profileStatus.replace("_", " ").slice(1)
          : "Unknown"}
      </div>

      {(roleType === "startup" || roleType === "incubation") && (
        <div className="relative w-full md:w-[240px] h-[160px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-950 z-10 mt-12 md:mt-0">
          {profileStatus === "approved" && profileRating !== null && profileRating !== undefined && (
            <div className="absolute top-2 left-2 z-10 bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-white" />
              Rating: {profileRating}/100
            </div>
          )}
          <div
            className="w-full h-full cursor-pointer group"
            onClick={() => fullVideoUrl && setShowVideoModal(true)}
          >
            <Image
              src={fullThumbnailUrl}
              alt={`${getProfileTitle()} Thumbnail`}
              fill
              style={{ objectFit: "cover" }}
              className="transition-transform duration-300 group-hover:scale-105"
            />
            {fullVideoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Play className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
          {fullLogoUrl && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-gray-800 bg-gray-800 overflow-hidden shadow-lg z-30">
              <Image src={fullLogoUrl} alt={`${getProfileTitle()} Logo`} fill className="object-cover" />
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col gap-2 pt-8 md:pt-0">
        <h3 className="text-lg font-semibold text-gray-100">
          {getProfileTitle()}
        </h3>
        {getProfileSubtitle() && (
          <p className="text-sm text-gray-300">{getProfileSubtitle()}</p>
        )}
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
          {getProfileDescription()}
        </p>
        {roleType === "startup" &&
          Array.isArray((approval as CreatorApproval)?.founder_names) &&
          ((approval as CreatorApproval)?.founder_names?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(approval as CreatorApproval)?.founder_names
                ?.filter((name) => typeof name === "string" && name.trim() !== "")
                .map((name, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-purple-700 text-purple-100 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    {name}
                  </span>
                ))}
            </div>
          )}
        {profileReason && currentStatus !== "approved" && (
          <p className="text-red-300 text-sm mt-2">Reason: {profileReason}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            type="button"
            className="bg-purple-600 text-white hover:bg-purple-700 w-fit"
            onClick={() => setIsDetailModalOpen(true)}
          >
            View
          </Button>
          {currentStatus === "pending" && (
            <>
              {(roleType === "startup" || roleType === "incubation") && (
                <Button
                  type="button"
                  className="bg-yellow-600 text-white hover:bg-yellow-700 flex-1 min-w-[100px]"
                  onClick={handleRateClick}
                  disabled={isProcessing}
                >
                  Rate
                </Button>
              )}
              <Button
                type="button"
                className="bg-green-600 text-white hover:bg-green-700 flex-1 min-w-[100px]"
                onClick={handleApproveClick}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Approve"}
              </Button>
              <Button
                type="button"
                className="bg-red-600 text-white hover:bg-red-700 flex-1 min-w-[100px]"
                onClick={handleRejectClick}
                disabled={isProcessing}
              >
                Reject
              </Button>
              <Button
                type="button"
                className="bg-blue-600 text-white hover:bg-blue-700 flex-1 min-w-[100px]"
                onClick={handleNeedUpdateClick}
                disabled={isProcessing}
              >
                Need Update
              </Button>
            </>
          )}
          {currentStatus === "rejected" && (
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700 flex-1 min-w-[100px]"
              onClick={handleNeedUpdateClick}
              disabled={isProcessing}
            >
              Request Update
            </Button>
          )}
          {currentStatus === "needs_update" && (
            <>
              {(roleType === "startup" || roleType === "incubation") && (
                <Button
                  type="button"
                  className="bg-yellow-600 text-white hover:bg-yellow-700 flex-1 min-w-[100px]"
                  onClick={handleRateClick}
                  disabled={isProcessing}
                >
                  Rate
                </Button>
              )}
              <Button
                type="button"
                className="bg-green-600 text-white hover:bg-green-700 flex-1 min-w-[100px]"
                onClick={handleApproveClick}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Approve Updated"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent className="sm:max-w-[425px] bg-[#0E0616] text-white border-[rgba(255,255,255,0.6)] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              {actionToConfirm === "reject"
                ? "Reason for Rejection"
                : actionToConfirm === "needs_update"
                ? "Reason for Need Update"
                : "Rate Profile"}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              {actionToConfirm === "rate" || actionToConfirm === "pre_approve_rate"
                ? "Please enter a rating between 1 and 100."
                : "Please provide a clear reason. This will be visible to the user."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {actionToConfirm === "rate" || actionToConfirm === "pre_approve_rate" ? (
              <>
                <Label htmlFor="rating" className="text-right text-neutral-300">
                  Rating (1-100)
                </Label>
                <Input
                  id="rating"
                  type="number"
                  value={ratingInput}
                  onChange={(e) => setRatingInput(e.target.value)}
                  min="1"
                  max="100"
                  className="col-span-3 bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg"
                  required
                />
              </>
            ) : (
              <>
                <Label htmlFor="reason" className="text-right text-neutral-300">
                  Reason
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="col-span-3 bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[100px]"
                  required
                />
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReasonDialog(false);
                setReason("");
                setRatingInput("");
                setActionToConfirm(null);
              }}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDialogSubmit}
              disabled={isProcessing || ((actionToConfirm === "rate" || actionToConfirm === "pre_approve_rate") ? !ratingInput.trim() : !reason.trim())}
              className={`${actionToConfirm === "reject" ? "bg-red-600 hover:bg-red-700" : actionToConfirm === "rate" || actionToConfirm === "pre_approve_rate" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : actionToConfirm === "rate" || actionToConfirm === "pre_approve_rate" ? (
                "Submit Rating"
              ) : (
                "Submit Reason"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {roleType === "startup" && fullVideoUrl && (
        <VideoPlayerModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoUrl={fullVideoUrl}
          title={getProfileTitle()}
        />
      )}

      <ProfileDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        profile={approval}
        roleType={roleType}
      />
    </div>
  );
}