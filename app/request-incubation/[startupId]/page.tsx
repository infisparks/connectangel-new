"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaselib";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface IncubationProfile {
  id: string;
  incubator_accelerator_name: string;
  city: string;
  country: string;
  thumbnail_url?: string | null;
  logo_url?: string | null;
}

interface RequestIncubationPageProps {
  params: {
    startupId: string;
  };
}

export default function RequestIncubationPage({ params }: RequestIncubationPageProps) {
  const { startupId } = params;
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [incubationProfiles, setIncubationProfiles] = useState<IncubationProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIncubation, setSelectedIncubation] = useState<IncubationProfile | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!startupId) {
      toast.error("Startup ID not provided. Redirecting to your profiles.");
      router.push("/my-startups");
    }
  }, [startupId, router]);

  const searchIncubations = async () => {
    if (searchTerm.length < 3) {
      setIncubationProfiles([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("incubation")
      .select("id, incubator_accelerator_name, city, country, thumbnail_url, logo_url")
      .ilike("incubator_accelerator_name", `%${searchTerm}%`)
      .limit(10);

    if (error) {
      console.error("Search error:", error);
      toast.error("Failed to search incubations.");
    } else {
      setIncubationProfiles(data as IncubationProfile[]);
    }
    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!startupId || !selectedIncubation) {
      toast.error("Please select an incubation to send the request.");
      return;
    }

    setIsSending(true);
    const { error } = await supabase.from("incubation_request").insert({
      startup_id: startupId,
      incubation_id: selectedIncubation.id,
      message,
      status: "pending",
    });

    if (error) {
      console.error("Failed to send request:", error);
      toast.error("Failed to send request. Please try again.");
    } else {
      toast.success("Request sent successfully!");
      router.push("/my-startups");
    }
    setIsSending(false);
  };

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

  return (
    <div className="max-w-3xl mx-auto py-8 mt-24 px-4 bg-gray-950 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-purple-400 mb-6">Request to Join an Incubation</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Search for an Incubation</h2>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by incubation name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white"
            />
            <Button onClick={searchIncubations} disabled={loading || searchTerm.length < 3}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>
        </div>

        {incubationProfiles.length > 0 && (
          <div className="border border-gray-700 rounded-lg p-4 max-h-[400px] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Search Results</h3>
            <ul className="space-y-4">
              {incubationProfiles.map((incubation) => (
                <li
                  key={incubation.id}
                  onClick={() => setSelectedIncubation(incubation)}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors duration-200",
                    selectedIncubation?.id === incubation.id
                      ? "bg-purple-700 border-purple-500"
                      : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                  )}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={getImageUrl(incubation.logo_url || incubation.thumbnail_url)}
                      alt={incubation.incubator_accelerator_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{incubation.incubator_accelerator_name}</p>
                    <p className="text-sm text-gray-400">{incubation.city}, {incubation.country}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedIncubation && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Send Request to: {selectedIncubation.incubator_accelerator_name}</h2>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Your Message (optional)
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a message to the incubation..."
                className="bg-gray-800 border-gray-700 text-white h-32"
              />
            </div>
            <Button
              onClick={handleSendRequest}
              disabled={isSending}
              className="bg-purple-600 hover:bg-purple-700 w-full"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Send Request"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}