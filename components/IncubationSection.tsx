"use client"

import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaselib";

// Define a type for the incubation data fetched from Supabase
interface IncubationData {
  id: string;
  incubator_accelerator_name: string;
  country: string;
  logo_url?: string;
  thumbnail_url?: string; // thumbnail_url is used for fallback
}

// Function to construct a public URL from the database path
const getPublicImageUrl = (path: string | undefined) => {
  if (!path) return undefined;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
    return undefined;
  }
  return `${supabaseUrl}${path}`;
};

export default function IncubationSection() {
  const [incubations, setIncubations] = useState<IncubationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncubations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('incubation')
        // Select both logo_url and thumbnail_url
        .select('id, incubator_accelerator_name, country, logo_url, thumbnail_url')
        .limit(3);

      if (error) {
        console.error("Error fetching incubations:", error);
        setLoading(false);
        return;
      }

      const formattedData = data.map(inc => ({
        id: inc.id,
        incubator_accelerator_name: inc.incubator_accelerator_name,
        country: inc.country,
        // This is the key part: It tries logo_url first.
        // If logo_url is null or empty in your database, it falls back to thumbnail_url.
        logo_url: getPublicImageUrl(inc.logo_url || inc.thumbnail_url),
      }));

      setIncubations(formattedData);
      setLoading(false);
    };

    fetchIncubations();
  }, []);

  const getFlagUrl = (country: string) => {
    return `https://flagsapi.com/${country.toUpperCase()}/flat/17.png`;
  };

  return (
    <section className="bg-[#1B0E2B] w-full py-8 font-sans">
      <div className="max-w-[1438px] mx-auto px-10 flex flex-col gap-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-4xl font-bold">Top Incubations</h2>
          <div className="group w-12 h-12 border-2 border-white/50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white">
            <ArrowRightIcon className="w-6 h-6 text-white/80 transition-all duration-300 group-hover:text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="text-white text-lg col-span-full text-center">Loading incubations...</div>
          ) : (
            incubations.map((incubation) => (
              <div
                key={incubation.id}
                className="group w-[316px] h-[272px] bg-white/5 border-[2.13px] border-[#FFFFFF] rounded-[25px] p-3 flex flex-col gap-y-4 transition-all duration-300 ease-in-out hover:scale-105 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20"
              >
                <div className="relative w-full h-[176px]">
                  {incubation.logo_url ? (
                    <Image
                      src={incubation.logo_url}
                      alt={incubation.incubator_accelerator_name}
                      fill
                      className="rounded-[18px] object-cover"
                    />
                  ) : (
                    <div className="rounded-[18px] w-full h-full bg-gray-700 flex items-center justify-center text-white/50 text-center">
                      No Logo
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-y-2 px-1">
                  <h3 className="text-white font-semibold text-xl truncate">
                    {incubation.incubator_accelerator_name}
                  </h3>
                  <div className="flex items-center gap-x-2">
                    <Image
                      src={getFlagUrl(incubation.country)}
                      alt={`${incubation.country} flag`}
                      width={17}
                      height={17}
                      className="rounded-full"
                    />
                    <span className="text-gray-400 text-sm">
                      {incubation.country}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

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