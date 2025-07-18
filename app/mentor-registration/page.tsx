// app/mentor-registration/page.tsx
"use client"; // This page uses client-side hooks, so it must be a Client Component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabaselib"; // Assuming your Supabase client is here
import { MentorMultiStepForm } from "./MentorMultiStepForm"; // Adjust this path if needed
import { toast } from "sonner"; // For notifications

/**
 * Renders the Mentor Registration Page.
 * This is a client component responsible for fetching the user ID
 * and then rendering the multi-step mentor form.
 */
export default function MentorRegistrationPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
        toast.error("Error fetching user session. Please log in again.");
        router.push("/auth/login"); // Redirect to login if no session or error
        return;
      }

      if (data?.session) {
        setUserId(data.session.user.id);
      } else {
        toast.info("Please log in to register your Mentor profile.");
        router.push("/auth/login"); // Redirect to login if no active session
      }
      setLoading(false);
    }

    getSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0617] flex items-center justify-center text-white text-xl">
        Loading user data...
      </div>
    );
  }

  if (!userId) {
    // If we're not loading and no userId, it means redirection should have happened
    // or there's an issue. This state should ideally not be reached if redirects work.
    return (
      <div className="min-h-screen bg-[#0E0617] flex items-center justify-center text-white text-xl">
        Access Denied: User not authenticated.
      </div>
    );
  }

  // Once userId is available, render the form
  return (
    <MentorMultiStepForm userId={userId} />
  );
}
