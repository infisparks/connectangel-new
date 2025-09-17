"use client";

import React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { Plus, ImageIcon, ArrowRight, CheckCircle2, Eye, X, ArrowLeft, Upload, User, Building2, HelpCircle, MessageSquare, Target, Camera, Sparkles } from "lucide-react";
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
import cover from "@/public/img/login.png"

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
      <DialogContent className="sm:max-w-[90vw] max-w-[95vw] h-[90vh] bg-slate-950 text-white border border-purple-500/30 rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            Crop Thumbnail (16:9)
          </DialogTitle>
        </DialogHeader>
        <div className="relative flex-1 bg-black">
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
        <div className="p-6 pt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
              {loading ? "Processing..." : "Apply Crop"}
            </Button>
          </div>
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
      <DialogContent className="sm:max-w-[90vw] max-w-[95vw] h-[90vh] bg-slate-950 text-white border border-purple-500/30 rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            Crop Logo (Circular)
          </DialogTitle>
        </DialogHeader>
        <div className="relative flex-1 bg-black">
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
        <div className="p-6 pt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
              {loading ? "Processing..." : "Apply Crop"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MobilePreviewDialog = ({
  isOpen,
  onClose,
  formData,
  previewThumbnailUrl,
  previewLogoUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  previewThumbnailUrl: string | null;
  previewLogoUrl: string | null;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] max-w-[95vw] max-h-[90vh] bg-slate-950 text-white border border-purple-500/30 rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-white/10 sticky top-0 bg-slate-950 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              Preview
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-white/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 to-purple-950/20 rounded-2xl p-4 space-y-4">
            {/* Thumbnail with Logo Overlay */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-800 border border-white/10">
              <Image
                src={previewThumbnailUrl || cover }
                alt="Thumbnail Preview"
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {previewLogoUrl && (
                <div className="absolute top-4 left-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/80">
                    <Image
                      src={previewLogoUrl}
                      alt="Logo Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white line-clamp-2">
                {formData.incubatorAcceleratorName || "Your Incubator Name"}
              </h3>
              
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                {formData.uniqueValueProposition || "A brief description of your organization will appear here."}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {formData.city && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                    {formData.city}
                  </span>
                )}
                {formData.typeOfIncubator && (
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                    {formData.typeOfIncubator}
                  </span>
                )}
                {formData.preferredStartupStages.length > 0 && (
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                    {formData.preferredStartupStages[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddAlumniDialog = ({
  isOpen,
  onClose,
  notableAlumniStartups,
  addNotableAlumniStartup,
  removeNotableAlumniStartup,
}: {
  isOpen: boolean;
  onClose: () => void;
  notableAlumniStartups: Array<{ startupName: string; websiteUrl: string }>;
  addNotableAlumniStartup: (startupName: string, websiteUrl: string) => void;
  removeNotableAlumniStartup: (index: number) => void;
}) => {
  const [newAlumni, setNewAlumni] = useState({ startupName: "", websiteUrl: "" });

  const handleAdd = () => {
    addNotableAlumniStartup(newAlumni.startupName, newAlumni.websiteUrl);
    setNewAlumni({ startupName: "", websiteUrl: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] bg-slate-950 text-white border border-purple-500/30 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Add Notable Alumni
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            name="startupName"
            placeholder="Startup Name"
            value={newAlumni.startupName}
            onChange={(e) => setNewAlumni({ ...newAlumni, startupName: e.target.value })}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
            required
          />
          <Input
            name="websiteUrl"
            placeholder="Website URL"
            type="url"
            value={newAlumni.websiteUrl}
            onChange={(e) => setNewAlumni({ ...newAlumni, websiteUrl: e.target.value })}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
            required
          />
          <Button onClick={handleAdd} className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl h-12">
            <Plus className="w-4 h-4 mr-2" />
            Add Alumni
          </Button>

          {notableAlumniStartups.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3 text-sm">Alumni ({notableAlumniStartups.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notableAlumniStartups.map((alumni, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <span className="text-sm font-medium text-white">
                        {alumni.startupName}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotableAlumniStartup(idx)}
                      className="text-red-400 hover:bg-white/10 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function IncubationMultiStepForm({ userId, initialData }: IncubationMultiStepFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
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
  const [showAddAlumniDialog, setShowAddAlumniDialog] = useState(false);
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
      // Reset dialog inputs
      setShowAddAlumniDialog(false);
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

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return User;
      case 2: return Building2;
      case 3: return Target;
      case 4: return Sparkles;
      case 5: return Eye;
      case 6: return Upload;
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
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                required
              />
              <Input
                name="emailAddress"
                type="email"
                placeholder="Email Address"
                value={formData.emailAddress}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
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
                  className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
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
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                required
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="button" onClick={handleNext} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-8 h-12">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
              <h3 className="text-2xl font-bold text-white mb-2">Incubation Overview</h3>
              <p className="text-gray-400 text-sm">Tell us about your organization</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="incubatorAcceleratorName"
                placeholder="Incubator/Accelerator Name"
                value={formData.incubatorAcceleratorName}
                onChange={handleInputChange}
                className="sm:col-span-2 bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                required
              />
              <Select
                name="typeOfIncubator"
                value={formData.typeOfIncubator}
                onValueChange={(val) => handleSelectChange("typeOfIncubator", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Type of Incubator" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
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
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                required
              />
              <Input
                name="website"
                placeholder="Website URL"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                required
              />
              <Input
                name="linkedInProfile"
                placeholder="LinkedIn Profile (Optional)"
                type="url"
                value={formData.linkedInProfile}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
              />
              <Input
                name="physicalAddress"
                placeholder="Physical Address"
                value={formData.physicalAddress}
                onChange={handleInputChange}
                className="sm:col-span-2 bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                required
              />
              <Input
                name="affiliatedOrganizationUniversity"
                placeholder="Affiliated Organization / University (Optional)"
                value={formData.affiliatedOrganizationUniversity}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
              />
              <Input
                name="registrationNumber"
                placeholder="Registration Number (Optional)"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
              />
            </div>
            
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl px-6 h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={handleNext} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-8 h-12">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Focus Areas</h3>
              <p className="text-gray-400 text-sm">Select your primary sectors or industries of focus</p>
            </div>
            <p className="text-white font-semibold mb-4 block">Select your primary sectors or industries of focus:</p>
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
                    "rounded-xl h-12 text-sm font-medium transition-all duration-200",
                    formData.primaryFocusAreas.includes(area)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30",
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
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500 mt-4"
                required
              />
            )}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl px-6 h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={handleNext} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-8 h-12">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Services & Track Record</h3>
              <p className="text-gray-400 text-sm">What do you offer to startups and what have you achieved?</p>
            </div>
            <p className="text-white font-semibold mb-4 block">Services Offered to Startups:</p>
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
                    "rounded-xl h-12 text-sm font-medium transition-all duration-200",
                    formData.servicesOfferedToStartups.includes(service)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30",
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
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500 mt-4"
                required
              />
            )}
            <Textarea
              name="eligibilityCriteria"
              placeholder="Describe the criteria for startups to join the program."
              value={formData.eligibilityCriteria}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[100px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500 mt-4"
              required
            />
            <Input
              name="totalFundingRaisedByAlumni"
              placeholder="Total Funding Raised by Alumni (USD)"
              type="text"
              value={formData.totalFundingRaisedByAlumni}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
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
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
              required
            />
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Notable Alumni Startups</h4>
                <Button
                  type="button"
                  onClick={() => setShowAddAlumniDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Alumni
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.notableAlumniStartups.map((alumni, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div>
                        <span className="text-sm font-medium text-white">
                          {alumni.startupName}
                        </span>
                      </div>
                      <Link href={alumni.websiteUrl} target="_blank" className="text-purple-400 hover:text-purple-300 text-xs">
                        Website
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl px-6 h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={handleNext} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-8 h-12">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Vision & Ecosystem Fit</h3>
              <p className="text-gray-400 text-sm">How do you fit into and shape the ecosystem?</p>
            </div>
            <Textarea
              name="uniqueValueProposition"
              placeholder="Describe your organization's unique value proposition."
              value={formData.uniqueValueProposition}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[100px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500"
              required
            />
            <Textarea
              name="problemGapsSolvedInEcosystem"
              placeholder="Explain how your organization addresses existing problems or gaps in the startup ecosystem."
              value={formData.problemGapsSolvedInEcosystem}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[100px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500"
              required
            />
            <p className="text-white font-semibold mt-4 mb-2 block">Preferred Startup Stages:</p>
            <div className="flex flex-wrap gap-2">
              {["Ideation", "MVP", "Scaling", "Mature"].map((stage) => (
                <Button
                  key={stage}
                  type="button"
                  variant={formData.preferredStartupStages.includes(stage) ? "default" : "outline"}
                  onClick={() => handleMultipleChoiceChange("preferredStartupStages", stage)}
                  className={cn(
                    "rounded-xl h-12 text-sm font-medium transition-all duration-200",
                    formData.preferredStartupStages.includes(stage)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30",
                  )}
                >
                  {stage}
                </Button>
              ))}
            </div>
            <p className="text-white font-semibold mt-4 mb-2 block">Interested in Cross-Border Collaborations?</p>
            <div className="flex gap-4">
              <Label htmlFor="collab-yes" className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  id="collab-yes"
                  name="interestedInCrossBorderCollaborations"
                  value="Yes"
                  checked={formData.interestedInCrossBorderCollaborations === "Yes"}
                  onChange={handleInputChange}
                  className="h-4 w-4 bg-transparent border-white/30 text-purple-600 focus:ring-purple-500"
                />
                Yes
              </Label>
              <Label htmlFor="collab-no" className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="radio"
                  id="collab-no"
                  name="interestedInCrossBorderCollaborations"
                  value="No"
                  checked={formData.interestedInCrossBorderCollaborations === "No"}
                  onChange={handleInputChange}
                  className="h-4 w-4 bg-transparent border-white/30 text-purple-600 focus:ring-purple-500"
                />
                No
              </Label>
            </div>
            <Textarea
              name="plannedExpansions"
              placeholder="Detail your planned expansions (Countries or Sectors)."
              value={formData.plannedExpansions}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[100px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500 mt-4"
              required
            />
            <Textarea
              name="keyChallengesYouFace"
              placeholder="Outline the main challenges your organization encounters."
              value={formData.keyChallengesYouFace}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[100px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500"
              required
            />
            <Input
              name="firstGoalNext12Months"
              placeholder="What's your first goal for next 12 months?"
              value={formData.firstGoalNext12Months}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500 mt-4"
              required
            />
            <Input
              name="secondGoal"
              placeholder="What's your second goal? (Optional)"
              value={formData.secondGoal}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
            />
            <Input
              name="thirdGoal"
              placeholder="What's your third and last goal? (Optional)"
              value={formData.thirdGoal}
              onChange={handleInputChange}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
            />
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl px-6 h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" onClick={handleNext} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-8 h-12">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Final Step</h3>
              <p className="text-gray-400 text-sm">Review and submit your profile</p>
            </div>

            <div className="space-y-8">
              {/* Thumbnail Upload */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Thumbnail Image (16:9 ratio)
                </h4>

                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 hover:border-white/40 transition-colors">
                  <div className="text-center">
                    <input
                      type="file"
                      id="thumbnail-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCustomThumbnailFileChange}
                    />

                    {previewThumbnailUrl && previewThumbnailUrl !== "/placeholder.svg" ? (
                      <div className="space-y-4">
                        <div className="relative w-full max-w-sm mx-auto h-32 rounded-lg overflow-hidden">
                          <Image
                           src={previewThumbnailUrl || "/img/login.png"}
                            alt="Thumbnail preview1"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => document.getElementById("thumbnail-upload")?.click()}
                          variant="outline"
                          className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-xl"
                        >
                          Change Thumbnail
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <Button
                            type="button"
                            onClick={() => document.getElementById("thumbnail-upload")?.click()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl"
                          >
                            Upload Thumbnail
                          </Button>
                          <p className="text-xs text-gray-400 mt-2">
                            Recommended: 1600x900px or any 16:9 ratio image
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Company Logo (Square/Circle)
                </h4>

                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 hover:border-white/40 transition-colors">
                  <div className="text-center">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCustomLogoFileChange}
                    />

                    {previewLogoUrl && previewLogoUrl !== "/placeholder.svg" ? (
                      <div className="space-y-4">
                        <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white/20">
                          <Image
                            src={previewLogoUrl}
                            alt="Logo preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => document.getElementById("logo-upload")?.click()}
                          variant="outline"
                          className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-xl"
                        >
                          Change Logo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                          <Sparkles className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <Button
                            type="button"
                            onClick={() => document.getElementById("logo-upload")?.click()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
                          >
                            Upload Logo
                          </Button>
                          <p className="text-xs text-gray-400 mt-2">
                            Will be automatically cropped to circle shape
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={formData.consentAgreed}
                    onCheckedChange={(checked) => setFormData({ ...formData, consentAgreed: checked as boolean })}
                    className="mt-1 border-white/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div>
                    <Label htmlFor="consent" className="text-white font-medium cursor-pointer text-sm">
                      I agree to the terms and privacy policy
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

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl px-6 h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.consentAgreed}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-8 h-12 font-semibold"
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
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const steps = [
    { label: "Personal Details", icon: User },
    { label: "Incubator Info", icon: Building2 },
    { label: "Focus Areas", icon: Target },
    { label: "Services & Track", icon: Sparkles },
    { label: "Vision & Fit", icon: Eye },
    { label: "Final Step", icon: Upload },
  ];

  return (
    <>
      {/* Custom Styles */}
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
          {/* Mobile Preview Button */}
          <div className="lg:hidden fixed top-24 right-4 z-40">
            <Button
              onClick={() => setShowMobilePreview(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* Main Form */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {initialData ? "Update Incubator Profile" : "Create Incubator Profile"}
                  </h2>
                  <span className="text-sm text-gray-400">
                    Step {step} of {steps.length}
                  </span>
                </div>
                
                {/* Desktop Step Indicators */}
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
                
                {/* Mobile Progress Bar */}
                <div className="sm:hidden">
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(step / steps.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                        {/* Correctly referencing the icon from the steps array */}
                        {React.createElement(steps[step - 1].icon, { className: "w-4 h-4 text-white" })}
                      </div>
                      <span className="text-white font-medium text-sm">
                        {steps[step - 1].label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step === steps.length) handleSubmit(e);
                }}
              >
                {renderStepContent()}
              </form>
            </div>

            {/* Desktop Preview Sidebar */}
            <div className="hidden lg:block sticky top-24 h-fit">
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Live Preview</h3>
                </div>
                
                <div className="bg-gradient-to-br from-slate-900 to-purple-950/20 rounded-2xl p-4 space-y-4">
                  {/* Thumbnail with Logo Overlay */}
                  <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-800 border border-white/10">
                    <Image
                      src={previewThumbnailUrl || cover }
                      alt="Thumbnail Preview2"
                      fill
                      className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {previewLogoUrl && previewLogoUrl !== "/placeholder.svg" && (
                      <div className="absolute top-4 left-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/80">
                          <Image
                            src={previewLogoUrl}
                            alt="Logo Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white line-clamp-2">
                      {formData.incubatorAcceleratorName || "Your Incubator Name"}
                    </h3>
                    
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                      {formData.uniqueValueProposition || "A brief description of your organization will appear here."}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {formData.city && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                          {formData.city}
                        </span>
                      )}
                      {formData.typeOfIncubator && (
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                          {formData.typeOfIncubator}
                        </span>
                      )}
                      {formData.preferredStartupStages.length > 0 && (
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                          {formData.preferredStartupStages[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Dialogs */}
        <MobilePreviewDialog
          isOpen={showMobilePreview}
          onClose={() => setShowMobilePreview(false)}
          formData={formData}
          previewThumbnailUrl={previewThumbnailUrl}
          previewLogoUrl={previewLogoUrl}
        />
        
        {showAddAlumniDialog && (
          <AddAlumniDialog
            isOpen={showAddAlumniDialog}
            onClose={() => setShowAddAlumniDialog(false)}
            notableAlumniStartups={formData.notableAlumniStartups}
            addNotableAlumniStartup={addNotableAlumniStartup}
            removeNotableAlumniStartup={removeNotableAlumniStartup}
          />
        )}
        
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

        {/* Success Dialog */}
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
                Your incubator profile has been submitted successfully!
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