"use server"

import { supabase } from "@/lib/supabaselib"
import { revalidatePath } from "next/cache"

// Define a type for the creator_approval data for better type safety
export type CreatorApproval = {
  id: string
  user_id: string
  startup_type: string | null
  startup_name: string
  description: string | null
  location: string | null
  language: string | null
  domain: string | null
  founder_names: string[] | null
  pitch_video_url: string | null
  status: string
  created_at: string
  updated_at: string
  thumbnail_url: string | null
}

/**
 * Fetches all pending creator approval requests.
 */
export async function getPendingApprovals(): Promise<{ data: CreatorApproval[] | null; error: string | null }> {
  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { data: null, error: "User not authenticated." }
  }

  // Basic admin check: In a real app, you'd check user roles here.
  // For this example, we'll just proceed if authenticated.
  // You might want to add a 'role' column to your public.users table and check it.

  const { data, error } = await supabase
    .from("creator_approval")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching pending approvals:", error)
    return { data: null, error: error.message }
  }

  return { data: data as CreatorApproval[], error: null }
}

/**
 * Approves a creator request, moving data to the creator table and updating status.
 */
export async function approveCreator(approvalId: string): Promise<{ success: boolean; message: string }> {
  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, message: "User not authenticated." }
  }

  // Fetch the approval request details
  const { data: approvalData, error: fetchError } = await supabase
    .from("creator_approval")
    .select("*")
    .eq("id", approvalId)
    .single()

  if (fetchError || !approvalData) {
    console.error("Error fetching approval data:", fetchError)
    return { success: false, message: fetchError?.message || "Approval request not found." }
  }

  if (approvalData.status !== "pending") {
    return { success: false, message: "This request is not pending approval." }
  }

  // Insert into public.creator table
  const { error: insertError } = await supabase.from("creator").upsert(
    {
      user_id: approvalData.user_id,
      startup_type: approvalData.startup_type,
      startup_name: approvalData.startup_name,
      description: approvalData.description,
      location: approvalData.location,
      language: approvalData.language,
      domain: approvalData.domain,
      founder_names: approvalData.founder_names,
      pitch_video_url: approvalData.pitch_video_url,
      thumbnail_url: approvalData.thumbnail_url,
      approved_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  ) // Use upsert in case a user somehow gets multiple pending requests

  if (insertError) {
    console.error("Error inserting into creator table:", insertError)
    return { success: false, message: `Failed to add creator: ${insertError.message}` }
  }

  // Update status in creator_approval table
  const { error: updateError } = await supabase
    .from("creator_approval")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", approvalId)

  if (updateError) {
    console.error("Error updating approval status:", updateError)
    // Consider rolling back the insert if this fails, though not strictly transactional here.
    return { success: false, message: `Failed to update approval status: ${updateError.message}` }
  }

  revalidatePath("/admin") // Revalidate the admin page to show updated list
  return { success: true, message: "Creator approved successfully!" }
}
