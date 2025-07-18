"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Cropper from "react-easy-crop"
import { Plus, Play, ImageIcon, ArrowRight, MessageSquareText, CheckCircle2 } from "lucide-react"
import { countryCodes } from "@/lib/country-codes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CountryCodeSelect } from "@/components/country-code-select"
import { supabase } from "@/lib/supabaselib"

// Supabase storage bucket names (define these if not already in a config)
const SUPABASE_VIDEO_BUCKET = "pitch-videos"
const SUPABASE_THUMBNAIL_BUCKET = "thumbnails"

type StartupMultiStepFormProps = {
  userId: string;
}

function getCroppedImg(imageSrc: string, croppedAreaPixels: any): Promise<Blob> {
  return new Promise(async (resolve) => {
    const image = new window.Image()
    image.crossOrigin = "anonymous"
    image.src = imageSrc
    image.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 400
      canvas.height = 225

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        400,
        225,
      )

      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, "image/png")
    }
  })
}

const ThumbnailCropper = ({
  imageUrl,
  onCropComplete,
  onClose,
}: {
  imageUrl: string
  onCropComplete: (croppedBlob: Blob) => void
  onClose: () => void
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleApply = async () => {
    setLoading(true)
    const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels)
    setLoading(false)
    onCropComplete(croppedBlob)
    onClose()
  }

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
  )
}

// Separate component for adding team members in a pop-up
const AddTeamMembersDialog = ({
  isOpen,
  onClose,
  teamMembers,
  setTeamMembers,
}: {
  isOpen: boolean
  onClose: () => void
  teamMembers: any[]
  setTeamMembers: (members: any[]) => void
}) => {
  const [newMember, setNewMember] = useState({
    name: "",
    designation: "",
    phoneCountryCode: "+91",
    localPhoneNumber: "",
  })

  const handleAddMember = () => {
    if (newMember.name && newMember.designation && newMember.localPhoneNumber && newMember.phoneCountryCode) {
      setTeamMembers([...teamMembers, newMember])
      setNewMember({ name: "", designation: "", phoneCountryCode: "+91", localPhoneNumber: "" })
      toast.success("Team member added!")
    } else {
      toast.error("Please fill all member details.")
    }
  }

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
              <SelectItem value="Founder" className="focus:bg-purple-700 focus:text-white">
                Founder
              </SelectItem>
              <SelectItem value="CEO" className="focus:bg-purple-700 focus:text-white">
                CEO
              </SelectItem>
              <SelectItem value="CTO" className="focus:bg-purple-700 focus:text-white">
                CTO
              </SelectItem>
              <SelectItem value="CMO" className="focus:bg-purple-700 focus:text-white">
                CMO
              </SelectItem>
              <SelectItem value="CFO" className="focus:bg-purple-700 focus:text-white">
                CFO
              </SelectItem>
              <SelectItem value="CXO" className="focus:bg-purple-700 focus:text-white">
                CXO
              </SelectItem>
            </SelectContent>
          </Select>
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
              {teamMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-neutral-800 rounded-md border border-neutral-700"
                >
                  <span className="text-sm text-neutral-300 font-medium">
                    {member.name} <span className="text-neutral-500">({member.designation})</span>
                  </span>
                  <span className="text-xs text-neutral-400">
                    {member.phoneCountryCode}
                    {member.localPhoneNumber}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function StartupMultiStepForm({ userId }: StartupMultiStepFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    phoneCountryCode: "+91", // Default to +91
    localPhoneNumber: "",
    country: "",
    city: "",
    startupName: "",
    industry: "",
    yearOfEstablishment: "",
    numberOfEmployees: "",
    domain: "",
    language: "",
    startupStage: "",
    revenueModel: "",
    fundingStage: "",
    instagramUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    teamMembers: [] as { name: string; designation: string; phoneCountryCode: string; localPhoneNumber: string }[],
    supportNeeded: [] as string[],
    otherSupportNeed: "",
    majorChallenges: "",
    oneSentenceDescription: "",
    problemBeingSolved: "",
    futurePlans: "",
    consentAgreed: false,
    selectedVideoFile: null as File | null,
    selectedCustomThumbnailFile: null as File | null,
  })
  const [previewThumbnailUrl, setPreviewThumbnailUrl] = useState<string | null>("/img/login.png") // Default thumbnail
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [showThumbnailCropModal, setShowThumbnailCropModal] = useState(false)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // FIX: Properly type the event for HTMLInputElement and HTMLTextAreaElement
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSupportNeededChange = (supportType: string) => {
    const newSupportNeeded = formData.supportNeeded.includes(supportType)
      ? formData.supportNeeded.filter((s) => s !== supportType)
      : [...formData.supportNeeded, supportType]
    setFormData({ ...formData, supportNeeded: newSupportNeeded })
  }

  const generateThumbnailFromVideo = useCallback(async (videoFile: File): Promise<File | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && canvas) {
        video.src = URL.createObjectURL(videoFile);
        video.load();
        video.onloadedmetadata = () => {
          video.currentTime = Math.min(1, video.duration / 2); // Try to get a frame at 1s or middle if video is shorter
        };
        video.onseeked = () => {
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            resolve(null)
            return
          }
          const aspect = video.videoWidth / video.videoHeight
          const w = 400
          const h = w / aspect
          canvas.width = 400
          canvas.height = h
          ctx.drawImage(video, 0, 0, w, h)
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `${videoFile.name}_thumbnail.png`, { type: "image/png" })
              setPreviewThumbnailUrl(URL.createObjectURL(thumbnailFile));
              resolve(thumbnailFile)
            } else {
              resolve(null)
            }
          }, "image/png")
        }
        video.onerror = () => {
          console.error("Error loading video for thumbnail generation.")
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  }, []);

  function is16by9(file: File, cb: (result: boolean, url: string) => void) {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const aspect = img.width / img.height
      cb(Math.abs(aspect - 16 / 9) < 0.05, url)
    }
    img.src = url
  }

  const handleCustomThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      is16by9(file, (isValid, url) => {
        if (isValid) {
          setFormData((prev) => ({ ...prev, selectedCustomThumbnailFile: file }))
          setPreviewThumbnailUrl(url)
        } else {
          setCropImageUrl(url)
          setShowThumbnailCropModal(true)
        }
      })
    }
  }

  const handleCroppedThumbnail = (blob: Blob) => {
    const croppedFile = new File([blob], "cropped_thumbnail.png", { type: "image/png", lastModified: Date.now() })
    setFormData((prev) => ({ ...prev, selectedCustomThumbnailFile: croppedFile }))
    setPreviewThumbnailUrl(URL.createObjectURL(croppedFile))
  }

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setFormData((prev) => ({ ...prev, selectedVideoFile: file }));
      toast.success("Video selected for upload. Generating thumbnail...");
      const generatedThumb = await generateThumbnailFromVideo(file);
      if (generatedThumb) {
        setFormData((prev) => ({ ...prev, selectedCustomThumbnailFile: generatedThumb }));
      } else {
        toast.error("Could not generate thumbnail from video.");
      }
    } else {
      setFormData((prev) => ({ ...prev, selectedVideoFile: null, selectedCustomThumbnailFile: null }));
      setPreviewThumbnailUrl("/login.png");
      toast.error("Please select a valid video file.");
    }
  };


  const handleNext = async () => {
    let isValid = true
    let errorMessage = ""

    if (step === 1) {
      if (!formData.selectedVideoFile) {
        isValid = false;
        errorMessage = "Please upload your pitch video.";
      }
    } else if (step === 2) {
      if (
        !formData.fullName ||
        !formData.emailAddress ||
        !formData.localPhoneNumber ||
        !formData.phoneCountryCode ||
        !formData.country ||
        !formData.city
      ) {
        isValid = false
        errorMessage = "Please fill in all personal and contact details."
      }
    } else if (step === 3) {
      if (
        !formData.startupName ||
        !formData.industry ||
        !formData.startupStage ||
        !formData.domain ||
        !formData.language
      ) {
        isValid = false
        errorMessage = "Please fill in all startup overview fields."
      }
    } else if (step === 4) {
      if (formData.supportNeeded.length === 0 || !formData.majorChallenges) {
        isValid = false
        errorMessage = "Please select at least one support type and describe your challenges."
      }
    } else if (step === 5) {
      if (!formData.oneSentenceDescription || !formData.problemBeingSolved) {
        isValid = false
        errorMessage = "Please fill in both open-ended questions."
      }
    } else if (step === 6) {
      if (!formData.futurePlans) {
        isValid = false
        errorMessage = "Please describe your future plans and vision."
      }
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
    if (!formData.consentAgreed) {
      setSubmissionError("You must agree to the privacy policy before submitting.")
      toast.error("You must agree to the privacy policy before submitting.")
      return
    }
    setIsSubmitting(true)
    setSubmissionError(null)

    let videoUrl = null
    let thumbnailUrl = null

    try {
      // 1. Upload Video (if selectedVideoFile exists)
      if (formData.selectedVideoFile) {
        const videoFileName = `${userId}/${Date.now()}_${formData.selectedVideoFile.name}`
        const { data: videoUploadData, error: videoUploadError } = await supabase.storage
          .from(SUPABASE_VIDEO_BUCKET)
          .upload(videoFileName, formData.selectedVideoFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (videoUploadError) throw videoUploadError
        videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${SUPABASE_VIDEO_BUCKET}/${videoFileName}`
      }

      // 2. Upload Custom Thumbnail (if selectedCustomThumbnailFile exists)
      if (formData.selectedCustomThumbnailFile) {
        const thumbnailFileName = `${userId}/${Date.now()}_${formData.selectedCustomThumbnailFile.name}`
        const { data: thumbnailUploadData, error: thumbnailUploadError } = await supabase.storage
          .from(SUPABASE_THUMBNAIL_BUCKET)
          .upload(thumbnailFileName, formData.selectedCustomThumbnailFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (thumbnailUploadError) throw thumbnailUploadError
        thumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${SUPABASE_THUMBNAIL_BUCKET}/${thumbnailFileName}`
      }


      // 3. Insert form data into creator_approval table
      const { data, error } = await supabase.from("creator_approval").insert([
        {
          user_id: userId,
          startup_type: formData.industry,
          startup_name: formData.startupName,
          description: formData.oneSentenceDescription,
          location: `${formData.city}, ${formData.country}`,
          language: formData.language,
          domain: formData.domain,
          founder_names: formData.teamMembers.map((member) => `${member.name} (${member.designation})`),
          pitch_video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
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
          future_plans: formData.futurePlans,
          full_name: formData.fullName,
          email_address: formData.emailAddress,
          phone_number: `${formData.phoneCountryCode}${formData.localPhoneNumber}`,
          startup_stage: formData.startupStage,
          team_members: formData.teamMembers, // Store the full team members array as JSONB
        },
      ]);

      if (error) throw error

      setShowSuccessDialog(true)
      toast.success("Form submitted successfully! Waiting for approval.")
      setTimeout(() => router.push("/"), 3000)
    } catch (err: any) {
      console.error("Submission error:", err)
      setSubmissionError(err?.message || "Submission failed. Please try again.")
      toast.error(err?.message || "Submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Upload Pitch Video</h3>
            <div className="space-y-4">
              <p className="text-neutral-300 font-medium">Upload your startup pitch video (Max 50MB)</p>
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                className="hidden"
                onChange={handleVideoFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("video-upload")?.click()}
                className="flex items-center justify-center gap-2 bg-neutral-800 border-neutral-700 text-neutral-50 hover:bg-neutral-700"
              >
                <Play className="h-5 w-5" />
                {formData.selectedVideoFile ? "Change Video" : "Upload Pitch Video"}
              </Button>
              {formData.selectedVideoFile && (
                <span className="text-sm text-neutral-400 truncate max-w-[150px]">
                  {formData.selectedVideoFile.name}
                </span>
              )}
              {formData.selectedVideoFile && (
                <p className="text-sm text-neutral-400">
                  * Thumbnail will be automatically generated from your video. You can upload a custom one later.
                </p>
              )}
            </div>
            <Button
              type="button"
              onClick={handleNext}
              className="w-[163px] h-[62px] bg-[#8800FF] hover:bg-purple-700 text-white rounded-full text-[25px] flex items-center justify-center"
            >
              Next <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        )
      case 2:
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
        )
      case 3:
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
                name="industry"
                value={formData.industry}
                onValueChange={(val) => handleSelectChange("industry", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="Tech" className="focus:bg-purple-700 focus:text-white">
                    Tech
                  </SelectItem>
                  <SelectItem value="SaaS" className="focus:bg-purple-700 focus:text-white">
                    SaaS
                  </SelectItem>
                  <SelectItem value="Fintech" className="focus:bg-purple-700 focus:text-white">
                    Fintech
                  </SelectItem>
                  <SelectItem value="Healthcare" className="focus:bg-purple-700 focus:text-white">
                    Healthcare
                  </SelectItem>
                  <SelectItem value="EdTech" className="focus:bg-purple-700 focus:text-white">
                    EdTech
                  </SelectItem>
                  <SelectItem value="AgriTech" className="focus:bg-purple-700 focus:text-white">
                    AgriTech
                  </SelectItem>
                  <SelectItem value="E-commerce" className="focus:bg-purple-700 focus:text-white">
                    E-commerce
                  </SelectItem>
                  <SelectItem value="AI/ML" className="focus:bg-purple-700 focus:text-white">
                    AI/ML
                  </SelectItem>
                  <SelectItem value="Biotechnology" className="focus:bg-purple-700 focus:text-white">
                    Biotechnology
                  </SelectItem>
                  <SelectItem value="Renewable Energy" className="focus:bg-purple-700 focus:text-white">
                    Renewable Energy
                  </SelectItem>
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
                  <SelectItem value="1-10" className="focus:bg-purple-700 focus:text-white">
                    1-10
                  </SelectItem>
                  <SelectItem value="11-50" className="focus:bg-purple-700 focus:text-white">
                    11-50
                  </SelectItem>
                  <SelectItem value="51-200" className="focus:bg-purple-700 focus:text-white">
                    51-200
                  </SelectItem>
                  <SelectItem value="200+" className="focus:bg-purple-700 focus:text-white">
                    200+
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select name="domain" value={formData.domain} onValueChange={(val) => handleSelectChange("domain", val)}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="AI" className="focus:bg-purple-700 focus:text-white">
                    AI
                  </SelectItem>
                  <SelectItem value="Healthcare" className="focus:bg-purple-700 focus:text-white">
                    Healthcare
                  </SelectItem>
                  <SelectItem value="Education" className="focus:bg-purple-700 focus:text-white">
                    Education
                  </SelectItem>
                  <SelectItem value="Fintech" className="focus:bg-purple-700 focus:text-white">
                    Fintech
                  </SelectItem>
                  <SelectItem value="Software Development" className="focus:bg-purple-700 focus:text-white">
                    Software Development
                  </SelectItem>
                  <SelectItem value="Marketing" className="focus:bg-purple-700 focus:text-white">
                    Marketing
                  </SelectItem>
                  <SelectItem value="Consulting" className="focus:bg-purple-700 focus:text-white">
                    Consulting
                  </SelectItem>
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
                  <SelectItem value="English" className="focus:bg-purple-700 focus:text-white">
                    English
                  </SelectItem>
                  <SelectItem value="Hindi" className="focus:bg-purple-700 focus:text-white">
                    Hindi
                  </SelectItem>
                  <SelectItem value="Spanish" className="focus:bg-purple-700 focus:text-white">
                    Spanish
                  </SelectItem>
                  <SelectItem value="French" className="focus:bg-purple-700 focus:text-white">
                    French
                  </SelectItem>
                  <SelectItem value="German" className="focus:bg-purple-700 focus:text-white">
                    German
                  </SelectItem>
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
                  <SelectItem value="Idea" className="focus:bg-purple-700 focus:text-white">
                    Idea
                  </SelectItem>
                  <SelectItem value="Prototype" className="focus:bg-purple-700 focus:text-white">
                    Prototype
                  </SelectItem>
                  <SelectItem value="Seed" className="focus:bg-purple-700 focus:text-white">
                    Seed
                  </SelectItem>
                  <SelectItem value="Growth" className="focus:bg-purple-700 focus:text-white">
                    Growth
                  </SelectItem>
                  <SelectItem value="Scale-up" className="focus:bg-purple-700 focus:text-white">
                    Scale-up
                  </SelectItem>
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
                  <SelectItem value="B2B" className="focus:bg-purple-700 focus:text-white">
                    B2B
                  </SelectItem>
                  <SelectItem value="B2C" className="focus:bg-purple-700 focus:text-white">
                    B2C
                  </SelectItem>
                  <SelectItem value="B2B2C" className="focus:bg-purple-700 focus:text-white">
                    B2B2C
                  </SelectItem>
                  <SelectItem value="Subscription" className="focus:bg-purple-700 focus:text-white">
                    Subscription
                  </SelectItem>
                  <SelectItem value="Freemium" className="focus:bg-purple-700 focus:text-white">
                    Freemium
                  </SelectItem>
                  <SelectItem value="Ad-based" className="focus:bg-purple-700 focus:text-white">
                    Ad-based
                  </SelectItem>
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
                  <SelectItem value="Pre-Seed" className="focus:bg-purple-700 focus:text-white">
                    Pre-Seed
                  </SelectItem>
                  <SelectItem value="Seed" className="focus:bg-purple-700 focus:text-white">
                    Seed
                  </SelectItem>
                  <SelectItem value="Series A" className="focus:bg-purple-700 focus:text-white">
                    Series A
                  </SelectItem>
                  <SelectItem value="Series B" className="focus:bg-purple-700 focus:text-white">
                    Series B
                  </SelectItem>
                  <SelectItem value="Series C+" className="focus:bg-purple-700 focus:text-white">
                    Series C+
                  </SelectItem>
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
        )
      case 3:
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
                name="industry"
                value={formData.industry}
                onValueChange={(val) => handleSelectChange("industry", val)}
              >
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="Tech" className="focus:bg-purple-700 focus:text-white">
                    Tech
                  </SelectItem>
                  <SelectItem value="SaaS" className="focus:bg-purple-700 focus:text-white">
                    SaaS
                  </SelectItem>
                  <SelectItem value="Fintech" className="focus:bg-purple-700 focus:text-white">
                    Fintech
                  </SelectItem>
                  <SelectItem value="Healthcare" className="focus:bg-purple-700 focus:text-white">
                    Healthcare
                  </SelectItem>
                  <SelectItem value="EdTech" className="focus:bg-purple-700 focus:text-white">
                    EdTech
                  </SelectItem>
                  <SelectItem value="AgriTech" className="focus:bg-purple-700 focus:text-white">
                    AgriTech
                  </SelectItem>
                  <SelectItem value="E-commerce" className="focus:bg-purple-700 focus:text-white">
                    E-commerce
                  </SelectItem>
                  <SelectItem value="AI/ML" className="focus:bg-purple-700 focus:text-white">
                    AI/ML
                  </SelectItem>
                  <SelectItem value="Biotechnology" className="focus:bg-purple-700 focus:text-white">
                    Biotechnology
                  </SelectItem>
                  <SelectItem value="Renewable Energy" className="focus:bg-purple-700 focus:text-white">
                    Renewable Energy
                  </SelectItem>
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
                  <SelectItem value="1-10" className="focus:bg-purple-700 focus:text-white">
                    1-10
                  </SelectItem>
                  <SelectItem value="11-50" className="focus:bg-purple-700 focus:text-white">
                    11-50
                  </SelectItem>
                  <SelectItem value="51-200" className="focus:bg-purple-700 focus:text-white">
                    51-200
                  </SelectItem>
                  <SelectItem value="200+" className="focus:bg-purple-700 focus:text-white">
                    200+
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select name="domain" value={formData.domain} onValueChange={(val) => handleSelectChange("domain", val)}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.15)] border-[rgba(255,255,255,0.4)] text-white placeholder:text-neutral-400 rounded-lg h-14 px-4 focus-visible:ring-purple-500">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 text-neutral-50 border-neutral-700 rounded-lg">
                  <SelectItem value="AI" className="focus:bg-purple-700 focus:text-white">
                    AI
                  </SelectItem>
                  <SelectItem value="Healthcare" className="focus:bg-purple-700 focus:text-white">
                    Healthcare
                  </SelectItem>
                  <SelectItem value="Education" className="focus:bg-purple-700 focus:text-white">
                    Education
                  </SelectItem>
                  <SelectItem value="Fintech" className="focus:bg-purple-700 focus:text-white">
                    Fintech
                  </SelectItem>
                  <SelectItem value="Software Development" className="focus:bg-purple-700 focus:text-white">
                    Software Development
                  </SelectItem>
                  <SelectItem value="Marketing" className="focus:bg-purple-700 focus:text-white">
                    Marketing
                  </SelectItem>
                  <SelectItem value="Consulting" className="focus:bg-purple-700 focus:text-white">
                    Consulting
                  </SelectItem>
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
                  <SelectItem value="English" className="focus:bg-purple-700 focus:text-white">
                    English
                  </SelectItem>
                  <SelectItem value="Hindi" className="focus:bg-purple-700 focus:text-white">
                    Hindi
                  </SelectItem>
                  <SelectItem value="Spanish" className="focus:bg-purple-700 focus:text-white">
                    Spanish
                  </SelectItem>
                  <SelectItem value="French" className="focus:bg-purple-700 focus:text-white">
                    French
                  </SelectItem>
                  <SelectItem value="German" className="focus:bg-purple-700 focus:text-white">
                    German
                  </SelectItem>
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
                  <SelectItem value="Idea" className="focus:bg-purple-700 focus:text-white">
                    Idea
                  </SelectItem>
                  <SelectItem value="Prototype" className="focus:bg-purple-700 focus:text-white">
                    Prototype
                  </SelectItem>
                  <SelectItem value="Seed" className="focus:bg-purple-700 focus:text-white">
                    Seed
                  </SelectItem>
                  <SelectItem value="Growth" className="focus:bg-purple-700 focus:text-white">
                    Growth
                  </SelectItem>
                  <SelectItem value="Scale-up" className="focus:bg-purple-700 focus:text-white">
                    Scale-up
                  </SelectItem>
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
                  <SelectItem value="B2B" className="focus:bg-purple-700 focus:text-white">
                    B2B
                  </SelectItem>
                  <SelectItem value="B2C" className="focus:bg-purple-700 focus:text-white">
                    B2C
                  </SelectItem>
                  <SelectItem value="B2B2C" className="focus:bg-purple-700 focus:text-white">
                    B2B2C
                  </SelectItem>
                  <SelectItem value="Subscription" className="focus:bg-purple-700 focus:text-white">
                    Subscription
                  </SelectItem>
                  <SelectItem value="Freemium" className="focus:bg-purple-700 focus:text-white">
                    Freemium
                  </SelectItem>
                  <SelectItem value="Ad-based" className="focus:bg-purple-700 focus:text-white">
                    Ad-based
                  </SelectItem>
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
                  <SelectItem value="Pre-Seed" className="focus:bg-purple-700 focus:text-white">
                    Pre-Seed
                  </SelectItem>
                  <SelectItem value="Seed" className="focus:bg-purple-700 focus:text-white">
                    Seed
                  </SelectItem>
                  <SelectItem value="Series A" className="focus:bg-purple-700 focus:text-white">
                    Series A
                  </SelectItem>
                  <SelectItem value="Series B" className="focus:bg-purple-700 focus:text-white">
                    Series B
                  </SelectItem>
                  <SelectItem value="Series C+" className="focus:bg-purple-700 focus:text-white">
                    Series C+
                  </SelectItem>
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
        )
      case 4:
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
        )
      case 5:
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
        )
      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Future Plans & Vision</h3>
            <p className="text-neutral-300">
              Share your vision for the next 1-3 years. What are your key milestones and long-term goals?
            </p>
            <Textarea
              name="futurePlans"
              placeholder="Describe your future plans and goals, including market expansion, product development, and team growth."
              value={formData.futurePlans}
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
        )
      case 7: // This will be the new "Review & Submit" step
        return (
          <div className="space-y-6">
            <h3 className="text-[30px] font-semibold text-white">Review & Submit</h3>
            <p className="text-neutral-300">Optionally, upload a custom thumbnail for your pitch video.</p>
            <div className="space-y-4">
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
                  variant="outline"
                  onClick={() => document.getElementById("custom-thumbnail-upload")?.click()}
                  className="flex items-center justify-center gap-2 bg-neutral-800 border-neutral-700 text-neutral-50 hover:bg-neutral-700"
                >
                  <ImageIcon className="h-5 w-5" />
                  {formData.selectedCustomThumbnailFile ? "Change Thumbnail" : "Upload Custom Thumbnail"}
                </Button>
                {formData.selectedCustomThumbnailFile && (
                  <span className="text-sm text-neutral-400 truncate max-w-[150px]">
                    {formData.selectedCustomThumbnailFile.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-400">
                * Thumbnail must be 16:9 ratio. A crop tool will appear if needed.
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
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderPreviewContent = () => (
    <div className="p-6 lg:p-8 space-y-6 bg-[#1B0E2B] rounded-[8.95px] shadow-lg relative border border-[#4A0080] max-w-[441px] mx-auto lg:px-8 lg:pt-8">
      <div className="relative w-[369px] h-[218px] rounded-[15px] overflow-hidden bg-neutral-900 flex items-center justify-center border border-neutral-700">
        <Image
          src={previewThumbnailUrl || "/login.png"} // Default to /login.png
          alt="Video Thumbnail"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-70"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-[34px] font-bold drop-shadow-lg"></span>
        </div>

        <Play className="absolute h-16 w-16 text-white cursor-pointer opacity-90 hover:opacity-100 transition-opacity" />
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
              {formData.teamMembers.map((member, idx) => (
                <span key={idx} className="bg-purple-700 text-white text-xs px-3 py-1 rounded-full">
                  {member.name} ({member.designation})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const steps = [
    "Upload Video", // Step 1: Only video upload
    "Personal Details", // New Step 2
    "Startup Overview", // New Step 3
    "Needs & Challenges", // New Step 4
    "Open-Ended Questions", // New Step 5
    "Future Plans", // New Step 6
    "Review & Submit", // New Step 7
  ]

  return (
    <div className="min-h-screen bg-[#0E0617] py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <header className="flex items-center mt-32 justify-between mb-10">
         
          {/* <MessageSquareText className="h-[30px] w-[30px] text-white cursor-pointer hover:text-purple-400 transition-colors" /> */}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
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
                if (step === steps.length) handleSubmit(e) // Changed from step === 6 to steps.length
              }}
              className="mt-8"
            >
              {renderStep()}
            </form>
          </div>

          {/* Desktop Preview */}
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
        <ThumbnailCropper
          imageUrl={cropImageUrl}
          onCropComplete={handleCroppedThumbnail}
          onClose={() => setShowThumbnailCropModal(false)}
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
              Redirecting to Home...
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Hidden video and canvas for thumbnail generation (if needed for re-upload or initial processing) */}
      <video ref={videoRef} style={{ display: "none" }} muted preload="metadata" />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )
}