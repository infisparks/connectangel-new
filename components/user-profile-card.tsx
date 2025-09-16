// components/user-profile-card.tsx

"use client";

import Image from "next/image";
import { 
  Play, 
  Star, 
  MoreVertical, 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  ExternalLink,
  Building2,
  TrendingUp,
  Users,
  Eye,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  UserPlus
} from "lucide-react";
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
  const statusConfig = {
    approved: {
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: <CheckCircle2 className="w-3 h-3" />
    },
    pending: {
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: <Clock className="w-3 h-3" />
    },
    needs_update: {
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      icon: <AlertCircle className="w-3 h-3" />
    },
    rejected: {
      color: "bg-red-500/10 text-red-400 border-red-500/30",
      icon: <XCircle className="w-3 h-3" />
    }
  };

  const currentStatus = statusConfig[profile.status as keyof typeof statusConfig] || statusConfig.pending;

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

  const renderProfileContent = () => {
    switch (roleType) {
      case "startup":
        const startup = profile as ApprovedStartup | PendingStartup;
        const locationCountry = startup.location?.split(", ")[1];
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{startup.startup_name}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="mr-1">{getFlagEmoji(locationCountry || null)}</span>
                  {locationCountry}
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {startup.domain}
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
              {startup.description}
            </p>
            
            {Array.isArray(startup.founder_names) && startup.founder_names.filter(Boolean).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {startup.founder_names.filter(Boolean).map((name: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-300 text-xs px-2.5 py-1 rounded-full border border-purple-500/20"
                  >
                    <Users className="w-3 h-3" />
                    {name}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Submitted: {new Date(startup.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        );

      case "incubation":
        const incubation = profile as IncubationProfile;
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{incubation.incubator_accelerator_name}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {incubation.type_of_incubator}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {incubation.city}, {incubation.country}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-1">Value Proposition</h4>
                <p className="text-gray-300 text-sm line-clamp-2">{incubation.unique_value_proposition}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-1">Focus Areas</h4>
                <p className="text-gray-300 text-sm">{incubation.primary_focus_areas.join(", ")}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Est. {incubation.year_established}</span>
              </div>
              {incubation.website && (
                <a
                  href={incubation.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Website
                </a>
              )}
            </div>
          </div>
        );

      case "investor":
        const investor = profile as InvestorProfile;
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{investor.full_name}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  {investor.investor_type}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {investor.city}, {investor.country}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-1">Investment Range</h4>
                <p className="text-gray-300 text-sm">{investor.typical_investment_range}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-1">Investment Criteria</h4>
                <p className="text-gray-300 text-sm line-clamp-2">{investor.investment_criteria}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-1">Preferred Stages</h4>
                <div className="flex flex-wrap gap-1">
                  {investor.investment_stage_preference.map((stage, idx) => (
                    <span key={idx} className="bg-blue-500/10 text-blue-300 text-xs px-2 py-1 rounded border border-blue-500/20">
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className={`w-2 h-2 rounded-full ${investor.looking_for_new_opportunities ? 'bg-green-400' : 'bg-gray-500'}`}></span>
              {investor.looking_for_new_opportunities ? 'Open to opportunities' : 'Not actively investing'}
            </div>
          </div>
        );

      case "mentor":
        const mentor = profile as MentorProfile;
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{mentor.full_name}</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {mentor.current_position_title} at {mentor.organization_company}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-1">Why I Mentor</h4>
                <p className="text-gray-300 text-sm line-clamp-2">{mentor.why_mentor_startups}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-1">Areas of Expertise</h4>
                <div className="flex flex-wrap gap-1">
                  {mentor.key_areas_of_expertise.map((area, idx) => (
                    <span key={idx} className="bg-green-500/10 text-green-300 text-xs px-2 py-1 rounded border border-green-500/20">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>{mentor.years_of_experience} years experience</span>
              <span>{mentor.weekly_availability} availability</span>
              <span>Languages: {mentor.languages_spoken.join(", ")}</span>
            </div>
          </div>
        );

      default:
        return <p className="text-gray-400">No details available for this profile type.</p>;
    }
  };

  const profileName = (profile as any).startup_name || (profile as any).incubator_accelerator_name || (profile as any).full_name;

  return (
    <div className="group relative bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 overflow-hidden">
      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${currentStatus.color}`}>
          {currentStatus.icon}
          <span>{statusText.charAt(0).toUpperCase() + statusText.slice(1)}</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col lg:flex-row">
        {/* Media Section for Startup/Incubation */}
        {isStartupOrIncubation && (
          <div className="relative lg:w-80 h-64 lg:h-auto flex-shrink-0">
            {/* Rating Badge */}
            {profileRating !== null && profileRating !== undefined && (
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 shadow-lg">
                <Star className="h-4 w-4 fill-current" />
                <span>{profileRating}/100</span>
              </div>
            )}
            
            {/* Incubation Member Badge */}
            {isIncubationMember && incubationName && (
              <div className="absolute bottom-4 left-4 z-10 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                🏢 In Incubation
              </div>
            )}

            {/* Video Thumbnail */}
            <div 
              className="relative w-full h-full cursor-pointer group/video" 
              onClick={() => fullVideoUrl && setShowVideoModal(true)}
            >
              <Image
                src={fullThumbnailUrl || "/placeholder.svg"}
                alt={`${profileName} Thumbnail`}
                fill
                className="object-cover transition-transform duration-500 group-hover/video:scale-105"
              />
              
              {/* Video Play Overlay */}
              {fullVideoUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/video:opacity-100 transition-all duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform group-hover/video:scale-110 transition-transform duration-300">
                    <Play className="h-8 w-8 text-white fill-current" />
                  </div>
                </div>
              )}
              
              {/* Dark Overlay for Better Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Logo Overlay */}
            {fullLogoUrl && (
              <div className="absolute bottom-4 right-4 w-16 h-16 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm overflow-hidden shadow-lg">
                <Image 
                  src={fullLogoUrl} 
                  alt={`${profileName} Logo`} 
                  fill 
                  className="object-cover" 
                />
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="h-full flex flex-col justify-between">
            {/* Profile Content */}
            <div className="flex-1">
              {renderProfileContent()}
              
              {/* Rejection/Update Reason */}
              {(profile.status === "rejected" || profile.status === "needs_update") &&
                "reason" in profile &&
                (profile as any).reason && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h4 className="text-red-300 font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Action Required
                    </h4>
                    <p className="text-red-200/80 text-sm">{(profile as any).reason}</p>
                  </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-700/50">
              <Button 
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/50 flex items-center gap-2 transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Button>
              
              {isPendingOrNeedsUpdate && (
                <Button
                  onClick={handleEditClick}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white flex items-center gap-2 transition-all duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}

              {/* More Actions Menu for Approved Profiles */}
              {isApproved && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-gray-800 border border-gray-700 text-gray-200">
                    {roleType === 'startup' && (
                      <>
                        {isIncubationMember ? (
                          <DropdownMenuItem className="cursor-default text-gray-400 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            In {incubationName}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={handleJoinIncubation} 
                            className="cursor-pointer hover:bg-purple-700 flex items-center gap-2"
                          >
                            <UserPlus className="h-4 w-4" />
                            Join Incubation
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    {roleType === 'incubation' && (
                      <DropdownMenuItem 
                        onClick={handleDashboardClick} 
                        className="cursor-pointer hover:bg-purple-700 flex items-center gap-2"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Go to Dashboard
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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