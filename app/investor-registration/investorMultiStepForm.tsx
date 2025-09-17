"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, ArrowLeft, User, Building2, HelpCircle, MessageSquare, Upload } from "lucide-react";
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

// Placeholder for InvestorProfile, assuming it's structured like this
interface InvestorProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email_address: string | null;
  phone_country_code: string | null;
  local_phone_number: string | null;
  country: string | null;
  city: string | null;
  linkedin_profile: string | null;
  investor_type: string | null;
  typical_investment_range: string | null;
  investment_stage_preference: string[] | null;
  preferred_sectors_industries: string[] | null;
  other_sector_industry: string | null;
  has_invested_before: boolean | null;
  number_of_startups_invested: number | null;
  example_startups: string | null;
  average_ticket_size: string | null;
  looking_for_new_opportunities: boolean | null;
  investment_criteria: string | null;
  support_offered_apart_from_funding: string[] | null;
  other_support_type: string | null;
  require_specific_country_region: boolean | null;
  specific_country_region: string | null;
  bucket_amount: string | null;
  status: string;
}

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
    linkedInProfile: "",

    // Step 2: Investor Profile
    investorType: "",
    typicalInvestmentRange: "",
    investmentStagePreference: [] as string[],
    preferredSectorsIndustries: [] as string[],
    otherSectorIndustry: "",

    // Step 3: Past Deals & Interests
    hasInvestedBefore: "",
    numberOfStartupsInvested: "",
    exampleStartups: "",
    averageTicketSize: "",
    lookingForNewOpportunities: "",
    investmentCriteria: "",

    // Step 4: Engagement Criteria
    supportOfferedApartFromFunding: [] as string[],
    otherSupportType: "",
    requireSpecificCountryRegion: "",
    specificCountryRegion: "",
    bucketAmount: "",

    // Step 5: Consent & Submission
    consentContact: false,
    consentTermsPrivacy: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (initialData) {
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

        hasInvestedBefore: initialData.has_invested_before ? "Yes" : "No",
        numberOfStartupsInvested: String(initialData.number_of_startups_invested || ""),
        exampleStartups: initialData.example_startups || "",
        averageTicketSize: initialData.average_ticket_size || "",
        lookingForNewOpportunities: initialData.looking_for_new_opportunities ? "Yes" : "No",
        investmentCriteria: initialData.investment_criteria || "",

        supportOfferedApartFromFunding: initialData.support_offered_apart_from_funding || [],
        otherSupportType: initialData.other_support_type || "",
        requireSpecificCountryRegion: initialData.require_specific_country_region ? "Yes" : "No",
        specificCountryRegion: initialData.specific_country_region || "",
        bucketAmount: initialData.bucket_amount != null ? String(initialData.bucket_amount) : "",

        consentContact: false,
        consentTermsPrivacy: false,
      });
      setStep(1);
    } else {
      setFormData({
        fullName: "", emailAddress: "", phoneCountryCode: "+91", localPhoneNumber: "", country: "", city: "", linkedInProfile: "",
        investorType: "", typicalInvestmentRange: "", investmentStagePreference: [], preferredSectorsIndustries: [], otherSectorIndustry: "",
        hasInvestedBefore: "", numberOfStartupsInvested: "", exampleStartups: "", averageTicketSize: "",
        lookingForNewOpportunities: "", investmentCriteria: "",
        supportOfferedApartFromFunding: [], otherSupportType: "", requireSpecificCountryRegion: "", specificCountryRegion: "", bucketAmount: "",
        consentContact: false, consentTermsPrivacy: false,
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
        if (!formData.fullName || !formData.emailAddress || !formData.localPhoneNumber || !formData.country || !formData.city) {
          isValid = false;
          errorMessage = "Please fill in all required personal details.";
        }
        break;
      case 2:
        if (!formData.investorType || !formData.typicalInvestmentRange || formData.investmentStagePreference.length === 0 || formData.preferredSectorsIndustries.length === 0) {
          isValid = false;
          errorMessage = "Please fill in all required investor profile details.";
        }
        if (formData.preferredSectorsIndustries.includes("Other") && !formData.otherSectorIndustry) {
          isValid = false;
          errorMessage = "Please specify the other sector/industry.";
        }
        break;
      case 3:
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
      case 4:
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
        if (!formData.bucketAmount) {
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
        has_invested_before: formData.hasInvestedBefore === "Yes",
        number_of_startups_invested: formData.hasInvestedBefore === "Yes" ? parseInt(formData.numberOfStartupsInvested, 10) : null,
        example_startups: formData.hasInvestedBefore === "Yes" ? formData.exampleStartups : null,
        average_ticket_size: formData.hasInvestedBefore === "Yes" ? formData.averageTicketSize : null,
        looking_for_new_opportunities: formData.lookingForNewOpportunities === "Yes",
        investment_criteria: formData.investmentCriteria,
        support_offered_apart_from_funding: formData.supportOfferedApartFromFunding,
        other_support_type: formData.otherSupportType,
        require_specific_country_region: formData.requireSpecificCountryRegion === "Yes",
        specific_country_region: formData.requireSpecificCountryRegion === "Yes" ? formData.specificCountryRegion : null,
        bucket_amount: formData.bucketAmount,
        status: "pending",
      };

      let dbOperationError = null;

      if (initialData?.id) {
        console.log("Updating existing Investor profile with ID:", initialData.id);
        const { error: updateError } = await supabase
          .from("investor_approval")
          .update({
            ...submissionPayload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);
        dbOperationError = updateError;
      } else {
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
      setTimeout(() => router.push("/my-startups"), 3000);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmissionError(err?.message || "Submission failed. Please try again.");
      toast.error(err?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return User;
      case 2: return Building2;
      case 3: return HelpCircle;
      case 4: return MessageSquare;
      case 5: return Upload;
      default: return User;
    }
  };

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
              <div className="flex gap-2 sm:col-span-2">
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
                name="country"
                value={formData.country}
                onValueChange={(value) => handleSelectChange("country", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Select Country" />
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
                name="linkedInProfile"
                type="url"
                placeholder="LinkedIn Profile (Optional)"
                value={formData.linkedInProfile}
                onChange={handleInputChange}
                className="sm:col-span-2 bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Investor Profile</h3>
              <p className="text-gray-400 text-sm">Tell us about your investment preferences</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                name="investorType"
                value={formData.investorType}
                onValueChange={(val) => handleSelectChange("investorType", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Investor Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
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
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Typical Investment Range" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
                  <SelectItem value="Below $50K">Below $50K</SelectItem>
                  <SelectItem value="$50K - $250K">$50K - $250K</SelectItem>
                  <SelectItem value="$250K - $1M">$250K - $1M</SelectItem>
                  <SelectItem value="$1M - $5M">$1M - $5M</SelectItem>
                  <SelectItem value="Above $5M">Above $5M</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-white font-semibold mt-4 mb-2 block">Investment Stage Preference:</p>
            <div className="flex flex-wrap gap-2">
              {["Pre-Seed", "Seed", "Series A", "Series B and above"].map((stage) => (
                <Button
                  key={stage}
                  type="button"
                  variant={formData.investmentStagePreference.includes(stage) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("investmentStagePreference", stage)}
                  className={cn(
                    "rounded-xl h-12 text-sm font-medium transition-all duration-200",
                    formData.investmentStagePreference.includes(stage)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30",
                  )}
                >
                  {stage}
                </Button>
              ))}
            </div>
            <p className="text-white font-semibold mt-4 mb-2 block">Preferred Sectors/Industries:</p>
            <div className="flex flex-wrap gap-2">
              {["FinTech", "EdTech", "AgriTech", "HealthTech", "Other"].map((sector) => (
                <Button
                  key={sector}
                  type="button"
                  variant={formData.preferredSectorsIndustries.includes(sector) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("preferredSectorsIndustries", sector)}
                  className={cn(
                    "rounded-xl h-12 text-sm font-medium transition-all duration-200",
                    formData.preferredSectorsIndustries.includes(sector)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30",
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
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Past Deals & Interests</h3>
              <p className="text-gray-400 text-sm">Tell us about your investment history and future goals</p>
            </div>
            <p className="text-white font-semibold mt-4 mb-2 block">Have you invested in startups before?</p>
            <div className="flex gap-4">
              <Label htmlFor="invested-yes" className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  id="invested-yes"
                  name="hasInvestedBefore"
                  value="Yes"
                  checked={formData.hasInvestedBefore === "Yes"}
                  onChange={handleInputChange}
                  className="h-4 w-4 bg-transparent border-white/30 text-purple-600 focus:ring-purple-500"
                />
                Yes
              </Label>
              <Label htmlFor="invested-no" className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  id="invested-no"
                  name="hasInvestedBefore"
                  value="No"
                  checked={formData.hasInvestedBefore === "No"}
                  onChange={handleInputChange}
                  className="h-4 w-4 bg-transparent border-white/30 text-purple-600 focus:ring-purple-500"
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
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
                  required
                />
                <Input
                  name="exampleStartups"
                  placeholder="Example startups (e.g., 'Startup A, Startup B')"
                  value={formData.exampleStartups}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
                  required
                />
                <Input
                  name="averageTicketSize"
                  placeholder="Average ticket size (e.g., '$100K')"
                  value={formData.averageTicketSize}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
                  required
                />
              </div>
            )}

            <p className="text-white font-semibold pt-4 mb-2 block">Are you currently looking for new investment opportunities?</p>
            <div className="flex gap-4">
              <Label htmlFor="looking-yes" className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  id="looking-yes"
                  name="lookingForNewOpportunities"
                  value="Yes"
                  checked={formData.lookingForNewOpportunities === "Yes"}
                  onChange={handleInputChange}
                  className="h-4 w-4 bg-transparent border-white/30 text-purple-600 focus:ring-purple-500"
                />
                Yes
              </Label>
              <Label htmlFor="looking-no" className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  id="looking-no"
                  name="lookingForNewOpportunities"
                  value="No"
                  checked={formData.lookingForNewOpportunities === "No"}
                  onChange={handleInputChange}
                  className="h-4 w-4 bg-transparent border-white/30 text-purple-600 focus:ring-purple-500"
                />
                No
              </Label>
            </div>

            <Textarea
              name="investmentCriteria"
              placeholder="What do you look for in a startup before investing? (e.g., strong team, market potential, traction)"
              value={formData.investmentCriteria}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[120px] px-4 py-3 focus-visible:ring-purple-500 mt-4"
              required
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Engagement Criteria</h3>
              <p className="text-gray-400 text-sm">Define how you want to engage with startups</p>
            </div>
            <p className="text-white font-semibold mt-4 mb-2 block">Apart from funding, what support do you offer?</p>
            <div className="flex flex-wrap gap-2">
              {["Mentorship", "Networking", "Strategic Guidance", "Operational Support", "Market Access", "Talent Acquisition", "Legal/IP Support", "Other"].map((support) => (
                <Button
                  key={support}
                  type="button"
                  variant={formData.supportOfferedApartFromFunding.includes(support) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("supportOfferedApartFromFunding", support)}
                  className={cn(
                    "rounded-xl h-12 text-sm font-medium transition-all duration-200",
                    formData.supportOfferedApartFromFunding.includes(support)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30",
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
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 mt-4"
                required
              />
            )}

            <p className="text-white font-semibold pt-4 mb-2 block">Do you require startups to be registered in a specific country or region?</p>
            <div className="flex gap-4">
              <Label htmlFor="region-yes" className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  id="region-yes"
                  name="requireSpecificCountryRegion"
                  value="Yes"
                  checked={formData.requireSpecificCountryRegion === "Yes"}
                  onChange={handleInputChange}
                  className="h-4 w-4 bg-transparent border-white/30 text-purple-600 focus:ring-purple-500"
                />
                Yes
              </Label>
              <Label htmlFor="region-no" className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  id="region-no"
                  name="requireSpecificCountryRegion"
                  value="No"
                  checked={formData.requireSpecificCountryRegion === "No"}
                  onChange={handleInputChange}
                  className="h-4 w-4 bg-transparent border-white/30 text-purple-600 focus:ring-purple-500"
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
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 mt-4"
                required
              />
            )}
            <Input
              name="bucketAmount"
              placeholder="Bucket Amount"
              value={formData.bucketAmount}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 mt-4"
              required
            />
          </div>
        );
      case 5:
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
              {/* Consent */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent-contact"
                    checked={formData.consentContact}
                    onCheckedChange={(checked) => setFormData({ ...formData, consentContact: checked as boolean })}
                    className="mt-1 border-white/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div>
                    <Label htmlFor="consent-contact" className="text-white font-medium cursor-pointer text-sm">
                      I consent to being contacted by startups and platform partners.
                    </Label>
                  </div>
                </div>
              </div>
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

  const steps = [
    { label: "Personal Details", icon: User },
    { label: "Investor Profile", icon: Building2 },
    { label: "Past Deals", icon: HelpCircle },
    { label: "Engagement", icon: MessageSquare },
    { label: "Submission", icon: Upload },
  ];

  return (
    <>
      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 1px #a855f7;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 1px #a855f7;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900">
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {initialData ? "Update Investor Profile" : "Create Investor Profile"}
                  </h2>
                  <span className="text-sm text-gray-400">
                    Step {step} of {steps.length}
                  </span>
                </div>
                
                <div className="relative flex justify-between items-center w-full mb-8 text-xs">
                  <div
                    className="absolute left-0 h-0.5 bg-gray-700 top-6"
                    style={{ width: `100%` }}
                  />
                  <div
                    className="absolute left-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 top-6 transition-all duration-500"
                    style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                  />
                  
                  {steps.map((stepInfo, index) => {
                    const StepIcon = stepInfo.icon;
                    const isCompleted = step > index + 1;
                    const isCurrent = step === index + 1;
                    
                    return (
                      <div key={index} className="relative z-10 flex flex-col items-center">
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
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step === steps.length) handleSubmit(e);
                }}
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
                      disabled={isSubmitting || !formData.consentContact || !formData.consentTermsPrivacy}
                      className={cn("bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-8 h-12 font-semibold", {
                        "w-full": step === 5,
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
                Your investor profile has been submitted successfully!
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
    </>
  );
}