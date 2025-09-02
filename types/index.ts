export interface ApprovedStartup {
  country: string;
  id: string;
  user_id: string;
  startup_type: string | null;
  startup_name: string;
  description: string;
  location: string | null;
  language: string | null;
  domain: string | null;
  founder_names: string[] | null;
  pitch_video_url: string | null;
  thumbnail_url: string | null;
  logo_url?: string | null;
  status: "approved";
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
    linkedin_url?: string;
    profile_url?: string;
  }> | null;
  rating?: number | null;
  is_incubation?: boolean | null;
  incubation_id?: string | null;
  incubation_name?: string | null;
  city?: string | null; // Added
  one_sentence_description?: string | null; // Added
}

export interface PendingStartup {
  id: string;
  user_id: string;
  startup_type: string | null;
  startup_name: string;
  description: string;
  location: string | null;
  language: string | null;
  domain: string | null;
  country?: string | null; // Added
  city?: string | null; // Added
  founder_names: string[] | null;
  pitch_video_url: string | null;
  thumbnail_url: string | null;
  logo_url?: string | null | undefined;
  status: "pending" | "needs_update" | "rejected";
  created_at: string;
  updated_at: string;
  reason?: string | null;
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

export type ProfileData =
  | ApprovedStartup
  | PendingStartup
  | IncubationProfile
  | InvestorProfile
  | MentorProfile;

export type ProfileRoleType = "startup" | "incubation" | "investor" | "mentor";

export type AdminApprovalProfile =
  | PendingStartup
  | IncubationProfile
  | InvestorProfile
  | MentorProfile;
