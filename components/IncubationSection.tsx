"use client"

import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

// Dummy data for the incubations, based on the new image
const incubations = [
  {
    name: "Cerberus",
    country: "Indonesia",
    imageUrl: "https://placehold.co/292x176/e63946/ffffff?text=Cerberus",
    flagUrl: "https://placehold.co/17x17/ff0000/ffffff?text=I",
    tag: "Top Rated",
  },
  {
    name: "Digitya",
    country: "Bahrain",
    imageUrl: "https://placehold.co/292x176/f1faee/000000?text=Digitya",
    flagUrl: "https://placehold.co/17x17/c42a35/ffffff?text=B",
  },
  {
    name: "Pulse",
    country: "Serbia",
    imageUrl: "https://placehold.co/292x176/a8dadc/000000?text=Pulse",
    flagUrl: "https://placehold.co/17x17/003893/ffffff?text=S",
  },
];

export default function IncubationSection() {
  return (
    <section className="bg-[#1B0E2B] w-full py-8 font-sans">
      {/* Main container with max-width for a professional layout */}
      <div className="max-w-[1438px] mx-auto px-10 flex flex-col gap-y-8">
        {/* Section Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-white text-4xl font-bold">Top Incubations</h2>
          <div className="group w-12 h-12 border-2 border-white/50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white">
            <ArrowRightIcon className="w-6 h-6 text-white/80 transition-all duration-300 group-hover:text-white" />
          </div>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Incubation Cards Mapping */}
          {incubations.map((incubation, index) => (
            <div
              key={index}
              // 👇 **BORDER STYLE UPDATED HERE**
              className="group w-[316px] h-[272px] bg-white/5 border-[2.13px] border-[#FFFFFF] rounded-[25px] p-3 flex flex-col gap-y-4 transition-all duration-300 ease-in-out hover:scale-105 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              {/* Image with optional tag */}
              <div className="relative w-full h-[176px]">
                <Image
                  src={incubation.imageUrl}
                  alt={incubation.name}
                  fill
                  className="rounded-[18px] object-cover"
                />
                {incubation.tag && (
                  <span className="absolute top-3 left-3 bg-purple-600/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {incubation.tag}
                  </span>
                )}
              </div>

              {/* Card Info */}
              <div className="flex flex-col gap-y-2 px-1">
                <h3 className="text-white font-semibold text-xl truncate">
                  {incubation.name}
                </h3>
                <div className="flex items-center gap-x-2">
                  <Image
                    src={incubation.flagUrl}
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
          ))}

          {/* "Still Curious" Card */}
          <div
            // 👇 **BORDER STYLE UPDATED HERE**
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
