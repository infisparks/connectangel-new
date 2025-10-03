"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Video, UserPlus, ArrowLeft, ArrowRight, Rocket, Lightbulb, DollarSign, Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaselib"

type PrimaryRole = "viewer" | "creator"
type SecondaryRole = "startup" | "incubation" | "investor" | "mentor"

export function UserRoleSelection() {
  const [step, setStep] = useState(1)
  const [selectedPrimaryRole, setSelectedPrimaryRole] = useState<PrimaryRole | null>(null)
  const [selectedSecondaryRole, setSelectedSecondaryRole] = useState<SecondaryRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [cameFromParam, setCameFromParam] = useState(false) // Track if we skipped to step 2

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchUserAndCheckParams = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/")
        return
      }
      setUserId(user.id)

      const roleParam = searchParams.get("role")

      if (roleParam === "creator") {
        setSelectedPrimaryRole("creator")
        setStep(2) // Directly go to step 2 if role is creator
        setCameFromParam(true) // Mark that we came from a URL parameter
      }

      setLoading(false)
      setInitialLoadComplete(true)
    }
    fetchUserAndCheckParams()
  }, [router, searchParams])

  // --- NEW FUNCTION: Handles click on Viewer/Creator cards ---
  const handlePrimaryRoleClick = async (role: PrimaryRole) => {
    setSelectedPrimaryRole(role);
    setError(null);

    if (role === "viewer") {
      if (!userId) return;

      setLoading(true);
      try {
        const { error: updateError } = await supabase
          .from("users")
          .update({ role: "viewer" })
          .eq("id", userId);
        
        if (updateError) throw updateError;
        router.push("/");
      } catch (err: any) {
        setError(err.message || "Failed to save role.");
      } finally {
        setLoading(false);
      }
    } else if (role === "creator") {
      setStep(2);
    }
  };

  // --- NEW FUNCTION: Handles click on Startup/Incubation/Investor/Mentor cards ---
  const handleSecondaryRoleClick = async (role: SecondaryRole) => {
    setSelectedSecondaryRole(role);
    setError(null);
    if (!userId) return;

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ role: role })
        .eq("id", userId);

      if (updateError) throw updateError;

      switch (role) {
        case "startup":
          router.push("/startup-registration");
          break;
        case "incubation":
          router.push("/incubation-registration");
          break;
        case "investor":
          router.push("/investor-registration");
          break;
        case "mentor":
          router.push("/mentor-registration");
          break;
        default:
          router.push("/");
          break;
      }
    } catch (err: any) {
      setError(err.message || "Failed to save your role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      // If we came directly to step 2 from a param, "Back" should go to the previous page
      if (cameFromParam) {
        router.back()
      } else {
        setStep(step - 1)
        setSelectedSecondaryRole(null) // Clear selection when going back
        setError(null)
      }
    } else {
      router.back()
    }
  }

  if (!initialLoadComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A23] text-white">
        <p>Loading...</p>
      </div>
    )
  }

  const showPrimaryRoles = step === 1
  const showSecondaryRoles = step === 2

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-8 px-4" style={{ backgroundColor: "#0A0A23" }}>
      <div className="flex flex-col items-center justify-center flex-grow text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {showPrimaryRoles ? "Who You Are" : "Tell Us Where You Belong"}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6">
          {showPrimaryRoles
            ? "Please choose your plan below"
            : "Choose the role that best represents how you'll use the platform."}
        </p>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading && <div className="text-white mb-4">Saving role and redirecting...</div>}

        {showPrimaryRoles && (
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div
              className={`flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer transition-all duration-300 w-64 h-64 md:w-72 md:h-72 ${
                selectedPrimaryRole === "viewer"
                  ? "bg-[#8B00FF] shadow-lg shadow-[#8B00FF]/40"
                  : "bg-gray-800 border-2 border-gray-700 hover:border-[#8B00FF]"
              }`}
              onClick={() => handlePrimaryRoleClick("viewer")}
              style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            >
              <Video className="h-24 w-24 text-white mb-4" />
              <span className="text-white text-2xl font-semibold">Viewer</span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer transition-all duration-300 w-64 h-64 md:w-72 md:h-72 ${
                selectedPrimaryRole === "creator"
                  ? "bg-[#8B00FF] shadow-lg shadow-[#8B00FF]/40"
                  : "bg-gray-800 border-2 border-gray-700 hover:border-[#8B00FF]"
              }`}
              onClick={() => handlePrimaryRoleClick("creator")}
              style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            >
              <UserPlus className="h-24 w-24 text-white mb-4" />
              <span className="text-white text-2xl font-semibold">Creator</span>
            </div>
          </div>
        )}

        {showSecondaryRoles && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
            <div
              className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl cursor-pointer transition-all duration-300 min-w-[150px] min-h-[150px] ${
                selectedSecondaryRole === "startup"
                  ? "bg-[#8B00FF] shadow-lg shadow-[#8B00FF]/40"
                  : "bg-gray-800 border-2 border-gray-700 hover:border-[#8B00FF]"
              }`}
              onClick={() => handleSecondaryRoleClick("startup")}
              style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            >
              <Rocket className="h-16 w-16 md:h-24 md:w-24 text-white mb-2 md:mb-4" />
              <span className="text-white text-lg md:text-xl font-semibold">Startup</span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl cursor-pointer transition-all duration-300 min-w-[150px] min-h-[150px] ${
                selectedSecondaryRole === "incubation"
                  ? "bg-[#8B00FF] shadow-lg shadow-[#8B00FF]/40"
                  : "bg-gray-800 border-2 border-gray-700 hover:border-[#8B00FF]"
              }`}
              onClick={() => handleSecondaryRoleClick("incubation")}
              style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            >
              <Lightbulb className="h-16 w-16 md:h-24 md:w-24 text-white mb-2 md:mb-4" />
              <span className="text-white text-lg md:text-xl font-semibold">Incubation</span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl cursor-pointer transition-all duration-300 min-w-[150px] min-h-[150px] ${
                selectedSecondaryRole === "investor"
                  ? "bg-[#8B00FF] shadow-lg shadow-[#8B00FF]/40"
                  : "bg-gray-800 border-2 border-gray-700 hover:border-[#8B00FF]"
              }`}
              onClick={() => handleSecondaryRoleClick("investor")}
              style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            >
              <DollarSign className="h-16 w-16 md:h-24 md:w-24 text-white mb-2 md:mb-4" />
              <span className="text-white text-lg md:text-xl font-semibold">Investor</span>
            </div>
            <div
              className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl cursor-pointer transition-all duration-300 min-w-[150px] min-h-[150px] ${
                selectedSecondaryRole === "mentor"
                  ? "bg-[#8B00FF] shadow-lg shadow-[#8B00FF]/40"
                  : "bg-gray-800 border-2 border-gray-700 hover:border-[#8B00FF]"
              }`}
              onClick={() => handleSecondaryRoleClick("mentor")}
              style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto' }}
            >
              <Briefcase className="h-16 w-16 md:h-24 md:w-24 text-white mb-2 md:mb-4" />
              <span className="text-white text-lg md:text-xl font-semibold">Mentor</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex justify-start items-center max-w-7xl mx-auto mt-auto pt-8">
        <Button
          variant="ghost"
          className="text-gray-300 hover:text-white text-lg font-semibold"
          onClick={handleBack}
          disabled={loading}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        {/* Removed "Continue" Button */}
      </div>
    </div>
  )
}