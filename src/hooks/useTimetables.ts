"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { Timetable } from "../types"

// Helper function to set up default data for a new timetable
async function setupDefaultTimetableData(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  timetableId: string,
) {
  try {
    // 1. Ensure Class 1 exists, create if not
    let { data: classData } = await supabase
      .from("classes")
      .select("*")
      .eq("user_id", userId)
      .eq("name", "Class 1")
      .single()

    if (!classData) {
      const { data: newClass, error: classError } = await supabase
        .from("classes")
        .insert({ name: "Class 1", user_id: userId })
        .select()
        .single()

      if (classError) throw classError
      classData = newClass
    }

    // 2. Ensure Section A exists for Class 1, create if not
    let { data: sectionData } = await supabase
      .from("sections")
      .select("*")
      .eq("user_id", userId)
      .eq("class_id", classData.id)
      .eq("name", "Section A")
      .single()

    if (!sectionData) {
      const { data: newSection, error: sectionError } = await supabase
        .from("sections")
        .insert({ name: "Section A", class_id: classData.id, user_id: userId })
        .select()
        .single()

      if (sectionError) throw sectionError
      sectionData = newSection
    }

    // 3. Ensure we have at least 2 subjects, create if needed
    let { data: subjectsData } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", userId)
      .limit(2)

    if (!subjectsData || subjectsData.length < 2) {
      const existingSubjectNames = subjectsData?.map((s) => s.name) || []
      const defaultSubjects = [
        { name: "Mathematics", user_id: userId },
        { name: "English", user_id: userId },
      ].filter((s) => !existingSubjectNames.includes(s.name))

      if (defaultSubjects.length > 0) {
        const { data: newSubjects, error: subjectsError } = await supabase
          .from("subjects")
          .insert(defaultSubjects)
          .select()

        if (subjectsError) throw subjectsError
        subjectsData = [...(subjectsData || []), ...(newSubjects || [])]
      }
    }

    // 4. Ensure we have at least 3 teachers, create if needed
    let { data: teachersData } = await supabase
      .from("teachers")
      .select("*")
      .eq("user_id", userId)
      .limit(3)

    if (!teachersData || teachersData.length < 3) {
      const existingTeacherCount = teachersData?.length || 0
      const neededTeachers = 3 - existingTeacherCount
      const subjectIds = subjectsData?.slice(0, 2).map((s) => s.id) || []

      if (subjectIds.length > 0) {
        const newTeachers = Array.from({ length: neededTeachers }, (_, i) => ({
          name: `Teacher ${existingTeacherCount + i + 1}`,
          subject_id: subjectIds[i % subjectIds.length],
          user_id: userId,
        }))

        if (newTeachers.length > 0) {
          const { data: createdTeachers, error: teachersError } = await supabase
            .from("teachers")
            .insert(newTeachers)
            .select()

          if (teachersError) throw teachersError
          teachersData = [...(teachersData || []), ...(createdTeachers || [])]
        }
      }
    }

    // 5. Ensure we have 7 time slots, create if needed
    let { data: timeSlotsData } = await supabase
      .from("timeslots")
      .select("*")
      .eq("user_id", userId)
      .order("start_time")

    const defaultTimeSlots = [
      { start_time: "8:00 AM", end_time: "9:00 AM" },
      { start_time: "9:00 AM", end_time: "10:00 AM" },
      { start_time: "10:00 AM", end_time: "11:00 AM" },
      { start_time: "11:00 AM", end_time: "12:00 PM" },
      { start_time: "12:00 PM", end_time: "1:00 PM" },
      { start_time: "1:00 PM", end_time: "2:00 PM" },
      { start_time: "2:00 PM", end_time: "3:00 PM" },
    ]

    if (!timeSlotsData || timeSlotsData.length < 7) {
      const existingTimeSlots = timeSlotsData || []
      const newTimeSlots = defaultTimeSlots
        .filter(
          (ts) =>
            !existingTimeSlots.some(
              (ets) => ets.start_time === ts.start_time && ets.end_time === ts.end_time,
            ),
        )
        .slice(0, 7 - existingTimeSlots.length)
        .map((ts) => ({ ...ts, user_id: userId }))

      if (newTimeSlots.length > 0) {
        const { data: createdTimeSlots, error: timeSlotsError } = await supabase
          .from("timeslots")
          .insert(newTimeSlots)
          .select()

        if (timeSlotsError) throw timeSlotsError
        timeSlotsData = [...existingTimeSlots, ...(createdTimeSlots || [])]
      }
    }

      // 6. Clean up any existing entries for this timetable first (to prevent old data from appearing)
      // This is important when creating a timetable with the same name as a deleted one
      // Even though it's a new ID, we want to ensure no orphaned entries exist
      const { error: cleanupError } = await supabase
        .from("timetableentries")
        .delete()
        .eq("timetable_id", timetableId)
        .eq("user_id", userId)

      if (cleanupError) {
        console.error("Error cleaning up old timetable entries:", cleanupError)
        // Continue anyway - this is just a cleanup step
      }
      
      // Also clean up any existing settings for this timetable
      const { error: settingsCleanupError } = await supabase
        .from("timetable_settings")
        .delete()
        .eq("timetable_id", timetableId)
        .eq("user_id", userId)

      if (settingsCleanupError) {
        console.error("Error cleaning up old timetable settings:", settingsCleanupError)
        // Continue anyway
      }
      
      // Small delay to ensure deletion completes
      await new Promise(resolve => setTimeout(resolve, 200))

    // 7. Initialize timetable entries for Class 1, Section A
    // Use only Mon-Fri by default (Sat is OFF by default)
    const days = [
      { id: 1, name: "Monday" },
      { id: 2, name: "Tuesday" },
      { id: 3, name: "Wednesday" },
      { id: 4, name: "Thursday" },
      { id: 5, name: "Friday" },
    ]
    
    // Create default timetable settings in database (Mon-Fri ON, Sat OFF)
    // Use upsert to handle case where settings might already exist
    const { error: settingsError } = await supabase
      .from("timetable_settings")
      .upsert({
        timetable_id: timetableId,
        user_id: userId,
        enabled_days: [1, 2, 3, 4, 5], // Mon-Fri by default
        max_lunch_slots: 1,
        lunch_slot_ids: [],
      }, {
        onConflict: "timetable_id,user_id",
      })

    if (settingsError) {
      console.error("Error creating default timetable settings:", settingsError)
      // Continue anyway - settings can be created later via the hook
    }

    const timeSlotsToUse = timeSlotsData?.slice(0, 7) || []
    if (timeSlotsToUse.length === 0) {
      console.warn("No time slots available for initialization")
      return
    }

    // Create all timetable entries
    const entriesToCreate = days.flatMap((day) =>
      timeSlotsToUse.map((timeSlot) => ({
        user_id: userId,
        timetable_id: timetableId,
        class_id: classData.id,
        section_id: sectionData.id,
        day_id: day.id,
        time_slot_id: timeSlot.id,
        teacher_id: null,
        subject_id: null,
      })),
    )

    // Assign first teacher to first cell (Monday, first time slot)
    if (teachersData && teachersData.length > 0 && entriesToCreate.length > 0) {
      const firstTeacher = teachersData[0]
      const firstEntry = entriesToCreate[0]
      firstEntry.teacher_id = firstTeacher.id
      firstEntry.subject_id = firstTeacher.subject_id
    }

    // Insert all entries (using insert instead of upsert since we cleaned up first)
    const { error: entriesError } = await supabase
      .from("timetableentries")
      .insert(entriesToCreate)

    if (entriesError) {
      console.error("Error creating timetable entries:", entriesError)
      // Don't throw, just log - the timetable is created successfully
    }

    console.log("Default timetable data set up successfully")
  } catch (error) {
    console.error("Error in setupDefaultTimetableData:", error)
    // Don't throw - allow timetable creation to succeed even if default data setup fails
  }
}

export const useTimetables = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const fetchTimetables = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("timetables")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching timetables:", error)
        setIsLoading(false)
        return
      }

      setTimetables(data || [])
    } catch (error) {
      console.error("Unexpected error fetching timetables:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user])

  const createTimetable = useCallback(
    async (name: string) => {
      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("timetables")
        .insert([
          {
            user_id: user.id,
            name: name.trim() || "Untitled Timetable",
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating timetable:", error)
        throw error
      }

      // Set up default data in background
      setupDefaultTimetableData(supabase, user.id, data.id).catch((err) => {
        console.error("Error setting up default timetable data:", err)
      })

      setTimetables((prev) => [data, ...prev])
      return data
    },
    [supabase, user],
  )

  const updateTimetable = useCallback(
    async (id: string, name: string) => {
      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("timetables")
        .update({
          name: name.trim() || "Untitled Timetable",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating timetable:", error)
        throw error
      }

      setTimetables((prev) => prev.map((t) => (t.id === id ? data : t)))
      return data
    },
    [supabase, user],
  )

  const deleteTimetable = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error("User not authenticated")
      }

      try {
        // Step 1: Delete ALL timetable entries for this timetable (with user_id filter for security)
        const { error: entriesError } = await supabase
          .from("timetableentries")
          .delete()
          .eq("timetable_id", id)
          .eq("user_id", user.id)

        if (entriesError) {
          console.error("Error deleting timetable entries:", entriesError)
          // Continue even if this fails - try to delete the timetable itself
        }

        // Step 2: Delete timetable settings (enabled days, lunch slots, etc.)
        const { error: settingsError } = await supabase
          .from("timetable_settings")
          .delete()
          .eq("timetable_id", id)
          .eq("user_id", user.id)

        if (settingsError) {
          console.error("Error deleting timetable settings:", settingsError)
          // Continue anyway
        }

        // Step 3: Delete the timetable itself
        const { error } = await supabase
          .from("timetables")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error deleting timetable:", error)
          throw error
        }

        // Step 4: Remove from local state immediately
        setTimetables((prev) => prev.filter((t) => t.id !== id))
        
        // Step 5: Small delay to ensure database operations complete before refetch
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error("Error in deleteTimetable:", error)
        throw error
      }
    },
    [supabase, user],
  )

  useEffect(() => {
    if (user) {
      fetchTimetables()
    }
  }, [user, fetchTimetables])

  return {
    timetables,
    isLoading,
    fetchTimetables,
    createTimetable,
    updateTimetable,
    deleteTimetable,
  }
}
