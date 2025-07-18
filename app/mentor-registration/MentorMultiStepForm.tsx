"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { countryCodes } from "@/lib/country-codes" // Assuming this path is correct
import { Button } from "@/components/ui/button" // Assuming this path is correct
import { Input } from "@/components/ui/input" // Assuming this path is correct
import { Textarea } from "@/components/ui/textarea" // Assuming this path is correct
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Assuming this path is correct
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog" // Assuming this path is correct
import { Checkbox } from "@/components/ui/checkbox" // Assuming this path is correct
import { Label } from "@/components/ui/label" // Assuming this path is correct
import { toast } from "sonner" // Assuming this path is correct
import { cn } from "@/lib/utils" // Assuming this path is correct
import { CountryCodeSelect } from "@/components/country-code-select" // Assuming this path is correct
import { supabase } from "@/lib/supabaselib" // Assuming this path is correct

type MentorMultiStepFormProps = {
  userId: string;
}

export function MentorMultiStepForm({ userId }: MentorMultiStepFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    fullName: "",
    emailAddress: "",
    phoneCountryCode: "+91", // Default country code
    localPhoneNumber: "",
    gender: "",
    linkedInProfile: "",
    city: "",
    personalWebsite: "",
    country: "",

    // Step 2: Professional Experience
    currentPositionTitle: "",
    organizationCompany: "",
    yearsOfExperience: "", // Will be parsed to number
    keyAreasOfExpertise: [] as string[],
    otherExpertiseArea: "", // Conditional

    // Step 3: Mentorship Domains
    mentorshipDomains: [] as string[],
    otherMentorshipDomain: "", // Conditional

    // Step 4: Mentorship Persona
    preferredStartupStage: "",
    mentorshipMode: "",
    weeklyAvailability: "",
    languagesSpoken: [] as string[], // Multi-select
    whyMentorStartups: "",
    proudMentoringExperience: "",
    industriesMostExcitedToMentor: "",

    // Step 5: Additional Contributions
    openToOtherContributions: [] as string[],
    otherContributionType: "", // Conditional

    // Step 6: Submit for Review
    consentTermsPrivacy: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleMultipleChoiceChange = (name: keyof typeof formData, value: string) => {
    const currentArray = formData[name] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [name]: newArray });
  };

  const handleNext = async () => {
    let isValid = true
    let errorMessage = ""

    switch (step) {
      case 1: // Personal Details
        if (!formData.fullName || !formData.emailAddress || !formData.localPhoneNumber || !formData.country || !formData.city || !formData.gender) {
          isValid = false
          errorMessage = "Please fill in all required personal details."
        }
        break
      case 2: // Professional Experience
        if (!formData.currentPositionTitle || !formData.organizationCompany || !formData.yearsOfExperience || formData.keyAreasOfExpertise.length === 0) {
          isValid = false
          errorMessage = "Please fill in all required professional experience details."
        }
        if (formData.keyAreasOfExpertise.includes("Other") && !formData.otherExpertiseArea) {
          isValid = false
          errorMessage = "Please specify your other area of expertise."
        }
        break
      case 3: // Mentorship Domains
        if (formData.mentorshipDomains.length === 0) {
          isValid = false
          errorMessage = "Please select at least one mentorship domain."
        }
        if (formData.mentorshipDomains.includes("Other") && !formData.otherMentorshipDomain) {
          isValid = false
          errorMessage = "Please specify your other mentorship domain."
        }
        break
      case 4: // Mentorship Persona
        if (!formData.preferredStartupStage || !formData.mentorshipMode || !formData.weeklyAvailability || formData.languagesSpoken.length === 0 || !formData.whyMentorStartups || !formData.proudMentoringExperience || !formData.industriesMostExcitedToMentor) {
          isValid = false
          errorMessage = "Please fill in all required mentorship persona details."
        }
        break
      case 5: // Additional Contributions
        // This step is optional, but if "Other" is selected, the field needs to be filled.
        if (formData.openToOtherContributions.includes("Other") && !formData.otherContributionType) {
          isValid = false
          errorMessage = "Please specify your other contribution type."
        }
        break
      default:
        break
    }

    if (isValid) {
      setStep(step + 1)
      setSubmissionError(null)
    } else {
      setSubmissionError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.consentTermsPrivacy) {
      setSubmissionError("You must agree to the platform's terms & privacy policy before submitting.")
      toast.error("You must agree to the platform's terms & privacy policy before submitting.")
      return
    }
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      // Renamed table to 'mentor_approval'
      const { data, error } = await supabase.from("mentor_approval").insert([
        {
          user_id: userId,
          full_name: formData.fullName,
          email_address: formData.emailAddress,
          phone_number: `${formData.phoneCountryCode}${formData.localPhoneNumber}`,
          gender: formData.gender,
          linkedin_profile: formData.linkedInProfile,
          city: formData.city,
          personal_website: formData.personalWebsite,
          country: formData.country,
          current_position_title: formData.currentPositionTitle,
          organization_company: formData.organizationCompany,
          years_of_experience: parseInt(formData.yearsOfExperience, 10),
          key_areas_of_expertise: formData.keyAreasOfExpertise,
          other_expertise_area: formData.otherExpertiseArea,
          mentorship_domains: formData.mentorshipDomains,
          other_mentorship_domain: formData.otherMentorshipDomain,
          preferred_startup_stage: formData.preferredStartupStage,
          mentorship_mode: formData.mentorshipMode,
          weekly_availability: formData.weeklyAvailability,
          languages_spoken: formData.languagesSpoken,
          why_mentor_startups: formData.whyMentorStartups,
          proud_mentoring_experience: formData.proudMentoringExperience,
          industries_most_excited_to_mentor: formData.industriesMostExcitedToMentor,
          open_to_other_contributions: formData.openToOtherContributions,
          other_contribution_type: formData.otherContributionType,
          status: "pending", // Default status
        },
      ])

      if (error) throw error

      setShowSuccessDialog(true)
      toast.success("Mentor Profile submitted successfully! Waiting for approval.")
      setTimeout(() => router.push("/"), 3000)
    } catch (err: any) {
      console.error("Submission error:", err)
      setSubmissionError(err?.message || "Submission failed. Please try again.")
      toast.error(err?.message || "Submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    "Personal Details",
    "Professional Experience",
    "Mentorship Domains",
    "Mentorship Persona",
    "Additional Contributions",
    "Submit for Review",
  ]

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="emailAddress"
                type="email"
                placeholder="Email Address"
                value={formData.emailAddress}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <div className="flex gap-2">
                <CountryCodeSelect
                  value={formData.phoneCountryCode}
                  onValueChange={(value) => setFormData({ ...formData, phoneCountryCode: value })}
                />
                <Input
                  name="localPhoneNumber"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.localPhoneNumber}
                  onChange={handleInputChange}
                  className="flex-1 bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                  required
                />
              </div>
              <Select
                name="gender"
                value={formData.gender}
                onValueChange={(val) => handleSelectChange("gender", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <Input
                name="linkedInProfile"
                type="url"
                placeholder="LinkedIn Profile URL"
                value={formData.linkedInProfile}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              />
              <Select
                name="country"
                value={formData.country}
                onValueChange={(value) => handleSelectChange("country", value)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 max-h-60 overflow-y-auto rounded-lg">
                  {countryCodes.map((cc) => (
                    <SelectItem key={cc.name} value={cc.name} className="focus:bg-purple-700 focus:text-white">
                      {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="personalWebsite"
                type="url"
                placeholder="Personal Website URL (Optional)"
                value={formData.personalWebsite}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Professional Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="currentPositionTitle"
                placeholder="Current Position / Title"
                value={formData.currentPositionTitle}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="organizationCompany"
                placeholder="Organization / Company"
                value={formData.organizationCompany}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="yearsOfExperience"
                type="number"
                placeholder="Years of Experience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
            </div>
            <p className="text-neutral-300 font-medium">Key Areas of Expertise:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Business Strategy", "Product Development", "Marketing & Sales", "Fundraising",
                "Legal/Compliance", "HR/Team Building", "Technology", "Other"
              ].map((area) => (
                <Button
                  key={area}
                  type="button"
                  variant={formData.keyAreasOfExpertise.includes(area) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("keyAreasOfExpertise", area)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    formData.keyAreasOfExpertise.includes(area)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                  )}
                >
                  {area}
                </Button>
              ))}
            </div>
            {formData.keyAreasOfExpertise.includes("Other") && (
              <Input
                name="otherExpertiseArea"
                placeholder="Let Us Know Your Need (for Other Expertise Area)"
                value={formData.otherExpertiseArea}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
            )}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Mentorship Domains</h3>
            <p className="text-neutral-300 font-medium">Select the industries or sectors you are interested in mentoring:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Technology & Innovation", "Finance", "Healthcare & Life Sciences", "Agriculture & Food",
                "Education", "Energy & Environment", "Logistics & Mobility", "Retail & E-Commerce",
                "Real Estate & Construction", "Media & Entertainment", "Travel & Hospitality",
                "Manufacturing & Industry", "Human Resources & Workforce", "Legal & Governance",
                "Space & Aerospace", "Defense & Security", "Fashion & Lifestyle",
                "Social Impact & Development", "Climate & Sustainability", "Other"
              ].map((domain) => (
                <Button
                  key={domain}
                  type="button"
                  variant={formData.mentorshipDomains.includes(domain) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("mentorshipDomains", domain)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    formData.mentorshipDomains.includes(domain)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                  )}
                >
                  {domain}
                </Button>
              ))}
            </div>
            {formData.mentorshipDomains.includes("Other") && (
              <Input
                name="otherMentorshipDomain"
                placeholder="Let Us Know Your Need (for Other Mentorship Domain)"
                value={formData.otherMentorshipDomain}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
            )}
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Mentorship Persona</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="preferredStartupStage"
                value={formData.preferredStartupStage}
                onValueChange={(val) => handleSelectChange("preferredStartupStage", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Preferred Startup Stage" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="Ideation">Ideation</SelectItem>
                  <SelectItem value="MVP">MVP</SelectItem>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Growth">Growth</SelectItem>
                  <SelectItem value="Scaling">Scaling</SelectItem>
                  <SelectItem value="Mature">Mature</SelectItem>
                </SelectContent>
              </Select>
              <Select
                name="mentorshipMode"
                value={formData.mentorshipMode}
                onValueChange={(val) => handleSelectChange("mentorshipMode", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Mentorship Mode" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <Select
                name="weeklyAvailability"
                value={formData.weeklyAvailability}
                onValueChange={(val) => handleSelectChange("weeklyAvailability", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Weekly Availability" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                  <SelectItem value="3-5 hours">3-5 hours</SelectItem>
                  <SelectItem value="5+ hours">5+ hours</SelectItem>
                </SelectContent>
              </Select>
              <Select
                name="languagesSpoken"
                value={formData.languagesSpoken.join(',')} // Join for display, split on change
                onValueChange={(val) => {
                  // This is a simplified multi-select. For a true multi-select,
                  // you'd need a custom component or a library.
                  // This assumes single selection from the dropdown, but stores as array.
                  const newLanguages = formData.languagesSpoken.includes(val)
                    ? formData.languagesSpoken.filter(lang => lang !== val)
                    : [...formData.languagesSpoken, val];
                  setFormData({ ...formData, languagesSpoken: newLanguages });
                }}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Languages Spoken" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Mandarin">Mandarin</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              name="whyMentorStartups"
              placeholder="Why do you want to mentor startups?"
              value={formData.whyMentorStartups}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[100px] px-4 py-3 focus-visible:ring-purple-500"
              required
            />
            <Textarea
              name="proudMentoringExperience"
              placeholder="Share a mentoring experience you're proud of."
              value={formData.proudMentoringExperience}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[100px] px-4 py-3 focus-visible:ring-purple-500"
              required
            />
            <Textarea
              name="industriesMostExcitedToMentor"
              placeholder="What industries are you most excited to mentor in?"
              value={formData.industriesMostExcitedToMentor}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[100px] px-4 py-3 focus-visible:ring-purple-500"
              required
            />
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Additional Contributions</h3>
            <p className="text-neutral-300 font-medium">Are you open to contributing in other ways?</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Hosting Webinars", "Speaking at Events", "Judging Competitions",
                "Writing Knowledge Articles", "Other"
              ].map((contribution) => (
                <Button
                  key={contribution}
                  type="button"
                  variant={formData.openToOtherContributions.includes(contribution) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("openToOtherContributions", contribution)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    formData.openToOtherContributions.includes(contribution)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                  )}
                >
                  {contribution}
                </Button>
              ))}
            </div>
            {formData.openToOtherContributions.includes("Other") && (
              <Input
                name="otherContributionType"
                placeholder="Let Us Know Your Need (for Other Contribution Type)"
                value={formData.otherContributionType}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
            )}
          </div>
        )
      case 6: // Submit for Review
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Submit for Review</h3>
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="consent-terms-privacy"
                checked={formData.consentTermsPrivacy}
                onCheckedChange={(checked) => setFormData({ ...formData, consentTermsPrivacy: checked as boolean })}
                className="border-neutral-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="consent-terms-privacy" className="text-neutral-300 text-sm cursor-pointer">
                I agree to the platform's terms & privacy policy.
              </Label>
            </div>
            {submissionError && <p className="text-red-500 text-sm mt-4">{submissionError}</p>}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0617] py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <header className="flex items-center mt-32 justify-between mb-10">
          {/* Optional: Add a logo or title here */}
        </header>

        <div className="max-w-3xl mx-auto"> {/* Centered form container */}
          <div className="p-6 lg:p-8 space-y-8 bg-[#0E0616] rounded-xl shadow-lg border border-[rgba(255,255,255,0.6)]">
            {/* Professional Progress Bar */}
            <div className="relative flex justify-between items-center w-full mb-8 text-xs">
              <div
                className="absolute left-0 h-1 bg-purple-600 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              />
              <div className="absolute left-0 right-0 h-1 bg-neutral-700 rounded-full" />

              {steps.map((label, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center z-10 cursor-pointer group"
                  onClick={() => setStep(index + 1)}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      step > index
                        ? "border-white bg-white shadow-lg shadow-white/50" // Added glow effect
                        : "border-[#818181] bg-[#0E0617] group-hover:border-purple-500",
                    )}
                  >
                    {step > index ? (
                      <CheckCircle2 className="h-5 w-5 text-[#0E0617]" />
                    ) : (
                      <span
                        className={cn(
                          "text-base font-bold",
                          step > index ? "text-[#0E0617]" : "text-neutral-400 group-hover:text-purple-300",
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-3 text-base text-center font-medium hidden md:block transition-colors",
                      step >= index + 1 ? "text-white" : "text-neutral-500 group-hover:text-neutral-300",
                    )}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (step === steps.length) handleSubmit(e)
              }}
              className="mt-8"
            >
              {renderStepContent()}

              <div className="flex justify-between items-center pt-8">
                {step > 1 && (
                  <Button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    variant="outline"
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
                  >
                    Back
                  </Button>
                )}
                {step < steps.length ? (
                  <Button type="button" onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-purple-600 text-white hover:bg-purple-700"
                    disabled={isSubmitting || !formData.consentTermsPrivacy}
                  >
                    {isSubmitting ? "Submitting..." : "Submit for Review"}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessDialog}>
        <DialogContent className="sm:max-w-[400px] bg-[#2A0050] text-white border-[#4A0080] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Registration Successful!</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-lg font-semibold text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="h-12 w-12 text-purple-400" />
            Your Mentor Profile has been submitted.
            <span className="text-purple-400 mt-1">Wait for approval.</span>
          </div>
          <div className="flex justify-center">
            <Button className="bg-purple-600 text-white" disabled>
              Redirecting to Home...
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
