"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaselib";
import { ArrowRightIcon, Mail, Phone, Globe, Twitter, Linkedin, MapPin, Calendar, Users, Briefcase, Search, Star, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Head from 'next/head';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// --- START: Data types and utility functions ---
interface IncubationProfile {
  id: string;
  incubator_accelerator_name: string;
  type_of_incubator: string;
  year_established: number;
  website: string;
  linkedin_profile?: string;
  physical_address: string;
  email_address: string;
  phone_country_code: string;
  local_phone_number: string;
  primary_focus_areas: string[];
  services_offered_to_startups: string[];
  eligibility_criteria: string;
  total_funding_raised_by_alumni: string;
  percentage_startups_operational_after_3_yrs: number;
  unique_value_proposition: string;
  problem_gaps_solved_in_ecosystem: string;
  preferred_startup_stages: string[];
  thumbnail_url: string | null;
  logo_url: string | null;
  notable_alumni_startups: Array<{ startupName: string; websiteUrl: string }>;
  key_personnel: { name: string; designation: string; email: string }[];
  location: string;
  portfolio_size: number;
  program_duration: string;
  preferred_startups: string;
  batch_size: string;
  investment_range: string;
  equity_stake: string;
  application_fee: string;
  selection_criteria: string;
}

interface Startup {
  id: string;
  startup_name: string;
  country: string;
  thumbnail_url: string;
  is_incubation: boolean;
  incubation_id: string;
}

const getAbsoluteUrl = (path: string | null | undefined): string => {
  if (!path || path.startsWith("http")) {
    return path || "/placeholder.svg";
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${baseUrl?.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};

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
  };
  const code = countryCodeMap[country] || country.toLowerCase().substring(0, 2);
  return `https://flagcdn.com/w20/${code}.png`;
};
// --- END: Data types and utility functions ---

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.645, 0.045, 0.355, 1],
    },
  },
};

export default function IncubationDashboardPage({ params }: { params: { id: string } }) {
  const [incubation, setIncubation] = useState<IncubationProfile | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: incubationData, error: incubationError } = await supabase
        .from("incubation")
        .select("*")
        .eq("id", params.id)
        .single();

      if (incubationError || !incubationData) {
        throw new Error("Incubation profile not found");
      }
      setIncubation(incubationData as IncubationProfile);

      const { data: startupData, error: startupError } = await supabase
        .from("creator")
        .select("id, startup_name, country, thumbnail_url, is_incubation, incubation_id")
        .eq("incubation_id", params.id);

      if (startupError) {
        console.error("Error fetching startups:", startupError);
      }
      if (startupData) {
        setStartups(startupData as Startup[]);
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStartups = useMemo(() => {
    const filteredByTab = startups.filter(s => {
      if (activeTab === "All") return true;
      // Implement your logic for 'Top' and 'Current' batches here
      return true;
    });

    if (!searchQuery) {
      return filteredByTab;
    }

    return filteredByTab.filter(s =>
      s.startup_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [startups, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="bg-[#0E0617] min-h-screen py-8 font-sans text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
          <Skeleton className="h-64 w-full rounded-3xl bg-white/10 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 rounded-3xl bg-white/10 lg:col-span-2" />
            <Skeleton className="h-96 rounded-3xl bg-white/10" />
          </div>
          <div className="mt-8">
            <Skeleton className="h-12 w-48 mb-4 bg-white/10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl bg-white/10" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!incubation) {
    return (
      <div className="bg-[#0E0617] min-h-screen py-8 font-sans text-white text-center">
        <div className="mt-32">
          <h1 className="text-4xl font-bold">Incubation Profile Not Found</h1>
          <p className="mt-4">The profile you are looking for does not exist or an error occurred.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0E0617] min-h-screen font-sans text-white">
      <Head>
        <title>{incubation.incubator_accelerator_name} Dashboard</title>
        <style>{`
          .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .hover-glow:hover {
            box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.2);
          }
          .card-hover-effect {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .card-hover-effect:hover {
            transform: translateY(-8px) scale(1.02);
          }
        `}</style>
      </Head>
      <main className="max-w-[1438px] mx-auto px-4 sm:px-6 lg:px-10 mt-32">
        {/* Hero Section */}
        <section className="relative w-full rounded-[25px] overflow-hidden p-6 sm:p-10 lg:p-16 text-center flex flex-col items-center border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-lg mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none"></div>
          {incubation.logo_url && (
            <Image
              src={getAbsoluteUrl(incubation.logo_url)}
              alt={`${incubation.incubator_accelerator_name} logo`}
              width={120}
              height={120}
              className="rounded-full mb-6 relative z-10 w-24 h-24 sm:w-32 sm:h-32"
            />
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-2 relative z-10 leading-tight">
            {incubation.incubator_accelerator_name}
          </h1>
          <p className="text-gray-300 max-w-4xl mx-auto relative z-10 text-base sm:text-lg">
            Empowering early-stage startups with mentorship, funding and resources to build scalable technology solutions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 relative z-10">
            <div className="px-5 py-2 border border-white/20 rounded-full text-sm font-semibold flex items-center gap-2">
              <Briefcase size={16} />
              <span>{incubation.type_of_incubator || "Corporate"}</span>
            </div>
            <div className="px-5 py-2 border border-white/20 rounded-full text-sm font-semibold flex items-center gap-2">
              <Users size={16} />
              <span>{incubation.portfolio_size || "45+"} Startups</span>
            </div>
            <div className="px-5 py-2 border border-white/20 rounded-full text-sm font-semibold flex items-center gap-2">
              <Calendar size={16} />
              <span>{incubation.year_established || "2018"}</span>
            </div>
            <div className="px-5 py-2 border border-white/20 rounded-full text-sm font-semibold flex items-center gap-2">
              <MapPin size={16} />
              <span>{incubation.location || "Bangalore"}</span>
            </div>
          </div>
        </section>

        {/* Overview & Key Personnel Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          <div className="p-6 md:p-8 bg-white/5 rounded-3xl border border-white/10 lg:col-span-2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Overview</h2>
            <p className="text-gray-300 mb-6 text-sm sm:text-base">
              {incubation.unique_value_proposition || "Leading technology incubator supporting early-stage startups in AI, IoT, Fintech, and SaaS sectors. We provide hands-on mentorship, strategic funding, and a robust network to help founders succeed."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400 text-sm">
              <div>
                <span className="text-white font-bold">Focus Areas:</span>{" "}
                {incubation.primary_focus_areas?.join(", ") || "Artificial Intelligence, IoT, Fintech, SaaS"}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2">
                <a href={`tel:${incubation.phone_country_code}${incubation.local_phone_number}`} className="text-gray-400 hover:text-white transition-colors">
                  <Phone size={18} />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <a href={incubation.linkedin_profile || "#"} target="_blank" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-white/5 rounded-3xl border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Key Personnel</h2>
            {incubation.key_personnel?.map((person, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-xl font-semibold">{person.name}</h3>
                <p className="text-gray-400 text-sm">{person.designation}</p>
                {person.email && <p className="text-purple-400 text-sm mt-1">{person.email}</p>}
              </div>
            )) || (
              <>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">Dr. Rajesh Kumar</h3>
                  <p className="text-gray-400 text-sm">Managing Director</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">Dr. Rajesh Kumar</h3>
                  <p className="text-gray-400 text-sm">Managing Director</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Programs & Contact Details Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          <div className="p-6 md:p-8 bg-white/5 rounded-3xl border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Programs & Services</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">Program Duration:</span>
                <span className="text-gray-400">{incubation.program_duration || "6-12 months"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">Preferred Startups:</span>
                <span className="text-gray-400">{incubation.preferred_startups || "Ideation"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">Batch Size:</span>
                <span className="text-gray-400">{incubation.batch_size || "15-20 startups per batch"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">Investment Range:</span>
                <span className="text-gray-400">{incubation.investment_range || "₹25 Lakhs - ₹2 Crores"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">Equity Stake:</span>
                <span className="text-gray-400">{incubation.equity_stake || "8-15%"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">Application Fee:</span>
                <span className="text-gray-400">{incubation.application_fee || "₹5,000 (Non-refundable)"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">Selection Criteria:</span>
                <span className="text-gray-400">{incubation.selection_criteria || "MVP ready, market validation, scalable business model"}</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-white/5 rounded-3xl border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Contact Details</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <Mail size={20} className="text-gray-400 flex-shrink-0" />
                <a href={`mailto:${incubation.email_address || "#"}`} className="text-purple-400 hover:underline">
                  {incubation.email_address || "info@techventurehub.com"}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone size={20} className="text-gray-400 flex-shrink-0" />
                <a href={`tel:${incubation.phone_country_code}${incubation.local_phone_number}`} className="text-purple-400 hover:underline">
                  {`${incubation.phone_country_code} ${incubation.local_phone_number}`}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Globe size={20} className="text-gray-400 flex-shrink-0" />
                <a href={incubation.website || "#"} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                  {incubation.website || "www.techventurehub.com"}
                </a>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <MapPin size={20} className="text-gray-400 flex-shrink-0 mt-1" />
                <span className="text-gray-400">
                  {incubation.physical_address || "Koramangala, Bangalore, Karnataka"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Interested CTA Section */}
        <section className="p-6 md:p-8 bg-[#1B0E2B] rounded-[25px] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-semibold mb-2">Interested in TechVenture Hub?</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Ready to accelerate your startup? Join our next batch and get access to funding, mentorship, and our extensive network.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link href={incubation.website || "#"} target="_blank" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full px-6 py-5 sm:px-8 sm:py-6 rounded-full text-sm sm:text-base font-bold text-white border-white/50 hover:bg-white/10 transition-colors">
                Visit Website
              </Button>
            </Link>
            <Link href={`mailto:${incubation.email_address || "#"}`} className="w-full sm:w-auto">
              <Button className="w-full bg-purple-600 text-white rounded-full px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base font-bold transition-colors hover:bg-purple-700">
                Schedule Call
              </Button>
            </Link>
          </div>
        </section>

        {/* Associated Startups Section */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Associated Startups ({startups.length})</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2 md:gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setActiveTab("All")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  activeTab === "All" ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                )}
              >
                All Startups
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab("Top")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  activeTab === "Top" ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                )}
              >
                Top Startups
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveTab("Current")}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  activeTab === "Current" ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700",
                )}
              >
                Current Batch
              </Button>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search startups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-[250px] bg-neutral-800 border-neutral-700 text-white rounded-lg focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredStartups.length > 0 ? (
              filteredStartups.map((s) => (
                <Link key={s.id} href={`/startup/${s.id}`}>
                  <div className="group w-full h-[272px] bg-white/5 border-[2.13px] border-[#FFFFFF] rounded-[25px] p-3 flex flex-col gap-y-4 transition-all duration-300 ease-in-out hover:scale-105 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20">
                    <div className="relative w-full h-[176px]">
                      <Image
                        src={getAbsoluteUrl(s.thumbnail_url)}
                        alt={s.startup_name}
                        fill
                        className="rounded-[18px] object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Incubation
                      </span>
                    </div>
                    <div className="flex flex-col gap-y-2 px-1">
                      <h3 className="text-white font-semibold text-lg sm:text-xl truncate">
                        {s.startup_name}
                      </h3>
                      <div className="flex items-center gap-x-2">
                        <Image
                          src={getFlagUrl(s.country)}
                          alt={`${s.country} flag`}
                          width={17}
                          height={17}
                          className="rounded-full"
                        />
                        <span className="text-gray-400 text-sm">
                          {s.country || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="lg:col-span-4 text-center py-10 text-gray-400">
                <p>No startups found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}