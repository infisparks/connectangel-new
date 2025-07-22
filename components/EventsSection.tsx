"use client"

import { ArrowRightIcon, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

// New dummy data with 6 events to match the request
const events = [
  {
    title: "CodeSprint '25: Dev Edition",
    organizer: "NovaCode Labs",
    organizerImage: "https://placehold.co/40x40/ffffff/8700ff?text=N",
    location: "Bengaluru, India",
    timeAgo: "23 hrs ago",
    eventImage: "https://placehold.co/347x200/2d3748/ffffff?text=Event+1",
  },
  {
    title: "AI & The Future of Design",
    organizer: "Pixel Perfect Inc.",
    organizerImage: "https://placehold.co/40x40/ffffff/8700ff?text=P",
    location: "San Francisco, USA",
    timeAgo: "1 day ago",
    eventImage: "https://placehold.co/347x200/4a5568/ffffff?text=Event+2",
  },
  {
    title: "Web3 Innovators Summit",
    organizer: "CryptoChain Co.",
    organizerImage: "https://placehold.co/40x40/ffffff/8700ff?text=C",
    location: "Dubai, UAE",
    timeAgo: "2 days ago",
    eventImage: "https://placehold.co/347x200/718096/ffffff?text=Event+3",
  },
  {
    title: "The UX/UI Masterclass",
    organizer: "Creative Minds",
    organizerImage: "https://placehold.co/40x40/ffffff/8700ff?text=C",
    location: "London, UK",
    timeAgo: "3 days ago",
    eventImage: "https://placehold.co/347x200/a0aec0/ffffff?text=Event+4",
  },
  {
    title: "Startup Pitch Night",
    organizer: "Venture Hub",
    organizerImage: "https://placehold.co/40x40/ffffff/8700ff?text=V",
    location: "Online",
    timeAgo: "5 days ago",
    eventImage: "https://placehold.co/347x200/cbd5e0/ffffff?text=Event+5",
  },
  {
    title: "Cloud Computing Expo",
    organizer: "Serverless Solutions",
    organizerImage: "https://placehold.co/40x40/ffffff/8700ff?text=S",
    location: "Berlin, Germany",
    timeAgo: "1 week ago",
    eventImage: "https://placehold.co/347x200/e2e8f0/000000?text=Event+6",
  },
];


export default function EventsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardRefs.current.indexOf(entry.target as HTMLDivElement)
            if (index !== -1) {
              setActiveIndex(index)
            }
          }
        })
      },
      {
        root: scrollElement,
        rootMargin: "0px",
        threshold: 0.7, // Card is considered active when 70% visible
      },
    )

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [])

  const scrollToCard = (index: number) => {
    if (cardRefs.current[index]) {
      cardRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      })
    }
  }

  const handleExploreClick = () => {
    router.push("/events")
  }

  return (
    <section 
      id="events" 
      className="relative w-full bg-[#1B0E2B] overflow-hidden font-sans"
      style={{
        paddingTop: '40px',
        paddingBottom: '40px',
      }}
    >
      <div 
        className="relative z-10 mx-auto flex flex-col"
        style={{
          maxWidth: '1438px',
          paddingLeft: '41px',
          paddingRight: '41px',
          gap: '30px'
        }}
      >
        {/* Section Header */}
        <div className="flex flex-row items-center justify-between">
          <h2 className="font-bold text-white text-4xl">Latest Events</h2>
          <Button
            variant="link"
            className="text-white flex items-center gap-3 text-lg hover:text-purple-400 transition-colors duration-200"
            onClick={handleExploreClick}
          >
            Explore More
            <ArrowRightIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Events Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto pb-4 scroll-snap-x-mandatory scroll-smooth"
          style={{
            gap: '30px', // Gap between cards
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
          }}
        >
          {events.map((event, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className="group flex-shrink-0 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
              style={{
                width: '367px',
                height: '435.45px',
                backgroundColor: '#FFFFFF1A',
                borderRadius: '22.58px',
                border: '1.13px solid #FFFFFF', // Using 1.13px as requested, can be changed to 2.13px if preferred
                padding: '19px 10px 31.61px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                scrollSnapAlign: 'center',
              }}
            >
              {/* Event Image */}
              <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                 <Image
                    src={event.eventImage}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
              </div>

              {/* Event Title */}
              <h3 
                className="font-semibold text-white text-2xl leading-tight"
                style={{
                  width: '347px',
                  height: '34px',
                }}
              >
                {event.title}
              </h3>

              {/* Organizer Info */}
              <div className="flex items-center gap-3">
                <div 
                  className="relative overflow-hidden"
                  style={{
                    width: '38.23px',
                    height: '39.14px',
                    borderRadius: '142.23px',
                  }}
                >
                  <Image
                    src={event.organizerImage}
                    alt={event.organizer}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white text-base">{event.organizer}</span>
                  <div className="flex items-center gap-1.5 text-gray-400">
                     <MapPinIcon className="w-4 h-4" />
                     <span className="text-sm">{event.location}</span>
                  </div>
                </div>
              </div>

              {/* Action and Time */}
              <div className="flex items-center justify-between mt-auto">
                <Button className="h-12 px-8 bg-[#8700ff] rounded-full font-bold text-base transition-all duration-300 hover:bg-[#7300dd] hover:scale-105">
                  Register
                </Button>
                <span className="font-medium text-white/70 text-sm">{event.timeAgo}</span>
              </div>
            </div>
          ))}
           {/* Hide scrollbar for Chrome/Safari/Opera */}
          <style>{`
            div[ref='scrollRef']::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2.5 mt-4">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToCard(index)}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-6 bg-white" : "bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to event ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
