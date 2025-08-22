"use client"

import { useState, useEffect } from "react"
import { StartupMultiStepForm } from "@/app/startup-registration/startup-multi-step-form"
import { supabase } from "@/lib/supabaselib" // Import supabase client to get user session
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting session:", error.message)
        setLoadingUser(false)
        // Optionally redirect to login if no session
        // router.push("/login")
        return
      }
      if (data.session) {
        setUserId(data.session.user.id)
      } else {
        // Handle case where there's no active session (e.g., redirect to login)
        console.warn("No active Supabase session found.")
        // router.push("/login") // Redirect to login page if no user
      }
      setLoadingUser(false)
    }
    getSession()
  }, [])

  if (loadingUser) {
    return <div className="min-h-screen bg-[#1A0033] text-white flex items-center justify-center">Loading user...</div>
  }

  if (!userId) {
    return <div className="min-h-screen bg-[#1A0033] text-white flex items-center justify-center">Please log in to submit a startup.</div>;
  }

  return (
    <div className="min-h-screen bg-[#1A0033] text-white">
      <StartupMultiStepForm userId={userId} />
    </div>
  )
}