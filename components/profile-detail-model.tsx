// components/profile-detail-modal.tsx
import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import type {
  ApprovedStartup,
  PendingStartup,
  IncubationProfile,
  InvestorProfile,
  MentorProfile,
  ProfileData,
  ProfileRoleType,
} from "@/app/my-startups/page" // Updated import path to match new location

interface ProfileDetailModalProps {
  isOpen: boolean
  onClose: () => void
  profile: ProfileData
  roleType: ProfileRoleType
}

const renderDetailRow = (
  label: string,
  value: string | number | string[] | undefined | boolean | React.ReactElement,
) => {
  if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
    return null // Don't render row if value is empty or undefined
  }
  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      <div className="text-gray-400 font-medium">{label}:</div>
      <div className="text-gray-200">
        {React.isValidElement(value)
          ? value
          : Array.isArray(value)
            ? value.join(", ")
            : typeof value === "boolean"
              ? value
                ? "Yes"
                : "No"
              : value}
      </div>
    </div>
  )
}

export function ProfileDetailModal({ isOpen, onClose, profile, roleType }: ProfileDetailModalProps) {
  const renderStartupDetails = (startup: ApprovedStartup | PendingStartup) => (
    <>
      {renderDetailRow("Startup Type", startup.startup_type)}
      {renderDetailRow("Description", startup.description)}
      {renderDetailRow("Location", startup.location)}
      {renderDetailRow("Language", startup.language)}
      {renderDetailRow("Domain", startup.domain)}
      {renderDetailRow("Founder Names", startup.founder_names)}
      {renderDetailRow(
        "Pitch Video URL",
        startup.pitch_video_url && (
          <a
            href={startup.pitch_video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {startup.pitch_video_url}
          </a>
        ),
      )}
      {renderDetailRow(
        "Thumbnail URL",
        startup.thumbnail_url && (
          <a
            href={startup.thumbnail_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {startup.thumbnail_url}
          </a>
        ),
      )}
      {renderDetailRow("Status", startup.status)}
      {"approved_at" in startup &&
        startup.approved_at &&
        renderDetailRow("Approved At", new Date(startup.approved_at).toLocaleDateString())}
      {renderDetailRow("Revenue Model", startup.revenue_model)}
      {renderDetailRow("Funding Stage", startup.funding_stage)}
      {renderDetailRow("Employee Count", startup.employee_count)}
      {renderDetailRow("Establishment Year", startup.establishment_year)}
      {renderDetailRow(
        "Instagram",
        startup.instagram_url && (
          <a
            href={startup.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Link
          </a>
        ),
      )}
      {renderDetailRow(
        "LinkedIn",
        startup.linkedin_url && (
          <a
            href={startup.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Link
          </a>
        ),
      )}
      {renderDetailRow(
        "Website",
        startup.website_url && (
          <a
            href={startup.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Link
          </a>
        ),
      )}
      {renderDetailRow("Support Needed", startup.support_needed)}
      {renderDetailRow("Major Challenges", startup.major_challenges)}
      {renderDetailRow("Problem Being Solved", startup.problem_being_solved)}
      {renderDetailRow("Future Plans", startup.future_plans)}
      {renderDetailRow("Contact Name", startup.full_name)}
      {renderDetailRow("Contact Email", startup.email_address)}
      {renderDetailRow("Contact Phone", startup.phone_number)}
      {renderDetailRow("Startup Stage", startup.startup_stage)}
      {startup.team_members && startup.team_members.length > 0 && (
        <div className="col-span-2 py-2">
          <div className="text-gray-400 font-medium mb-1">Team Members:</div>
          <ul className="list-disc list-inside text-gray-200">
            {startup.team_members.map((member, index) => (
              <li key={index}>
                {member.name} ({member.designation}) - {member.phoneCountryCode} {member.localPhoneNumber}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )

  const renderIncubationDetails = (incubation: IncubationProfile) => (
    <>
      {renderDetailRow("Full Name", incubation.full_name)}
      {renderDetailRow("Email", incubation.email_address)}
      {renderDetailRow("Phone", `${incubation.phone_country_code} ${incubation.local_phone_number}`)}
      {renderDetailRow("Country", incubation.country)}
      {renderDetailRow("City", incubation.city)}
      {renderDetailRow("Incubator Name", incubation.incubator_accelerator_name)}
      {renderDetailRow("Type of Incubator", incubation.type_of_incubator)}
      {renderDetailRow("Year Established", incubation.year_established)}
      {renderDetailRow(
        "Website",
        incubation.website && (
          <a
            href={incubation.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Link
          </a>
        ),
      )}
      {renderDetailRow(
        "LinkedIn",
        incubation.linkedin_profile && (
          <a
            href={incubation.linkedin_profile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Link
          </a>
        ),
      )}
      {renderDetailRow("Physical Address", incubation.physical_address)}
      {renderDetailRow("Affiliated Organization", incubation.affiliated_organization_university)}
      {renderDetailRow("Registration Number", incubation.registration_number)}
      {renderDetailRow("Primary Focus Areas", incubation.primary_focus_areas)}
      {renderDetailRow("Other Focus Area", incubation.specify_other_focus_area)}
      {renderDetailRow("Services Offered", incubation.services_offered_to_startups)}
      {renderDetailRow("Other Services", incubation.specify_other_services)}
      {renderDetailRow("Eligibility Criteria", incubation.eligibility_criteria)}
      {renderDetailRow("Total Funding Raised by Alumni", incubation.total_funding_raised_by_alumni)}
      {renderDetailRow(
        "Percentage Startups Operational After 3 Yrs",
        incubation.percentage_startups_operational_after_3_yrs + "%",
      )}
      {incubation.notable_alumni_startups && incubation.notable_alumni_startups.length > 0 && (
        <div className="col-span-2 py-2">
          <div className="text-gray-400 font-medium mb-1">Notable Alumni Startups:</div>
          <ul className="list-disc list-inside text-gray-200">
            {incubation.notable_alumni_startups.map((startup, index) => (
              <li key={index}>
                {startup.startupName} -{" "}
                {startup.websiteUrl && (
                  <a
                    href={startup.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Website
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {renderDetailRow("Unique Value Proposition", incubation.unique_value_proposition)}
      {renderDetailRow("Problem/Gaps Solved", incubation.problem_gaps_solved_in_ecosystem)}
      {renderDetailRow("Preferred Startup Stages", incubation.preferred_startup_stages)}
      {renderDetailRow("Cross-Border Collaborations", incubation.interested_in_cross_border_collaborations)}
      {renderDetailRow("Planned Expansions", incubation.planned_expansions)}
      {renderDetailRow("Key Challenges", incubation.key_challenges_you_face)}
      {renderDetailRow("First Goal (Next 12 Months)", incubation.first_goal_next_12_months)}
      {renderDetailRow("Second Goal", incubation.second_goal)}
      {renderDetailRow("Third Goal", incubation.third_goal)}
      {renderDetailRow("Status", incubation.status)}
    </>
  )

  const renderInvestorDetails = (investor: InvestorProfile) => (
    <>
      {renderDetailRow("Full Name", investor.full_name)}
      {renderDetailRow("Email", investor.email_address)}
      {renderDetailRow("Phone", `${investor.phone_country_code} ${investor.local_phone_number}`)}
      {renderDetailRow("Country", investor.country)}
      {renderDetailRow("City", investor.city)}
      {renderDetailRow(
        "LinkedIn",
        investor.linkedin_profile && (
          <a
            href={investor.linkedin_profile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Link
          </a>
        ),
      )}
      {renderDetailRow("Investor Type", investor.investor_type)}
      {renderDetailRow("Typical Investment Range", investor.typical_investment_range)}
      {renderDetailRow("Investment Stage Preference", investor.investment_stage_preference)}
      {renderDetailRow("Preferred Sectors/Industries", investor.preferred_sectors_industries)}
      {renderDetailRow("Other Sector/Industry", investor.other_sector_industry)}
      {renderDetailRow("Has Invested Before", investor.has_invested_before)}
      {renderDetailRow("Number of Startups Invested", investor.number_of_startups_invested)}
      {renderDetailRow("Example Startups", investor.example_startups)}
      {renderDetailRow("Average Ticket Size", investor.average_ticket_size)}
      {renderDetailRow("Looking for New Opportunities", investor.looking_for_new_opportunities)}
      {renderDetailRow("Investment Criteria", investor.investment_criteria)}
      {renderDetailRow("Support Apart from Funding", investor.support_offered_apart_from_funding)}
      {renderDetailRow("Other Support Type", investor.other_support_type)}
      {renderDetailRow("Require Specific Country/Region", investor.require_specific_country_region)}
      {renderDetailRow("Specific Country/Region", investor.specific_country_region)}
      {renderDetailRow(
        "Bucket Amount",
        investor.bucket_amount ? `$${investor.bucket_amount.toLocaleString()}` : undefined,
      )}
      {renderDetailRow("Status", investor.status)}
    </>
  )

  const renderMentorDetails = (mentor: MentorProfile) => (
    <>
      {renderDetailRow("Full Name", mentor.full_name)}
      {renderDetailRow("Email", mentor.email_address)}
      {renderDetailRow("Phone", mentor.phone_number)}
      {renderDetailRow("Gender", mentor.gender)}
      {renderDetailRow(
        "LinkedIn",
        mentor.linkedin_profile && (
          <a
            href={mentor.linkedin_profile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Link
          </a>
        ),
      )}
      {renderDetailRow("City", mentor.city)}
      {renderDetailRow(
        "Personal Website",
        mentor.personal_website && (
          <a
            href={mentor.personal_website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Link
          </a>
        ),
      )}
      {renderDetailRow("Country", mentor.country)}
      {renderDetailRow("Current Position/Title", mentor.current_position_title)}
      {renderDetailRow("Organization/Company", mentor.organization_company)}
      {renderDetailRow("Years of Experience", mentor.years_of_experience)}
      {renderDetailRow("Key Areas of Expertise", mentor.key_areas_of_expertise)}
      {renderDetailRow("Other Expertise Area", mentor.other_expertise_area)}
      {renderDetailRow("Mentorship Domains", mentor.mentorship_domains)}
      {renderDetailRow("Other Mentorship Domain", mentor.other_mentorship_domain)}
      {renderDetailRow("Preferred Startup Stage", mentor.preferred_startup_stage)}
      {renderDetailRow("Mentorship Mode", mentor.mentorship_mode)}
      {renderDetailRow("Weekly Availability", mentor.weekly_availability)}
      {renderDetailRow("Languages Spoken", mentor.languages_spoken)}
      {renderDetailRow("Why Mentor Startups", mentor.why_mentor_startups)}
      {renderDetailRow("Proud Mentoring Experience", mentor.proud_mentoring_experience)}
      {renderDetailRow("Industries Most Excited to Mentor", mentor.industries_most_excited_to_mentor)}
      {renderDetailRow("Open to Other Contributions", mentor.open_to_other_contributions)}
      {renderDetailRow("Other Contribution Type", mentor.other_contribution_type)}
      {renderDetailRow("Status", mentor.status)}
    </>
  )

  const getProfileTitle = () => {
    switch (roleType) {
      case "startup":
        return (profile as ApprovedStartup).startup_name
      case "incubation":
        return (profile as IncubationProfile).incubator_accelerator_name
      case "investor":
        return `Investor: ${(profile as InvestorProfile).full_name}`
      case "mentor":
        return `Mentor: ${(profile as MentorProfile).full_name}`
      default:
        return "Profile Details"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-6 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-3xl font-bold text-purple-400">{getProfileTitle()}</DialogTitle>
          <DialogDescription className="text-gray-400">Full details of this {roleType} profile.</DialogDescription>
        </DialogHeader>
        <Separator className="bg-gray-700" />
        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="py-4 space-y-4">
            {roleType === "startup" && renderStartupDetails(profile as ApprovedStartup | PendingStartup)}
            {roleType === "incubation" && renderIncubationDetails(profile as IncubationProfile)}
            {roleType === "investor" && renderInvestorDetails(profile as InvestorProfile)}
            {roleType === "mentor" && renderMentorDetails(profile as MentorProfile)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
