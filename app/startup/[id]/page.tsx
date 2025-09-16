"use client"

import { ArrowRightIcon, TwitterIcon, LinkedinIcon, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaselib";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Head from 'next/head';

// Define the types for the fetched data
interface Startup {
  email_address: string;
  id: string;
  startup_name: string;
  country: string | null;
  thumbnail_url: string | null;
  logo_url: string | null;
  is_incubation: boolean;
  incubation_id: string | null;
  incubator_accelerator_name: string | null;
  rating: number | null;
  description: string;
  location: string | null;
  domain: string | null;
  startup_stage: string | null;
  revenue_model: string | null;
  funding_stage: string | null;
  employee_count: string | null;
  problem_being_solved: string | null;
  one_sentence_description: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  establishment_year: string | null;
  team_members: { name: string; designation: string; linkedin_url?: string; }[] | null;
}

interface SimilarStartup {
  id: string;
  startup_name: string;
  country: string | null;
  thumbnail_url: string | null;
  is_incubation: boolean;
  incubation_id: string | null;
}

const trainingSeries = [
  {
    title: "Idea to Innovation",
    description: "Learn how to validate and shape your tech idea.",
    imageUrl: "https://placehold.co/292x176/9a58b8/ffffff?text=Training",
    author: "Esther Howard",
    authorImage: "https://placehold.co/32x32/ff0000/ffffff?text=EH",
  },
  {
    title: "Building the Stack",
    description: "Choose the right technologies, tools, and frameworks.",
    imageUrl: "https://placehold.co/292x176/58b88f/ffffff?text=Training",
    author: "Kathryn Murphy",
    authorImage: "https://placehold.co/32x32/00ff00/ffffff?text=KM",
  },
  {
    title: "From MVP to Day",
    description: "Design, build, and present minimum viable product.",
    imageUrl: "https://placehold.co/292x176/6561b3/ffffff?text=Training",
    author: "Ronald Richards",
    authorImage: "https://placehold.co/32x32/0000ff/ffffff?text=RR",
  },
];

const getAbsoluteUrl = (path: string | null | undefined): string => {
  if (!path || path.startsWith("http")) {
    return path || "/placeholder.svg";
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${baseUrl?.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};

const getFlagUrl = (country: string | null) => {
  if (!country) return "https://placehold.co/17x17/000000/ffffff?text=?";
  const countryCode = country.substring(0, 1).toUpperCase();
  return `https://placehold.co/17x17/cccccc/333333?text=${countryCode}`;
};

export default function StartupInfoPage({ params }: { params: { id: string } }) {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [similarStartups, setSimilarStartups] = useState<SimilarStartup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: startupData, error: startupError } = await supabase
          .from("creator")
          .select(`
            *,
            incubation:incubation_id (
              incubator_accelerator_name
            )
          `)
          .eq("id", params.id)
          .single();

        if (startupError || !startupData) {
          throw new Error("Startup not found");
        }

        const formattedStartup = {
          ...startupData,
          incubation_id: startupData.incubation?.id || null,
          incubator_accelerator_name: (startupData.incubation as any)?.incubator_accelerator_name || null
        };
        setStartup(formattedStartup as Startup);

        if (formattedStartup.domain) {
          const { data: similarData, error: similarError } = await supabase
            .from("creator")
            .select("id, startup_name, country, thumbnail_url, is_incubation, incubation_id")
            .eq("domain", formattedStartup.domain)
            .neq("id", params.id)
            .limit(3);

          if (similarError) {
            console.error("Error fetching similar startups:", similarError);
          }
          if (similarData) {
            setSimilarStartups(similarData as SimilarStartup[]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="bg-[#1B0E2B] min-h-screen py-8 font-sans text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <Skeleton className="h-64 w-full rounded-3xl bg-white/10" />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64 rounded-xl bg-white/10" />
            <Skeleton className="h-64 rounded-xl bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="bg-[#1B0E2B] min-h-screen py-8 font-sans text-white text-center">
        <h1 className="text-4xl font-bold">Startup Not Found</h1>
        <p className="mt-4">The startup you are looking for does not exist.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-[#1B0E2B] min-h-screen py-8 font-sans text-white overflow-hidden">
      <Head>
        <style>{`
          @keyframes glow {
            0%, 100% {
              box-shadow: 0 0 5px #a855f7, 0 0 10px #a855f7;
            }
            50% {
              box-shadow: 0 0 15px #a855f7, 0 0 25px #a855f7;
            }
          }
          .animate-glow {
            animation: glow 2s ease-in-out infinite;
          }
        `}</style>
      </Head>

      <main className="max-w-[1438px] mx-auto px-4 sm:px-6 lg:px-10 mt-24">
        {/* Hero Section */}
        <section className="relative w-full rounded-[25px] overflow-hidden p-6 sm:p-10 lg:p-16 text-center flex flex-col items-center border border-white/10 bg-white/[0.03] backdrop-blur-3xl shadow-lg mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none"></div>
          {startup.logo_url && (
            <Image
              src={getAbsoluteUrl(startup.logo_url)}
              alt={`${startup.startup_name} logo`}
              width={120}
              height={120}
              className="rounded-full mb-6 relative z-10 w-24 h-24 sm:w-32 sm:h-32"
            />
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-2 relative z-10 leading-tight">{startup.startup_name}</h1>
          <p className="text-gray-300 max-w-4xl mx-auto relative z-10 text-base sm:text-lg">
            {startup.one_sentence_description || "Premium manufacturer of next-generation smart home automation systems, turning your smart home vision into reality with AI-powered IoT solutions."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 relative z-10">
            {startup.is_incubation && startup.incubation_id && (
              <Link href={`/incubation-dashboard/${startup.incubation_id}`}>
                <div className="px-4 py-2 sm:px-5 sm:py-2 border border-purple-500 bg-purple-500/20 text-purple-200 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 hover:bg-purple-500/40 cursor-pointer animate-glow">
                  {startup.incubator_accelerator_name || "Incubation"}
                </div>
              </Link>
            )}
            <div className="px-4 py-2 sm:px-5 sm:py-2 border border-white/20 rounded-full text-xs sm:text-sm font-semibold">{startup.domain || "AI/ML"}</div>
            <div className="px-4 py-2 sm:px-5 sm:py-2 border border-white/20 rounded-full text-xs sm:text-sm font-semibold">{startup.establishment_year || "2022"}</div>
            <div className="px-4 py-2 sm:px-5 sm:py-2 border border-white/20 rounded-full text-xs sm:text-sm font-semibold">{startup.location || "Maharashtra"}</div>
            <div className="px-4 py-2 sm:px-5 sm:py-2 border border-white/20 rounded-full text-xs sm:text-sm font-semibold">{startup.funding_stage || "Series A"}</div>
          </div>
        </section>

        {/* Overview & Problem/Solution Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
          <div className="p-6 md:p-8 bg-white/5 rounded-3xl border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Overview</h2>
            <p className="text-gray-300 mb-6 text-sm sm:text-base">{startup.description || "We turn your smart home vision into reality with AI-powered IoT solutions that are private, secure, and delightful to use."}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400 text-sm">
              <div><span className="text-white font-bold">Startup Stage:</span> {startup.startup_stage || "Ideation"}</div>
              <div><span className="text-white font-bold">Revenue Model:</span> {startup.revenue_model || "B2B, B2C"}</div>
              <div><span className="text-white font-bold">Funding Stage:</span> {startup.funding_stage || "Seed A"}</div>
              <div><span className="text-white font-bold">No. of Employees:</span> {startup.employee_count || "1-100"}</div>
            </div>
            <div className="flex gap-4 mt-6">
              {startup.instagram_url && (
                <Link href={startup.instagram_url} target="_blank" className="p-3 border border-white/20 rounded-full hover:bg-white/10 transition-colors">
                  <TwitterIcon size={20} className="text-white" />
                </Link>
              )}
              {startup.linkedin_url && (
                <Link href={startup.linkedin_url} target="_blank" className="p-3 border border-white/20 rounded-full hover:bg-white/10 transition-colors">
                  <LinkedinIcon size={20} className="text-white" />
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 md:gap-8">
            <div className="p-6 md:p-8 bg-white/5 rounded-3xl border border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Problem</h2>
              <p className="text-gray-300 text-sm sm:text-base">{startup.problem_being_solved || "Homes rely on multiple vendor apps that don't work together, creating friction and security bottlenecks."}</p>
            </div>
            <div className="p-6 md:p-8 bg-white/5 rounded-3xl border border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Solution</h2>
              <p className="text-gray-300 text-sm sm:text-base">
                {startup.one_sentence_description || "A modular hub with local AI that unifies devices and enables privacy-first automations without cloud dependency."}
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        {startup.team_members && startup.team_members.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold mb-6">Team</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {startup.team_members.map((member, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center border border-white/10"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4">
                    <Image
                      src={`https://placehold.co/96x96/666666/ffffff?text=${member.name.split(' ').map(n => n[0]).join('')}`}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold">{member.name}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">{member.designation}</p>
                  {member.linkedin_url && (
                    <Link href={member.linkedin_url} target="_blank" className="mt-2 text-gray-400 hover:text-white transition-colors">
                      <LinkedinIcon size={18} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interested CTA Section */}
        <section className="p-6 md:p-8 bg-[#1B0E2B] rounded-[25px] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-semibold mb-2">Interested in {startup.startup_name}?</h3>
            <p className="text-gray-400 text-sm sm:text-base">Request the deck or schedule a demo.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link href={startup.website_url || "#"} target="_blank" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full px-6 py-5 sm:px-8 sm:py-6 rounded-full text-sm sm:text-base font-bold text-white border-white/50 hover:bg-white/10 transition-colors"
              >
                Visit Website
              </Button>
            </Link>
            <Link href={`mailto:${startup.email_address || "#"}`} className="w-full sm:w-auto">
              <Button
                className="w-full bg-purple-600 text-white rounded-full px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base font-bold transition-colors hover:bg-purple-700"
              >
                Get In Touch
              </Button>
            </Link>
          </div>
        </section>

        {/* Similar Startups Section */}
        {similarStartups.length > 0 && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-3xl font-bold">Startups Solving Similar Problems</h2>
              <div className="group w-10 h-10 sm:w-12 sm:h-12 border-2 border-white/50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white">
                <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 transition-all duration-300 group-hover:text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {similarStartups.map((s) => (
                <Link key={s.id} href={`/startup/${s.id}`}>
                  <div
                    className="group w-full h-[272px] bg-white/5 border-[2.13px] border-[#FFFFFF] rounded-[25px] p-3 flex flex-col gap-y-4 transition-all duration-300 ease-in-out hover:scale-105 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20"
                  >
                    <div className="relative w-full h-[176px]">
                      <Image
                        src={getAbsoluteUrl(s.thumbnail_url)}
                        alt={s.startup_name}
                        fill
                        className="rounded-[18px] object-cover"
                      />
                      {s.is_incubation && s.incubation_id && (
                        <span className="absolute top-3 left-3 bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold animate-glow">
                          Incubation
                        </span>
                      )}
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
              ))}
              <div
                className="group w-full h-[272px] bg-white/5 border-[2.13px] border-[#FFFFFF] rounded-[25px] p-4 flex flex-col items-center justify-center gap-y-5 text-center transition-all duration-300 ease-in-out hover:scale-105 hover:border-purple-500 hover:bg-purple-500/10 hover:shadow-2xl hover:hover:shadow-purple-500/20"
              >
                <h3 className="text-white text-xl sm:text-2xl font-semibold">
                  Still Curious? We Got More
                </h3>
                <Button className="bg-purple-600 text-white rounded-full px-6 py-5 sm:px-8 sm:py-6 text-sm sm:text-base font-bold transition-all duration-300 hover:bg-purple-700 hover:scale-105">
                  Buy Premium
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Free Training Series Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-3xl font-bold">Free Training Series</h2>
            <div className="group w-10 h-10 sm:w-12 sm:h-12 border-2 border-white/50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white">
              <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 transition-all duration-300 group-hover:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trainingSeries.map((item, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-[25px] border border-white/10 flex flex-col gap-4">
                <div className="relative w-full h-[176px] rounded-[18px] overflow-hidden">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-3">{item.description}</p>
                  <div className="flex items-center gap-2">
                    <Image src={item.authorImage} alt={item.author} width={32} height={32} className="rounded-full" />
                    <span className="text-gray-300 text-sm">{item.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}