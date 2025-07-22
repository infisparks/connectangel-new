// lib/data.ts
import IndiaImg from "@/public/img/country/india.png"
import PakistanImg from "@/public/img/country/pakistan.png"
import MalaysiaImg from "@/public/img/country/Malaysia.png"
import PhilippinesImg from "@/public/img/country/Philippines.png"
import UAEImg from "@/public/img/country/UAE.png"
import CanadaImg from "@/public/img/country/Canada.png"
import IranImg from "@/public/img/country/Iran.png"

import StartupsImg from "@/public/img/categories/startups.png"
import TechnologyImg from "@/public/img/categories/incubator.png"
import BusinessImg from "@/public/img/categories/venture-captital.png"
import InnovationImg from "@/public/img/categories/angel-investors.png"

// New domain images
import AIMLImg from "@/public/img/domain/deep-tech.png"
import BlockchainWeb3Img from "@/public/img/domain/IT.png"
import FinTechSolutionsImg from "@/public/img/domain/drone-tech.png"
import HealthTechInnovationImg from "@/public/img/domain/agriculture.png"



export const countries = [
  { name: "India", image: IndiaImg },
  { name: "Pakistan", image: PakistanImg },
  { name: "Malaysia", image: MalaysiaImg },
  { name: "Philippines", image: PhilippinesImg },
  { name: "UAE", image: UAEImg },
  { name: "Canada", image: CanadaImg },
  { name: "Iran", image: IranImg },
  // Add more countries here if needed
  { name: "Germany", image: IndiaImg },
  { name: "France", image: PakistanImg },
  { name: "Japan", image: MalaysiaImg },
]

export const categories = [
  { name: "Startups", image: StartupsImg },
  { name: "Technology", image: TechnologyImg },
  { name: "Business", image: BusinessImg },
  { name: "Innovation", image: InnovationImg },
   // Add more categories here if needed
  { name: "Finance", image: StartupsImg },
  { name: "Healthcare", image: TechnologyImg },
  { name: "Education", image: BusinessImg },
  { name: "Environment", image: InnovationImg },
  
]

export const domains = [
  {
    title: "AI & Machine Learning",
    image: AIMLImg,
  },
  {
    title: "Blockchain & Web3",
    image: BlockchainWeb3Img,
  },
  {
    title: "FinTech Solutions",
    image: FinTechSolutionsImg,
  },
  {
    title: "HealthTech Innovation",
    image: HealthTechInnovationImg,
  },
  // Add more domains here if needed
  {
    title: "Cybersecurity",
    image: AIMLImg, // Placeholder
  },
  {
    title: "Biotechnology",
    image: BlockchainWeb3Img, // Placeholder
  },
]

export const events = [
  {
    title: "CodeSprint '25: Dev Edition",
    organizer: "NovaCode Labs",
    location: "Bengaluru, India",
    organizerImage:
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  {
    title: "Startup Unplugged: Founder's Q&A",
    organizer: "LeapNest Ventures",
    location: "Mumbai, India",
    organizerImage:
      "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  {
    title: "TechBridge: AI for Impact",
    organizer: "MindMesh Technologies",
    location: "Nairobi, Kenya",
    organizerImage:
      "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  {
    title: "ScaleUp Summit: Growth Hacking 101",
    organizer: "GrowthPath Systems",
    location: "Austin, USA",
    organizerImage:
      "https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  {
    title: "Women Who Build: Innovation Fair",
    organizer: "SheStarts Network",
    location: "Delhi, India",
    organizerImage:
      "https://images.pexels.com/photos/3861458/pexels-photo-3861458.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  {
    title: "UX Ignite: Design Thinking for Startups",
    organizer: "PixelPulse Studio",
    location: "Berlin, Germany",
    organizerImage:
      "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "23 hrs ago",
  },
  // Add more events here if needed
  {
    title: "Future of AI Conference",
    organizer: "AI Innovators",
    location: "San Francisco, USA",
    organizerImage:
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "1 day ago",
  },
  {
    title: "Blockchain Dev Summit",
    organizer: "Web3 Builders",
    location: "London, UK",
    organizerImage:
      "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop",
    timeAgo: "2 days ago",
  },
]
