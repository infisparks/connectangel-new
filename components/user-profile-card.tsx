// components/user-profile-card.tsx

"use client";

import Image from "next/image";
import { Play, Star, MoreVertical, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VideoPlayerModal } from "./video-player-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import all types directly from the page file
import {
  ProfileData,
  ProfileRoleType,
  ApprovedStartup,
  PendingStartup,
  IncubationProfile,
  InvestorProfile,
  MentorProfile,
} from "@/types";
import { ProfileDetailModal } from "@/components/profile-detail-model";

interface UserProfileCardProps {
  profile: ProfileData;
  roleType: ProfileRoleType;
}

// Helper function to get flag emojis
function getFlagEmoji(countryName: string | null) {
  const countryCodeMap: { [key: string]: string } = {
    "Indonesia": "🇮🇩",
    "Bahrain": "🇧🇭",
    "Serbia": "🇷🇸",
    "India": "🇮🇳",
    "United States": "🇺🇸"
  };
  return countryName ? countryCodeMap[countryName] || "🌍" : "🌍";
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

export function UserProfileCard({ profile, roleType }: UserProfileCardProps) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const statusText = (profile.status || "Pending").replace("_", " ");
  const statusColor =
    profile.status === "approved"
      ? "bg-green-600"
      : profile.status === "pending"
        ? "bg-yellow-600"
        : profile.status === "needs_update"
          ? "bg-blue-600"
          : "bg-red-600";

  const isStartupOrIncubation = roleType === "startup" || roleType === "incubation";

  const getThumbnailPath = () => {
    if (roleType === "startup") {
      return (profile as ApprovedStartup | PendingStartup).thumbnail_url;
    }
    if (roleType === "incubation") {
      return (profile as IncubationProfile).thumbnail_url;
    }
    return null;
  };

  const getLogoPath = () => {
    if (roleType === "startup") {
      return (profile as ApprovedStartup | PendingStartup).logo_url;
    }
    if (roleType === "incubation") {
      return (profile as IncubationProfile).logo_url;
    }
    return null;
  };

  const fullThumbnailUrl = getImageUrl(getThumbnailPath());
  const fullLogoUrl = getImageUrl(getLogoPath());
  const fullVideoUrl = roleType === "startup" ? (profile as ApprovedStartup | PendingStartup).pitch_video_url || null : null;

  const profileRating = (profile as any).rating;
  const isApproved = profile.status === "approved";
  const isPendingOrNeedsUpdate = profile.status === "pending" || profile.status === "needs_update";
  
  const isIncubationMember = roleType === "startup" && (profile as ApprovedStartup).is_incubation;
  const incubationName = roleType === "startup" ? (profile as ApprovedStartup).incubation_name : null;

  const handleEditClick = () => {
    let editPath = "";
    switch (roleType) {
      case "startup":
        editPath = `/startup-registration/${profile.id}`;
        break;
      case "incubation":
        editPath = `/incubation-registration/${profile.id}`;
        break;
      case "investor":
        editPath = `/investor-registration/${profile.id}`;
        break;
      case "mentor":
        editPath = `/mentor-registration/${profile.id}`;
        break;
      default:
        console.warn("Unknown roleType for edit:", roleType);
        return;
    }
    router.push(editPath);
  };

  const handleJoinIncubation = () => {
    router.push(`/request-incubation/${profile.id}`);
  };

  const handleDashboardClick = () => {
    if (roleType === 'incubation') {
      router.push(`/incubation-dashboard/${profile.id}`);
    }
  };


  const renderProfileDetails = () => {
    switch (roleType) {
      case "startup":
        const startup = profile as ApprovedStartup | PendingStartup;
        const locationCountry = startup.location?.split(", ")[1];
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-100">{startup.startup_name}</h3>
            <p className="text-sm text-gray-300 flex items-center">
              <span className="mr-1">{getFlagEmoji(locationCountry || null)}</span>
              {locationCountry} • {startup.domain}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{startup.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {startup.founder_names?.filter(Boolean).map((name: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-block bg-purple-700 text-purple-100 text-xs px-3 py-1 rounded-full font-medium"
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              <span>Submitted: {new Date(startup.created_at).toLocaleDateString()}</span>
            </div>
          </>
        );
      case "incubation":
        const incubation = profile as IncubationProfile;
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-100">{incubation.incubator_accelerator_name}</h3>
            <p className="text-sm text-gray-300">
              {incubation.type_of_incubator} • {incubation.city}, {incubation.country}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              <strong>Unique Value Proposition:</strong> {incubation.unique_value_proposition}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              <strong>Focus Areas:</strong> {incubation.primary_focus_areas.join(", ")}
            </p>
            <div className="text-gray-500 text-xs mt-1">
              <span>Established: {incubation.year_established}</span> •{" "}
              <span>
                Website:{" "}
                <a
                  href={incubation.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {incubation.website}
                </a>
              </span>
            </div>
          </>
        );
      case "investor":
        const investor = profile as InvestorProfile;
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-100">{investor.full_name}</h3>
            <p className="text-sm text-gray-300">
              {investor.investor_type} • {investor.typical_investment_range}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              <strong>Investment Criteria:</strong> {investor.investment_criteria}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              <strong>Preferred Stages:</strong> {investor.investment_stage_preference.join(", ")}
            </p>
            <div className="text-gray-500 text-xs mt-1">
              <span>
                Location: {investor.city}, {investor.country}
              </span>{" "}
              • <span>Looking for new opportunities: {investor.looking_for_new_opportunities ? "Yes" : "No"}</span>
            </div>
          </>
        );
      case "mentor":
        const mentor = profile as MentorProfile;
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-100">{mentor.full_name}</h3>
            <p className="text-sm text-gray-300">
              {mentor.current_position_title} at {mentor.organization_company}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              <strong>Why Mentor:</strong> {mentor.why_mentor_startups}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              <strong>Expertise:</strong> {mentor.key_areas_of_expertise.join(", ")}
            </p>
            <div className="text-gray-500 text-xs mt-1">
              <span>Experience: {mentor.years_of_experience} years</span> •{" "}
              <span>Availability: {mentor.weekly_availability}</span> •{" "}
              <span>Languages: {mentor.languages_spoken.join(", ")}</span>
            </div>
          </>
        );
      default:
        return <p className="text-gray-400">No details available for this profile type.</p>;
    }
  };

  const profileName = (profile as any).startup_name || (profile as any).incubator_accelerator_name || (profile as any).full_name;

  return (
    <div className="relative flex flex-col md:flex-row items-start p-4 gap-4 border rounded-lg shadow-sm bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow pt-12 md:pt-4">
      {isStartupOrIncubation && (
        <div className="relative w-full md:w-[240px] h-[160px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-950 z-10 mt-4 md:mt-0">
          {profileRating !== null && profileRating !== undefined && (
            <div className="absolute top-2 left-2 z-10 bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-semibold items-center gap-1 flex">
              <Star className="h-4 w-4 fill-current text-white" />
              <span>{profileRating}/100</span>
            </div>
          )}
          {isIncubationMember && incubationName && (
            <div className="absolute bottom-2 left-2 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold items-center gap-1 flex">
              In an Incubation
            </div>
          )}
          <div className="w-full h-full cursor-pointer group" onClick={() => fullVideoUrl && setShowVideoModal(true)}>
            <Image
              src={fullThumbnailUrl || "/placeholder.svg"}
              alt={`${profileName} Thumbnail`}
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
              <Image src={fullLogoUrl} alt={`${profileName} Logo`} fill className="object-cover" />
            </div>
          )}
        </div>
      )}

      <div className={`absolute top-2 right-10 px-3 py-1 rounded-full text-xs font-semibold ${statusColor} z-20`}>
        {roleType.charAt(0).toUpperCase() + roleType.slice(1)}: {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
      </div>

      {isApproved && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="absolute top-1 right-1 p-2 rounded-full hover:bg-gray-700 z-30"
              aria-label="Options"
            >
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 border border-gray-700 text-gray-200">
            {roleType === 'startup' && (
              <>
                {isIncubationMember ? (
                  <DropdownMenuItem className="cursor-default text-gray-400">
                    Already in an Incubation ({incubationName})
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleJoinIncubation} className="cursor-pointer hover:bg-purple-700">
                    Join Incubation
                  </DropdownMenuItem>
                )}
              </>
            )}
             {roleType === 'incubation' && (
                <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer hover:bg-purple-700 flex items-center gap-2">
                   <LayoutDashboard className="h-4 w-4" />
                   Go to Dashboard
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="flex-1 flex flex-col gap-2 pt-0 md:pt-0">
        {renderProfileDetails()}
        {(profile.status === "rejected" || profile.status === "needs_update") &&
          "reason" in profile &&
          profile.reason && (
            <p className="text-red-300 text-sm mt-2">
              <strong>Reason:</strong> {profile.reason}
            </p>
          )}
        <div className="flex gap-3 mt-4">
          <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => setIsModalOpen(true)}>
            View
          </Button>
          {isPendingOrNeedsUpdate && (
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleEditClick}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {fullVideoUrl && (
        <VideoPlayerModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoUrl={fullVideoUrl}
          title={profileName || "Video Playback"}
        />
      )}

      <ProfileDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profile={profile}
        roleType={roleType}
      />
    </div>
  );
}