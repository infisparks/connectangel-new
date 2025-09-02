"use client";

import { ArrowRightIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaselib";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

// Define the type for the startup data, now with the incubator name.
interface Startup {
  id: string;
  startup_name: string;
  country: string | null;
  thumbnail_url: string | null;
  is_incubation: boolean; // Corrected to match the database field name
  incubation_id: string | null;
  domain: string | null;
  incubation: { incubator_accelerator_name: string | null } | null;
}

// Helper function to get the absolute URL from a relative path
const getAbsoluteUrl = (path: string | null | undefined): string => {
  if (!path || path.startsWith("http")) {
    return path || "/placeholder.svg";
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
    return "/placeholder.svg";
  }
  const fullUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  return fullUrl;
};

// Function to get a dummy flag emoji based on the country
const getFlagEmoji = (countryName: string | null) => {
  const countryCodeMap: { [key: string]: string } = {
    "Indonesia": "🇮🇩",
    "Bahrain": "🇧🇭",
    "Serbia": "🇷🇸",
    "India": "🇮🇳",
    "United States": "🇺🇸",
  };
  return countryName ? countryCodeMap[countryName] || "🌍" : "🌍";
};

// Domain filters for the tabs
const domainFilters = [
  "All",
  "IT & SaaS",
  "AgriTech",
  "HealthTech",
  "FinTech",
  "Manufacturing",
  "PropTech",
  "EdTech",
];

const sortFilters = ["Startups", "Founder", "Countries"];

const StartupCard = ({ startup }: { startup: Startup }) => {
  const thumbnailUrl = getAbsoluteUrl(startup.thumbnail_url);

  return (
    <Link href={`/startup/${startup.id}`}>
      <div className="group w-full h-auto bg-white/5 border-[2.13px] border-white/[0.05] rounded-[25px] p-3 flex flex-col gap-y-4 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
        <div className="relative w-full h-[176px]">
          <Image
            src={thumbnailUrl}
            alt={startup.startup_name}
            fill
            className="rounded-[18px] object-cover"
          />
          {startup.is_incubation && (
            <span className="absolute top-3 left-3 bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold animate-glow">
              {startup.incubation?.incubator_accelerator_name || "Incubation"}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-y-2 px-1">
          <h3 className="text-white font-semibold text-xl truncate">
            {startup.startup_name}
          </h3>
          <div className="flex items-center gap-x-2">
            <span className="text-sm">{getFlagEmoji(startup.country)}</span>
            <span className="text-gray-400 text-sm">
              {startup.country || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function AllStartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const countryFilter = searchParams.get("country");
  const domainFilter = searchParams.get("domain");

  useEffect(() => {
    async function fetchAllStartups() {
      try {
        setLoading(true);
        let query = supabase
          .from("creator")
          .select(`
            id, 
            startup_name, 
            country, 
            thumbnail_url, 
            is_incubation,
            incubation_id, 
            domain,
            incubation:incubation_id (
              incubator_accelerator_name
            )
          `)
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (countryFilter) {
          query = query.eq("country", countryFilter);
        }
        if (domainFilter && domainFilter !== "All") {
          query = query.eq("domain", domainFilter);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        const formattedData = data.map(item => ({
          ...item,
          incubation: item.incubation as unknown as { incubator_accelerator_name: string | null },
          is_incubation: item.is_incubation, // Ensure this value is correctly typed
        }));

        setStartups(formattedData as Startup[]);
      } catch (e: any) {
        console.error("Error fetching startups:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAllStartups();
  }, [countryFilter, domainFilter]); // Rerun effect when filters change

  const featuredStartup = {
    name: "DSD Soft",
    country: "Indonesia",
    background: "https://placehold.co/1920x800/2A0050/ffffff?text=DSD+Soft+Pitch",
  };

  return (
    <div className="min-h-screen bg-[#1B0E2B] text-white pt-20 font-sans">
      
      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex items-end overflow-hidden">
        <Image
          src={featuredStartup.background}
          alt="Featured Startup Background"
          fill
          priority
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 p-8 md:p-16 text-white w-full">
          <div className="max-w-[1438px] mx-auto">
            <div className="mb-4">
              <h2 className="text-4xl md:text-6xl font-bold">{featuredStartup.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg">{getFlagEmoji(featuredStartup.country)}</span>
                <span className="text-lg">{featuredStartup.country}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button className="bg-white text-purple-800 hover:bg-gray-100 px-8 py-6 rounded-full text-base font-bold transition-all">
                Watch Now
              </Button>
              <Button className="bg-purple-600 text-white hover:bg-purple-700 px-8 py-6 rounded-full text-base font-bold transition-all">
                Buy Plan
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Content Section */}
      <section className="max-w-[1438px] mx-auto px-4 md:px-10 py-8">
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full md:w-auto">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search Startups"
              className="w-full bg-white/5 border-white/[0.15] text-white rounded-full h-14 pl-12 pr-4 transition-all focus:border-purple-500"
            />
          </div>

          <div className="relative flex-none w-full md:w-auto">
            <div className="flex overflow-x-auto gap-2 p-2 scrollbar-hide">
              {domainFilters.map((filter) => (
                <Button
                  key={filter}
                  variant={filter === "All" ? "default" : "outline"}
                  className={cn("whitespace-nowrap px-6 py-3 rounded-full text-sm font-semibold transition-colors",
                    filter === "All" ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-white/5 border-white/[0.15] hover:bg-white/[0.1] text-gray-300"
                  )}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
          
          <Tabs defaultValue="Startups" className="flex-none w-full md:w-auto">
            <TabsList className="grid grid-cols-3 bg-white/5 border-white/[0.15] rounded-full p-1 h-14">
              {sortFilters.map(filter => (
                <TabsTrigger
                  key={filter}
                  value={filter}
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-full text-sm font-semibold h-full transition-all"
                >
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            className="flex-none w-full md:w-auto bg-purple-600 text-white hover:bg-purple-700 px-6 py-3 rounded-full text-sm font-bold transition-all"
          >
            Countries <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Startups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-[25px] h-[272px] bg-white/5 border-[2.13px] border-white/[0.05] p-3 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {startups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>
        )}
      </section>
      
    </div>
  );
}