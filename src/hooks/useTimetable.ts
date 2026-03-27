"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { Day, TimeSlot, TimeTableEntry } from "../types"

export const useTimetable = (timetableId: string) => {
  const [timeTable, setTimeTable] = useState<TimeTableEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const { user } = useAuth()
  
  // Lazy initialize Supabase client only once
  if (!supabaseRef.current) {
    supabaseRef.current = createClient()
  }
  const supabase = supabaseRef.current

  const initializeTimeTable = useCallback(
    async (classId: string, sectionId: string, days: Day[], timeSlots: TimeSlot[]) => {
      if (!user) {
        setError("User not authenticated")
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      setError(null)

      // Check if timeSlots is empty
      if (!timeSlots || timeSlots.length === 0) {
        setError("Cannot initialize timetable: time slots are not loaded yet")
        setIsLoading(false)
        return
      }

      // Check if days is empty
      if (!days || days.length === 0) {
        setError("Cannot initialize timetable: days are not provided")
        setIsLoading(false)
        return
      }

      try {
        // First, fetch existing entries
        const { data: existingEntries, error: fetchError } = await supabase
          .from("timetableentries")
          .select("*")
          .eq("user_id", user.id)
          .eq("timetable_id", timetableId)
          .eq("class_id", classId)
          .eq("section_id", sectionId)

        if (fetchError) {
          throw fetchError
        }

        // Create map of existing entries for quick lookup
        const existingEntriesMap = new Map(
          existingEntries?.map((entry) => [`${entry.day_id}-${entry.time_slot_id}`, entry]),
        )

        // Create or update entries
        const entriesToUpsert = days.flatMap((day) =>
          timeSlots.map((timeSlot) => {
            const key = `${day.id}-${timeSlot.id}`
            const existing = existingEntriesMap.get(key)
            return {
              user_id: user.id,
              timetable_id: timetableId,
              class_id: classId,
              section_id: sectionId,
              day_id: day.id,
              time_slot_id: timeSlot.id,
              teacher_id: existing?.teacher_id || null,
              subject_id: existing?.subject_id || null,
            }
          }),
        )

        // Don't upsert if there are no entries to create
        if (entriesToUpsert.length === 0) {
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("timetableentries")
          .upsert(entriesToUpsert, {
            onConflict: "user_id,timetable_id,class_id,section_id,day_id,time_slot_id",
          })
          .select()

        if (error) {
          throw error
        }

        setTimeTable(data || [])
      } catch (err: any) {
        console.error("Error initializing timetable:", err)
        setError(err.message || "Failed to initialize timetable")
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, timetableId, user],
  )

  const fetchTimetable = useCallback(
    async (classId: string, sectionId: string) => {
      if (!user) {
        setError("User not authenticated")
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from("timetableentries")
          .select("*")
          .eq("user_id", user.id)
          .eq("timetable_id", timetableId)
          .eq("class_id", classId)
          .eq("section_id", sectionId)

        if (error) {
          throw error
        }

        setTimeTable(data || [])
      } catch (err: any) {
        console.error("Error fetching timetable:", err)
        setError(err.message || "Failed to fetch timetable")
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, timetableId, user],
  )

    const updateTeacherInTimeTable = useCallback(
    async (
      teacherId: string,
      subjectId: string,
      classId: string,
      sectionId: string,
      timeSlotId: string,
      dayId: number,
    ) => {
      if (!user) {
        setError("User not authenticated")
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from("timetableentries")
          .upsert(
            {
              user_id: user.id,
              timetable_id: timetableId,
              class_id: classId,
              section_id: sectionId,
              day_id: dayId,
              time_slot_id: timeSlotId,
              teacher_id: teacherId,
              subject_id: subjectId,
            },
            { onConflict: "user_id,timetable_id,class_id,section_id,day_id,time_slot_id" },
          )
          .select()
          .single()

        if (error) {
          throw error
        }

        // Update the local state
        setTimeTable((prevTimeTable) =>
          prevTimeTable.map((entry) =>
            entry.class_id === classId &&
            entry.section_id === sectionId &&
            entry.day_id === dayId &&
            entry.time_slot_id === timeSlotId
              ? data
              : entry,
          ),
        )

        // Fetch the latest data to ensure consistency
        await fetchTimetable(classId, sectionId)
      } catch (err: any) {
        console.error("Error updating teacher in timetable:", err)
        setError(err.message || "Failed to update teacher in timetable")
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, fetchTimetable, user],
  )

  const clearTimeTable = useCallback(() => {
    setTimeTable([])
  }, [])

  // Add this new function inside the useTimetable hook
  const checkTeacherConflict = useCallback(
    async (teacherId: string, classId: string, sectionId: string, timeSlotId: string, dayId: number) => {
      if (!user) {
        setError("User not authenticated")
        return false
      }

      try {
        const { data, error } = await supabase.rpc("check_teacher_conflict", {
          p_teacher_id: teacherId,
          p_class_id: classId,
          p_section_id: sectionId,
          p_time_slot_id: timeSlotId,
          p_day_id: dayId,
        })

        if (error) {
          throw error
        }

        return data
      } catch (err: any) {
        console.error("Error checking teacher conflict:", err)
        setError(err.message || "Failed to check teacher conflict")
        return false
      }
    },
    [supabase, user],
  )

  return {
    timeTable,
    isLoading,
    error,
    initializeTimeTable,
    fetchTimetable,
    updateTeacherInTimeTable,
    clearTimeTable,
    checkTeacherConflict, // Add this line
  }
}

