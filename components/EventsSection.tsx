'use client'

import { ArrowRightIcon, MapPinIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

const events = [
  {
    title: "CodeSprint '25: Dev Edition",
    organizer: "NovaCode Labs",
    location: "Bengaluru, India",
    organizerImage: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  {
    title: "Startup Unplugged: Founder's Q&A",
    organizer: "LeapNest Ventures",
    location: "Mumbai, India",
    organizerImage: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  {
    title: "TechBridge: AI for Impact",
    organizer: "MindMesh Technologies",
    location: "Nairobi, Kenya",
    organizerImage: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  {
    title: "ScaleUp Summit: Growth Hacking 101",
    organizer: "GrowthPath Systems",
    location: "Austin, USA",
    organizerImage: "https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  {
    title: "Women Who Build: Innovation Fair",
    organizer: "SheStarts Network",
    location: "Delhi, India",
    organizerImage: "https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  {
    title: "UX Ignite: Design Thinking for Startups",
    organizer: "PixelPulse Studio",
    location: "Berlin, Germany",
    organizerImage: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
]

export default function EventsSection() {
  return (
    <section id="events" className="py-8 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-poppins font-medium text-white text-2xl md:text-3xl lg:text-4xl">
              Events
            </h2>

            <Button
              variant="link"
              className="text-white flex items-center gap-3 font-inter text-lg md:text-xl hover:text-purple-400 transition-colors duration-200 self-start sm:self-center"
            >
              Explore More
              <ArrowRightIcon className="w-6 h-6 md:w-8 md:h-8" />
            </Button>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <Card
                key={index}
                className="glass-effect hover-lift transition-all duration-300 hover:scale-105 border border-white/20"
              >
                <CardContent className="flex flex-col space-y-6 p-6 md:p-8">
                  <div className="flex flex-col space-y-4">
                    <h3 className="font-poppins font-medium text-white text-lg md:text-xl leading-tight">
                      {event.title}
                    </h3>

                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
                        <Image
                          src={event.organizerImage}
                          alt={event.organizer}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-poppins font-medium text-white text-sm md:text-base">
                        {event.organizer}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      <span className="font-poppins font-medium text-white text-sm md:text-base">
                        {event.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button className="h-10 md:h-12 px-4 md:px-6 py-2 bg-[#8700ff] rounded-full font-poppins text-sm md:text-base hover:bg-[#7300dd] transition-all duration-200">
                      Register
                    </Button>
                    <span className="font-inter font-medium text-white/80 text-xs md:text-sm">
                      {event.timeAgo}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}