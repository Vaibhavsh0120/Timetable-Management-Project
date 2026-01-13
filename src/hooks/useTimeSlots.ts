"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { TimeSlot } from "../types"

export const useTimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const fetchTimeSlots = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("timeslots").select("*").eq("user_id", user.id).order("start_time")

      if (error) {
        console.error("Error fetching time slots:", error)
        return
      }

      setTimeSlots(data || [])
    } catch (error) {
      console.error("Error fetching time slots:", error)
    }
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      fetchTimeSlots()
    }
  }, [user, fetchTimeSlots])

  const addTimeSlot = useCallback(
    async (start_time: string, end_time: string) => {
      if (!user) return

      try {
        // Format time to ensure consistent format (hh:mm AM/PM)
        const formattedStartTime = formatTime12Hour(start_time)
        const formattedEndTime = formatTime12Hour(end_time)

        const { data, error } = await supabase
          .from("timeslots")
          .insert({ start_time: formattedStartTime, end_time: formattedEndTime, user_id: user.id })
          .select()
          .single()

        if (error) {
          console.error("Error adding time slot:", error)
          return
        }

        setTimeSlots((prevTimeSlots) => [...prevTimeSlots, data])
      } catch (error) {
        console.error("Error adding time slot:", error)
      }
    },
    [supabase, user],
  )

  const updateTimeSlot = useCallback(
    async (timeSlotId: string, start_time: string, end_time: string, is_lunch?: boolean) => {
      if (!user) return

      try {
        // Format time to ensure consistent format (hh:mm AM/PM)
        const formattedStartTime = formatTime12Hour(start_time)
        const formattedEndTime = formatTime12Hour(end_time)

        const updateData: { start_time: string; end_time: string; is_lunch?: boolean } = {
          start_time: formattedStartTime,
          end_time: formattedEndTime,
        }
        
        if (is_lunch !== undefined) {
          updateData.is_lunch = is_lunch
        }

        const { error } = await supabase
          .from("timeslots")
          .update(updateData)
          .eq("id", timeSlotId)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error updating time slot:", error)
          return
        }

        setTimeSlots((prevTimeSlots) =>
          prevTimeSlots.map((timeSlot) =>
            timeSlot.id === timeSlotId
              ? { ...timeSlot, start_time: formattedStartTime, end_time: formattedEndTime, is_lunch: is_lunch !== undefined ? is_lunch : timeSlot.is_lunch }
              : timeSlot,
          ),
        )
      } catch (error) {
        console.error("Error updating time slot:", error)
      }
    },
    [supabase, user],
  )

  const deleteTimeSlot = useCallback(
    async (timeSlotId: string) => {
      if (!user) return

      try {
        const { error } = await supabase.from("timeslots").delete().eq("id", timeSlotId).eq("user_id", user.id)

        if (error) {
          console.error("Error deleting time slot:", error)
          return
        }

        setTimeSlots((prevTimeSlots) => prevTimeSlots.filter((timeSlot) => timeSlot.id !== timeSlotId))
      } catch (error) {
        console.error("Error deleting time slot:", error)
      }
    },
    [supabase, user],
  )

  // Helper function to ensure consistent 12-hour time format (hh:mm AM/PM)
  const formatTime12Hour = (time: string) => {
    try {
      // If time is already in correct format, return it
      if (/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(time)) {
        return time
      }

      // If time is in HTML input format (HH:mm), convert it to 12-hour format
      const [hours, minutes] = time.split(":")
      const hour = Number.parseInt(hours)
      const ampm = hour >= 12 ? "PM" : "AM"
      const hour12 = hour % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    } catch (error) {
      console.error("Error formatting time:", error)
      return time
    }
  }

  return {
    timeSlots,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    fetchTimeSlots,
  }
}

