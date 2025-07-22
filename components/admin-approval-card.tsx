"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Loader2 } from "lucide-react"; // Loader2 for processing state
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // For notifications

// Import all profile types and the union type from admin/approvals/page.tsx
// IMPORTANT: Adjust this path if your types are defined in a different shared file
import {
  AdminApprovalProfile,
  ProfileRoleType,
  CreatorApproval, // Specific types needed for casting
  IncubationApproval,
  InvestorApproval,
  MentorApproval,
} from "@/app/admin/approvals/page"; // Ensure correct import path

import { VideoPlayerModal } from "./video-player-modal"; // Assuming this component exists
import { ProfileDetailModal } from "@/components/profile-detail-model"; // Import the new modal component
import {
  InvestorProfile,
  MentorProfile,
  IncubationProfile,
} from "@/app/my-startups/page"; // Re-import for type consistency if needed, though AdminApprovalProfile should cover it

interface AdminApprovalCardProps {
  approval: AdminApprovalProfile; // Now a generic AdminApprovalProfile
  roleType: ProfileRoleType; // New prop to specify the type of profile
  // Callbacks from parent for actions (id, actionType, reason?)
  onApprove: (id: string, actionType: "approve") => Promise<void>;
  onReject: (id: string, actionType: "reject", reason: string) => Promise<void>;
  onNeedUpdate: (
    id: string,
    actionType: "needs_update",
    reason: string,
  ) => Promise<void>;
  currentStatus: string; // The status of the tab this card is currently displayed in (e.g., 'pending', 'rejected', 'needs_update')
}

export function AdminApprovalCard({
  approval,
  roleType,
  onApprove,
  onReject,
  onNeedUpdate,
  currentStatus,
}: AdminApprovalCardProps) {
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [actionToConfirm, setActionToConfirm] = useState<
    "reject" | "needs_update" | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false); // New state to manage loading on buttons
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // State for the new detail modal

  // Safely access the status property common to all approval types
  const profileStatus = approval.status;
  const profileReason = (approval as any).reason; // Reason is optional, cast to any for direct access

  // Function to get the main title for the profile card based on its role type
  const getProfileTitle = () => {
    switch (roleType) {
      case "startup":
        return (approval as CreatorApproval).startup_name;
      case "incubation":
        return (approval as IncubationApproval).incubator_accelerator_name;
      case "investor":
        return (approval as InvestorApproval).full_name;
      case "mentor":
        return (approval as MentorApproval).full_name;
      default:
        return "Unknown Profile";
    }
  };

  // Function to get a subtitle/secondary detail for the profile card
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

  // Function to get the main description for the profile card
  const getProfileDescription = () => {
    switch (roleType) {
      case "startup":
        return (approval as CreatorApproval).description;
      case "incubation":
        return (approval as IncubationProfile).unique_value_proposition;
      case "investor":
        return (approval as InvestorProfile).investment_criteria;
      case "mentor":
        return (approval as MentorProfile).why_mentor_startups;
      default:
        return "No description available.";
    }
  };

  const getThumbnailUrl = () => {
    // Only startup profiles have specific thumbnail_url and pitch_video_url
    if (roleType === "startup") {
      return (approval as CreatorApproval).thumbnail_url || "/placeholder.svg";
    }
    // For other profile types, return a generic placeholder if no specific image field
    return "/placeholder.svg"; // Or a different default for other types
  };

  const getPitchVideoUrl = () => {
    if (roleType === "startup") {
      return (approval as CreatorApproval).pitch_video_url || null;
    }
    return null;
  };

  // State and logic for video player modal
  const [showVideoModal, setShowVideoModal] = useState(false);

  // When opening reason dialog, pre-fill reason if it exists from previous action
  useEffect(() => {
    if (showReasonDialog && actionToConfirm) {
      // Access reason dynamically based on the current approval object and its type
      setReason(profileReason || ""); // Use the reason stored in the approval itself
    } else if (!showReasonDialog) {
      setReason(""); // Clear reason when dialog closes
      setActionToConfirm(null); // Clear action type
    }
  }, [showReasonDialog, actionToConfirm, profileReason]); // Depend on relevant states/props

  // Handle submission of reason (for Reject/Need Update)
  const handleReasonSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }
    setIsProcessing(true); // Indicate processing
    try {
      if (actionToConfirm === "reject") {
        await onReject(approval.id, "reject", reason);
      } else if (actionToConfirm === "needs_update") {
        await onNeedUpdate(approval.id, "needs_update", reason);
      }
      setShowReasonDialog(false); // Close dialog on success
    } catch (err) {
      // Error handling is primarily done in parent component via toast
      console.error("Action submission error:", err);
    } finally {
      setIsProcessing(false); // End processing
    }
  };

  // Handle Approve action directly
  const handleApproveClick = async () => {
    setIsProcessing(true);
    try {
      await onApprove(approval.id, "approve");
    } catch (err) {
      console.error("Approve action error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger dialog for Reject
  const handleRejectClick = () => {
    setActionToConfirm("reject");
    setShowReasonDialog(true);
  };

  // Trigger dialog for Need Update
  const handleNeedUpdateClick = () => {
    setActionToConfirm("needs_update");
    setShowReasonDialog(true);
  };

  // Determine the color for the status tag
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
      className={`relative flex flex-col p-4 gap-4 border rounded-lg shadow-sm bg-gray-900 border-gray-700 hover:shadow-lg transition-shadow ${roleType === "startup" ? "md:flex-row items-start" : "items-start"}`}
    >
      {/* Role and Status Tag */}
      <div
        className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(profileStatus)}`}
      >
        {roleType.charAt(0).toUpperCase() + roleType.slice(1)}:{" "}
        {profileStatus
          ? profileStatus.replace("_", " ").charAt(0).toUpperCase() +
            profileStatus.replace("_", " ").slice(1)
          : "Unknown"}
      </div>

      {/* Thumbnail/Video Preview (only for Startup role) */}
      {roleType === "startup" && (
        <div
          className="relative w-full md:w-[240px] h-[160px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-950 cursor-pointer group"
          onClick={() => getPitchVideoUrl() && setShowVideoModal(true)}
        >
          <Image
            src={getThumbnailUrl()}
            alt={`${getProfileTitle()} Thumbnail`}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          {getPitchVideoUrl() && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Play className="h-12 w-12 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col gap-2 pt-8 md:pt-0">
        {" "}
        {/* Added padding to top for role tag */}
        <h3 className="text-lg font-semibold text-gray-100">
          {getProfileTitle()}
        </h3>
        {getProfileSubtitle() && (
          <p className="text-sm text-gray-300">{getProfileSubtitle()}</p>
        )}
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
          {getProfileDescription()}
        </p>
        {/* Display Founder Names / Other relevant tags for respective profile types */}
        {roleType === "startup" &&
          (approval as CreatorApproval).founder_names?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(approval as CreatorApproval).founder_names
                .filter(Boolean)
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
        {/* Display reason if available */}
        {profileReason && (
          <p className="text-red-300 text-sm mt-2">Reason: {profileReason}</p>
        )}
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            type="button"
            className="bg-purple-600 text-white hover:bg-purple-700 w-fit" // Removed flex-1 and min-w-[100px], added w-fit
            onClick={() => setIsDetailModalOpen(true)} // Open detail modal
          >
            View {/* Changed button text */}
          </Button>
          {currentStatus === "pending" && (
            <>
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
            <Button
              type="button"
              className="bg-green-600 text-white hover:bg-green-700 flex-1 min-w-[100px]"
              onClick={handleApproveClick}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Approve Updated"}
            </Button>
          )}
        </div>
      </div>

      {/* Reason Dialog */}
      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent className="sm:max-w-[425px] bg-[#0E0616] text-white border-[rgba(255,255,255,0.6)] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              {actionToConfirm === "reject"
                ? "Reason for Rejection"
                : "Reason for Need Update"}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Please provide a clear reason. This will be visible to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReasonDialog(false);
                setReason("");
                setActionToConfirm(null);
              }}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReasonSubmit}
              disabled={isProcessing || !reason.trim()} // Disable if no reason
              className={`${actionToConfirm === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"} text-white`}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Reason"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Player Modal (only shown for Startup role) */}
      {roleType === "startup" && getPitchVideoUrl() && (
        <VideoPlayerModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoUrl={getPitchVideoUrl() || ""} // Ensure it's not null/undefined
          title={getProfileTitle()}
        />
      )}

      {/* Professional Detail Modal (New) */}
      <ProfileDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        profile={approval} // Pass the approval object directly
        roleType={roleType}
      />
    </div>
  );
}