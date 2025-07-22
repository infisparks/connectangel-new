// app/mentor-registration/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Import useParams
import { supabase } from "@/lib/supabaselib";
import { MentorMultiStepForm } from "@/app/mentor-registration/MentorMultiStepForm";
import { toast } from "sonner";
import { MentorProfile } from '@/app/my-startups/page'; // Import type

interface MentorRegistrationPageProps {
  params: { id: string }; // Define params prop for dynamic route
}

export default function MentorRegistrationPage({ params }: MentorRegistrationPageProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [initialData, setInitialData] = useState<MentorProfile | null>(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const router = useRouter();
  const { id } = params; // Get the ID from the URL parameters

  useEffect(() => {
    async function getSessionAndData() {
      setLoadingUser(true);
      setLoadingInitialData(true);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error("Error fetching session:", sessionError?.message || "No active session.");
        toast.error("Error fetching user session. Please log in again.");
        router.push("/auth/login");
        return;
      }
      setUserId(sessionData.session.user.id);
      setLoadingUser(false);

      if (id) {
        const { data: mentorProfile, error: mentorError } = await supabase
          .from("mentor_approval") // Fetch from approval table for editing
          .select("*")
          .eq("id", id)
          .single();

        if (mentorError) {
          console.error("Error fetching mentor profile:", mentorError.message);
          toast.error("Failed to load mentor profile for editing.");
          setInitialData(null);
        } else {
          setInitialData(mentorProfile as MentorProfile);
        }
      }
      setLoadingInitialData(false);
    }

    getSessionAndData();
  }, [id, router]);

  if (loadingUser || loadingInitialData) {
    return (
      <div className="min-h-screen bg-[#0E0617] flex items-center justify-center text-white text-xl">
        Loading profile data...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#0E0617] flex items-center justify-center text-white text-xl">
        Access Denied: User not authenticated.
      </div>
    );
  }

  return (
    <MentorMultiStepForm userId={userId} initialData={initialData} />
  );
}