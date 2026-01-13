"use client"

import { useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { Day, TimeSlot, TimeTableEntry } from "../types"

export const useTimetable = (timetableId: string) => {
  const [timeTable, setTimeTable] = useState<TimeTableEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const initializeTimeTable = useCallback(
    async (classId: string, sectionId: string, days: Day[], timeSlots: TimeSlot[]) => {
      if (!user) {
        console.error("User not authenticated")
        return
      }
      
      setIsLoading(true)

      // Check if timeSlots is empty
      if (!timeSlots || timeSlots.length === 0) {
        console.error("Cannot initialize timetable: time slots are not loaded yet")
        setIsLoading(false)
        return
      }

      // Check if days is empty
      if (!days || days.length === 0) {
        console.error("Cannot initialize timetable: days are not provided")
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
          console.error("Error fetching existing entries:", fetchError)
          setIsLoading(false)
          return
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
          console.warn("No entries to upsert")
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
          console.error("Error initializing timetable:", error)
          console.error("Error details:", JSON.stringify(error, null, 2))
          setIsLoading(false)
          return
        }

        setTimeTable(data || [])
      } catch (error) {
        console.error("Unexpected error initializing timetable:", error)
        if (error instanceof Error) {
          console.error("Error message:", error.message)
          console.error("Error stack:", error.stack)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, timetableId, user],
  )

  const fetchTimetable = useCallback(
    async (classId: string, sectionId: string) => {
      if (!user) {
        console.error("User not authenticated")
        return
      }
      
      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from("timetableentries")
          .select("*")
          .eq("user_id", user.id)
          .eq("timetable_id", timetableId)
          .eq("class_id", classId)
          .eq("section_id", sectionId)

        if (error) {
          console.error("Error fetching timetable:", error)
          setIsLoading(false)
          return
        }

        setTimeTable(data || [])
      } catch (error) {
        console.error("Unexpected error fetching timetable:", error)
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
        console.error("User not authenticated")
        return
      }
      
      setIsLoading(true)

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
          console.error("Error updating teacher in timetable:", error)
          setIsLoading(false)
          return
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
      } catch (error) {
        console.error("Unexpected error updating teacher in timetable:", error)
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
        console.error("User not authenticated")
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
          console.error("Error checking teacher conflict:", error)
          return false
        }

        return data
      } catch (error) {
        console.error("Unexpected error checking teacher conflict:", error)
        return false
      }
    },
    [supabase, user],
  )

  return {
    timeTable,
    isLoading,
    initializeTimeTable,
    fetchTimetable,
    updateTeacherInTimeTable,
    clearTimeTable,
    checkTeacherConflict, // Add this line
  }
}

