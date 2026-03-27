"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { TimeSlot } from "../types"
import { formatTime12Hour } from "@/lib/utils"

export const useTimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const fetchTimeSlots = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from("timeslots").select("*").eq("user_id", user.id).order("start_time")

      if (error) {
        throw error
      }

      setTimeSlots(data || [])
    } catch (err: any) {
      console.error("Error fetching time slots:", err)
      setError(err.message || "Failed to fetch time slots")
    } finally {
      setLoading(false)
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

      setError(null)
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
          throw error
        }

        setTimeSlots((prevTimeSlots) => [...prevTimeSlots, data])
      } catch (err: any) {
        console.error("Error adding time slot:", err)
        setError(err.message || "Failed to add time slot")
        throw err
      }
    },
    [supabase, user],
  )

  const updateTimeSlot = useCallback(
    async (timeSlotId: string, start_time: string, end_time: string, is_lunch?: boolean) => {
      if (!user) return

      setError(null)
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
          throw error
        }

        setTimeSlots((prevTimeSlots) =>
          prevTimeSlots.map((timeSlot) =>
            timeSlot.id === timeSlotId
              ? { ...timeSlot, start_time: formattedStartTime, end_time: formattedEndTime, is_lunch: is_lunch !== undefined ? is_lunch : timeSlot.is_lunch }
              : timeSlot,
          ),
        )
      } catch (err: any) {
        console.error("Error updating time slot:", err)
        setError(err.message || "Failed to update time slot")
        throw err
      }
    },
    [supabase, user],
  )

  const deleteTimeSlot = useCallback(
    async (timeSlotId: string) => {
      if (!user) return

      setError(null)
      try {
        const { error } = await supabase.from("timeslots").delete().eq("id", timeSlotId).eq("user_id", user.id)

        if (error) {
          throw error
        }

        setTimeSlots((prevTimeSlots) => prevTimeSlots.filter((timeSlot) => timeSlot.id !== timeSlotId))
      } catch (err: any) {
        console.error("Error deleting time slot:", err)
        setError(err.message || "Failed to delete time slot")
        throw err
      }
    },
    [supabase, user],
  )

  // Helper function to ensure consistent 12-hour time format (hh:mm AM/PM)
  const formatTime12Hour = (time: string) => {
    // Use the utility function from lib/utils
    return formatTime12Hour(time)
  }

  return {
    timeSlots,
    loading,
    error,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    fetchTimeSlots,
  }
}

