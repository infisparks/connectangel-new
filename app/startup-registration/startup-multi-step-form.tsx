"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";
import { Plus, ImageIcon, ArrowRight, CheckCircle2, Eye, X, ArrowLeft, Upload, User, Building2, HelpCircle, MessageSquare, Target, Camera, Sparkles, Wand2, RefreshCw } from "lucide-react";
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

const domains = [
  "AI/ML",
  "Healthcare",
  "Education",
  "Fintech",
  "E-commerce",
  "SaaS",
  "IoT",
  "Blockchain",
];

const employeeCounts = ["1-10", "11-50", "51-200", "200+"];

const languages = ["English", "Hindi", "Spanish", "French", "German", "Mandarin"];

const startupStages = ["Idea", "Prototype", "MVP", "Growth", "Scale-up"];

const revenueModels = ["B2B", "B2C", "B2B2C", "Subscription", "Freemium", "Transaction-based"];

const fundingStages = ["Bootstrapped", "Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];

const supportNeededOptions = [
  "Funding",
  "Mentorship",
  "Technical Support",
  "Legal Support",
  "Market Access",
  "Talent Acquisition",
  "Infrastructure",
  "Networking",
  "Other",
];

const defaultDummyData = {
  fullName: "Jane Doe",
  emailAddress: "jane.doe@example.com",
  phoneCountryCode: "+1",
  localPhoneNumber: "555-1234",
  country: "United States",
  city: "San Francisco",
  startupName: "Innovate AI",
  yearOfEstablishment: "2023",
  numberOfEmployees: "1-10",
  domain: "AI/ML",
  language: "English",
  startupType: "Technology",
  startupStage: "MVP",
  revenueModel: "Subscription",
  fundingStage: "Bootstrapped",
  instagramUrl: "https://instagram.com/innovateai",
  linkedinUrl: "https://linkedin.com/company/innovateai",
  websiteUrl: "https://innovateai.com",
  teamMembers: [
    { name: "John Smith", designation: "Founder", phoneCountryCode: "+1", localPhoneNumber: "555-5678", linkedinUrl: "https://linkedin.com/in/johnsmith" },
  ],
  supportNeeded: ["Funding", "Mentorship"],
  majorChallenges: "Scaling our user base and securing seed funding.",
  oneSentenceDescription: "Innovate AI is a revolutionary platform that uses machine learning to create personalized educational content for students.",
  problemBeingSolved: "Existing educational tools are one-size-fits-all, failing to adapt to individual learning styles and paces, which leads to disengagement and poor learning outcomes. Our platform addresses this by providing dynamic, personalized content.",
  futurePlans: {
    goal1: "Launch a public beta and attract 1,000 active users within 6 months.",
    goal2: "Secure $500K in seed funding to expand our engineering team.",
    goal3: "Achieve a 90% user retention rate within the first year.",
  },
};


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
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] bg-slate-950 text-white border border-purple-500/30 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Add Team Member
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Input
              placeholder="Member Name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
            />
            <Select
              value={newMember.designation}
              onValueChange={(value) => setNewMember({ ...newMember, designation: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                <SelectValue placeholder="Select Designation" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
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
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
            />
            <div className="flex gap-2">
              <CountryCodeSelect
                value={newMember.phoneCountryCode}
                onValueChange={(value) => setNewMember({ ...newMember, phoneCountryCode: value })}
              />
              <Input
                placeholder="Phone Number"
                type="tel"
                value={newMember.localPhoneNumber}
                onChange={(e) => setNewMember({ ...newMember, localPhoneNumber: e.target.value })}
                className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500"
              />
            </div>
          </div>
          
          <Button onClick={handleAddMember} className="w-full bg-purple-600 hover:bg-purple-700 rounded-xl h-12">
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
          
          {teamMembers.length > 0 && (
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3 text-sm">Team Members ({teamMembers.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {teamMembers.map((member: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <span className="text-sm font-medium text-white">
                        {member.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({member.designation})
                      </span>
                    </div>
                    <Link href={member.linkedinUrl || "#"} target="_blank" className="text-purple-400 hover:text-purple-300 text-xs">
                      LinkedIn
                    </Link>
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
                src={previewThumbnailUrl || "/img/login.png"}
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
                {formData.startupName || "Your Startup Name"}
              </h3>
              
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                {formData.oneSentenceDescription || "A brief description of your innovative startup will appear here."}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {formData.domain && (
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                    {formData.domain}
                  </span>
                )}
                {formData.startupStage && (
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                    {formData.startupStage}
                  </span>
                )}
                {formData.city && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                    {formData.city}
                  </span>
                )}
              </div>

              {/* Team Members */}
              {formData.teamMembers.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold text-sm mb-2">Team</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.teamMembers.slice(0, 3).map((member: any, idx: number) => (
                      <span key={idx} className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                        {member.name}
                      </span>
                    ))}
                    {formData.teamMembers.length > 3 && (
                      <span className="bg-white/10 text-gray-400 text-xs px-2 py-1 rounded-full">
                        +{formData.teamMembers.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Problem Statement */}
              {formData.problemBeingSolved && (
                <div className="pt-2 border-t border-white/10">
                  <h4 className="text-white font-semibold text-sm mb-1">Problem</h4>
                  <p className="text-gray-400 text-xs line-clamp-2">
                    {formData.problemBeingSolved}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AIDialog = ({
  isOpen,
  onClose,
  onFill,
}: {
  isOpen: boolean;
  onClose: () => void;
  onFill: (text: string) => void;
}) => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleFill = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to fill the form.");
      return;
    }
    setIsLoading(true);
    try {
      await onFill(inputText);
      onClose();
    } catch (error) {
      console.error("AI fill operation failed:", error);
      toast.error("Failed to process AI request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] bg-slate-950 text-white border border-green-500/30 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-green-400" />
            AI Form Filler
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-400">
            Enter a startup name, a description, or paste full details. The AI will try to extract and fill the form for you. Unspecified fields will be filled with dummy data.
          </p>
          <Textarea
            ref={textareaRef}
            placeholder="E.g., 'Innovate AI is a technology startup...' or 'Innovate AI'"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[120px] px-4 py-3 focus-visible:ring-green-500 focus-visible:border-green-500 resize-none"
          />
          <Button
            onClick={handleFill}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-12"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Filling...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" /> Fill with AI
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export function StartupMultiStepForm({ userId, initialData }: StartupMultiStepFormProps) {
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
  const [showAIDialog, setShowAIDialog] = useState(false);

  // Load data from localStorage or initialData on first render
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.full_name || "",
        emailAddress: initialData.email_address || "",
        phoneCountryCode: initialData.phone_number?.match(/^\+\d+/)?.[0] || "+91",
        localPhoneNumber: initialData.phone_number?.replace(/^\+\d+/, '') || "",
        country: initialData.country || "",
        city: initialData.city || "",
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
    } else {
      const savedData = localStorage.getItem('startupFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          ...parsedData,
          teamMembers: parsedData.teamMembers || []
        }));
        setStep(parsedData.step || 1);
        // Also update preview URLs if data was loaded from localStorage
        if (parsedData.originalThumbnailPath) {
          setPreviewThumbnailUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}${parsedData.originalThumbnailPath}`);
        }
        if (parsedData.originalLogoPath) {
          setPreviewLogoUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}${parsedData.originalLogoPath}`);
        }
      }
    }
  }, [initialData, setPreviewThumbnailUrl, setPreviewLogoUrl]);

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
          errorMessage = "Please fill in both description and problem statement.";
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
        city: formData.city,
        country: formData.country,
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
        Category: formData.startupType,
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

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return User;
      case 2: return Building2;
      case 3: return HelpCircle;
      case 4: return MessageSquare;
      case 5: return Target;
      case 6: return Upload;
      default: return User;
    }
  };

  const fetchStartupDetails = useCallback(async (startupName: string) => {
    // Calling the new server-side API route instead of the public Gemini endpoint
    try {
      const res = await fetch('/api/ai-fill-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: startupName }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API route error:", errorData.error);
        return null;
      }
  
      const { data } = await res.json();
      return data;
  
    } catch (err: any) {
      console.error("An unexpected error occurred while fetching from API route:", err);
      return null;
    }
  }, []);

  const fillFormData = useCallback((aiData: any) => {
    const getVal = (key: keyof typeof defaultDummyData) => {
      // Check if aiData has a non-empty string for the key, otherwise use dummy data
      return aiData[key] && aiData[key] !== '' ? aiData[key] : defaultDummyData[key];
    };

    setFormData(prev => ({
      ...prev,
      fullName: getVal('fullName'),
      emailAddress: getVal('emailAddress'),
      phoneCountryCode: getVal('phoneCountryCode'),
      localPhoneNumber: getVal('localPhoneNumber'),
      country: getVal('country'),
      city: getVal('city'),
      startupName: getVal('startupName'),
      yearOfEstablishment: getVal('yearOfEstablishment'),
      numberOfEmployees: employeeCounts.includes(aiData.numberOfEmployees) ? aiData.numberOfEmployees : defaultDummyData.numberOfEmployees,
      domain: domains.includes(aiData.domain) ? aiData.domain : defaultDummyData.domain,
      language: languages.includes(aiData.language) ? aiData.language : defaultDummyData.language,
      startupType: categories.includes(aiData.startupType) ? aiData.startupType : defaultDummyData.startupType,
      startupStage: startupStages.includes(aiData.startupStage) ? aiData.startupStage : defaultDummyData.startupStage,
      revenueModel: revenueModels.includes(aiData.revenueModel) ? aiData.revenueModel : defaultDummyData.revenueModel,
      fundingStage: fundingStages.includes(aiData.fundingStage) ? aiData.fundingStage : defaultDummyData.fundingStage,
      instagramUrl: getVal('instagramUrl'),
      linkedinUrl: getVal('linkedinUrl'),
      websiteUrl: getVal('websiteUrl'),
      teamMembers: Array.isArray(aiData.teamMembers) && aiData.teamMembers.length > 0 ? aiData.teamMembers : defaultDummyData.teamMembers,
      supportNeeded: Array.isArray(aiData.supportNeeded) && aiData.supportNeeded.every((s: string) => supportNeededOptions.includes(s)) ? aiData.supportNeeded : defaultDummyData.supportNeeded,
      majorChallenges: getVal('majorChallenges'),
      oneSentenceDescription: getVal('oneSentenceDescription'),
      problemBeingSolved: getVal('problemBeingSolved'),
      futurePlans: {
        goal1: aiData.futurePlans?.goal1 || defaultDummyData.futurePlans.goal1,
        goal2: aiData.futurePlans?.goal2 || defaultDummyData.futurePlans.goal2,
        goal3: aiData.futurePlans?.goal3 || defaultDummyData.futurePlans.goal3,
      },
    }));
  }, []);

  const onAIInput = useCallback(async (text: string) => {
    const aiData = await fetchStartupDetails(text);
    if (aiData) {
      fillFormData(aiData);
      toast.success("Form filled with AI-generated data! ✨");
    } else {
      toast.info("Could not find data. Filling with dummy information.");
      fillFormData(defaultDummyData);
    }
  }, [fetchStartupDetails, fillFormData]);

  const renderStep = () => {
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
              <h3 className="text-2xl font-bold text-white mb-2">Startup Overview</h3>
              <p className="text-gray-400 text-sm">Tell us about your startup and team</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="startupName"
                placeholder="Startup Name"
                value={formData.startupName}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500 sm:col-span-2"
                required
              />
              
              <Select
                name="startupType"
                value={formData.startupType}
                onValueChange={(val) => handleSelectChange("startupType", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Startup Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select name="domain" value={formData.domain} onValueChange={(val) => handleSelectChange("domain", val)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                name="yearOfEstablishment"
                placeholder="Year of Establishment"
                type="number"
                min="1900"
                max="2024"
                value={formData.yearOfEstablishment}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
              />
              
              <Select
                name="numberOfEmployees"
                value={formData.numberOfEmployees}
                onValueChange={(val) => handleSelectChange("numberOfEmployees", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Team Size" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
                  {employeeCounts.map((count) => (
                    <SelectItem key={count} value={count}>{count} employees</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                name="language"
                value={formData.language}
                onValueChange={(val) => handleSelectChange("language", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Primary Language" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                name="startupStage"
                value={formData.startupStage}
                onValueChange={(val) => handleSelectChange("startupStage", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Startup Stage" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
                  {startupStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>{stage} Stage</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                name="revenueModel"
                value={formData.revenueModel}
                onValueChange={(val) => handleSelectChange("revenueModel", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Revenue Model" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
                  {revenueModels.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                name="fundingStage"
                value={formData.fundingStage}
                onValueChange={(val) => handleSelectChange("fundingStage", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Funding Stage" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-white border-slate-700 rounded-xl">
                  {fundingStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                name="websiteUrl"
                placeholder="Website URL (Optional)"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
              />
              
              <Input
                name="linkedinUrl"
                placeholder="LinkedIn URL (Optional)"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500"
              />
              
              <Input
                name="instagramUrl"
                placeholder="Instagram URL (Optional)"
                value={formData.instagramUrl}
                onChange={handleInputChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl h-12 px-4 focus-visible:ring-purple-500 focus-visible:border-purple-500 sm:col-span-2"
              />
            </div>
            
            {/* Team Members Section */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Team Members</h4>
                <Button
                  type="button"
                  onClick={() => setShowAddMemberDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 text-sm"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </div>
              
              {formData.teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.teamMembers.map((member, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-white text-sm">{member.name}</h5>
                          <p className="text-gray-400 text-xs">{member.designation}</p>
                        </div>
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {member.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-xl">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No team members added yet</p>
                  <p className="text-gray-500 text-xs">Add at least one team member to continue</p>
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
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Support & Challenges</h3>
              <p className="text-gray-400 text-sm">What support do you need and what challenges are you facing?</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-white font-semibold mb-4 block">What kind of support are you seeking?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {supportNeededOptions.map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={formData.supportNeeded.includes(type) ? "default" : "outline"}
                      onClick={() => handleSupportNeededChange(type)}
                      className={cn(
                        "rounded-xl h-12 text-sm font-medium transition-all duration-200",
                        formData.supportNeeded.includes(type)
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                          : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30",
                      )}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                {formData.supportNeeded.length > 0 && (
                  <p className="text-sm text-gray-400 mt-2">
                    {formData.supportNeeded.length} support type(s) selected
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-white font-semibold mb-3 block">Describe your major challenges</label>
                <Textarea
                  name="majorChallenges"
                  placeholder="Tell us about the biggest obstacles your startup is currently facing. Be specific about technical, financial, market, or operational challenges..."
                  value={formData.majorChallenges}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[120px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500 resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.majorChallenges.length}/500 characters
                </p>
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
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Tell Your Story</h3>
              <p className="text-gray-400 text-sm">Help us understand your startup's mission and impact</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-white font-semibold mb-3 block">
                  Describe your startup in one compelling sentence
                </label>
                <Textarea
                  name="oneSentenceDescription"
                  placeholder="Example: 'We're building an AI-powered platform that helps small farmers increase crop yields by 40% through predictive analytics and real-time monitoring.'"
                  value={formData.oneSentenceDescription}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[100px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500 resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.oneSentenceDescription.length}/300 characters
                </p>
              </div>
              
              <div>
                <label className="text-white font-semibold mb-3 block">
                  What specific problem are you solving?
                </label>
                <Textarea
                  name="problemBeingSolved"
                  placeholder="Describe the problem in detail - who faces it, why it matters, and what the current solutions are lacking. Include the market size and impact if possible..."
                  value={formData.problemBeingSolved}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[140px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500 resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.problemBeingSolved.length}/500 characters
                </p>
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
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Future Vision</h3>
              <p className="text-gray-400 text-sm">What are your key milestones and long-term goals?</p>
            </div>
            
            <div className="space-y-6">
              <p className="text-gray-300 text-center">
                Share your vision for the next 1-3 years. What are the three most important goals that will define your success?
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white font-semibold mb-3 block flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    First Priority Goal
                  </label>
                  <Textarea
                    name="futurePlans.goal1"
                    placeholder="Example: Launch our MVP and acquire 1,000 active users within 6 months"
                    value={formData.futurePlans.goal1}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[80px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500 resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-white font-semibold mb-3 block flex items-center gap-2">
                    <span className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Second Priority Goal
                  </label>
                  <Textarea
                    name="futurePlans.goal2"
                    placeholder="Example: Raise Series A funding and expand to 3 new markets"
                    value={formData.futurePlans.goal2}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[80px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500 resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-white font-semibold mb-3 block flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Third Priority Goal
                  </label>
                  <Textarea
                    name="futurePlans.goal3"
                    placeholder="Example: Build strategic partnerships and achieve profitability"
                    value={formData.futurePlans.goal3}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl min-h-[80px] px-4 py-3 focus-visible:ring-purple-500 focus-visible:border-purple-500 resize-none"
                    required
                  />
                </div>
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
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Final Step</h3>
              <p className="text-gray-400 text-sm">Upload your media and review before submission</p>
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
                    
                    {previewThumbnailUrl && previewThumbnailUrl !== "/img/login.png" ? (
                      <div className="space-y-4">
                        <div className="relative w-full max-w-sm mx-auto h-32 rounded-lg overflow-hidden">
                          <Image
                            src={previewThumbnailUrl}
                            alt="Thumbnail preview"
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
                    
                    {previewLogoUrl && previewLogoUrl !== "/img/login.png" ? (
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

  const steps = useMemo(() => [
    { label: "Personal Details", icon: User },
    { label: "Startup Overview", icon: Building2 },
    { label: "Support & Challenges", icon: HelpCircle },
    { label: "Tell Your Story", icon: MessageSquare },
    { label: "Future Vision", icon: Target },
    { label: "Final Step", icon: Upload },
  ], []);

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
          {/* AI Floating Button */}
          <div className="fixed bottom-8 right-8 z-50">
            <Button
              onClick={() => setShowAIDialog(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full w-14 h-14 p-0 shadow-lg animate-pulse"
              aria-label="Fill form with AI"
            >
              <Wand2 className="w-6 h-6" />
            </Button>
          </div>

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
                    {initialData ? "Update Startup Profile" : "Create Startup Profile"}
                  </h2>
                  <span className="text-sm text-gray-400">
                    Step {step} of {steps.length}
                  </span>
                </div>
                
                {/* Desktop Step Indicators */}
                <div className="hidden sm:flex justify-between items-center mb-8">
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
                        <User className="w-4 h-4 text-white" />
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
                {renderStep()}
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
                      src={previewThumbnailUrl || "/img/login.png"}
                      alt="Thumbnail Preview"
                      fill
                      className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {previewLogoUrl && previewLogoUrl !== "/img/login.png" && (
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
                      {formData.startupName || "Your Startup Name"}
                    </h3>
                    
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                      {formData.oneSentenceDescription || "A brief description of your innovative startup will appear here."}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {formData.domain && (
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                          {formData.domain}
                        </span>
                      )}
                      {formData.startupStage && (
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                          {formData.startupStage}
                        </span>
                      )}
                      {formData.city && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                          {formData.city}
                        </span>
                      )}
                    </div>

                    {/* Team Members */}
                    {formData.teamMembers.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-2">Team ({formData.teamMembers.length})</h4>
                        <div className="flex flex-wrap gap-1">
                          {formData.teamMembers.slice(0, 3).map((member: any, idx: number) => (
                            <span key={idx} className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                              {member.name}
                            </span>
                          ))}
                          {formData.teamMembers.length > 3 && (
                            <span className="bg-white/10 text-gray-400 text-xs px-2 py-1 rounded-full">
                              +{formData.teamMembers.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Preview Dialog */}
        <MobilePreviewDialog
          isOpen={showMobilePreview}
          onClose={() => setShowMobilePreview(false)}
          formData={formData}
          previewThumbnailUrl={previewThumbnailUrl}
          previewLogoUrl={previewLogoUrl}
        />

        {/* AI Dialog */}
        <AIDialog
          isOpen={showAIDialog}
          onClose={() => setShowAIDialog(false)}
          onFill={onAIInput}
        />

        {/* Other Dialogs */}
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
                Your startup profile has been submitted successfully!
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