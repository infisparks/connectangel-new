"use client"

import { ArrowRightIcon, MapPinIcon, CalendarIcon, UsersIcon, ExternalLinkIcon, ClockIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Enhanced dummy data with more realistic information
const events = [
  {
    id: 1,
    title: "CodeSprint '25: Dev Edition",
    organizer: "NovaCode Labs",
    organizerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    location: "Bengaluru, India",
    timeAgo: "23 hrs ago",
    eventImage: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop",
    attendees: 247,
    category: "Development",
    date: "Mar 15, 2025",
    isLive: true,
    featured: true,
  },
  {
    id: 2,
    title: "AI & The Future of Design",
    organizer: "Pixel Perfect Inc.",
    organizerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    location: "San Francisco, USA",
    timeAgo: "1 day ago",
    eventImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop",
    attendees: 189,
    category: "AI/ML",
    date: "Mar 20, 2025",
    isLive: false,
    featured: false,
  },
  {
    id: 3,
    title: "Web3 Innovators Summit",
    organizer: "CryptoChain Co.",
    organizerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    location: "Dubai, UAE",
    timeAgo: "2 days ago",
    eventImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop",
    attendees: 312,
    category: "Blockchain",
    date: "Mar 25, 2025",
    isLive: false,
    featured: true,
  },
  {
    id: 4,
    title: "The UX/UI Masterclass",
    organizer: "Creative Minds",
    organizerImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    location: "London, UK",
    timeAgo: "3 days ago",
    eventImage: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=250&fit=crop",
    attendees: 156,
    category: "Design",
    date: "Apr 2, 2025",
    isLive: false,
    featured: false,
  },
  {
    id: 5,
    title: "Startup Pitch Night",
    organizer: "Venture Hub",
    organizerImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
    location: "Online",
    timeAgo: "5 days ago",
    eventImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop",
    attendees: 89,
    category: "Startup",
    date: "Apr 8, 2025",
    isLive: false,
    featured: false,
  },
  {
    id: 6,
    title: "Cloud Computing Expo",
    organizer: "Serverless Solutions",
    organizerImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    location: "Berlin, Germany",
    timeAgo: "1 week ago",
    eventImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
    attendees: 445,
    category: "Cloud",
    date: "Apr 15, 2025",
    isLive: false,
    featured: true,
  },
];

const categoryColors = {
  Development: "from-blue-500 to-cyan-400",
  "AI/ML": "from-purple-500 to-pink-400",
  Blockchain: "from-yellow-500 to-orange-400",
  Design: "from-green-500 to-teal-400",
  Startup: "from-red-500 to-pink-400",
  Cloud: "from-indigo-500 to-purple-400",
};

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
        threshold: 0.6,
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

  const handleRegisterClick = (eventId: number) => {
    router.push(`/events/${eventId}/register`)
  }

  return (
    <section 
      id="events" 
      className="relative w-full py-16 lg:py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:gap-16">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <h2 
                className="font-black text-white text-4xl lg:text-6xl xl:text-7xl leading-tight tracking-tight"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Trending
                </span>{" "}
                Events
              </h2>
              <p
                className="text-white/70 text-sm sm:text-base lg:text-lg max-w-md"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Discover amazing events happening in your tech community
              </p>
            </div>
            
            <div>
              <Button
                variant="ghost"
                className="group text-white/90 flex items-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg hover:text-white transition-all duration-300 hover:bg-white/10 rounded-full px-4 sm:px-6 py-2 sm:py-3 backdrop-blur-sm border border-white/20 hover:border-white/40"
                onClick={handleExploreClick}
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Explore More
                <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Events Scrollable Container */}
          <div>
            <div
              ref={scrollRef}
              className="flex overflow-x-auto gap-4 sm:gap-6 lg:gap-8 pb-4 sm:pb-6 scroll-smooth snap-x snap-mandatory"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {events.map((event, index) => (
                <div
                  key={event.id}
                  ref={(el) => (cardRefs.current[index] = el)}
                  className="group flex-shrink-0 snap-center"
                  style={{ width: "min(340px, 85vw)" }}
                >
                  <div className="relative h-full">
                    {/* Card Container */}
                    <div
                      className="relative h-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 group-hover:border-white/20 overflow-hidden shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl"
                    >
                      {/* Featured Badge */}
                      {event.featured && (
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg">
                            Featured
                          </div>
                        </div>
                      )}

                      {/* Live Indicator */}
                      {event.isLive && (
                        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20">
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-red-500/90 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                            LIVE
                          </div>
                        </div>
                      )}

                      <div className="p-4 sm:p-5 lg:p-6 flex flex-col h-full min-h-[420px] sm:min-h-[450px] lg:min-h-[480px]">
                        {/* Event Image */}
                        <div className="relative w-full h-32 sm:h-40 lg:h-48 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-5">
                          <Image
                            src={event.eventImage}
                            alt={event.title}
                            fill
                            className="object-cover transition-all duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 340px, 340px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          
                          {/* Category Badge */}
                          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                            <div className={`bg-gradient-to-r ${categoryColors[event.category as keyof typeof categoryColors]} text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow-lg backdrop-blur-sm`}>
                              {event.category}
                            </div>
                          </div>
                        </div>

                        {/* Event Title */}
                        <h3 
                          className="font-bold text-white text-lg sm:text-xl lg:text-2xl leading-tight mb-3 sm:mb-4 line-clamp-2"
                          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                        >
                          {event.title}
                        </h3>

                        {/* Event Details */}
                        <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-5">
                          <div className="flex items-center gap-2 text-white/80">
                            <CalendarIcon className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/80">
                            <MapPinIcon className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/80">
                            <UsersIcon className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium">{event.attendees} attending</span>
                          </div>
                        </div>

                        {/* Organizer Info */}
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-white/20">
                            <Image
                              src={event.organizerImage}
                              alt={event.organizer}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm sm:text-base truncate">{event.organizer}</p>
                            <div className="flex items-center gap-1 text-white/60">
                              <ClockIcon className="w-3 h-3" />
                              <span className="text-xs">{event.timeAgo}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-auto">
                          <Button 
                            className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group"
                            onClick={() => handleRegisterClick(event.id)}
                            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                          >
                            Register Now
                            <ExternalLinkIcon className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Hide scrollbar */}
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>

          {/* Enhanced Pagination Dots */}
          <div 
            className="flex justify-center items-center gap-2 sm:gap-3 mt-4 sm:mt-6"
          >
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToCard(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === activeIndex 
                    ? "w-8 sm:w-10 h-2 sm:h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg" 
                    : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/30 hover:bg-white/50 hover:scale-110"
                }`}
                aria-label={`Go to event ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}