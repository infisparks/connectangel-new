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


// Supabase storage bucket names
const SUPABASE_THUMBNAIL_BUCKET = "thumbnails";
const SUPABASE_LOGO_BUCKET = "logos";

// Define a common base interface for startup data
interface BaseStartup {
  id: string;
  user_id: string;
  startup_name: string;
  description: string;
  location: string | null;
  language: string | null;
  domain: string | null;
  founder_names: string[] | null;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
  full_name?: string | null;
  email_address?: string | null;
  phone_number?: string | null;
  country?: string | null;
  city?: string | null;
  establishment_year?: string | null;
  employee_count?: string | null;
  startup_stage?: string | null;
  revenue_model?: string | null;
  funding_stage?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  support_needed?: string[] | null;
  major_challenges?: string | null;
  one_sentence_description?: string | null;
  problem_being_solved?: string | null;
  future_plans?: string[] | null;
  team_members?: { name: string; designation: string; phoneCountryCode: string; localPhoneNumber: string; linkedin_url?: string; profile_url?: string }[] | null;
  logo_url?: string | null | undefined;
  startup_type: string | null;
}

interface ApprovedStartup extends BaseStartup {
  status: "approved";
  approved_at: string;
  rating: number | null;
}

interface PendingStartup extends BaseStartup {
  status: "pending" | "needs_update" | "rejected";
  reason?: string | null;
}

type StartupMultiStepFormProps = {
  userId: string;
  initialData?: ApprovedStartup | PendingStartup | null;
};

const categories = [
  "Startups",
  "Technology",
  "Business",
  "Innovation",
  "Finance",
  "Healthcare",
  "Education",
  "Environment",
];

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

const AddTeamMembersDialog = ({
  isOpen,
  onClose,
  teamMembers,
  setTeamMembers,
}: {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: any[];
  setTeamMembers: (members: any[]) => void;
}) => {
  const [newMember, setNewMember] = useState({
    name: "",
    designation: "",
    phoneCountryCode: "+91",
    localPhoneNumber: "",
    linkedinUrl: "",
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.designation || !newMember.linkedinUrl) {
      toast.error("Please fill in member name, designation, and LinkedIn URL.");
      return;
    }
    setTeamMembers([
      ...teamMembers,
      {
        ...newMember,
      },
    ]);
    setNewMember({
      name: "",
      designation: "",
      phoneCountryCode: "+91",
      localPhoneNumber: "",
      linkedinUrl: "",
    });
    toast.success("Team member added!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0E0616] text-white border-[rgba(255,255,255,0.6)] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Add Team Members</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Member Name"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
          />
          <Select
            value={newMember.designation}
            onValueChange={(value) => setNewMember({ ...newMember, designation: value })}
          >
            <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
              <SelectValue placeholder="Designation" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
              <SelectItem value="Founder">Founder</SelectItem>
              <SelectItem value="CEO">CEO</SelectItem>
              <SelectItem value="CTO">CTO</SelectItem>
              <SelectItem value="CMO">CMO</SelectItem>
              <SelectItem value="CFO">CFO</SelectItem>
              <SelectItem value="CXO">CXO</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="LinkedIn Profile URL"
            value={newMember.linkedinUrl}
            onChange={(e) => setNewMember({ ...newMember, linkedinUrl: e.target.value })}
            className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
          />
          <div className="flex gap-2 items-center">
            <CountryCodeSelect
              value={newMember.phoneCountryCode}
              onValueChange={(value) => setNewMember({ ...newMember, phoneCountryCode: value })}
            />
            <Input
              placeholder="Phone Number"
              type="tel"
              value={newMember.localPhoneNumber}
              onChange={(e) => setNewMember({ ...newMember, localPhoneNumber: e.target.value })}
              className="flex-1 bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
            />
          </div>
        </div>
        <Button onClick={handleAddMember} className="bg-purple-600 hover:bg-purple-700 text-white">
          Add Member
        </Button>
        <div className="mt-4">
          <h4 className="text-white font-semibold mb-2">Current Members:</h4>
          {teamMembers.length === 0 ? (
            <p className="text-neutral-400 text-sm">No team members added yet.</p>
          ) : (
            <div className="grid gap-2">
              {teamMembers.map((member: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-neutral-800 rounded-md border border-neutral-700">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-300 font-medium">
                      {member.name} <span className="text-neutral-500">({member.designation})</span>
                    </span>
                  </div>
                  <Link href={member.linkedinUrl || "#"} target="_blank" className="text-purple-400 hover:underline text-xs">
                    LinkedIn
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function StartupMultiStepForm({ userId, initialData }: StartupMultiStepFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    phoneCountryCode: "+91",
    localPhoneNumber: "",
    country: "",
    city: "",
    startupName: "",
    yearOfEstablishment: "",
    numberOfEmployees: "",
    domain: "",
    language: "",
    startupType: "",
    startupStage: "",
    revenueModel: "",
    fundingStage: "",
    instagramUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    teamMembers: initialData?.team_members || [] as { name: string; designation: string; phoneCountryCode: string; localPhoneNumber: string; linkedin_url?: string; profile_url?: string }[],
    supportNeeded: [] as string[],
    majorChallenges: "",
    oneSentenceDescription: "",
    problemBeingSolved: "",
    futurePlans: {
      goal1: "",
      goal2: "",
      goal3: "",
    },
    consentAgreed: false,
    selectedCustomThumbnailFile: null as File | null,
    originalThumbnailPath: initialData?.thumbnail_url || null as string | null,
    selectedCustomLogoFile: null as File | null,
    originalLogoPath: initialData?.logo_url || null as string | null,
  });
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string | null>(
    initialData?.thumbnail_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${initialData.thumbnail_url}` : "/img/login.png"
  );
  const [previewLogoUrl, setPreviewLogoUrl] = useState<string | null>(
    initialData?.logo_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${initialData.logo_url}` : "/img/login.png"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [showThumbnailCropModal, setShowThumbnailCropModal] = useState(false);
  const [showLogoCropModal, setShowLogoCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropLogoUrl, setCropLogoUrl] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);

  // Load data from localStorage or initialData on first render
  useEffect(() => {
    const savedData = localStorage.getItem('startupFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(prev => ({
        ...prev,
        ...parsedData,
        teamMembers: parsedData.teamMembers || []
      }));
      setStep(parsedData.step || 1);
    } else if (initialData) {
      setFormData({
        fullName: initialData.full_name || "",
        emailAddress: initialData.email_address || "",
        phoneCountryCode: initialData.phone_number?.match(/^\+\d+/)?.[0] || "+91",
        localPhoneNumber: initialData.phone_number?.replace(/^\+\d+/, '') || "",
        country: initialData.country || "", // Corrected mapping
        city: initialData.city || "", // Corrected mapping
        startupName: initialData.startup_name || "",
        yearOfEstablishment: initialData.establishment_year || "",
        numberOfEmployees: initialData.employee_count || "",
        domain: initialData.domain || "",
        language: initialData.language || "",
        startupType: initialData.startup_type || "",
        startupStage: initialData.startup_stage || "",
        revenueModel: initialData.revenue_model || "",
        fundingStage: initialData.funding_stage || "",
        instagramUrl: initialData.instagram_url || "",
        linkedinUrl: initialData.linkedin_url || "",
        websiteUrl: initialData.website_url || "",
        teamMembers: initialData.team_members || [],
        supportNeeded: initialData.support_needed || [],
        majorChallenges: initialData.major_challenges || "",
        oneSentenceDescription: initialData.one_sentence_description || initialData.description || "",
        problemBeingSolved: initialData.problem_being_solved || "",
        futurePlans: {
          goal1: Array.isArray(initialData.future_plans) ? initialData.future_plans[0] || "" : "",
          goal2: Array.isArray(initialData.future_plans) ? initialData.future_plans[1] || "" : "",
          goal3: Array.isArray(initialData.future_plans) ? initialData.future_plans[2] || "" : "",
        },
        consentAgreed: false,
        selectedCustomThumbnailFile: null,
        originalThumbnailPath: initialData.thumbnail_url || null,
        selectedCustomLogoFile: null,
        originalLogoPath: initialData.logo_url || null,
      });
      setPreviewThumbnailUrl(initialData.thumbnail_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${initialData.thumbnail_url}` : "/img/login.png");
      setPreviewLogoUrl(initialData.logo_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${initialData.logo_url}` : "/img/login.png");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save data to localStorage whenever formData or step changes
  useEffect(() => {
    localStorage.setItem('startupFormData', JSON.stringify({ ...formData, step }));
  }, [formData, step]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("futurePlans.")) {
      const goalKey = name.split(".")[1] as "goal1" | "goal2" | "goal3";
      setFormData((prev) => ({
        ...prev,
        futurePlans: { ...prev.futurePlans, [goalKey]: value },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSupportNeededChange = (supportType: string) => {
    const newSupportNeeded = formData.supportNeeded.includes(supportType)
      ? formData.supportNeeded.filter((s) => s !== supportType)
      : [...formData.supportNeeded, supportType];
    setFormData({ ...formData, supportNeeded: newSupportNeeded });
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

  const handleCustomLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCropLogoUrl(url);
      setShowLogoCropModal(true);
    }
  };

  const handleCroppedThumbnail = (blob: Blob) => {
    const croppedFile = new File([blob], "cropped_thumbnail.png", { type: "image/png", lastModified: Date.now() });
    setFormData((prev) => ({ ...prev, selectedCustomThumbnailFile: croppedFile }));
    setPreviewThumbnailUrl(URL.createObjectURL(croppedFile));
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
        if (!formData.startupName || !formData.startupType || !formData.startupStage || !formData.domain || !formData.language || formData.teamMembers.length === 0) {
          isValid = false;
          errorMessage = "Please fill in all startup overview fields and add at least one team member.";
        }
        break;
      case 3:
        if (formData.supportNeeded.length === 0 || !formData.majorChallenges) {
          isValid = false;
          errorMessage = "Please select at least one support type and describe your challenges.";
        }
        break;
      case 4:
        if (!formData.oneSentenceDescription || !formData.problemBeingSolved) {
          isValid = false;
          errorMessage = "Please fill in both open-ended questions.";
        }
        break;
      case 5:
        if (!formData.futurePlans.goal1 || !formData.futurePlans.goal2 || !formData.futurePlans.goal3) {
          isValid = false;
          errorMessage = "Please provide all three goals for your future plans.";
        }
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
        const thumbnailFileName = `${userId}/${Date.now()}_thumbnail.png`;
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
        const logoFileName = `${userId}/${Date.now()}_logo.png`;
        const { error: logoUploadError } = await supabase.storage
          .from(SUPABASE_LOGO_BUCKET)
          .upload(logoFileName, formData.selectedCustomLogoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (logoUploadError) throw logoUploadError;
        finalLogoPath = `/storage/v1/object/public/${SUPABASE_LOGO_BUCKET}/${logoFileName}`;
      }

      const futurePlansArray = Object.values(formData.futurePlans).filter(plan => plan);

      const submissionPayload = {
        user_id: userId,
        startup_name: formData.startupName,
        description: formData.oneSentenceDescription,
        location: `${formData.city}, ${formData.country}`,
        city: formData.city, // Storing city separately
        country: formData.country, // Storing country separately
        language: formData.language,
        domain: formData.domain,
        startup_type: formData.startupType,
        founder_names: formData.teamMembers.map((member: any) => `${member.name} (${member.designation})`),
        thumbnail_url: finalThumbnailPath,
        logo_url: finalLogoPath,
        status: "pending",
        revenue_model: formData.revenueModel,
        funding_stage: formData.fundingStage,
        employee_count: formData.numberOfEmployees,
        establishment_year: formData.yearOfEstablishment,
        instagram_url: formData.instagramUrl,
        linkedin_url: formData.linkedinUrl,
        website_url: formData.websiteUrl,
        support_needed: formData.supportNeeded,
        major_challenges: formData.majorChallenges,
        problem_being_solved: formData.problemBeingSolved,
        future_plans: futurePlansArray,
        full_name: formData.fullName,
        email_address: formData.emailAddress,
        phone_number: `${formData.phoneCountryCode}${formData.localPhoneNumber}`,
        startup_stage: formData.startupStage,
        team_members: formData.teamMembers,
        one_sentence_description: formData.oneSentenceDescription,
      };

      let dbOperationError = null;

      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from("creator_approval")
          .update({
            ...submissionPayload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);
        dbOperationError = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("creator_approval")
          .insert({
            ...submissionPayload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        dbOperationError = insertError;
      }

      if (dbOperationError) throw dbOperationError;

      setShowSuccessDialog(true);
      toast.success("Form submitted successfully! Waiting for approval.");
      localStorage.removeItem('startupFormData');
      setTimeout(() => router.push("/my-startups"), 3000);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmissionError(err?.message || "Submission failed. Please try again.");
      toast.error(err?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Personal & Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
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
              <Input
                name="emailAddress"
                type="email"
                placeholder="Email Address"
                value={formData.emailAddress}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
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
                className="md:col-span-2 bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
            </div>
            <div className="flex justify-end items-center pt-4">
              <Button type="button" onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Startup Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="startupName"
                placeholder="Startup Name"
                value={formData.startupName}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
                required
              />
              <Select
                name="startupType"
                value={formData.startupType}
                onValueChange={(val) => handleSelectChange("startupType", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Startup Category" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                name="yearOfEstablishment"
                placeholder="Year of Establishment"
                type="number"
                value={formData.yearOfEstablishment}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              />
              <Select
                name="numberOfEmployees"
                value={formData.numberOfEmployees}
                onValueChange={(val) => handleSelectChange("numberOfEmployees", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="No. of Employees" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="200+">200+</SelectItem>
                </SelectContent>
              </Select>
              <Select name="domain" value={formData.domain} onValueChange={(val) => handleSelectChange("domain", val)}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="AI">AI</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Fintech">Fintech</SelectItem>
                  <SelectItem value="Software Development">Software Development</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
              <Select
                name="language"
                value={formData.language}
                onValueChange={(val) => handleSelectChange("language", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                </SelectContent>
              </Select>
              <Select
                name="startupStage"
                value={formData.startupStage}
                onValueChange={(val) => handleSelectChange("startupStage", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Startup Stage" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="Idea">Idea</SelectItem>
                  <SelectItem value="Prototype">Prototype</SelectItem>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Growth">Growth</SelectItem>
                  <SelectItem value="Scale-up">Scale-up</SelectItem>
                </SelectContent>
              </Select>
              <Select
                name="revenueModel"
                value={formData.revenueModel}
                onValueChange={(val) => handleSelectChange("revenueModel", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Revenue Model" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="B2B">B2B</SelectItem>
                  <SelectItem value="B2C">B2C</SelectItem>
                  <SelectItem value="B2B2C">B2B2C</SelectItem>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                  <SelectItem value="Freemium">Freemium</SelectItem>
                  <SelectItem value="Ad-based">Ad-based</SelectItem>
                </SelectContent>
              </Select>
              <Select
                name="fundingStage"
                value={formData.fundingStage}
                onValueChange={(val) => handleSelectChange("fundingStage", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Funding Stage" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B">Series B</SelectItem>
                  <SelectItem value="Series C+">Series C+</SelectItem>
                </SelectContent>
              </Select>
              <Input
                name="instagramUrl"
                placeholder="Instagram URL (Optional)"
                value={formData.instagramUrl}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              />
              <Input
                name="linkedinUrl"
                placeholder="LinkedIn URL (Optional)"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              />
              <Input
                name="websiteUrl"
                placeholder="Website URL (Optional)"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => setShowAddMemberDialog(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Team Member
              </Button>
              <div className="flex flex-wrap gap-2">
                {formData.teamMembers.map((member, idx) => (
                  <span key={idx} className="bg-purple-700 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {member.name} ({member.designation})
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
              >
                Back
              </Button>
              <Button type="button" onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Needs & Challenges</h3>
            <div className="space-y-3">
              <p className="text-neutral-300 font-medium">What kind of support are you seeking?</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Funding",
                  "Mentorship",
                  "Infrastructure",
                  "HealthTech",
                  "AgriTech",
                  "Legal Support",
                  "Market Access",
                  "Hiring Support",
                  "Other",
                ].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={formData.supportNeeded.includes(type) ? "default" : "outline"}
                    onClick={() => handleSupportNeededChange(type)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm transition-colors",
                      formData.supportNeeded.includes(type)
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                    )}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
            <Textarea
              name="majorChallenges"
              placeholder="Describe the major challenges your startup is currently facing."
              value={formData.majorChallenges}
              onChange={handleInputChange}
              className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[120px] px-4 py-3 focus-visible:ring-purple-500"
              required
            />
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
              >
                Back
              </Button>
              <Button type="button" onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Open-Ended Questions</h3>
            <div className="space-y-2">
              <p className="text-neutral-300 font-medium">Describe your startup in one concise sentence.</p>
              <Textarea
                name="oneSentenceDescription"
                placeholder="E.g., 'We are building an AI-powered platform to revolutionize healthcare diagnostics.'"
                value={formData.oneSentenceDescription}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[80px] px-4 py-3 focus-visible:ring-purple-500"
                required
              />
            </div>
            <div className="space-y-2">
              <p className="text-neutral-300 font-medium">
                What specific problem are you solving in your country/region?
              </p>
              <Textarea
                name="problemBeingSolved"
                placeholder="Describe the problem and its impact. E.g., 'Lack of access to affordable mental health services in rural areas, leading to poor well-being.'"
                value={formData.problemBeingSolved}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[120px] px-4 py-3 focus-visible:ring-purple-500"
                required
              />
            </div>
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
              >
                Back
              </Button>
              <Button type="button" onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Future Plans & Vision</h3>
            <p className="text-neutral-300">
              Share your vision for the next 1-3 years. What are your key milestones and long-term goals?
            </p>
            <div className="space-y-4">
              <Textarea
                name="futurePlans.goal1"
                placeholder="What's your first goal?"
                value={formData.futurePlans.goal1}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[80px] px-4 py-3 focus-visible:ring-purple-500"
                required
              />
              <Textarea
                name="futurePlans.goal2"
                placeholder="What's your second goal?"
                value={formData.futurePlans.goal2}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[80px] px-4 py-3 focus-visible:ring-purple-500"
                required
              />
              <Textarea
                name="futurePlans.goal3"
                placeholder="What's your third and last goal?"
                value={formData.futurePlans.goal3}
                onChange={handleInputChange}
                className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg min-h-[80px] px-4 py-3 focus-visible:ring-purple-500"
                required
              />
            </div>
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
              >
                Back
              </Button>
              <Button type="button" onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Review & Submit</h3>
            <p className="text-neutral-300">Upload a thumbnail and logo for your profile.</p>
            
            {/* Thumbnail Upload */}
            <div className="space-y-4">
              <p className="text-neutral-300 font-semibold">1. Upload Thumbnail (16:9)</p>
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
                  {formData.selectedCustomThumbnailFile ? "Change Thumbnail" : formData.originalThumbnailPath ? "Change Existing" : "Upload Thumbnail"}
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
              <p className="text-sm text-neutral-400">
                * Thumbnail must be 16:9 ratio. A crop tool will appear if needed.
              </p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-4 mt-6">
              <p className="text-neutral-300 font-semibold">2. Upload Logo (Circular)</p>
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
                  {formData.selectedCustomLogoFile ? "Change Logo" : formData.originalLogoPath ? "Change Existing" : "Upload Logo"}
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
              <p className="text-sm text-neutral-400">
                * Logo will be cropped to a circle automatically.
              </p>
            </div>


            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="consent"
                checked={formData.consentAgreed}
                onCheckedChange={(checked) => setFormData({ ...formData, consentAgreed: checked as boolean })}
                className="border-neutral-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="consent" className="text-neutral-300 text-sm cursor-pointer">
                I agree that my data can be used for research and collaboration under the platform's privacy policy.
              </Label>
            </div>
            {submissionError && <p className="text-red-500 text-sm mt-4">{submissionError}</p>}
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 text-white hover:bg-purple-700"
                disabled={isSubmitting || !formData.consentAgreed}
              >
                {isSubmitting ? "Submitting..." : (initialData ? "Update Profile" : "Submit for Review")}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPreviewContent = () => (
    <div className="p-6 lg:p-8 space-y-6 bg-[#1B0E2B] rounded-[8.95px] shadow-lg relative border border-[#4A0080] max-w-[441px] mx-auto lg:px-8 lg:pt-8">
      <div className="relative w-[369px] h-[218px] rounded-[15px] overflow-hidden bg-neutral-900 flex items-center justify-center border border-neutral-700">
        <Image
          src={previewThumbnailUrl || "/img/login.png"}
          alt="Video Thumbnail"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-70"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {previewLogoUrl && (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white">
               <Image
                src={previewLogoUrl}
                alt="Startup Logo"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-white">{formData.startupName || "Your Startup Name"}</h3>
        <p className="text-neutral-300 text-sm leading-relaxed">
          {formData.oneSentenceDescription || "A brief description of your innovative startup goes here."}
        </p>
        {formData.problemBeingSolved && (
          <p className="text-neutral-400 text-xs">
            <span className="font-semibold">Problem:</span> {formData.problemBeingSolved}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-neutral-400 text-[17.9px]">
          {formData.city && <span>{formData.city}</span>}
          {formData.city && formData.language && <span>•</span>}
          {formData.language && <span>{formData.language}</span>}
          {(formData.city || formData.language) && formData.domain && <span>•</span>}
          {formData.domain && <span>{formData.domain}</span>}
          {!formData.city && !formData.language && !formData.domain && (
            <>
              <span>City</span>
              <span>•</span>
              <span>Language</span>
              <span>•</span>
              <span>Domain</span>
            </>
          )}
        </div>
        {formData.teamMembers.length > 0 && (
          <div className="mt-4">
            <h4 className="text-white font-semibold mb-2">Team</h4>
            <div className="flex flex-wrap gap-2">
              {formData.teamMembers.map((member: any, idx: number) => (
                <span key={idx} className="bg-purple-700 text-white text-xs px-3 py-1 rounded-full">
                  {member.name} ({member.designation})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const steps = [
    "Personal Details",
    "Startup Overview",
    "Needs & Challenges",
    "Open-Ended Questions",
    "Future Plans",
    "Review & Submit",
  ];

  return (
    <div className="min-h-screen bg-[#0E0617] py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <header className="flex items-center mt-32 justify-between mb-10"></header>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
          <div className="p-6 lg:p-8 space-y-8 bg-[#0E0616] rounded-xl shadow-lg border border-[rgba(255,255,255,0.6)]">
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
              {renderStep()}
            </form>
          </div>
          <div className="hidden lg:block">
            <h3 className="text-2xl font-bold text-white mb-4">Live Preview</h3>
            {renderPreviewContent()}
          </div>
        </div>
      </div>
      {showAddMemberDialog && (
        <AddTeamMembersDialog
          isOpen={showAddMemberDialog}
          onClose={() => setShowAddMemberDialog(false)}
          teamMembers={formData.teamMembers}
          setTeamMembers={(members) => setFormData({ ...formData, teamMembers: members })}
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
      <Dialog open={showSuccessDialog}>
        <DialogContent className="sm:max-w-[400px] bg-[#2A0050] text-white border-[#4A0080] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Registration Successful!</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-lg font-semibold text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="h-12 w-12 text-purple-400" />
            Your registration has been submitted.
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