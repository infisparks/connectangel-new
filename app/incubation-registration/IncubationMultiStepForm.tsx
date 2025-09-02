"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { Plus, ImageIcon, ArrowRight, CheckCircle2 } from "lucide-react";
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
import Link from "next/link";

// --- START: All Incubation-related types consolidated here ---
// This ensures the component is self-contained and avoids import errors.
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
}

type IncubationMultiStepFormProps = {
  userId: string;
  initialData?: IncubationProfile | null;
};
// --- END: All Incubation-related types consolidated here ---


// Supabase storage bucket names
const SUPABASE_THUMBNAIL_BUCKET = "thumbnails";
const SUPABASE_LOGO_BUCKET = "logos";

function getCroppedImg(imageSrc: string, croppedAreaPixels: any, options: { isCircular?: boolean; aspectRatio?: number }): Promise<Blob> {
  return new Promise(async (resolve) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { isCircular = false } = options;
      const finalWidth = isCircular ? 200 : 400;
      const finalHeight = isCircular ? 200 : 225;

      canvas.width = finalWidth;
      canvas.height = finalHeight;

      if (isCircular) {
        ctx.beginPath();
        ctx.arc(finalWidth / 2, finalHeight / 2, finalWidth / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        finalWidth,
        finalHeight
      );

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/png");
    };
  });
}

const AspectRatioCropper = ({
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
    const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels, { aspectRatio: 16 / 9 });
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

const CircularCropper = ({
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
    const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels, { isCircular: true, aspectRatio: 1 });
    setLoading(false);
    onCropComplete(croppedBlob);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#2A0050] text-white border-[#4A0080] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Crop Logo (Circular)</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
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
    fullName: "",
    emailAddress: "",
    phoneCountryCode: "+91",
    localPhoneNumber: "",
    country: "",
    city: "",
    incubatorAcceleratorName: "",
    typeOfIncubator: "",
    yearEstablished: "",
    website: "",
    linkedInProfile: "",
    physicalAddress: "",
    affiliatedOrganizationUniversity: "",
    registrationNumber: "",
    selectedCustomThumbnailFile: null as File | null,
    originalThumbnailPath: initialData?.thumbnail_url || null as string | null,
    selectedCustomLogoFile: null as File | null,
    originalLogoPath: initialData?.logo_url || null as string | null,
    primaryFocusAreas: [] as string[],
    specifyOtherFocusArea: "",
    servicesOfferedToStartups: [] as string[],
    specifyOtherServices: "",
    eligibilityCriteria: "",
    totalFundingRaisedByAlumni: "",
    extraAlumniDetails: "",
    percentageStartupsOperationalAfter3Yrs: "",
    notableAlumniStartups: [] as { startupName: string; websiteUrl: string }[],
    uniqueValueProposition: "",
    problemGapsSolvedInEcosystem: "",
    preferredStartupStages: [] as string[],
    interestedInCrossBorderCollaborations: "",
    plannedExpansions: "",
    keyChallengesYouFace: "",
    firstGoalNext12Months: "",
    secondGoal: "",
    thirdGoal: "",
    consentAgreed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string | null>(
    initialData?.thumbnail_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${initialData.thumbnail_url}` : "/placeholder.svg"
  );
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(
    initialData?.logo_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${initialData.logo_url}` : "/placeholder.svg"
  );
  const [showThumbnailCropModal, setShowThumbnailCropModal] = useState(false);
  const [showLogoCropModal, setShowLogoCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropLogoUrl, setCropLogoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.full_name || "",
        emailAddress: initialData.email_address || "",
        phoneCountryCode: initialData.phone_country_code || "+91",
        localPhoneNumber: initialData.local_phone_number || "",
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
        selectedCustomThumbnailFile: null,
        originalThumbnailPath: initialData.thumbnail_url || null,
        selectedCustomLogoFile: null,
        originalLogoPath: initialData.logo_url || null,
        primaryFocusAreas: initialData.primary_focus_areas || [],
        specifyOtherFocusArea: initialData.specify_other_focus_area || "",
        servicesOfferedToStartups: initialData.services_offered_to_startups || [],
        specifyOtherServices: initialData.specify_other_services || "",
        eligibilityCriteria: initialData.eligibility_criteria || "",
        totalFundingRaisedByAlumni: initialData.total_funding_raised_by_alumni || "",
        extraAlumniDetails: "",
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
        consentAgreed: false,
      });
      setPreviewThumbnailUrl(initialData.thumbnail_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${initialData.thumbnail_url}` : "/placeholder.svg");
      setPreviewLogoUrl(initialData.logo_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${initialData.logo_url}` : "/placeholder.svg");
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

  const addNotableAlumniStartup = (startupName: string, websiteUrl: string) => {
    if (startupName && websiteUrl) {
      setFormData((prev) => ({
        ...prev,
        notableAlumniStartups: [...prev.notableAlumniStartups, { startupName, websiteUrl }],
      }));
      toast.success("Notable alumni startup added!");
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

  function is16by9(file: File, cb: (result: boolean, url: string) => void) {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const aspect = img.width / img.height;
      cb(Math.abs(aspect - 16 / 9) < 0.05, url);
    };
    img.src = url;
  }

  const handleCustomThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      is16by9(file, (isValid, url) => {
        if (isValid) {
          setFormData((prev) => ({ ...prev, selectedCustomThumbnailFile: file }));
          setPreviewThumbnailUrl(url);
        } else {
          setCropImageUrl(url);
          setShowThumbnailCropModal(true);
        }
      });
    }
  };

  const handleCroppedThumbnail = (blob: Blob) => {
    const croppedFile = new File([blob], "cropped_thumbnail.png", { type: "image/png", lastModified: Date.now() });
    setFormData((prev) => ({ ...prev, selectedCustomThumbnailFile: croppedFile }));
    setPreviewThumbnailUrl(URL.createObjectURL(croppedFile));
  };
  
  const handleCustomLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCropLogoUrl(url);
      setShowLogoCropModal(true);
    }
  };
  
  const handleCroppedLogo = (blob: Blob) => {
    const croppedFile = new File([blob], "cropped_logo.png", { type: "image/png", lastModified: Date.now() });
    setFormData((prev) => ({ ...prev, selectedCustomLogoFile: croppedFile }));
    setPreviewLogoUrl(URL.createObjectURL(croppedFile));
  };

  const handleNext = async () => {
    let isValid = true;
    let errorMessage = "";

    switch (step) {
      case 1:
        if (!formData.fullName || !formData.emailAddress || !formData.localPhoneNumber || !formData.country || !formData.city) {
          isValid = false;
          errorMessage = "Please fill in all personal and contact details.";
        }
        break;
      case 2:
        if (!formData.incubatorAcceleratorName || !formData.typeOfIncubator || !formData.yearEstablished || !formData.website || !formData.physicalAddress) {
          isValid = false;
          errorMessage = "Please fill in all required incubation overview details.";
        }
        if (!formData.selectedCustomThumbnailFile && !formData.originalThumbnailPath) {
          isValid = false;
          errorMessage = "Please upload a thumbnail for your profile.";
        }
        if (!formData.selectedCustomLogoFile && !formData.originalLogoPath) {
          isValid = false;
          errorMessage = "Please upload a logo for your profile.";
        }
        break;
      case 3:
        if (formData.primaryFocusAreas.length === 0) {
          isValid = false;
          errorMessage = "Please select at least one primary focus area.";
        }
        if (formData.primaryFocusAreas.includes("Other") && !formData.specifyOtherFocusArea) {
          isValid = false;
          errorMessage = "Please specify the other focus area.";
        }
        break;
      case 4:
        if (formData.servicesOfferedToStartups.length === 0 || !formData.eligibilityCriteria || !formData.totalFundingRaisedByAlumni || !formData.percentageStartupsOperationalAfter3Yrs) {
          isValid = false;
          errorMessage = "Please fill in all required services and track record details.";
        }
        if (formData.servicesOfferedToStartups.includes("Other") && !formData.specifyOtherServices) {
          isValid = false;
          errorMessage = "Please specify the other services offered.";
        }
        break;
      case 5:
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

    let finalThumbnailPath = formData.originalThumbnailPath;
    let finalLogoPath = formData.originalLogoPath;

    try {
      if (formData.selectedCustomThumbnailFile) {
        const thumbnailFileName = `${userId}/incubation_thumbnail_${Date.now()}.png`;
        const { error: thumbnailUploadError } = await supabase.storage
          .from(SUPABASE_THUMBNAIL_BUCKET)
          .upload(thumbnailFileName, formData.selectedCustomThumbnailFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (thumbnailUploadError) throw thumbnailUploadError;
        finalThumbnailPath = `/storage/v1/object/public/${SUPABASE_THUMBNAIL_BUCKET}/${thumbnailFileName}`;
      }

      if (formData.selectedCustomLogoFile) {
        const logoFileName = `${userId}/incubation_logo_${Date.now()}.png`;
        const { error: logoUploadError } = await supabase.storage
          .from(SUPABASE_LOGO_BUCKET)
          .upload(logoFileName, formData.selectedCustomLogoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (logoUploadError) throw logoUploadError;
        finalLogoPath = `/storage/v1/object/public/${SUPABASE_LOGO_BUCKET}/${logoFileName}`;
      }

      const goalsArray = [
        formData.firstGoalNext12Months,
        formData.secondGoal,
        formData.thirdGoal,
      ].filter(Boolean);

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
        year_established: parseInt(formData.yearEstablished, 10),
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
        percentage_startups_operational_after_3_yrs: parseFloat(formData.percentageStartupsOperationalAfter3Yrs),
        notable_alumni_startups: formData.notableAlumniStartups,
        unique_value_proposition: formData.uniqueValueProposition,
        problem_gaps_solved_in_ecosystem: formData.problemGapsSolvedInEcosystem,
        preferred_startup_stages: formData.preferredStartupStages,
        interested_in_cross_border_collaborations: formData.interestedInCrossBorderCollaborations,
        planned_expansions: formData.plannedExpansions,
        key_challenges_you_face: formData.keyChallengesYouFace,
        first_goal_next_12_months: formData.firstGoalNext12Months,
        second_goal: formData.secondGoal,
        third_goal: formData.thirdGoal,
        status: "pending",
        thumbnail_url: finalThumbnailPath,
        logo_url: finalLogoPath,
      };

      let dbOperationError = null;
      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from("incubation_approval")
          .update({ ...submissionPayload, updated_at: new Date().toISOString() })
          .eq("id", initialData.id);
        dbOperationError = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("incubation_approval")
          .insert({ ...submissionPayload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        dbOperationError = insertError;
      }

      if (dbOperationError) throw dbOperationError;

      setShowSuccessDialog(true);
      toast.success(initialData ? "Incubation Profile updated successfully!" : "Incubation Profile submitted successfully! Waiting for approval.");
      setTimeout(() => router.push("/my-startups"), 3000);
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
            
            {/* Image Uploads */}
            <div className="space-y-4 pt-4">
              <p className="text-neutral-300 font-semibold">Thumbnail (16:9)</p>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="custom-thumbnail-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomThumbnailFileChange}
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById("custom-thumbnail-upload")?.click()}
                  className="flex items-center justify-center gap-2 bg-neutral-800 border-neutral-700 text-neutral-50 hover:bg-neutral-700"
                >
                  <ImageIcon className="h-5 w-5" />
                  {formData.selectedCustomThumbnailFile ? "Change Thumbnail" : "Upload Thumbnail"}
                </Button>
                {formData.selectedCustomThumbnailFile && (
                  <span className="text-sm text-neutral-400 truncate max-w-[150px]">
                    {formData.selectedCustomThumbnailFile.name}
                  </span>
                )}
                {!formData.selectedCustomThumbnailFile && formData.originalThumbnailPath && (
                  <span className="text-sm text-neutral-400 truncate max-w-[150px]">
                    Existing: <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${formData.originalThumbnailPath}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View</a>
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-400">* Thumbnail is required. A crop tool will appear if needed.</p>
            </div>
            <div className="space-y-4 pt-4">
              <p className="text-neutral-300 font-semibold">Logo (Circular)</p>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="custom-logo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomLogoFileChange}
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById("custom-logo-upload")?.click()}
                  className="flex items-center justify-center gap-2 bg-neutral-800 border-neutral-700 text-neutral-50 hover:bg-neutral-700"
                >
                  <ImageIcon className="h-5 w-5" />
                  {formData.selectedCustomLogoFile ? "Change Logo" : "Upload Logo"}
                </Button>
                {formData.selectedCustomLogoFile && (
                  <span className="text-sm text-neutral-400 truncate max-w-[150px]">
                    {formData.selectedCustomLogoFile.name}
                  </span>
                )}
                {!formData.selectedCustomLogoFile && formData.originalLogoPath && (
                  <span className="text-sm text-neutral-400 truncate max-w-[150px]">
                    Existing: <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${formData.originalLogoPath}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View</a>
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-400">* Logo is required and will be cropped to a circle.</p>
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
              type="text"
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
      case 6:
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
                        ? "border-white bg-white shadow-lg shadow-white/50"
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
      {showThumbnailCropModal && cropImageUrl && (
        <AspectRatioCropper
          imageUrl={cropImageUrl}
          onCropComplete={handleCroppedThumbnail}
          onClose={() => setShowThumbnailCropModal(false)}
        />
      )}
      {showLogoCropModal && cropLogoUrl && (
        <CircularCropper
          imageUrl={cropLogoUrl}
          onCropComplete={handleCroppedLogo}
          onClose={() => setShowLogoCropModal(false)}
        />
      )}
    </div>
  );
}