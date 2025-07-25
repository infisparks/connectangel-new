"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image"; // Keep if you use Image component, even if not directly for thumbnails in this form
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop"; // Keep if you use Cropper, even if not directly for thumbnails in this form
import { Plus, Play, ImageIcon, ArrowRight, CheckCircle2 } from "lucide-react";
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

// Import IncubationProfile type from its source (assuming it's in my-startups/page.tsx)
import { IncubationProfile } from "@/app/my-startups/page";

// Supabase storage bucket names (not directly used in this form but kept for context)
const SUPABASE_VIDEO_BUCKET = "pitch-videos"; // Not used in Incubation form
const SUPABASE_THUMBNAIL_BUCKET = "thumbnails"; // Not used in Incubation form

type IncubationMultiStepFormProps = {
  userId: string;
  initialData?: IncubationProfile | null;
};

// Utility function to get cropped image - assumed to be globally available or imported
// This function and ThumbnailCropper component are generally for image uploads.
// If your Incubation form doesn't involve image uploads, these can be removed.
function getCroppedImg(imageSrc: string, croppedAreaPixels: any): Promise<Blob> {
  return new Promise(async (resolve) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 400;
      canvas.height = 225;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        400,
        225
      );

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/png");
    };
  });
}

const ThumbnailCropper = ({
  imageUrl,
  onCropComplete,
  onClose,
}: {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onClose: () => void;
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    setLoading(true);
    const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);
    setLoading(false);
    onCropComplete(croppedBlob);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#2A0050] text-white border-[#4A0080] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Crop Thumbnail (16:9)</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="flex flex-col space-y-3 pt-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <Button onClick={handleApply} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
            {loading ? "Processing..." : "Apply Crop"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function IncubationMultiStepForm({ userId, initialData }: IncubationMultiStepFormProps) {
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

    // Step 2: Incubation Overview
    incubatorAcceleratorName: "",
    typeOfIncubator: "",
    yearEstablished: "",
    website: "",
    linkedInProfile: "", // Optional
    physicalAddress: "",
    affiliatedOrganizationUniversity: "", // Optional
    registrationNumber: "", // Optional

    // Step 3: Focus Areas
    primaryFocusAreas: [] as string[],
    specifyOtherFocusArea: "", // Appears if "Other" is selected

    // Step 4: Services & Track Record
    servicesOfferedToStartups: [] as string[],
    specifyOtherServices: "", // Appears if "Other" is selected
    eligibilityCriteria: "",
    totalFundingRaisedByAlumni: "",
    percentageStartupsOperationalAfter3Yrs: "",
    notableAlumniStartups: [] as { startupName: string; websiteUrl: string }[],

    // Step 5: Vision & Ecosystem Fit
    uniqueValueProposition: "",
    problemGapsSolvedInEcosystem: "",
    preferredStartupStages: [] as string[],
    interestedInCrossBorderCollaborations: "",
    plannedExpansions: "",
    keyChallengesYouFace: "",
    firstGoalNext12Months: "",
    secondGoal: "", // Optional
    thirdGoal: "", // Optional

    // Step 6: Consent & Submission
    consentAgreed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // --- useEffect to pre-fill form data when initialData prop is received ---
  useEffect(() => {
    if (initialData) {
      // Helper to parse phone number (e.g., "+911234567890" -> "+91", "1234567890")
      const parsePhoneNumber = (fullNumber: string | undefined | null) => {
        if (!fullNumber) return { code: "+91", number: "" };
        const match = fullNumber.match(/^(\+\d+)(.*)$/);
        if (match) {
          return { code: match[1], number: match[2] };
        }
        return { code: "+91", number: fullNumber }; // Fallback if format is unexpected
      };

      const { code: phoneCountryCode, number: localPhoneNumber } = parsePhoneNumber(initialData.phone_country_code + initialData.local_phone_number);

      setFormData({
        fullName: initialData.full_name || "",
        emailAddress: initialData.email_address || "",
        phoneCountryCode: initialData.phone_country_code || "+91", // Use the explicit country code if available
        localPhoneNumber: initialData.local_phone_number || "", // Use the explicit local number if available
        country: initialData.country || "",
        city: initialData.city || "",

        incubatorAcceleratorName: initialData.incubator_accelerator_name || "",
        typeOfIncubator: initialData.type_of_incubator || "",
        yearEstablished: String(initialData.year_established || ""),
        website: initialData.website || "",
        linkedInProfile: initialData.linkedin_profile || "",
        physicalAddress: initialData.physical_address || "",
        affiliatedOrganizationUniversity: initialData.affiliated_organization_university || "",
        registrationNumber: initialData.registration_number || "",

        primaryFocusAreas: initialData.primary_focus_areas || [],
        specifyOtherFocusArea: initialData.specify_other_focus_area || "",

        servicesOfferedToStartups: initialData.services_offered_to_startups || [],
        specifyOtherServices: initialData.specify_other_services || "",
        eligibilityCriteria: initialData.eligibility_criteria || "",
        totalFundingRaisedByAlumni: initialData.total_funding_raised_by_alumni || "",
        percentageStartupsOperationalAfter3Yrs: String(initialData.percentage_startups_operational_after_3_yrs || ""),
        notableAlumniStartups: initialData.notable_alumni_startups || [],

        uniqueValueProposition: initialData.unique_value_proposition || "",
        problemGapsSolvedInEcosystem: initialData.problem_gaps_solved_in_ecosystem || "",
        preferredStartupStages: initialData.preferred_startup_stages || [],
        interestedInCrossBorderCollaborations: initialData.interested_in_cross_border_collaborations || "",
        plannedExpansions: initialData.planned_expansions || "",
        keyChallengesYouFace: initialData.key_challenges_you_face || "",
        firstGoalNext12Months: initialData.first_goal_next_12_months || "",
        secondGoal: initialData.second_goal || "",
        thirdGoal: initialData.third_goal || "",

        consentAgreed: false, // User should always re-consent for submission/update
      });
      setStep(1); // Reset to first step when initialData loads for editing
    } else {
      // Reset form for new submission if initialData is null
      setFormData({
        fullName: "", emailAddress: "", phoneCountryCode: "+91", localPhoneNumber: "", country: "", city: "",
        incubatorAcceleratorName: "", typeOfIncubator: "", yearEstablished: "", website: "",
        linkedInProfile: "", physicalAddress: "", affiliatedOrganizationUniversity: "", registrationNumber: "",
        primaryFocusAreas: [], specifyOtherFocusArea: "", servicesOfferedToStartups: [],
        specifyOtherServices: "", eligibilityCriteria: "", totalFundingRaisedByAlumni: "",
        percentageStartupsOperationalAfter3Yrs: "", notableAlumniStartups: [],
        uniqueValueProposition: "", problemGapsSolvedInEcosystem: "", preferredStartupStages: [],
        interestedInCrossBorderCollaborations: "", plannedExpansions: "", keyChallengesYouFace: "",
        firstGoalNext12Months: "", secondGoal: "", thirdGoal: "", consentAgreed: false,
      });
      setStep(1); // Ensure new form starts at step 1
    }
  }, [initialData]);

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

  const addNotableAlumniStartup = (startupName: string, websiteUrl: string) => {
    if (startupName && websiteUrl) {
      setFormData((prev) => ({
        ...prev,
        notableAlumniStartups: [...prev.notableAlumniStartups, { startupName, websiteUrl }],
      }));
      toast.success("Notable alumni startup added!");
      // Clear the input fields after adding
      (document.getElementById("newAlumniStartupName") as HTMLInputElement).value = '';
      (document.getElementById("newAlumniWebsiteUrl") as HTMLInputElement).value = '';
    } else {
      toast.error("Please fill in both startup name and website URL.");
    }
  };

  const removeNotableAlumniStartup = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      notableAlumniStartups: prev.notableAlumniStartups.filter((_, i) => i !== index),
    }));
    toast.info("Notable alumni startup removed.");
  };

  const handleNext = async () => {
    let isValid = true;
    let errorMessage = "";

    switch (step) {
      case 1: // Personal Details
        if (!formData.fullName || !formData.emailAddress || !formData.localPhoneNumber || !formData.country || !formData.city) {
          isValid = false;
          errorMessage = "Please fill in all personal and contact details.";
        }
        break;
      case 2: // Incubation Overview
        if (!formData.incubatorAcceleratorName || !formData.typeOfIncubator || !formData.yearEstablished || !formData.website || !formData.physicalAddress) {
          isValid = false;
          errorMessage = "Please fill in all required incubation overview details.";
        }
        break;
      case 3: // Focus Areas
        if (formData.primaryFocusAreas.length === 0) {
          isValid = false;
          errorMessage = "Please select at least one primary focus area.";
        }
        if (formData.primaryFocusAreas.includes("Other") && !formData.specifyOtherFocusArea) {
          isValid = false;
          errorMessage = "Please specify the other focus area.";
        }
        break;
      case 4: // Services & Track Record
        if (formData.servicesOfferedToStartups.length === 0 || !formData.eligibilityCriteria || !formData.totalFundingRaisedByAlumni || !formData.percentageStartupsOperationalAfter3Yrs) {
          isValid = false;
          errorMessage = "Please fill in all required services and track record details.";
        }
        if (formData.servicesOfferedToStartups.includes("Other") && !formData.specifyOtherServices) {
          isValid = false;
          errorMessage = "Please specify the other services offered.";
        }
        break;
      case 5: // Vision & Ecosystem Fit
        if (!formData.uniqueValueProposition || !formData.problemGapsSolvedInEcosystem || formData.preferredStartupStages.length === 0 || !formData.interestedInCrossBorderCollaborations || !formData.plannedExpansions || !formData.keyChallengesYouFace || !formData.firstGoalNext12Months) {
          isValid = false;
          errorMessage = "Please fill in all required vision and ecosystem fit details.";
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
    if (!formData.consentAgreed) {
      setSubmissionError("You must agree to the privacy policy before submitting.");
      toast.error("You must agree to the privacy policy before submitting.");
      return;
    }
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Prepare the data payload, converting types as necessary
      const submissionPayload = {
        user_id: userId,
        full_name: formData.fullName,
        email_address: formData.emailAddress,
        phone_country_code: formData.phoneCountryCode,
        local_phone_number: formData.localPhoneNumber,
        country: formData.country,
        city: formData.city,
        incubator_accelerator_name: formData.incubatorAcceleratorName,
        type_of_incubator: formData.typeOfIncubator,
        year_established: parseInt(formData.yearEstablished, 10), // Convert to integer
        website: formData.website,
        linkedin_profile: formData.linkedInProfile,
        physical_address: formData.physicalAddress,
        affiliated_organization_university: formData.affiliatedOrganizationUniversity,
        registration_number: formData.registrationNumber,
        primary_focus_areas: formData.primaryFocusAreas,
        specify_other_focus_area: formData.specifyOtherFocusArea,
        services_offered_to_startups: formData.servicesOfferedToStartups,
        specify_other_services: formData.specifyOtherServices,
        eligibility_criteria: formData.eligibilityCriteria,
        total_funding_raised_by_alumni: formData.totalFundingRaisedByAlumni,
        percentage_startups_operational_after_3_yrs: parseFloat(formData.percentageStartupsOperationalAfter3Yrs), // Convert to float
        notable_alumni_startups: formData.notableAlumniStartups, // Stored as JSONB
        unique_value_proposition: formData.uniqueValueProposition,
        problem_gaps_solved_in_ecosystem: formData.problemGapsSolvedInEcosystem,
        preferred_startup_stages: formData.preferredStartupStages,
        interested_in_cross_border_collaborations: formData.interestedInCrossBorderCollaborations,
        planned_expansions: formData.plannedExpansions,
        key_challenges_you_face: formData.keyChallengesYouFace,
        first_goal_next_12_months: formData.firstGoalNext12Months,
        second_goal: formData.secondGoal,
        third_goal: formData.thirdGoal,
        status: "pending", // Always set to pending for re-approval/initial submission
      };

      let dbOperationError = null;

      if (initialData?.id) {
        // --- UPDATE Existing Profile ---
        console.log("Updating existing Incubation profile with ID:", initialData.id);
        const { error: updateError } = await supabase
          .from("incubation_approval")
          .update({
            ...submissionPayload,
            updated_at: new Date().toISOString(), // Update timestamp
          })
          .eq("id", initialData.id); // Target the specific record by its ID
        dbOperationError = updateError;
      } else {
        // --- INSERT New Profile ---
        console.log("Submitting new Incubation profile.");
        const { error: insertError } = await supabase
          .from("incubation_approval")
          .insert({
            ...submissionPayload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        dbOperationError = insertError;
      }

      if (dbOperationError) throw dbOperationError;

      setShowSuccessDialog(true);
      toast.success(initialData ? "Incubation Profile updated successfully!" : "Incubation Profile submitted successfully! Waiting for approval.");
      setTimeout(() => router.push("/my-startups"), 3000); // Redirect to My Profiles after submission/update
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
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Incubation Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="incubatorAcceleratorName"
                placeholder="Incubator/Accelerator Name"
                value={formData.incubatorAcceleratorName}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <Select
                name="typeOfIncubator"
                value={formData.typeOfIncubator}
                onValueChange={(val) => handleSelectChange("typeOfIncubator", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Type of Incubator" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="University-affiliated">University-affiliated</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Independent">Independent</SelectItem>
                  <SelectItem value="Government-backed">Government-backed</SelectItem>
                </SelectContent>
              </Select>
              <Input
                name="yearEstablished"
                placeholder="Year Established"
                type="number"
                value={formData.yearEstablished}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="website"
                placeholder="Website URL"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="linkedInProfile"
                placeholder="LinkedIn Profile (Optional)"
                type="url"
                value={formData.linkedInProfile}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              />
              <Input
                name="physicalAddress"
                placeholder="Physical Address"
                value={formData.physicalAddress}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <Input
                name="affiliatedOrganizationUniversity"
                placeholder="Affiliated Organization / University (Optional)"
                value={formData.affiliatedOrganizationUniversity}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              />
              <Input
                name="registrationNumber"
                placeholder="Registration Number (Optional)"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Focus Areas</h3>
            <p className="text-neutral-300 font-medium">Select your primary sectors or industries of focus:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "AI/ML", "Fintech", "Healthcare", "EdTech", "AgriTech", "Clean Energy",
                "Manufacturing", "Logistics", "Biotechnology", "E-commerce", "SaaS", "Other"
              ].map((area) => (
                <Button
                  key={area}
                  type="button"
                  variant={formData.primaryFocusAreas.includes(area) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("primaryFocusAreas", area)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    formData.primaryFocusAreas.includes(area)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                  )}
                >
                  {area}
                </Button>
              ))}
            </div>
            {formData.primaryFocusAreas.includes("Other") && (
              <Input
                name="specifyOtherFocusArea"
                placeholder="Specify Other Focus Area"
                value={formData.specifyOtherFocusArea}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Services & Track Record</h3>
            <p className="text-neutral-300 font-medium">Services Offered to Startups:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Seed Funding", "Co-working Space", "Legal/IP Support", "Investor Networking",
                "Technical Mentorship", "Market Access Programs", "Curriculum or Training Support", "Other"
              ].map((service) => (
                <Button
                  key={service}
                  type="button"
                  variant={formData.servicesOfferedToStartups.includes(service) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("servicesOfferedToStartups", service)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    formData.servicesOfferedToStartups.includes(service)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                  )}
                >
                  {service}
                </Button>
              ))}
            </div>
            {formData.servicesOfferedToStartups.includes("Other") && (
              <Input
                name="specifyOtherServices"
                placeholder="Specify Other Services"
                value={formData.specifyOtherServices}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
            )}
            <Textarea
              name="eligibilityCriteria"
              placeholder="Describe the criteria for startups to join the program."
              value={formData.eligibilityCriteria}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[100px] px-4 py-3 focus-visible:ring-purple-500"
              required
            />
            <Input
              name="totalFundingRaisedByAlumni"
              placeholder="Total Funding Raised by Alumni (USD)"
              type="text" // Can be number or text for flexible input (e.g., "1.5 Million")
              value={formData.totalFundingRaisedByAlumni}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              required
            />
            <Input
              name="percentageStartupsOperationalAfter3Yrs"
              placeholder="% of Startups Operational After 3 Yrs"
              type="number"
              min="0"
              max="100"
              value={formData.percentageStartupsOperationalAfter3Yrs}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              required
            />
            <div className="space-y-3">
              <p className="text-neutral-300 font-medium">Notable Alumni Startups:</p>
              <div className="flex flex-col gap-2">
                {formData.notableAlumniStartups.map((alumni, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-neutral-800 p-3 rounded-md border border-neutral-700">
                    <span className="text-sm text-neutral-300">{alumni.startupName}</span>
                    <a href={alumni.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline">
                      {alumni.websiteUrl}
                    </a>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeNotableAlumniStartup(idx)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    id="newAlumniStartupName"
                    placeholder="Startup Name"
                    className="flex-1 bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                  />
                  <Input
                    id="newAlumniWebsiteUrl"
                    placeholder="Website URL"
                    type="url"
                    className="flex-1 bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      addNotableAlumniStartup(
                        (document.getElementById("newAlumniStartupName") as HTMLInputElement).value,
                        (document.getElementById("newAlumniWebsiteUrl") as HTMLInputElement).value
                      )
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Add Alumni
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Vision & Ecosystem Fit</h3>
            <Textarea
              name="uniqueValueProposition"
              placeholder="Describe your organization's unique selling points."
              value={formData.uniqueValueProposition}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[100px] px-4 py-3 focus-visible:ring-purple-500"
              required
            />
            <Textarea
              name="problemGapsSolvedInEcosystem"
              placeholder="Explain how your organization addresses existing problems or gaps in the startup ecosystem."
              value={formData.problemGapsSolvedInEcosystem}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[100px] px-4 py-3 focus-visible:ring-purple-500"
              required
            />
            <p className="text-neutral-300 font-medium">Preferred Startup Stages:</p>
            <div className="flex flex-wrap gap-2">
              {["Ideation", "MVP", "Scaling", "Mature"].map((stage) => (
                <Button
                  key={stage}
                  type="button"
                  variant={formData.preferredStartupStages.includes(stage) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("preferredStartupStages", stage)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    formData.preferredStartupStages.includes(stage)
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                  )}
                >
                  {stage}
                </Button>
              ))}
            </div>
            <p className="text-neutral-300 font-medium">Interested in Cross-Border Collaborations?</p>
            <div className="flex gap-4">
              <Label htmlFor="collab-yes" className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  id="collab-yes"
                  name="interestedInCrossBorderCollaborations"
                  value="Yes"
                  checked={formData.interestedInCrossBorderCollaborations === "Yes"}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500 border-neutral-600"
                />
                Yes
              </Label>
              <Label htmlFor="collab-no" className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                <input
                  type="radio"
                  id="collab-no"
                  name="interestedInCrossBorderCollaborations"
                  value="No"
                  checked={formData.interestedInCrossBorderCollaborations === "No"}
                  onChange={handleInputChange}
                  className="form-radio h-4 w-4 text-purple-600 focus:ring-purple-500 border-neutral-600"
                />
                No
              </Label>
            </div>
            <Textarea
              name="plannedExpansions"
              placeholder="Detail your planned expansions (Countries or Sectors)."
              value={formData.plannedExpansions}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[100px] px-4 py-3 focus-visible:ring-purple-500"
              required
            />
            <Textarea
              name="keyChallengesYouFace"
              placeholder="Outline the main challenges your organization encounters."
              value={formData.keyChallengesYouFace}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[100px] px-4 py-3 focus-visible:ring-purple-500"
              required
            />
            <Input
              name="firstGoalNext12Months"
              placeholder="What's your first goal for next 12 months?"
              value={formData.firstGoalNext12Months}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              required
            />
            <Input
              name="secondGoal"
              placeholder="What's your second goal? (Optional)"
              value={formData.secondGoal}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
            />
            <Input
              name="thirdGoal"
              placeholder="What's your third and last goal? (Optional)"
              value={formData.thirdGoal}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
            />
          </div>
        );
      case 6: // Consent & Submission
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Consent & Submission</h3>
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="consent"
                checked={formData.consentAgreed}
                onCheckedChange={(checked) => setFormData({ ...formData, consentAgreed: checked as boolean })}
                className="border-neutral-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="consent" className="text-neutral-300 text-sm cursor-pointer">
                I agree to the privacy policy and data sharing terms.
              </Label>
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
    "Incubation Overview",
    "Focus Areas",
    "Services & Track Record",
    "Vision & Ecosystem Fit",
    "Consent & Submission",
  ];

  return (
    <div className="min-h-screen bg-[#0E0617] py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <header className="flex items-center mt-32 justify-between mb-10">
          {/* You can add a logo or title here */}
        </header>

        {/* Changed this div to take full width and be centered */}
        <div className="max-w-3xl mx-auto">
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
                    disabled={isSubmitting || !formData.consentAgreed}
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
            Your Incubation Profile has been submitted.
            <span className="text-purple-400 mt-1">Wait for approval.</span>
          </div>
          <div className="flex justify-center">
            <Button className="bg-purple-600 text-white" disabled>
              Redirecting to My Profiles...
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Hidden video and canvas are not needed for incubation form unless you explicitly add video uploads */}
      {/* <video ref={videoRef} style={{ display: "none" }} muted preload="metadata" />
      <canvas ref={canvasRef} style={{ display: "none" }} /> */}
    </div>
  );
}