"use client";

import { ArrowRightIcon, SearchIcon, GridIcon, ListIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaselib";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import React from 'react';

import ReactCountryFlag from "react-country-flag";


// Define the type for the startup data, now with the incubator name.
interface Startup {
  id: string;
  startup_name: string;
  country: string | null;
  thumbnail_url: string | null;
  is_incubation: boolean;
  incubation_id: string | null;
  domain: string | null;
  one_sentence_description: string | null;
  incubation: { incubator_accelerator_name: string | null } | null;
  founder_names: string[] | null; // Added founder_names
}

// Dummy list of countries (used for filtering/dialog)
const allCountries = [
    { name: "All Countries", code: "All" },
    { name: "Indonesia", code: "ID" },
    { name: "Bahrain", code: "BH" },
    { name: "Serbia", code: "RS" },
    { name: "India", code: "IN" },
    { name: "United States", code: "US" },
    { name: "Canada", code: "CA" },
    { name: "Germany", code: "DE" },
    { name: "Qatar", code: "QA" },
    { name: "Iran", code: "IR" },
    { name: "Turkey", code: "TR" },
    { name: "United Kingdom", code: "GB" },
    { name: "France", code: "FR" },
    { name: "Italy", code: "IT" },
    { name: "Spain", code: "ES" },
    { name: "Australia", code: "AU" },
    { name: "Mexico", code: "MX" },
    { name: "Brazil", code: "BR" },
    { name: "China", code: "CN" },
    { name: "Japan", code: "JP" },
    { name: "Russia", code: "RU" },
    { name: "South Korea", code: "KR" },
    { name: "Saudi Arabia", code: "SA" },
    { name: "Egypt", code: "EG" },
    { name: "Nigeria", code: "NG" },
    { name: "South Africa", code: "ZA" },
    { name: "Argentina", code: "AR" },
    { name: "New Zealand", code: "NZ" },
    { name: "Sweden", code: "SE" },
    { name: "Switzerland", code: "CH" },
    { name: "Netherlands", code: "NL" },
    { name: "Belgium", code: "BE" },
    { name: "Austria", code: "AT" },
    { name: "Greece", code: "GR" },
    { name: "Malaysia", code: "MY" }, 
    { name: "Philippines", code: "PH" }, 
];


// --- Helper Functions ---

const getAbsoluteUrl = (path: string | null | undefined): string => {
  if (!path || path.startsWith("http")) {
    return path || "https://placehold.co/192x96/1a1a1a/ffffff?text=Image"; 
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    return "https://placehold.co/192x96/1a1a1a/ffffff?text=Image";
  }
  const fullUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, 1) : baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  return fullUrl.includes('/storage/v1/object/public') ? fullUrl : `${baseUrl}/storage/v1/object/public${path}`;
};

// New function to get 2-letter country code (uppercase)
const getCountryCode = (countryName: string | null): string => {
  if (!countryName) return 'US'; // Default to US or a generic if unknown
  const country = allCountries.find(c => c.name === countryName);
  return country?.code || 'US';
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

const sortFilters = ["Startups", "Founder", "Countries"];


// --- StartupCard Component ---

const StartupCard = ({ startup, viewMode = "grid", activeSort }: { startup: Startup; viewMode?: "grid" | "list"; activeSort: string }) => {
  const thumbnailUrl = getAbsoluteUrl(startup.thumbnail_url);
  const primaryFounder = startup.founder_names?.[0] ? startup.founder_names[0].split('(')[0].trim() : 'Unknown Founder';
  const countryCode = getCountryCode(startup.country);


  // --- Founder View Mode ---
  if (activeSort === "Founder") {
    return (
      <Link href={`/startup/${startup.id}`}>
        <div className="group w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center h-56 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-3">
            <span className="text-3xl text-white font-bold">{primaryFounder.charAt(0)}</span>
          </div>
          <h3 className="text-white font-semibold text-xl truncate mb-1 text-center">
            {primaryFounder}
          </h3>
          <p className="text-gray-400 text-sm truncate text-center">
            {startup.startup_name} ({startup.country || 'Global'})
          </p>
        </div>
      </Link>
    );
  }
  
  // --- Country View Mode (FIXED FLAG TO FULL RECTANGLE) ---
  if (activeSort === "Countries") {
    return (
      <Link href={`/startup/${startup.id}`}>
        <div className="group w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center h-56 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer">
          
          {/* Container for rectangular flag: adjust size as needed, removed overflow-hidden */}
          {/* Use specific W-20 and H-15 for a typical 4:3 aspect ratio, or adjust as desired */}
          <div className="flex items-center justify-center mb-3 p-1 rounded-md border border-white/20">
            <ReactCountryFlag 
                countryCode={countryCode} 
                svg
                // Explicitly set width and height for a typical flag aspect ratio
                style={{ width: '80px', height: '60px' }} // e.g., 4:3 aspect ratio
                title={startup.country || 'Global'}
            />
          </div>
          
          <h3 className="text-white font-semibold text-xl truncate mb-1 text-center">
            {startup.country || 'Global'}
          </h3>
          <p className="text-gray-400 text-sm truncate text-center">
            {startup.startup_name}
          </p>
          <p className="text-purple-400 text-xs mt-2">
            {startup.domain || 'General'}
          </p>
        </div>
      </Link>
    );
  }


  // --- Default (Startups) View Mode (Grid/List) ---

  if (viewMode === "list") {
    return (
      <Link href={`/startup/${startup.id}`}>
        <div className="group w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-start gap-4 transition-all duration-300 ease-in-out hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer">
          {/* Image container for list view, fixed width/height for uniformity */}
          <div className="relative w-32 h-20 sm:w-40 sm:h-24 flex-shrink-0 border border-white/10 rounded-lg p-1 bg-white/[0.03] overflow-hidden">
            <Image
              src={thumbnailUrl}
              alt={startup.startup_name}
              fill
              className="rounded-lg object-cover" 
            />
            {startup.is_incubation && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">✓</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-white font-semibold text-base sm:text-lg truncate mb-1">
              {startup.startup_name}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-2 truncate">
              {startup.one_sentence_description || "One sentence description not available."}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* FIX: Flag for List View - use appropriate width/height for full display */}
              <div className="flex-shrink-0 p-0.5 rounded-sm border border-white/10"> {/* Added padding/border for clarity */}
                <ReactCountryFlag 
                    countryCode={countryCode} 
                    svg
                    style={{ width: '28px', height: '21px' }} // Adjusted for a small uncropped flag (4:3)
                    title={startup.country || 'Global'}
                />
              </div>
              <span className="text-gray-400 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px] flex-shrink-0"> 
                {startup.country || "Global"}
              </span>
              {startup.domain && (
                <span className="inline-block bg-white/10 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium truncate flex-shrink-0">
                  {startup.domain}
                </span>
              )}
            </div>
            {startup.is_incubation && (
              <span className="inline-block mt-2 bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium truncate max-w-full">
                {startup.incubation?.incubator_accelerator_name || "Incubation"}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default Grid View
  return (
    <Link href={`/startup/${startup.id}`}>
      <div className="group w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer">
        {/* Image container for grid view: uniform height and using object-cover */}
        <div className="relative w-full h-36 sm:h-48 border-b border-white/10 bg-white/[0.03] overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={startup.startup_name}
            fill
            className="rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {startup.is_incubation && (
            <span className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
              {startup.incubation?.incubator_accelerator_name || "Incubation"}
            </span>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-white font-semibold text-base sm:text-lg lg:text-xl truncate mb-1">
            {startup.startup_name}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-2 truncate">
            {startup.one_sentence_description || "One sentence description not available."}
          </p>
          <div className="flex items-center gap-2">
            {/* FIX: Flag for Grid View - use appropriate width/height for full display */}
            <div className="flex-shrink-0 p-0.5 rounded-sm border border-white/10">
              <ReactCountryFlag 
                  countryCode={countryCode} 
                  svg
                  style={{ width: '28px', height: '21px' }} // Adjusted for a small uncropped flag (4:3)
                  title={startup.country || 'Global'}
              />
            </div>
            <span className="text-gray-400 text-xs sm:text-sm truncate max-w-[100px] flex-shrink-0">
              {startup.country || "Global"}
            </span>
            {startup.domain && (
              <span className="inline-block bg-white/10 text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium truncate max-w-[100px]">
                {startup.domain}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};


// --- AllStartupsPage Component ---

export default function AllStartupsPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for sorting and country filter dialog
  const [activeSort, setActiveSort] = useState("Startups");
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState("All");

  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Initialize state from URL params
  const initialCountry = searchParams.get("country") || "All";
  const initialDomain = searchParams.get("domain") || "All";
  const categoryFilter = searchParams.get("category");
  
  // Use state variables initialized from URL
  const [selectedDomain, setSelectedDomain] = useState(initialDomain);
  const [appliedCountryFilter, setAppliedCountryFilter] = useState<string>(initialCountry);
  
  // Define featuredStartup data needed for the Hero Section (MOVED INSIDE COMPONENT)
  const featuredStartup = {
    name: "DSD Soft",
    country: "Indonesia",
    background: "/img/bgcover.png",
  };


  // 2. Sync state with URL only on mount/param change
  useEffect(() => {
    // This ensures the local state matches the URL when the component loads or the URL is changed externally
    const urlCountry = searchParams.get("country") || "All";
    const urlDomain = searchParams.get("domain") || "All";

    if (urlCountry !== appliedCountryFilter) {
      setAppliedCountryFilter(urlCountry);
    }
    if (urlDomain !== selectedDomain) {
      setSelectedDomain(urlDomain);
    }
  }, [searchParams, appliedCountryFilter, selectedDomain]); 
  
  // 3. Data Fetching Logic
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
            one_sentence_description,
            founder_names,
            incubation:incubation_id (
              incubator_accelerator_name
            )
          `)
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        // Apply Country Filter
        if (appliedCountryFilter && appliedCountryFilter !== "All") {
          query = query.eq("country", appliedCountryFilter);
        }
        
        // Apply Domain Filter
        if (selectedDomain && selectedDomain !== "All") {
          query = query.eq("domain", selectedDomain);
        }
        
        // Apply Category Filter (if still needed)
        if (categoryFilter) {
          query = query.eq("Category", categoryFilter.replace(/-/g, ' '));
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
  }, [appliedCountryFilter, selectedDomain, categoryFilter]); 

  // Update URL parameters when filters change
  const updateUrl = (country: string, domain: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (country === "All") {
      params.delete("country");
    } else {
      params.set("country", country);
    }

    if (domain === "All") {
      params.delete("domain");
    } else {
      params.set("domain", domain);
    }
    
    // Preserve category filter if it exists
    if (categoryFilter) {
      params.set("category", categoryFilter);
    }
    
    router.push(`/allstartup/?${params.toString()}`, { scroll: false });
  };
  
  // Handle domain filter change
  const handleDomainChange = (domain: string) => {
    // Note: We update the state first, which triggers the fetch (via useEffect) and then update the URL.
    setSelectedDomain(domain);
    updateUrl(appliedCountryFilter, domain);
  };
  
  // Handle country filter submission from dialog
  const handleApplyCountryFilter = () => {
    // Note: We update the state first, which triggers the fetch (via useEffect) and then update the URL.
    setAppliedCountryFilter(selectedCountryFilter);
    updateUrl(selectedCountryFilter, selectedDomain);
    setShowCountryDialog(false);
  };

  // Filter startups based on search term (only for client-side search across all loaded data)
  const filteredStartups = startups.filter(startup =>
    startup.startup_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (startup.country && startup.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Determine grid layout based on active sort mode and view mode
  const getGridLayout = useMemo(() => {
    // Special views (Founder/Countries) always use a uniform 4-column grid
    if (activeSort === "Founder" || activeSort === "Countries") {
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6";
    }
    // Default 'Startups' view uses standard grid/list mode
    if (viewMode === "grid") {
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6";
    }
    // If viewMode is 'list', the outer container shouldn't be a grid, it should be a simple space-y list.
    return "";
  }, [activeSort, viewMode]);


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
                {/* FIX: Rectangular Flag in Hero - no overflow hidden, explicitly sized div */}
                <div className="p-0.5 rounded-sm border border-white/10"> 
                  <ReactCountryFlag 
                      countryCode={getCountryCode(featuredStartup.country)} 
                      svg
                      style={{ width: '32px', height: '24px' }} // Approx 4:3 aspect
                      title={featuredStartup.country}
                  />
                </div>
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
          {(appliedCountryFilter && appliedCountryFilter !== "All") && (
            <p className="text-purple-400 text-sm mt-1 font-medium flex items-center gap-2">
                Active Country: 
                {/* FIX: Rectangular Flag for Active Filter - no overflow hidden, explicitly sized div */}
                <span className="p-0.5 rounded-sm border border-white/10">
                    <ReactCountryFlag 
                        countryCode={getCountryCode(appliedCountryFilter)} 
                        svg
                        style={{ width: '24px', height: '18px' }} // Smaller for inline text
                        title={appliedCountryFilter}
                    />
                </span>
                {appliedCountryFilter}
            </p>
          )}
          {(selectedDomain && selectedDomain !== "All") && (
            <p className="text-purple-400 text-sm mt-1 font-medium">
                Active Domain: {selectedDomain}
            </p>
          )}
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

          {/* Filter Controls (Domain/Categories, View Mode, Sort, Countries Button) */}
          <div className="flex flex-wrap items-center gap-4"> 
            
            {/* Domain Filters (Categories) - Takes up full width, scrolls horizontally if needed */}
            <div className="w-full"> 
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {domainFilters.map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedDomain === filter ? "default" : "outline"}
                    onClick={() => handleDomainChange(filter)} // Use new handler
                    className={cn(
                      "whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex-shrink-0",
                      selectedDomain === filter
                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25"
                        : "bg-[#2A1B3D] border-purple-500/50 hover:bg-[#3A2B4D] text-gray-300 hover:text-white"
                    )}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            {/* View Mode and Sort Controls Container */}
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

              {/* Sort Tabs (Updated to use activeSort state) */}
              <Tabs defaultValue="Startups" className="hidden sm:block">
                <TabsList className="bg-white/5 backdrop-blur-sm border-white/10 rounded-full p-1 h-10">
                  {sortFilters.map(filter => (
                    <TabsTrigger
                      key={filter}
                      value={filter}
                      onClick={() => setActiveSort(filter)}
                      className={cn(
                        "data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-xs font-medium px-4 py-2 transition-all",
                        activeSort === filter && "bg-purple-600 text-white shadow-sm"
                      )}
                    >
                      {filter}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              {/* Countries Button (Opens Dialog) */}
              <Button
                onClick={() => {
                  // Set dialog's initial selection to the current applied filter before opening
                  setSelectedCountryFilter(appliedCountryFilter);
                  setShowCountryDialog(true);
                }}
                className="bg-[#2A1B3D] border border-purple-500/50 text-white hover:bg-[#3A2B4D] px-5 py-3 rounded-full text-sm font-medium transition-all shadow-md"
                size="sm"
              >
                <span className="mr-1">Countries</span>
                <ArrowRightIcon className="h-4 w-4" />
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
            getGridLayout,
            viewMode === "list" && activeSort === "Startups" && "space-y-4" // Use list spacing when in list mode and default sort
          )}>
            {[...Array(activeSort === 'Countries' || activeSort === 'Founder' ? 4 : 8)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "bg-white/5 border border-white/10 rounded-xl animate-pulse",
                  viewMode === "grid" || activeSort !== "Startups" ? "h-40 sm:h-56" : "h-20 sm:h-24"
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
            getGridLayout, // Apply grid layout for Founder/Countries/Default Grid view
            viewMode === "list" && activeSort === "Startups" ? "space-y-3 sm:space-y-4" : "" // Apply list spacing for Default List view
          )}>
            {filteredStartups.map((startup) => (
              <StartupCard 
                key={startup.id} 
                startup={startup} 
                viewMode={viewMode}
                activeSort={activeSort} 
              />
            ))}
          </div>
        )}
      </section>
      
      {/* --- Country Filter Dialog (FIXED FLAGS) --- */}
      <Dialog open={showCountryDialog} onOpenChange={setShowCountryDialog}>
        <DialogContent className="sm:max-w-[425px] bg-[#1B0E2B] border-purple-500/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Filter by Country</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label htmlFor="country-select" className="text-sm text-gray-300">Select a Country</Label>
            <Select
              // Ensure the dialog's select component is controlled by the temporary state
              value={selectedCountryFilter} 
              onValueChange={setSelectedCountryFilter}
            >
              <SelectTrigger className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 h-11">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A1B3D] text-white border-white/10">
                {allCountries.map((c) => (
                  <SelectItem 
                    key={c.code} 
                    value={c.name} // Changed value to c.name to align with appliedCountryFilter state
                    className="hover:bg-purple-600/20 focus:bg-purple-600/20"
                  >
                    <div className="flex items-center gap-2">
                       {/* FIX: Rectangular Flag in Dropdown - no overflow hidden, explicitly sized div */}
                      <div className="p-0.5 rounded-sm border border-white/10 flex-shrink-0">
                        {c.code !== 'All' ? (
                          <ReactCountryFlag 
                              countryCode={c.code} 
                              svg
                              style={{ width: '24px', height: '18px' }} // Adjusted for small dropdown flag
                              title={c.name}
                          />
                        ) : (
                           // Placeholder for "All Countries"
                          <span className="text-lg leading-none">🌍</span>
                        )}
                      </div>
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowCountryDialog(false)}
              className="bg-transparent border-gray-600 hover:bg-gray-700/50 text-white"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleApplyCountryFilter}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Apply Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}