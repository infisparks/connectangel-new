// app/investor-registration/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from "@/lib/supabaselib";
import { InvestorMultiStepForm } from "@/app/investor-registration/investorMultiStepForm";
import { toast } from "sonner";
import { InvestorProfile } from '@/types';

interface InvestorRegistrationPageProps {
  params: { id: string };
}

export default function InvestorRegistrationPage({ params }: InvestorRegistrationPageProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [initialData, setInitialData] = useState<InvestorProfile | null>(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const router = useRouter();
  const { id } = params;

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
        const { data: investorProfile, error: investorError } = await supabase
          .from("investor_approval")
          .select("*")
          .eq("id", id)
          .single();

        if (investorError) {
          console.error("Error fetching investor profile:", investorError.message);
          toast.error("Failed to load investor profile for editing.");
          setInitialData(null);
        } else {
          setInitialData(investorProfile as InvestorProfile);
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
  
  // This is the updated code block to handle undefined values, including the new one
  const fixedInitialData = initialData
    ? {
        ...initialData,
        linkedin_profile: initialData.linkedin_profile,
        other_sector_industry: initialData.other_sector_industry,
        number_of_startups_invested: initialData.number_of_startups_invested,
        bucket_amount: initialData.bucket_amount,
        example_startups: initialData.example_startups,
        // Added the fix for `average_ticket_size`
        average_ticket_size: initialData.average_ticket_size,
      }
    : null;

  return (
    <InvestorMultiStepForm
      userId={userId}
      initialData={fixedInitialData}
    />
  );
}