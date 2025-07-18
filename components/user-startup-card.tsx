"use client"

import Image from "next/image"
import { Play } from "lucide-react"
import { useState } from "react"
import { VideoPlayerModal } from "./video-player-modal" // Assuming this path is correct
// Corrected import: Use ApprovedStartup and PendingStartup
import type { ProfileData, ProfileRoleType, ApprovedStartup, PendingStartup, IncubationProfile, InvestorProfile, MentorProfile } from "@/app/my-startups/page"

interface UserProfileCardProps {
  profile: ProfileData
  roleType: ProfileRoleType
}

export function UserProfileCard({ profile, roleType }: UserProfileCardProps) {
  const [showVideoModal, setShowVideoModal] = useState(false)

  const statusText = profile.status || "Pending"
  const statusColor = profile.status === "approved" ? "bg-green-600" : "bg-yellow-600"

  // Determine if it's a startup profile for video/thumbnail logic
  const isStartupProfile = roleType === "startup";
  const startupProfile = profile as ApprovedStartup | PendingStartup; // Cast for specific startup properties

  // Conditional fullThumbnailUrl and fullVideoUrl based on isStartupProfile
  const fullThumbnailUrl = isStartupProfile ? (startupProfile.thumbnail_url || "/placeholder.svg") : "/placeholder.svg";
  const fullVideoUrl = isStartupProfile ? (startupProfile.pitch_video_url || null) : null;

  const renderProfileDetails = () => {
    switch (roleType) {
      case "startup":
        const startup = profile as ApprovedStartup | PendingStartup;
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-100">{startup.startup_name}</h3>
            <p className="text-sm text-gray-300">{startup.startup_type} • {startup.domain}</p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{startup.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {startup.founder_names?.filter(Boolean).map((name: string, idx: number) => (
                <span key={idx} className="inline-block bg-purple-700 text-purple-100 text-xs px-3 py-1 rounded-full font-medium">{name}</span>
              ))}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              <span>Location: {startup.location}</span> • <span>Language: {startup.language}</span> •{" "}
              <span>Submitted: {new Date(startup.created_at).toLocaleDateString()}</span>
            </div>
          </>
        );
      case "incubation":
        const incubation = profile as IncubationProfile;
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-100">{incubation.incubator_accelerator_name}</h3>
            <p className="text-sm text-gray-300">{incubation.type_of_incubator} • {incubation.city}, {incubation.country}</p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              **Unique Value Proposition:** {incubation.unique_value_proposition}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              **Focus Areas:** {incubation.primary_focus_areas.join(', ')}
            </p>
            <div className="text-gray-500 text-xs mt-1">
              <span>Established: {incubation.year_established}</span> •{" "}
              <span>Website: <a href={incubation.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{incubation.website}</a></span>
            </div>
          </>
        );
      case "investor":
        const investor = profile as InvestorProfile;
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-100">{investor.full_name}</h3>
            <p className="text-sm text-gray-300">{investor.investor_type} • {investor.typical_investment_range}</p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              **Investment Criteria:** {investor.investment_criteria}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              **Preferred Stages:** {investor.investment_stage_preference.join(', ')}
            </p>
            <div className="text-gray-500 text-xs mt-1">
              <span>Location: {investor.city}, {investor.country}</span> •{" "}
              <span>Looking for new opportunities: {investor.looking_for_new_opportunities ? "Yes" : "No"}</span>
            </div>
          </>
        );
      case "mentor":
        const mentor = profile as MentorProfile;
        return (
          <>
            <h3 className="text-lg font-semibold text-gray-100">{mentor.full_name}</h3>
            <p className="text-sm text-gray-300">{mentor.current_position_title} at {mentor.organization_company}</p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              **Why Mentor:** {mentor.why_mentor_startups}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              **Expertise:** {mentor.key_areas_of_expertise.join(', ')}
            </p>
            <div className="text-gray-500 text-xs mt-1">
              <span>Experience: {mentor.years_of_experience} years</span> •{" "}
              <span>Availability: {mentor.weekly_availability}</span> •{" "}
              <span>Languages: {mentor.languages_spoken.join(', ')}</span>
            </div>
          </>
        );
      default:
        return <p className="text-gray-400">No details available for this profile type.</p>;
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row items-start p-4 gap-4 border rounded-lg shadow-sm bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow">
      {/* Role Tag */}
      <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold w-fit ${statusColor} text-white`}>
        {roleType.charAt(0).toUpperCase() + roleType.slice(1)} Profile: {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
      </div>

      {isStartupProfile && (
        <div
          className="relative w-full md:w-[240px] h-[160px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-950 cursor-pointer group"
          onClick={() => fullVideoUrl && setShowVideoModal(true)}
        >
          <Image
            src={fullThumbnailUrl}
            alt={`${(profile as ApprovedStartup).startup_name || 'Profile'} Thumbnail`}
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
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col gap-2 pt-8 md:pt-0"> {/* Added padding to top for role tag */}
        {renderProfileDetails()}
      </div>

      {/* Video Player Modal */}
      {fullVideoUrl && (
        <VideoPlayerModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoUrl={fullVideoUrl}
          title={(profile as ApprovedStartup).startup_name || "Video Playback"}
        />
      )}
    </div>
  )
}
