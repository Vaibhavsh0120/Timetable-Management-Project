"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Timetable } from "../types"

export const useTimetables = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const fetchTimetables = useCallback(async () => {
    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

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
  }, [supabase])

  const createTimetable = useCallback(
    async (name: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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

      setTimetables((prev) => [data, ...prev])
      return data
    },
    [supabase],
  )

  const updateTimetable = useCallback(
    async (id: string, name: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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
    [supabase],
  )

  const deleteTimetable = useCallback(
    async (id: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      // First delete all timetable entries
      const { error: entriesError } = await supabase
        .from("timetableentries")
        .delete()
        .eq("timetable_id", id)
        .eq("user_id", user.id)

      if (entriesError) {
        console.error("Error deleting timetable entries:", entriesError)
        throw entriesError
      }

      // Then delete the timetable
      const { error } = await supabase
        .from("timetables")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error deleting timetable:", error)
        throw error
      }

      setTimetables((prev) => prev.filter((t) => t.id !== id))
    },
    [supabase],
  )

  useEffect(() => {
    fetchTimetables()
  }, [fetchTimetables])

  return {
    timetables,
    isLoading,
    fetchTimetables,
    createTimetable,
    updateTimetable,
    deleteTimetable,
  }
}
