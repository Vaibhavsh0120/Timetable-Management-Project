import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

async function addDefaultDataIfNeeded(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  try {
    // Check if user already has subjects (indicates default data was already added)
    const { data: existingSubjects } = await supabase
      .from("subjects")
      .select("id")
      .eq("user_id", userId)
      .limit(1)

    if (existingSubjects && existingSubjects.length > 0) {
      // Default data already exists
      return
    }

    // Add default subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("subjects")
      .insert([
        { name: "Mathematics", user_id: userId },
        { name: "Physics", user_id: userId },
        { name: "Chemistry", user_id: userId },
        { name: "Biology", user_id: userId },
        { name: "English", user_id: userId },
      ])
      .select()

    if (subjectsError || !subjectsData || subjectsData.length === 0) {
      throw new Error(`Failed to add subjects: ${subjectsError?.message || "Unknown error"}`)
    }

    // Add default teachers
    const { error: teachersError } = await supabase.from("teachers").insert([
      { name: "Teacher 1", subject_id: subjectsData[0].id, user_id: userId },
      { name: "Teacher 2", subject_id: subjectsData[1].id, user_id: userId },
      { name: "Teacher 3", subject_id: subjectsData[2].id, user_id: userId },
      { name: "Teacher 4", subject_id: subjectsData[3].id, user_id: userId },
      { name: "Teacher 5", subject_id: subjectsData[4].id, user_id: userId },
    ])

    if (teachersError) {
      throw new Error(`Failed to add teachers: ${teachersError.message}`)
    }

    // Add default classes
    const { data: classesData, error: classesError } = await supabase
      .from("classes")
      .insert([
        { name: "Class 1", user_id: userId },
        { name: "Class 2", user_id: userId },
      ])
      .select()

    if (classesError || !classesData || classesData.length === 0) {
      throw new Error(`Failed to add classes: ${classesError?.message || "Unknown error"}`)
    }

    // Add default sections
    const { error: sectionsError } = await supabase.from("sections").insert([
      { name: "Section A", class_id: classesData[0].id, user_id: userId },
      { name: "Section B", class_id: classesData[0].id, user_id: userId },
      { name: "Section A", class_id: classesData[1].id, user_id: userId },
      { name: "Section B", class_id: classesData[1].id, user_id: userId },
    ])

    if (sectionsError) {
      throw new Error(`Failed to add sections: ${sectionsError.message}`)
    }

    // Add default time slots
    const { error: timeSlotsError } = await supabase.from("timeslots").insert([
      { start_time: "8:00 AM", end_time: "9:00 AM", user_id: userId },
      { start_time: "9:00 AM", end_time: "10:00 AM", user_id: userId },
      { start_time: "10:00 AM", end_time: "11:00 AM", user_id: userId },
      { start_time: "11:00 AM", end_time: "12:00 PM", user_id: userId },
      { start_time: "12:00 PM", end_time: "1:00 PM", user_id: userId },
      { start_time: "1:00 PM", end_time: "2:00 PM", user_id: userId },
    ])

    if (timeSlotsError) {
      throw new Error(`Failed to add time slots: ${timeSlotsError.message}`)
    }

    console.log("Default data added successfully for user:", userId)
  } catch (error: any) {
    // Log error but don't block the auth flow
    console.error("Error adding default data in auth callback:", {
      message: error?.message || error?.toString() || "Unknown error",
      details: error?.details || error?.hint || "",
    })
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("Error exchanging code for session:", error)
      // Redirect to login on error
      return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin))
    }

    // If this is a password recovery flow, redirect to reset password page
    if (type === "recovery") {
      return NextResponse.redirect(new URL("/reset-password", requestUrl.origin))
    }

    // After successful email verification, add default data if needed
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Add default data in background (don't wait for it)
      addDefaultDataIfNeeded(supabase, user.id).catch(console.error)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}

