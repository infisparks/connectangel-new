// src/components/UserRoleSelection.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Video, UserPlus, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaselib"

export function UserRoleSelection() {
  const [selectedRole, setSelectedRole] = useState<"viewer" | "creator" | null>(null)
  const [currentRole, setCurrentRole] = useState<"viewer" | "creator" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const fetchUserAndRole = async () => {
      setLoading(true); // Set loading while fetching user and role
      setError(null);

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // If no user is logged in, redirect to auth page
        router.replace('/') // Or your login page path, e.g., '/auth'
        return
      }

      setUserId(user.id)

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'No rows found'
        console.error("Error fetching user profile:", profileError.message);
        setError("Failed to load your profile. Please try again.");
        setLoading(false);
        setInitialLoadComplete(true);
        return;
      }

      const roleFromDb = userProfile?.role as "viewer" | "creator" | null;
      setCurrentRole(roleFromDb);
      setSelectedRole(roleFromDb); // Pre-select current role if it exists

      setLoading(false);
      setInitialLoadComplete(true);
    }
    fetchUserAndRole()
  }, [router])

  const handleRoleSelect = useCallback((role: "viewer" | "creator") => {
    setSelectedRole(role)
  }, [])

  const handleContinue = async () => {
    if (!selectedRole || !userId) {
      setError("Please select a role.")
      return
    }

    // Only proceed with update if the selected role is different from the current one
    if (selectedRole === currentRole && currentRole !== null) {
        if (selectedRole === 'viewer') {
            router.push('/');
        } else {
            router.push('/startup-registration');
        }
        return; // Exit if no change is needed
    }

    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ role: selectedRole })
        .eq("id", userId)

      if (updateError) throw updateError

      // Update currentRole state after successful update
      setCurrentRole(selectedRole);

      if (selectedRole === "viewer") {
        router.push("/") // Redirect to home page for viewer
      } else if (selectedRole === "creator") {
        router.push("/startup-registration") // Redirect to startup registration for creator
      }
    } catch (err: any) {
      console.error("Error updating role:", err.message)
      setError(err.message || "Failed to save your role. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Show a loading state or nothing until initial data is fetched
  if (!initialLoadComplete) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A23] text-white">
            <p>Loading role options...</p>
        </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-8 px-4"
      style={{ backgroundColor: "#0A0A23" }}
    >
    
      <div className="flex flex-col items-center justify-center flex-grow text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Who You Are</h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6">Please choose your plan below</p>

        {currentRole && (
            <p className="text-lg text-gray-400 mb-8">
                Your current role is: <span className="font-semibold capitalize text-purple-400">{currentRole}</span>
            </p>
        )}

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Viewer Card */}
          <div
            className={`flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer transition-all duration-300 w-64 h-64 md:w-72 md:h-72
              ${selectedRole === "viewer" ? "bg-[#8B00FF] shadow-lg shadow-[#8B00FF]/40" : "bg-gray-800 border-2 border-gray-700"}
            `}
            onClick={() => handleRoleSelect("viewer")}
          >
            <Video className="h-24 w-24 text-white mb-4" />
            <span className="text-white text-2xl font-semibold">Viewer</span>
          </div>

          {/* Creator Card */}
          <div
            className={`flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer transition-all duration-300 w-64 h-64 md:w-72 md:h-72
              ${selectedRole === "creator" ? "bg-[#8B00FF] shadow-lg shadow-[#8B00FF]/40" : "bg-gray-800 border-2 border-gray-700"}
            `}
            onClick={() => handleRoleSelect("creator")}
          >
            <UserPlus className="h-24 w-24 text-white mb-4" />
            <span className="text-white text-2xl font-semibold">Creator</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Navigation Buttons */}
      <div className="w-full flex justify-between items-center max-w-7xl mx-auto mt-auto pt-8">
        <Button
          variant="ghost"
          className="text-gray-300 hover:text-white text-lg font-semibold"
          onClick={() => router.back()} // Go back to previous page
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        <Button
          className="bg-[#8B00FF] text-white h-12 px-8 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors"
          disabled={selectedRole === null || loading}
          onClick={handleContinue}
        >
          {loading ? "Saving..." : "Continue"}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}