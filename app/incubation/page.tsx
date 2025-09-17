"use client";

import { ArrowRightIcon, SearchIcon, FilterIcon, GridIcon, ListIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaselib";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Star, TrendingUpIcon, MapPin } from "lucide-react";

// Define the type for the incubation data
interface Incubation {
  id: string;
  incubator_accelerator_name: string;
  country: string | null;
  thumbnail_url: string | null;
  logo_url: string | null;
  rating?: number | null;
  startups_count?: number | null;
  founded_year?: string | null;
}

// Helper function to get the absolute URL from a relative path
const getAbsoluteUrl = (path: string | null | undefined): string => {
  if (!path || path.startsWith("http")) {
    return path || "https://placehold.co/280x160/1a1a1a/ffffff?text=No+Image";
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
    return "https://placehold.co/280x160/1a1a1a/ffffff?text=No+Image";
  }
  const fullUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  return fullUrl;
};

// Function to get a flag URL based on the country
const getFlagUrl = (country: string | null) => {
  if (!country) return "https://flagcdn.com/w20/xx.png";

  const countryCodeMap: { [key: string]: string } = {
    'India': 'in',
    'United States': 'us',
    'United Kingdom': 'gb',
    'Germany': 'de',
    'France': 'fr',
    'Japan': 'jp',
    'China': 'cn',
    'Canada': 'ca',
    'Australia': 'au',
    'Brazil': 'br',
    'Singapore': 'sg',
    'Netherlands': 'nl',
    'Switzerland': 'ch',
    'Sweden': 'se',
    'Israel': 'il',
    'Indonesia': 'id'
  };

  const code = countryCodeMap[country] || country.toLowerCase().substring(0, 2);
  return `https://flagcdn.com/w20/${code}.png`;
};

// Get rating stars based on a 1-100 score
const getRatingStars = (rating: number | null) => {
  const stars = [];
  // Convert the 1-100 rating to a 1-5 scale
  const ratingValue = (rating || 0) / 20; 
  
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        size={12}
        className={i < Math.floor(ratingValue) ? "fill-yellow-400 text-yellow-400" : "text-gray-500"}
      />
    );
  }
  return stars;
};

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

const sortFilters = ["Incubators", "Countries", "Startups"];

// Incubation Card Component with detailed UI
const IncubationCard = ({ incubation, viewMode = "grid" }: { incubation: Incubation; viewMode?: "grid" | "list" }) => {
  const thumbnailUrl = getAbsoluteUrl(incubation.thumbnail_url || incubation.logo_url);
  const foundedYear = incubation.founded_year || "N/A";
  const startupsCount = incubation.startups_count || 0;
  const rating = incubation.rating || 0;

  if (viewMode === "list") {
    return (
      <Link href={`/incubation/${incubation.id}`}>
        <div className="group w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 ease-in-out hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
            <Image
              src={thumbnailUrl}
              alt={incubation.incubator_accelerator_name}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-base sm:text-lg truncate mb-1">
              {incubation.incubator_accelerator_name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs sm:text-sm">{getFlagUrl(incubation.country) ? <Image src={getFlagUrl(incubation.country)} alt={`${incubation.country} flag`} width={16} height={12} className="rounded-sm" /> : '🌍'}</span>
              <span className="text-gray-400 text-xs sm:text-sm">
                {incubation.country || "Global"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-gray-400">
                <TrendingUpIcon className="w-3 h-3" />
                <span>{startupsCount}+ startups</span>
              </div>
              <div className="flex items-center gap-1">
                 {getRatingStars(rating)}
                 <span className="text-gray-400">{rating}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/incubation/${incubation.id}`}>
      <div className="group glass-card rounded-2xl p-4 card-hover-effect w-full">
        {/* Image and Background */}
        <div className="relative w-full h-[140px] sm:h-[160px] mb-4 overflow-hidden rounded-xl">
          <Image
            src={thumbnailUrl}
            alt={incubation.incubator_accelerator_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="text-white font-bold text-lg sm:text-xl mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300 leading-tight">
              {incubation.incubator_accelerator_name}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-0.5">
                {getRatingStars(rating)}
              </div>
              <span className="text-xs text-gray-400">
                {rating}
              </span>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-2 text-gray-400 mb-3">
              <MapPin className="w-3 h-3" />
              <Image
                src={getFlagUrl(incubation.country)}
                alt={`${incubation.country} flag`}
                width={14}
                height={10}
                className="rounded-sm"
              />
              <span className="text-xs">
                {incubation.country || "Global"}
              </span>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-gray-400">
                <TrendingUpIcon className="w-3 h-3" />
                <span>{startupsCount}+ startups</span>
              </div>
              <div className="text-gray-500">
                Since {foundedYear}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function AllIncubationsPage() {
  const [incubations, setIncubations] = useState<Incubation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");

  const searchParams = useSearchParams();
  const countryFilter = searchParams.get("country");
  
  // Enhanced CSS for the glass effect
  const cardStyle = `
    .glass-card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .card-hover-effect {
      transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    .card-hover-effect:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(139, 92, 246, 0.15);
    }
  `;

  useEffect(() => {
    async function fetchAllIncubationsAndCountStartups() {
      try {
        setLoading(true);
        // 1. Fetch incubators
        let incubationQuery = supabase
          .from("incubation")
          .select(`
            id, 
            incubator_accelerator_name, 
            country, 
            thumbnail_url,
            logo_url,
            year_established,
            rating
          `)
          .order("created_at", { ascending: false });

        if (countryFilter) {
          incubationQuery = incubationQuery.eq("country", countryFilter);
        }

        const { data: incubationData, error: incubationError } = await incubationQuery;

        if (incubationError) {
          throw incubationError;
        }

        // 2. Map and fetch startup counts for each incubator
        const incubationsWithCounts = await Promise.all(
          incubationData.map(async (incubation) => {
            // Count the number of startups related to this specific incubator ID
            const { count, error: countError } = await supabase
              .from('creator')
              .select('id', { count: 'exact', head: true })
              .eq('incubation_id', incubation.id)
              .eq('status', 'approved'); // Only count approved startups

            if (countError) {
              console.error(`Error counting startups for incubator ${incubation.id}:`, countError);
              // Return a default count of 0 on error
              return {
                ...incubation,
                startups_count: 0,
                founded_year: incubation.year_established?.toString() || 'N/A',
              };
            }

            return {
              ...incubation,
              startups_count: count,
              founded_year: incubation.year_established?.toString() || 'N/A',
            };
          })
        );
        
        setIncubations(incubationsWithCounts as Incubation[]);
      } catch (e: any) {
        console.error("Error fetching incubations:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAllIncubationsAndCountStartups();
  }, [countryFilter]);

  const filteredIncubations = incubations.filter(incubation => {
    const matchesSearch = incubation.incubator_accelerator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incubation.country && incubation.country.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // The domain filter is now just a visual tab and doesn't affect the data fetched from the DB
    const matchesDomain = selectedDomain === "All"; 

    return matchesSearch && matchesDomain;
  });

  const featuredIncubation = {
    name: "Kalsekar Incubation Centre",
    country: "Indonesia",
    background: "/img/bgcover.png",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B0E2B] via-[#2A1B3D] to-[#1B0E2B] text-white font-sans">
      <style jsx>{cardStyle}</style>

      {/* Hero Section */}
      <section className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] flex items-end overflow-hidden">
        <Image
          src="/img/bgcover.png"
          alt="Featured Incubation Background"
          fill
          priority
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <div className="relative z-20 p-4 sm:p-8 lg:p-16 text-white w-full">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {featuredIncubation.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">{getFlagUrl(featuredIncubation.country) ? <Image src={getFlagUrl(featuredIncubation.country)} alt={`${featuredIncubation.country} flag`} width={24} height={16} className="rounded-sm" /> : '🌍'}</span>
                <span className="text-base sm:text-lg text-gray-200">{featuredIncubation.country}</span>
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
            Discover Incubators
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Explore leading accelerators and incubators globally
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-6 sm:mb-8">
          
          {/* Search Bar */}
          <div className="relative w-full max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              placeholder="Search incubators or countries..."
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
              <Tabs defaultValue="Incubators" className="hidden sm:block">
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
            {loading ? "Loading..." : `${filteredIncubations.length} incubators found`}
          </p>
        </div>

        {/* Incubations Grid/List */}
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
              <p className="text-red-400 font-medium mb-2">Error loading incubations</p>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          </div>
        ) : filteredIncubations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 max-w-md mx-auto">
              <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 font-medium mb-2">No incubations found</p>
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
            {filteredIncubations.map((incubation) => (
              <IncubationCard key={incubation.id} incubation={incubation} viewMode={viewMode} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}