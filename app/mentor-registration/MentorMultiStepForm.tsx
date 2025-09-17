"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ArrowLeft, User, Briefcase, Target, MessageSquare, PlusCircle, Upload } from "lucide-react";
import { countryCodes } from "@/lib/country-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CountryCodeSelect } from "@/components/country-code-select";
import { supabase } from "@/lib/supabaselib";
import { MentorProfile } from '@/types'; // Assuming this type is defined elsewhere

type MentorMultiStepFormProps = {
  userId: string;
  initialData?: MentorProfile | null;
};

export function MentorMultiStepForm({ userId, initialData }: MentorMultiStepFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    fullName: "",
    emailAddress: "",
    phoneCountryCode: "+91",
    localPhoneNumber: "",
    gender: "",
    linkedInProfile: "",
    city: "",
    personalWebsite: "",
    country: "",

    // Step 2: Professional Experience
    currentPositionTitle: "",
    organizationCompany: "",
    yearsOfExperience: "",
    keyAreasOfExpertise: [] as string[],
    otherExpertiseArea: "",

    // Step 3: Mentorship Domains
    mentorshipDomains: [] as string[],
    otherMentorshipDomain: "",

    // Step 4: Mentorship Persona
    preferredStartupStage: "",
    mentorshipMode: "",
    weeklyAvailability: "",
    languagesSpoken: [] as string[],
    whyMentorStartups: "",
    proudMentoringExperience: "",
    industriesMostExcitedToMentor: "",

    // Step 5: Additional Contributions
    openToOtherContributions: [] as string[],
    otherContributionType: "",

    // Step 6: Submit for Review
    consentTermsPrivacy: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (initialData) {
      const parsePhoneNumber = (fullNumber: string | undefined | null) => {
        if (!fullNumber) return { code: "+91", number: "" };
        const match = fullNumber.match(/^(\+\d+)(.*)$/);
        if (match) {
          return { code: match[1], number: match[2] };
        }
        return { code: "+91", number: fullNumber };
      };

      const { code: phoneCountryCode, number: localPhoneNumber } = parsePhoneNumber(initialData.phone_number);

      setFormData({
        fullName: initialData.full_name || "",
        emailAddress: initialData.email_address || "",
        phoneCountryCode: phoneCountryCode,
        localPhoneNumber: localPhoneNumber,
        gender: initialData.gender || "",
        linkedInProfile: initialData.linkedin_profile || "",
        city: initialData.city || "",
        personalWebsite: initialData.personal_website || "",
        country: initialData.country || "",

        currentPositionTitle: initialData.current_position_title || "",
        organizationCompany: initialData.organization_company || "",
        yearsOfExperience: String(initialData.years_of_experience || ""),
        keyAreasOfExpertise: initialData.key_areas_of_expertise || [],
        otherExpertiseArea: initialData.other_expertise_area || "",

        mentorshipDomains: initialData.mentorship_domains || [],
        otherMentorshipDomain: initialData.other_mentorship_domain || "",

        preferredStartupStage: initialData.preferred_startup_stage || "",
        mentorshipMode: initialData.mentorship_mode || "",
        weeklyAvailability: initialData.weekly_availability || "",
        languagesSpoken: initialData.languages_spoken || [],
        whyMentorStartups: initialData.why_mentor_startups || "",
        proudMentoringExperience: initialData.proud_mentoring_experience || "",
        industriesMostExcitedToMentor: initialData.industries_most_excited_to_mentor || "",

        openToOtherContributions: initialData.open_to_other_contributions || [],
        otherContributionType: initialData.other_contribution_type || "",

        consentTermsPrivacy: false,
      });
      setStep(1);
    } else {
      setFormData({
        fullName: "", emailAddress: "", phoneCountryCode: "+91", localPhoneNumber: "", gender: "",
        linkedInProfile: "", city: "", personalWebsite: "", country: "",
        currentPositionTitle: "", organizationCompany: "", yearsOfExperience: "",
        keyAreasOfExpertise: [], otherExpertiseArea: "",
        mentorshipDomains: [], otherMentorshipDomain: "",
        preferredStartupStage: "", mentorshipMode: "", weeklyAvailability: "",
        languagesSpoken: [], whyMentorStartups: "", proudMentoringExperience: "",
        industriesMostExcitedToMentor: "",
        openToOtherContributions: [], otherContributionType: "",
        consentTermsPrivacy: false,
      });
      setStep(1);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleMultipleChoiceChange = (name: keyof typeof formData, value: string) => {
    const currentArray = formData[name] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [name]: newArray });
  };

  const handleNext = async () => {
    let isValid = true;
    let errorMessage = "";

    switch (step) {
      case 1:
        if (!formData.fullName || !formData.emailAddress || !formData.localPhoneNumber || !formData.country || !formData.city || !formData.gender) {
          isValid = false;
          errorMessage = "Please fill in all required personal details.";
        }
        break;
      case 2:
        if (!formData.currentPositionTitle || !formData.organizationCompany || !formData.yearsOfExperience || formData.keyAreasOfExpertise.length === 0) {
          isValid = false;
          errorMessage = "Please fill in all required professional experience details.";
        }
        if (formData.keyAreasOfExpertise.includes("Other") && !formData.otherExpertiseArea) {
          isValid = false;
          errorMessage = "Please specify your other area of expertise.";
        }
        break;
      case 3:
        if (formData.mentorshipDomains.length === 0) {
          isValid = false;
          errorMessage = "Please select at least one mentorship domain.";
        }
        if (formData.mentorshipDomains.includes("Other") && !formData.otherMentorshipDomain) {
          isValid = false;
          errorMessage = "Please specify your other mentorship domain.";
        }
        break;
      case 4:
        if (!formData.preferredStartupStage || !formData.mentorshipMode || !formData.weeklyAvailability || formData.languagesSpoken.length === 0 || !formData.whyMentorStartups || !formData.proudMentoringExperience || !formData.industriesMostExcitedToMentor) {
          isValid = false;
          errorMessage = "Please fill in all required mentorship persona details.";
        }
        break;
      case 5:
        if (formData.openToOtherContributions.includes("Other") && !formData.otherContributionType) {
          isValid = false;
          errorMessage = "Please specify your other contribution type.";
        }
        break;
      default:
        break;
    }

    if (isValid) {
      setStep(step + 1);
      setSubmissionError(null);
    } else {
      setSubmissionError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentTermsPrivacy) {
      setSubmissionError("You must agree to the platform's terms & privacy policy before submitting.");
      toast.error("You must agree to the platform's terms & privacy policy before submitting.");
      return;
    }
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const submissionPayload = {
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
        status: "pending",
      };

      let dbOperationError = null;

      if (initialData?.id) {
        console.log("Updating existing Mentor profile with ID:", initialData.id);
        const { error: updateError } = await supabase
          .from("mentor_approval")
          .update({
            ...submissionPayload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);
        dbOperationError = updateError;
      } else {
        console.log("Submitting new Mentor profile.");
        const { error: insertError } = await supabase
          .from("mentor_approval")
          .insert({
            ...submissionPayload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        dbOperationError = insertError;
      }

      if (dbOperationError) throw dbOperationError;

      setShowSuccessDialog(true);
      toast.success(initialData ? "Mentor Profile updated successfully!" : "Mentor Profile submitted successfully! Waiting for approval.");
      setTimeout(() => router.push("/my-startups"), 3000);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmissionError(err?.message || "Submission failed. Please try again.");
      toast.error(err?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { label: "Personal Details", icon: User },
    { label: "Professional Exp.", icon: Briefcase },
    { label: "Mentorship Domains", icon: Target },
    { label: "Mentorship Persona", icon: MessageSquare },
    { label: "Additional Contributions", icon: PlusCircle },
    { label: "Submit for Review", icon: Upload },
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Personal Details</h3>
              <p className="text-gray-400 text-sm">Let's start with your basic information</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="emailAddress"
                type="email"
                placeholder="Email Address"
                value={formData.emailAddress}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
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
                  className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
                  required
                />
              </div>
              <Select
                name="gender"
                value={formData.gender}
                onValueChange={(val) => handleSelectChange("gender", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
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
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
              />
              <Select
                name="country"
                value={formData.country}
                onValueChange={(value) => handleSelectChange("country", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 max-h-60 overflow-y-auto rounded-xl">
                  {countryCodes.map((cc) => (
                    <SelectItem key={cc.name} value={cc.name}>
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
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="personalWebsite"
                type="url"
                placeholder="Personal Website URL (Optional)"
                value={formData.personalWebsite}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional Experience</h3>
              <p className="text-gray-400 text-sm">Share your professional background</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="currentPositionTitle"
                placeholder="Current Position / Title"
                value={formData.currentPositionTitle}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="organizationCompany"
                placeholder="Organization / Company"
                value={formData.organizationCompany}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="yearsOfExperience"
                type="number"
                placeholder="Years of Experience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
                required
              />
            </div>
            <p className="text-white font-semibold mt-4 mb-2 block">Key Areas of Expertise:</p>
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
                    "rounded-xl h-12 text-sm font-medium transition-all duration-200",
                    formData.keyAreasOfExpertise.includes(area)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30",
                  )}
                >
                  {area}
                </Button>
              ))}
            </div>
            {formData.keyAreasOfExpertise.includes("Other") && (
              <Input
                name="otherExpertiseArea"
                placeholder="Please specify your expertise area"
                value={formData.otherExpertiseArea}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 mt-4"
                required
              />
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Mentorship Domains</h3>
              <p className="text-gray-400 text-sm">Select the industries you want to mentor in</p>
            </div>
            <p className="text-white font-semibold mt-4 mb-2 block">Select the industries or sectors you are interested in mentoring:</p>
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
                    "rounded-xl h-12 text-sm font-medium transition-all duration-200",
                    formData.mentorshipDomains.includes(domain)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30",
                  )}
                >
                  {domain}
                </Button>
              ))}
            </div>
            {formData.mentorshipDomains.includes("Other") && (
              <Input
                name="otherMentorshipDomain"
                placeholder="Please specify your mentorship domain"
                value={formData.otherMentorshipDomain}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 mt-4"
                required
              />
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Mentorship Persona</h3>
              <p className="text-gray-400 text-sm">Describe your approach to mentorship</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                name="preferredStartupStage"
                value={formData.preferredStartupStage}
                onValueChange={(val) => handleSelectChange("preferredStartupStage", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Preferred Startup Stage" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
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
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Mentorship Mode" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
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
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Weekly Availability" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
                  <SelectItem value="1-2 hours">1-2 hours</SelectItem>
                  <SelectItem value="3-5 hours">3-5 hours</SelectItem>
                  <SelectItem value="5+ hours">5+ hours</SelectItem>
                </SelectContent>
              </Select>
              <Select
                name="languagesSpoken"
                value={formData.languagesSpoken.join(',')}
                onValueChange={(val) => {
                  const newLanguages = formData.languagesSpoken.includes(val)
                    ? formData.languagesSpoken.filter(lang => lang !== val)
                    : [...formData.languagesSpoken, val];
                  setFormData({ ...formData, languagesSpoken: newLanguages });
                }}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Languages Spoken" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
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
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[100px] px-4 py-3 focus-visible:ring-purple-500 mt-4"
              required
            />
            <Textarea
              name="proudMentoringExperience"
              placeholder="Share a mentoring experience you're proud of."
              value={formData.proudMentoringExperience}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[100px] px-4 py-3 focus-visible:ring-purple-500 mt-4"
              required
            />
            <Textarea
              name="industriesMostExcitedToMentor"
              placeholder="What industries are you most excited to mentor in?"
              value={formData.industriesMostExcitedToMentor}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[100px] px-4 py-3 focus-visible:ring-purple-500 mt-4"
              required
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Additional Contributions</h3>
              <p className="text-gray-400 text-sm">How else can you contribute to the community?</p>
            </div>
            <p className="text-white font-semibold mt-4 mb-2 block">Are you open to contributing in other ways?</p>
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
                    "rounded-xl h-12 text-sm font-medium transition-all duration-200",
                    formData.openToOtherContributions.includes(contribution)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30",
                  )}
                >
                  {contribution}
                </Button>
              ))}
            </div>
            {formData.openToOtherContributions.includes("Other") && (
              <Input
                name="otherContributionType"
                placeholder="Please specify your other contribution type"
                value={formData.otherContributionType}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 mt-4"
                required
              />
            )}
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Final Step</h3>
              <p className="text-gray-400 text-sm">Review and submit your profile</p>
            </div>
            <div className="space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent-terms-privacy"
                    checked={formData.consentTermsPrivacy}
                    onCheckedChange={(checked) => setFormData({ ...formData, consentTermsPrivacy: checked as boolean })}
                    className="mt-1 border-white/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div>
                    <Label htmlFor="consent-terms-privacy" className="text-white font-medium cursor-pointer text-sm">
                      I agree to the platform's terms & privacy policy.
                    </Label>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                      By submitting this form, you consent to your data being used for platform features, research, and collaboration opportunities. We respect your privacy and will never share your personal information without permission.
                    </p>
                  </div>
                </div>
              </div>
              {submissionError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{submissionError}</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {initialData ? "Update Mentor Profile" : "Create Mentor Profile"}
                </h2>
                <span className="text-sm text-gray-400">
                  Step {step} of {steps.length}
                </span>
              </div>
              
              {/* Desktop Progress Bar */}
              <div className="hidden sm:flex justify-between items-center mb-8 relative">
                <div className="absolute w-full h-0.5 bg-gray-700 top-6" />
                <div
                  className="absolute h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 top-6 transition-all duration-500"
                  style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                />
                
                {steps.map((stepInfo, index) => {
                  const StepIcon = stepInfo.icon;
                  const isCompleted = step > index + 1;
                  const isCurrent = step === index + 1;
                  
                  return (
                    <div key={index} className="relative z-10 flex-shrink-0 flex flex-col items-center sm:w-1/6">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer",
                          isCompleted
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 border-purple-600 text-white"
                            : isCurrent
                            ? "bg-white/10 border-purple-500 text-purple-400"
                            : "bg-gray-800 border-gray-600 text-gray-400"
                        )}
                        onClick={() => setStep(index + 1)}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-xs text-center font-medium transition-colors max-w-20",
                          isCurrent ? "text-white" : "text-gray-400"
                        )}
                      >
                        {stepInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Progress Bar and Indicator */}
              <div className="sm:hidden w-full">
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(step / steps.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                      {React.createElement(steps[step - 1].icon, { className: "w-4 h-4 text-white" })}
                    </div>
                    <span className="text-white font-medium text-sm">
                      {steps[step - 1].label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (step === steps.length) handleSubmit(e);
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
                    className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl px-6 h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                )}
                {step < steps.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className={cn("bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-8 h-12", {
                      "ml-auto": step === 1,
                    })}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.consentTermsPrivacy}
                    className={cn("bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-8 h-12 font-semibold", {
                      "w-full": step === 6,
                    })}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        {initialData ? "Update Profile" : "Submit for Review"}
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessDialog}>
        <DialogContent className="sm:max-w-[400px] bg-slate-950 text-white border border-green-500/30 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              Success!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4 space-y-4">
            <p className="text-lg font-semibold">
              Your mentor profile has been submitted successfully!
            </p>
            <p className="text-gray-400 text-sm">
              Our team will review your submission and get back to you within 2-3 business days.
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-green-400 text-sm">
                You'll receive an email confirmation shortly.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}