"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
import { InvestorProfile } from "@/components/admin-approval-card"; // Ensure InvestorProfile is imported

type InvestorMultiStepFormProps = {
  userId: string;
  initialData?: InvestorProfile | null;
};

export function InvestorMultiStepForm({ userId, initialData }: InvestorMultiStepFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    fullName: "",
    emailAddress: "",
    phoneCountryCode: "+91",
    localPhoneNumber: "",
    country: "",
    city: "",
    linkedInProfile: "", // Optional

    // Step 2: Investor Profile
    investorType: "",
    typicalInvestmentRange: "",
    investmentStagePreference: [] as string[],
    preferredSectorsIndustries: [] as string[],
    otherSectorIndustry: "", // Appears if "Other" is selected

    // Step 3: Past Deals & Interests
    hasInvestedBefore: "", // "Yes" or "No"
    numberOfStartupsInvested: "", // number
    exampleStartups: "", // text
    averageTicketSize: "", // text (e.g., "$100K")
    lookingForNewOpportunities: "", // "Yes" or "No"
    investmentCriteria: "", // textarea

    // Step 4: Engagement Criteria
    supportOfferedApartFromFunding: [] as string[],
    otherSupportType: "", // Appears if "Other" is selected
    requireSpecificCountryRegion: "", // "Yes" or "No"
    specificCountryRegion: "", // text
    bucketAmount: "", // New field: Bucket Amount

    // Step 5: Consent & Submission
    consentContact: false,
    consentTermsPrivacy: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // --- useEffect to pre-fill form data when initialData prop is received ---
  useEffect(() => {
    if (initialData) {
      const fullPhoneNumber = initialData.phone_country_code + initialData.local_phone_number;
      const phoneMatch = fullPhoneNumber.match(/^(\+\d+)(.*)$/);
      const parsedPhoneCountryCode = phoneMatch ? phoneMatch[1] : "+91";
      const parsedLocalPhoneNumber = phoneMatch ? phoneMatch[2] : "";


      setFormData({
        fullName: initialData.full_name || "",
        emailAddress: initialData.email_address || "",
        phoneCountryCode: initialData.phone_country_code || "+91",
        localPhoneNumber: initialData.local_phone_number || "",
        country: initialData.country || "",
        city: initialData.city || "",
        linkedInProfile: initialData.linkedin_profile || "",

        investorType: initialData.investor_type || "",
        typicalInvestmentRange: initialData.typical_investment_range || "",
        investmentStagePreference: initialData.investment_stage_preference || [],
        preferredSectorsIndustries: initialData.preferred_sectors_industries || [],
        otherSectorIndustry: initialData.other_sector_industry || "",

        hasInvestedBefore: initialData.has_invested_before ? "Yes" : "No", // Convert boolean to "Yes"/"No"
        numberOfStartupsInvested: String(initialData.number_of_startups_invested || ""), // Convert number to string
        exampleStartups: initialData.example_startups || "",
        averageTicketSize: initialData.average_ticket_size || "",
        lookingForNewOpportunities: initialData.looking_for_new_opportunities ? "Yes" : "No", // Convert boolean to "Yes"/"No"
        investmentCriteria: initialData.investment_criteria || "",

        supportOfferedApartFromFunding: initialData.support_offered_apart_from_funding || [],
        otherSupportType: initialData.other_support_type || "",
        requireSpecificCountryRegion: initialData.require_specific_country_region ? "Yes" : "No", // Convert boolean to "Yes"/"No"
        specificCountryRegion: initialData.specific_country_region || "",
        bucketAmount: initialData.bucket_amount != null ? String(initialData.bucket_amount) : "", // Add new field here

        consentContact: false, // User should always re-consent
        consentTermsPrivacy: false, // User should always re-consent
      });
      setStep(1); // Reset to first step when initialData loads for editing
    } else {
      // Reset form for new submission if initialData is null
      setFormData({
        fullName: "", emailAddress: "", phoneCountryCode: "+91", localPhoneNumber: "", country: "", city: "", linkedInProfile: "",
        investorType: "", typicalInvestmentRange: "", investmentStagePreference: [], preferredSectorsIndustries: [], otherSectorIndustry: "",
        hasInvestedBefore: "", numberOfStartupsInvested: "", exampleStartups: "", averageTicketSize: "",
        lookingForNewOpportunities: "", investmentCriteria: "",
        supportOfferedApartFromFunding: [], otherSupportType: "", requireSpecificCountryRegion: "", specificCountryRegion: "", bucketAmount: "", // Add new field here
        consentContact: false, consentTermsPrivacy: false,
      });
      setStep(1); // Ensure new form starts at step 1
    }
  }, [initialData]); // Depend on initialData prop

  // Handlers
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
      case 1: // Personal Details
        if (!formData.fullName || !formData.emailAddress || !formData.localPhoneNumber || !formData.country || !formData.city) {
          isValid = false;
          errorMessage = "Please fill in all required personal details.";
        }
        break;
      case 2: // Investor Profile
        if (!formData.investorType || !formData.typicalInvestmentRange || formData.investmentStagePreference.length === 0 || formData.preferredSectorsIndustries.length === 0) {
          isValid = false;
          errorMessage = "Please fill in all required investor profile details.";
        }
        if (formData.preferredSectorsIndustries.includes("Other") && !formData.otherSectorIndustry) {
          isValid = false;
          errorMessage = "Please specify the other sector/industry.";
        }
        break;
      case 3: // Past Deals & Interests
        if (!formData.hasInvestedBefore) {
          isValid = false;
          errorMessage = "Please indicate if you have invested in startups before.";
        } else if (formData.hasInvestedBefore === "Yes") {
          if (!formData.numberOfStartupsInvested || !formData.exampleStartups || !formData.averageTicketSize) {
            isValid = false;
            errorMessage = "Please provide details about your past investments.";
          }
        }
        if (!formData.lookingForNewOpportunities) {
          isValid = false;
          errorMessage = "Please indicate if you are looking for new investment opportunities.";
        }
        if (!formData.investmentCriteria) {
          isValid = false;
          errorMessage = "Please describe what you look for in a startup.";
        }
        break;
      case 4: // Engagement Criteria
        if (formData.supportOfferedApartFromFunding.length === 0) {
          isValid = false;
          errorMessage = "Please select at least one type of support you offer.";
        }
        if (formData.supportOfferedApartFromFunding.includes("Other") && !formData.otherSupportType) {
          isValid = false;
          errorMessage = "Please specify the other support type.";
        }
        if (!formData.requireSpecificCountryRegion) {
          isValid = false;
          errorMessage = "Please indicate if you require startups to be registered in a specific country/region.";
        } else if (formData.requireSpecificCountryRegion === "Yes" && !formData.specificCountryRegion) {
          isValid = false;
          errorMessage = "Please specify the required country or region.";
        }
        if (!formData.bucketAmount) { // Validation for the new field
          isValid = false;
          errorMessage = "Please enter the bucket amount.";
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
    if (!formData.consentContact || !formData.consentTermsPrivacy) {
      setSubmissionError("You must agree to all consent policies before submitting.");
      toast.error("You must agree to all consent policies before submitting.");
      return;
    }
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const submissionPayload = {
        user_id: userId,
        full_name: formData.fullName,
        email_address: formData.emailAddress,
        phone_country_code: formData.phoneCountryCode,
        local_phone_number: formData.localPhoneNumber,
        country: formData.country,
        city: formData.city,
        linkedin_profile: formData.linkedInProfile,
        investor_type: formData.investorType,
        typical_investment_range: formData.typicalInvestmentRange,
        investment_stage_preference: formData.investmentStagePreference,
        preferred_sectors_industries: formData.preferredSectorsIndustries,
        other_sector_industry: formData.otherSectorIndustry,
        has_invested_before: formData.hasInvestedBefore === "Yes", // Convert to boolean
        number_of_startups_invested: formData.hasInvestedBefore === "Yes" ? parseInt(formData.numberOfStartupsInvested, 10) : null,
        example_startups: formData.hasInvestedBefore === "Yes" ? formData.exampleStartups : null,
        average_ticket_size: formData.hasInvestedBefore === "Yes" ? formData.averageTicketSize : null,
        looking_for_new_opportunities: formData.lookingForNewOpportunities === "Yes", // Convert to boolean
        investment_criteria: formData.investmentCriteria,
        support_offered_apart_from_funding: formData.supportOfferedApartFromFunding,
        other_support_type: formData.otherSupportType,
        require_specific_country_region: formData.requireSpecificCountryRegion === "Yes", // Convert to boolean
        specific_country_region: formData.requireSpecificCountryRegion === "Yes" ? formData.specificCountryRegion : null,
        bucket_amount: formData.bucketAmount, // Include the new field in the payload
        status: "pending", // Always set to pending for re-approval/initial submission
      };

      let dbOperationError = null;

      if (initialData?.id) {
        // --- UPDATE Existing Profile ---
        console.log("Updating existing Investor profile with ID:", initialData.id);
        const { error: updateError } = await supabase
          .from("investor_approval")
          .update({
            ...submissionPayload,
            updated_at: new Date().toISOString(), // Update timestamp
          })
          .eq("id", initialData.id); // Target the specific record by its ID
        dbOperationError = updateError;
      } else {
        // --- INSERT New Profile ---
        console.log("Submitting new Investor profile.");
        const { error: insertError } = await supabase
          .from("investor_approval")
          .insert({
            ...submissionPayload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        dbOperationError = insertError;
      }

      if (dbOperationError) throw dbOperationError;

      setShowSuccessDialog(true);
      toast.success(initialData ? "Investor Profile updated successfully!" : "Investor Profile submitted successfully! Waiting for approval.");
      setTimeout(() => router.push("/my-startups"), 3000); // Redirect to My Profiles
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmissionError(err?.message || "Submission failed. Please try again.");
      toast.error(err?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  placeholder="Local Phone Number"
                  value={formData.localPhoneNumber}
                  onChange={handleInputChange}
                  className="flex-1 bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                  required
                />
              </div>
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
                className="md:col-span-2 bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="linkedInProfile"
                type="url"
                placeholder="LinkedIn Profile (Optional)"
                value={formData.linkedInProfile}
                onChange={handleInputChange}
                className="md:col-span-2 bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Investor Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="investorType"
                value={formData.investorType}
                onValueChange={(val) => handleSelectChange("investorType", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Investor Type" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="Angel Investor">Angel Investor</SelectItem>
                  <SelectItem value="Venture Capitalist">Venture Capitalist</SelectItem>
                  <SelectItem value="Corporate VC">Corporate VC</SelectItem>
                  <SelectItem value="Family Office">Family Office</SelectItem>
                  <SelectItem value="Private Equity">Private Equity</SelectItem>
                  <SelectItem value="Incubator/Accelerator">Incubator/Accelerator</SelectItem>
                </SelectContent>
              </Select>
              <Select
                name="typicalInvestmentRange"
                value={formData.typicalInvestmentRange}
                onValueChange={(val) => handleSelectChange("typicalInvestmentRange", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Typical Investment Range" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="Below $50K">Below $50K</SelectItem>
                  <SelectItem value="$50K - $250K">$50K - $250K</SelectItem>
                  <SelectItem value="$250K - $1M">$250K - $1M</SelectItem>
                  <SelectItem value="$1M - $5M">$1M - $5M</SelectItem>
                  <SelectItem value="Above $5M">Above $5M</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-neutral-300 font-medium">Investment Stage Preference:</p>
            <div className="flex flex-wrap gap-2">
              {["Pre-Seed", "Seed", "Series A", "Series B and above"].map((stage) => (
                <Button
                  key={stage}
                  type="button"
                  variant={formData.investmentStagePreference.includes(stage) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("investmentStagePreference", stage)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    formData.investmentStagePreference.includes(stage)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                  )}
                >
                  {stage}
                </Button>
              ))}
            </div>
            <p className="text-neutral-300 font-medium">Preferred Sectors/Industries:</p>
            <div className="flex flex-wrap gap-2">
              {["FinTech", "EdTech", "AgriTech", "HealthTech", "Other"].map((sector) => (
                <Button
                  key={sector}
                  type="button"
                  variant={formData.preferredSectorsIndustries.includes(sector) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("preferredSectorsIndustries", sector)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    formData.preferredSectorsIndustries.includes(sector)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                  )}
                >
                  {sector}
                </Button>
              ))}
            </div>
            {formData.preferredSectorsIndustries.includes("Other") && (
              <Input
                name="otherSectorIndustry"
                placeholder="Let Us Know Your Need (for Other Sector/Industry)"
                value={formData.otherSectorIndustry}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Past Deals & Interests</h3>
            <p className="text-neutral-300 font-medium">Have you invested in startups before?</p>
            <div className="flex gap-4">
              <Label htmlFor="invested-yes" className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  id="invested-yes"
                  name="hasInvestedBefore"
                  value="Yes"
                  checked={formData.hasInvestedBefore === "Yes"}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500 border-neutral-600"
                />
                Yes
              </Label>
              <Label htmlFor="invested-no" className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  id="invested-no"
                  name="hasInvestedBefore"
                  value="No"
                  checked={formData.hasInvestedBefore === "No"}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500 border-neutral-600"
                />
                No
              </Label>
            </div>
            {formData.hasInvestedBefore === "Yes" && (
              <div className="space-y-4 pt-4">
                <Input
                  name="numberOfStartupsInvested"
                  placeholder="Number of startups invested in"
                  type="number"
                  min="0"
                  value={formData.numberOfStartupsInvested}
                  onChange={handleInputChange}
                  className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                  required
                />
                <Input
                  name="exampleStartups"
                  placeholder="Example startups (e.g., 'Startup A, Startup B')"
                  value={formData.exampleStartups}
                  onChange={handleInputChange}
                  className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                  required
                />
                <Input
                  name="averageTicketSize"
                  placeholder="Average ticket size (e.g., '$100K')"
                  value={formData.averageTicketSize}
                  onChange={handleInputChange}
                  className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                  required
                />
              </div>
            )}

            <p className="text-neutral-300 font-medium pt-4">Are you currently looking for new investment opportunities?</p>
            <div className="flex gap-4">
              <Label htmlFor="looking-yes" className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  id="looking-yes"
                  name="lookingForNewOpportunities"
                  value="Yes"
                  checked={formData.lookingForNewOpportunities === "Yes"}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500 border-neutral-600"
                />
                Yes
              </Label>
              <Label htmlFor="looking-no" className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  id="looking-no"
                  name="lookingForNewOpportunities"
                  value="No"
                  checked={formData.lookingForNewOpportunities === "No"}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500 border-neutral-600"
                />
                No
              </Label>
            </div>

            <Textarea
              name="investmentCriteria"
              placeholder="What do you look for in a startup before investing? (e.g., strong team, market potential, traction)"
              value={formData.investmentCriteria}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[120px] px-4 py-3 focus-visible:ring-purple-500"
              required
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Engagement Criteria</h3>
            <p className="text-neutral-300 font-medium">Apart from funding, what support do you offer?</p>
            <div className="flex flex-wrap gap-2">
              {["Mentorship", "Networking", "Strategic Guidance", "Operational Support", "Market Access", "Talent Acquisition", "Legal/IP Support", "Other"].map((support) => (
                <Button
                  key={support}
                  type="button"
                  variant={formData.supportOfferedApartFromFunding.includes(support) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("supportOfferedApartFromFunding", support)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    formData.supportOfferedApartFromFunding.includes(support)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                  )}
                >
                  {support}
                </Button>
              ))}
            </div>
            {formData.supportOfferedApartFromFunding.includes("Other") && (
              <Input
                name="otherSupportType"
                placeholder="Let Us Know Your Need (for Other Support Type)"
                value={formData.otherSupportType}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
            )}

            <p className="text-neutral-300 font-medium pt-4">Do you require startups to be registered in a specific country or region?</p>
            <div className="flex gap-4">
              <Label htmlFor="region-yes" className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  id="region-yes"
                  name="requireSpecificCountryRegion"
                  value="Yes"
                  checked={formData.requireSpecificCountryRegion === "Yes"}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500 border-neutral-600"
                />
                Yes
              </Label>
              <Label htmlFor="region-no" className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  id="region-no"
                  name="requireSpecificCountryRegion"
                  value="No"
                  checked={formData.requireSpecificCountryRegion === "No"}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500 border-neutral-600"
                />
                No
              </Label>
            </div>
            {formData.requireSpecificCountryRegion === "Yes" && (
              <Input
                name="specificCountryRegion"
                placeholder="Specify Country or Region"
                value={formData.specificCountryRegion}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
            )}
            {/* Added new input field for bucket amount */}
            <Input
              name="bucketAmount"
              placeholder="Bucket Amount"
              value={formData.bucketAmount}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              required
            />
          </div>
        );
      case 5: // Consent & Submission
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Consent & Submission</h3>
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent-contact"
                  checked={formData.consentContact}
                  onCheckedChange={(checked) => setFormData({ ...formData, consentContact: checked as boolean })}
                  className="border-neutral-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <Label htmlFor="consent-contact" className="text-neutral-300 text-sm cursor-pointer">
                  I consent to being contacted by startups and platform partners.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
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
            </div>
            {submissionError && <p className="text-red-500 text-sm mt-4">{submissionError}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  const steps = [
    "Personal Details",
    "Investor Profile",
    "Past Deals & Interests",
    "Engagement Criteria",
    "Consent & Submission",
  ];

  return (
    <div className="min-h-screen bg-[#0E0617] py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <header className="flex items-center mt-32 justify-between mb-10">
          {/* Optional: Add a logo or title here */}
        </header>

        <div className="max-w-3xl mx-auto">
          {" "}
          {/* Centered form container */}
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
                    disabled={isSubmitting || !formData.consentContact || !formData.consentTermsPrivacy}
                  >
                    {isSubmitting ? "Submitting..." : (initialData ? "Update Profile" : "Submit for Review")}
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
            Your Investor Profile has been submitted.
            <span className="text-purple-400 mt-1">Wait for approval.</span>
          </div>
          <div className="flex justify-center">
            <Button className="bg-purple-600 text-white" disabled>
              Redirecting to My Profiles...
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}