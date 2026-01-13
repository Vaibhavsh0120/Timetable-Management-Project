"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { TimetableSettings } from "../types"

export const useTimetableSettings = (timetableId: string) => {
  const [settings, setSettings] = useState<TimetableSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const createDefaultSettings = useCallback(async () => {
    if (!user || !timetableId) return

    try {
      // First check if settings already exist
      const { data: existingSettings } = await supabase
        .from("timetable_settings")
        .select("*")
        .eq("timetable_id", timetableId)
        .eq("user_id", user.id)
        .single()

      if (existingSettings) {
        setSettings(existingSettings)
        return existingSettings
      }

      const defaultSettings = {
        timetable_id: timetableId,
        user_id: user.id,
        enabled_days: [1, 2, 3, 4, 5], // Mon-Fri by default
        max_lunch_slots: 1,
        lunch_slot_ids: [],
      }

      // Use upsert to handle race conditions where settings might be created concurrently
      const { data, error } = await supabase
        .from("timetable_settings")
        .upsert(defaultSettings, {
          onConflict: "timetable_id,user_id",
        })
        .select()
        .single()

      if (error) {
        // If it's a conflict error, try to fetch the existing settings
        if (error.code === "23505" || error.message?.includes("duplicate")) {
          const { data: existing } = await supabase
            .from("timetable_settings")
            .select("*")
            .eq("timetable_id", timetableId)
            .eq("user_id", user.id)
            .single()
          
          if (existing) {
            setSettings(existing)
            return existing
          }
        }
        console.error("Error creating default settings:", error)
        return null
      }

      setSettings(data)
      return data
    } catch (error) {
      console.error("Unexpected error creating default settings:", error)
      return null
    }
  }, [supabase, user, timetableId])

  const fetchSettings = useCallback(async () => {
    if (!user || !timetableId) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("timetable_settings")
        .select("*")
        .eq("timetable_id", timetableId)
        .eq("user_id", user.id)
        .single()

      if (error) {
        // If settings don't exist, create default ones
        if (error.code === "PGRST116") {
          const newSettings = await createDefaultSettings()
          if (newSettings) {
            setSettings(newSettings)
          }
          setIsLoading(false)
          return
        }
        console.error("Error fetching timetable settings:", error)
        setIsLoading(false)
        return
      }

      setSettings(data)
    } catch (error) {
      console.error("Unexpected error fetching timetable settings:", error)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user, timetableId, createDefaultSettings])

  const updateEnabledDays = useCallback(
    async (enabledDays: number[]) => {
      if (!user || !timetableId) return

      try {
        // Ensure settings exist
        if (!settings) {
          const newSettings = await createDefaultSettings()
          if (!newSettings) return
        }

        const { data, error } = await supabase
          .from("timetable_settings")
          .update({
            enabled_days: enabledDays,
            updated_at: new Date().toISOString(),
          })
          .eq("timetable_id", timetableId)
          .eq("user_id", user.id)
          .select()
          .single()

        if (error) {
          console.error("Error updating enabled days:", error)
          return
        }

        setSettings(data)
      } catch (error) {
        console.error("Unexpected error updating enabled days:", error)
      }
    },
    [supabase, user, timetableId, settings, createDefaultSettings],
  )

  const updateMaxLunchSlots = useCallback(
    async (maxLunchSlots: number) => {
      if (!user || !timetableId) return

      try {
        // Ensure settings exist
        if (!settings) {
          const newSettings = await createDefaultSettings()
          if (!newSettings) return
        }

        const { data, error } = await supabase
          .from("timetable_settings")
          .update({
            max_lunch_slots: maxLunchSlots,
            updated_at: new Date().toISOString(),
          })
          .eq("timetable_id", timetableId)
          .eq("user_id", user.id)
          .select()
          .single()

        if (error) {
          console.error("Error updating max lunch slots:", error)
          return
        }

        setSettings(data)
      } catch (error) {
        console.error("Unexpected error updating max lunch slots:", error)
      }
    },
    [supabase, user, timetableId, settings, createDefaultSettings],
  )

  const updateLunchSlots = useCallback(
    async (lunchSlotIds: string[]) => {
      if (!user || !timetableId) return

      try {
        // Ensure settings exist
        if (!settings) {
          const newSettings = await createDefaultSettings()
          if (!newSettings) return
        }

        const { data, error } = await supabase
          .from("timetable_settings")
          .update({
            lunch_slot_ids: lunchSlotIds,
            updated_at: new Date().toISOString(),
          })
          .eq("timetable_id", timetableId)
          .eq("user_id", user.id)
          .select()
          .single()

        if (error) {
          console.error("Error updating lunch slots:", error)
          return
        }

        setSettings(data)
      } catch (error) {
        console.error("Unexpected error updating lunch slots:", error)
      }
    },
    [supabase, user, timetableId, settings, createDefaultSettings],
  )

  const toggleLunchSlot = useCallback(
    async (timeSlotId: string, isLunch: boolean) => {
      if (!settings) {
        const newSettings = await createDefaultSettings()
        if (!newSettings) return
        // Use the newly created settings
        const currentLunchSlots: string[] = []
        const newLunchSlots = isLunch ? [timeSlotId] : []
        await updateLunchSlots(newLunchSlots)
        return
      }

      const currentLunchSlots = settings.lunch_slot_ids || []
      let newLunchSlots: string[]

      if (isLunch) {
        // Add to lunch slots if not already present
        newLunchSlots = currentLunchSlots.includes(timeSlotId)
          ? currentLunchSlots
          : [...currentLunchSlots, timeSlotId]
      } else {
        // Remove from lunch slots
        newLunchSlots = currentLunchSlots.filter((id) => id !== timeSlotId)
      }

      await updateLunchSlots(newLunchSlots)
    },
    [settings, updateLunchSlots, createDefaultSettings],
  )

  useEffect(() => {
    if (user && timetableId) {
      fetchSettings()
    }
  }, [user, timetableId, fetchSettings])

  return {
    settings,
    isLoading,
    enabledDays: settings?.enabled_days || [1, 2, 3, 4, 5],
    maxLunchSlots: settings?.max_lunch_slots || 1,
    lunchSlotIds: settings?.lunch_slot_ids || [],
    updateEnabledDays,
    updateMaxLunchSlots,
    updateLunchSlots,
    toggleLunchSlot,
    fetchSettings,
  }
}
