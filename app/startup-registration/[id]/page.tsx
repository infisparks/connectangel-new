// app/startup-registration/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { StartupMultiStepForm } from "@/app/startup-registration/startup-multi-step-form";
import { supabase } from "@/lib/supabaselib";
import { useRouter, useParams } from "next/navigation";
import { PendingStartup } from "@/app/my-startups/page"; // Only need PendingStartup for editable data

interface StartupRegistrationPageProps {
  params: { id: string };
}

export default function StartupRegistrationPage({ params }: StartupRegistrationPageProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [initialData, setInitialData] = useState<PendingStartup | null>(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [error, setError] = useState<string | null>(null); // New state for specific errors
  const router = useRouter();
  const { id } = params; // Get the ID from the URL parameters

  useEffect(() => {
    const getSessionAndData = async () => {
      setLoadingUser(true);
      setLoadingInitialData(true);
      setError(null); // Clear previous errors

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error("Error getting session:", sessionError?.message || "No active session.");
        router.push("/register"); // Redirect to login if no session
        return;
      }
      setUserId(sessionData.session.user.id);
      setLoadingUser(false);

      if (id) {
        // When editing, we always fetch from the _approval table
        // because edit is for pending/needs_update records.
        const { data: startupProfile, error: startupError } = await supabase
          .from("creator_approval")
          .select("*")
          .eq("id", id)
          .eq("user_id", sessionData.session.user.id) // Ensure user owns this profile
          .single();

        if (startupError) {
          console.error("Error fetching startup profile for editing:", startupError.message);
          if (startupError.code === "PGRST116") { // Specific code for "no rows found"
            setError("Startup profile not found or you don't have permission to edit it.");
          } else {
            setError("Failed to load startup profile: " + startupError.message);
          }
          setInitialData(null);
        } else {
          setInitialData(startupProfile as PendingStartup);
        }
      } else {
        // If no ID is provided, this is a new submission, no initial data
        setInitialData(null);
      }
      setLoadingInitialData(false);
    };

    getSessionAndData();
  }, [id, router]); // Depend on 'id' so it refetches if the ID changes

  if (loadingUser || loadingInitialData) {
    return (
      <div className="min-h-screen bg-[#1A0033] text-white flex items-center justify-center text-xl">
        Loading profile data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A0033] text-red-400 flex flex-col items-center justify-center text-xl p-4 text-center">
        <p className="mb-4">{error}</p>
        <p>Please check the URL or ensure you have permission to edit this profile.</p>
        <button onClick={() => router.push("/my-startups")} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          Go to My Profiles
        </button>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#1A0033] text-white flex items-center justify-center text-xl">
        Please log in to manage startup profiles.
      </div>
    );
  }

  // If we're here, it means either:
  // 1. A new form (id is null, initialData is null)
  // 2. An edit form (id is present, initialData is fetched)
  return (
    <div className="min-h-screen bg-[#1A0033] text-white">
      <StartupMultiStepForm userId={userId} initialData={initialData} />
    </div>
  );
}