"use client"

import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaselib";
import { useEffect, useState } from "react";
import Link from "next/link";
import Head from 'next/head'; // Import Head for custom CSS

// Define the type for the startup data
interface Startup {
  id: string;
  startup_name: string;
  country: string | null;
  thumbnail_url: string | null;
  is_incubation: boolean;
  incubation_id: string | null;
  rating: number | null;
  incubator_accelerator_name: string | null;
}

// Helper function to get the absolute URL from a relative path
const getAbsoluteUrl = (path: string | null | undefined): string => {
  if (!path) {
    return "https://placehold.co/292x176";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
    return "https://placehold.co/292x176";
  }
  const fullUrl = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  return fullUrl;
};

// Function to get a dummy flag URL based on the country
const getFlagUrl = (country: string | null) => {
  if (!country) return "https://placehold.co/17x17/000000/ffffff?text=?";
  const countryCode = country.substring(0, 1).toUpperCase();
  return `https://placehold.co/17x17/cccccc/333333?text=${countryCode}`;
};

export default function StartupSection() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTopStartups() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("creator")
          .select(`
            id,
            startup_name,
            country,
            thumbnail_url,
            is_incubation,
            incubation_id,
            rating,
            incubation:incubation_id (
              incubator_accelerator_name
            )
          `)
          .eq("status", "approved")
          .order("rating", { ascending: false })
          .limit(3);

        if (error) {
          throw error;
        }

        if (data) {
          const formattedData = data.map(item => ({
            id: item.id,
            startup_name: item.startup_name,
            country: item.country,
            thumbnail_url: item.thumbnail_url,
            is_incubation: item.is_incubation,
            incubation_id: item.incubation_id,
            rating: item.rating,
            incubator_accelerator_name: (item.incubation as any)?.incubator_accelerator_name || null
          }));
          setStartups(formattedData as Startup[]);
        }
      } catch (error) {
        console.error("Error fetching top startups:", error);
      } finally {
        setLoading(false);
      }
    }

    getTopStartups();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#1B0E2B] w-full py-8 font-sans">
        <div className="max-w-[1438px] mx-auto px-10 flex flex-col gap-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-4xl font-bold">Top Startups</h2>
            <div className="group w-12 h-12 border-2 border-white/50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white">
              <ArrowRightIcon className="w-6 h-6 text-white/80 transition-all duration-300 group-hover:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <p className="text-white">Loading startups...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#1B0E2B] w-full py-8 font-sans">
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
      <div className="max-w-[1438px] mx-auto px-10 flex flex-col gap-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-4xl font-bold">Top Startups</h2>
          <Link href="/allstartup" className="group w-12 h-12 border-2 border-white/50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white">
            <ArrowRightIcon className="w-6 h-6 text-white/80 transition-all duration-300 group-hover:text-white" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {startups.map((startup) => (
            <Link key={startup.id} href={`/startup/${startup.id}`}>
              <div
                className="group w-[316px] h-[272px] bg-white/5 border-[2.13px] border-[#FFFFFF] rounded-[25px] p-3 flex flex-col gap-y-4 transition-all duration-300 ease-in-out hover:scale-105 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
              >
                <div className="relative w-full h-[176px]">
                  <Image
                    src={getAbsoluteUrl(startup.thumbnail_url)}
                    alt={startup.startup_name}
                    fill
                    className="rounded-[18px] object-cover"
                  />
                  {startup.is_incubation && (
                    <span className="absolute top-3 left-3 bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold animate-glow">
                      {startup.incubator_accelerator_name || "Incubation"}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-y-2 px-1">
                  <h3 className="text-white font-semibold text-xl truncate">
                    {startup.startup_name}
                  </h3>
                  <div className="flex items-center gap-x-2">
                    <Image
                      src={getFlagUrl(startup.country)}
                      alt={`${startup.country} flag`}
                      width={17}
                      height={17}
                      className="rounded-full"
                    />
                    <span className="text-gray-400 text-sm">
                      {startup.country || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          <div
            className="group w-[316px] h-[272px] bg-white/5 border-[2.13px] border-[#FFFFFF] rounded-[25px] p-4 flex flex-col items-center justify-center gap-y-5 text-center transition-all duration-300 ease-in-out hover:scale-105 hover:border-purple-500 hover:bg-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20"
          >
            <h3 className="text-white text-2xl font-semibold">
              Still Curious? We Got More
            </h3>
            <Button className="bg-purple-600 text-white rounded-full px-8 py-6 text-base font-bold transition-all duration-300 hover:bg-purple-700 hover:scale-105">
              Buy Premium
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}