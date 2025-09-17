"use client";

import { ArrowRightIcon, SearchIcon, FilterIcon, GridIcon, ListIcon } from "lucide-react";
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
  is_incubation: boolean;
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

const StartupCard = ({ startup, viewMode = "grid" }: { startup: Startup; viewMode?: "grid" | "list" }) => {
  const thumbnailUrl = getAbsoluteUrl(startup.thumbnail_url);

  if (viewMode === "list") {
    return (
      <Link href={`/startup/${startup.id}`}>
        <div className="group w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 ease-in-out hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
            <Image
              src={thumbnailUrl}
              alt={startup.startup_name}
              fill
              className="rounded-lg object-cover"
            />
            {startup.is_incubation && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">✓</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base sm:text-lg truncate mb-1">
              {startup.startup_name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs sm:text-sm">{getFlagEmoji(startup.country)}</span>
              <span className="text-gray-400 text-xs sm:text-sm">
                {startup.country || "Global"}
              </span>
            </div>
            {startup.is_incubation && (
              <span className="inline-block bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                {startup.incubation?.incubator_accelerator_name || "Incubation"}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/startup/${startup.id}`}>
      <div className="group w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer">
        <div className="relative w-full h-32 sm:h-40 lg:h-44">
          <Image
            src={thumbnailUrl}
            alt={startup.startup_name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {startup.is_incubation && (
            <span className="absolute top-2 left-2 bg-purple-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              {startup.incubation?.incubator_accelerator_name || "Incubation"}
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg truncate mb-2">
            {startup.startup_name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm">{getFlagEmoji(startup.country)}</span>
            <span className="text-gray-400 text-xs sm:text-sm truncate">
              {startup.country || "Global"}
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");

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
          is_incubation: item.is_incubation,
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
  }, [countryFilter, domainFilter]);

  // Filter startups based on search term
  const filteredStartups = startups.filter(startup =>
    startup.startup_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (startup.country && startup.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const featuredStartup = {
    name: "DSD Soft",
    country: "Indonesia",
    background: "/img/bgcover.png",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B0E2B] via-[#2A1B3D] to-[#1B0E2B] text-white font-sans">
      
      {/* Hero Section */}
      <section className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] flex items-end overflow-hidden">
        <Image
          src={featuredStartup.background}
          alt="Featured Startup Background"
          fill
          priority
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <div className="relative z-20 p-4 sm:p-8 lg:p-16 text-white w-full">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {featuredStartup.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">{getFlagEmoji(featuredStartup.country)}</span>
                <span className="text-base sm:text-lg text-gray-200">{featuredStartup.country}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button className="bg-white text-purple-800 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold transition-all hover:shadow-lg">
                Watch Now
              </Button>
              <Button className="bg-purple-600 text-white hover:bg-purple-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-semibold transition-all hover:shadow-lg">
                Buy Plan
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Discover Startups
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Explore innovative startups from around the world
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-6 sm:mb-8">
          
          {/* Search Bar */}
          <div className="relative w-full max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              placeholder="Search startups or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white rounded-full h-12 sm:h-14 pl-12 pr-4 transition-all focus:border-purple-500 focus:bg-white/10 text-sm sm:text-base"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            
            {/* Domain Filters */}
            <div className="w-full sm:w-auto">
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {domainFilters.map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedDomain === filter ? "default" : "outline"}
                    onClick={() => setSelectedDomain(filter)}
                    className={cn(
                      "whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex-shrink-0",
                      selectedDomain === filter
                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25"
                        : "bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 text-gray-300 hover:text-white"
                    )}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            {/* View Mode and Sort Controls */}
            <div className="flex items-center gap-3">
              
              {/* View Mode Toggle */}
              <div className="flex bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    viewMode === "grid"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <GridIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    viewMode === "list"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort Tabs */}
              <Tabs defaultValue="Startups" className="hidden sm:block">
                <TabsList className="bg-white/5 backdrop-blur-sm border-white/10 rounded-full p-1 h-10">
                  {sortFilters.map(filter => (
                    <TabsTrigger
                      key={filter}
                      value={filter}
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-xs font-medium px-4 py-2 transition-all"
                    >
                      {filter}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Countries Button */}
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 hover:border-purple-500/50 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all"
              >
                <span className="hidden sm:inline">Countries</span>
                <ArrowRightIcon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6">
          <p className="text-gray-400 text-sm sm:text-base">
            {loading ? "Loading..." : `${filteredStartups.length} startups found`}
          </p>
        </div>

        {/* Startups Grid/List */}
        {loading ? (
          <div className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              : "space-y-4"
          )}>
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "bg-white/5 border border-white/10 rounded-xl animate-pulse",
                  viewMode === "grid" ? "h-48 sm:h-56" : "h-20 sm:h-24"
                )}
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-400 font-medium mb-2">Error loading startups</p>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          </div>
        ) : filteredStartups.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 max-w-md mx-auto">
              <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 font-medium mb-2">No startups found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className={cn(
            "transition-all duration-300",
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              : "space-y-3 sm:space-y-4"
          )}>
            {filteredStartups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} viewMode={viewMode} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}