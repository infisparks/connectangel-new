// app/incubation-dashboard/[incubationId]/page.tsx

"use client"

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaselib";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApprovedStartup, IncubationProfile } from "@/types";
import Image from "next/image";

// Helper function to get the correct image URL
const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("/storage/")) {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.endsWith('/')
      ? process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, -1)
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${baseUrl}${path}`;
  }
  return path;
};

// Component to display a single startup list item
const StartupListItem = ({ startup }: { startup: ApprovedStartup }) => {
  const router = useRouter();
  const fullLogoUrl = getImageUrl(startup.logo_url);

  return (
    <div
      className="flex items-center gap-6 p-4 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
      onClick={() => router.push(`/startup/${startup.id}`)}
    >
      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-purple-500 flex-shrink-0">
        <Image 
          src={fullLogoUrl} 
          alt={`${startup.startup_name} Logo`} 
          layout="fill" 
          objectFit="cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-purple-400">{startup.startup_name}</h3>
        <p className="text-gray-400 text-xs mt-2">
          <span className="font-medium text-gray-200">Country:</span> {startup.country || 'N/A'}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          <span className="font-medium text-gray-200">Funding Stage:</span> {startup.funding_stage || 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default function IncubationDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const incubationId = params.incubationId as string;

  const [incubation, setIncubation] = useState<IncubationProfile | null>(null);
  const [enrolledStartups, setEnrolledStartups] = useState<ApprovedStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!incubationId) return;

    setLoading(true);
    setError(null);

    // Fetch incubation details
    const { data: incubationData, error: incubationError } = await supabase
      .from("incubation")
      .select("*")
      .eq("id", incubationId)
      .single();

    if (incubationError || !incubationData) {
      setError("Failed to load incubation details. It might not exist or you may not have permission to view it.");
      setLoading(false);
      return;
    }
    setIncubation(incubationData);

    // Fetch startups enrolled in this incubation
    const { data: startupData, error: startupError } = await supabase
      .from("creator")
      .select("*")
      .eq("incubation_id", incubationId)
      .eq("is_incubation", true);

    if (startupError) {
      setError("Failed to load enrolled startups.");
      console.error("Startup fetch error:", startupError);
    } else {
      setEnrolledStartups(startupData as ApprovedStartup[]);
    }

    setLoading(false);
  }, [incubationId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-400 p-4 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => router.push('/my-startups')} className="bg-purple-600 hover:bg-purple-700 text-white">
          Back to My Profiles
        </Button>
      </div>
    );
  }

  if (!incubation) {
    return null; // or a not found component
  }
  
  const fullLogoUrl = getImageUrl(incubation.logo_url);

  return (
    <div className="max-w-5xl mx-auto py-8 mt-24 px-4 space-y-8 bg-gray-950 min-h-screen text-white">
      {/* Incubation Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-900 rounded-lg">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 flex-shrink-0">
          <Image 
            src={fullLogoUrl} 
            alt={`${incubation.incubator_accelerator_name} Logo`} 
            layout="fill" 
            objectFit="cover" 
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-purple-400">{incubation.incubator_accelerator_name}</h1>
          <p className="text-gray-300">Incubation Dashboard</p>
        </div>
      </div>

      {/* Enrolled Startups List */}
      <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">Enrolled Startups ({enrolledStartups.length})</h2>
          <span className="text-gray-400 text-lg">{enrolledStartups.length} startup{enrolledStartups.length !== 1 ? 's' : ''}</span>
        </div>

        {enrolledStartups.length === 0 ? (
          <p className="text-center text-gray-500">No startups are currently enrolled in this program.</p>
        ) : (
          <div className="space-y-4">
            {enrolledStartups.map(startup => (
              <StartupListItem key={startup.id} startup={startup} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}