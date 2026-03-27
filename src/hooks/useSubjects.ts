"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { Subject } from "../types"

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const fetchSubjects = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from("subjects").select("*").eq("user_id", user.id)

      if (error) {
        throw error
      }

      setSubjects(data)
    } catch (err: any) {
      console.error("Error fetching subjects:", err)
      setError(err.message || "Failed to fetch subjects")
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      fetchSubjects()
    }
  }, [user, fetchSubjects])

  const addSubject = useCallback(
    async (name: string) => {
      if (!user) return

      setError(null)
      try {
        const { data, error } = await supabase.from("subjects").insert({ name, user_id: user.id }).select().single()

        if (error) {
          throw error
        }

        setSubjects((prevSubjects) => [...prevSubjects, data])
      } catch (err: any) {
        console.error("Error adding subject:", err)
        setError(err.message || "Failed to add subject")
        throw err
      }
    },
    [supabase, user],
  )

  const updateSubject = useCallback(
    async (subjectId: string, name: string) => {
      if (!user) return

      setError(null)
      try {
        const { error } = await supabase.from("subjects").update({ name }).eq("id", subjectId).eq("user_id", user.id)

        if (error) {
          throw error
        }

        setSubjects((prevSubjects) =>
          prevSubjects.map((subject) => (subject.id === subjectId ? { ...subject, name } : subject)),
        )
      } catch (err: any) {
        console.error("Error updating subject:", err)
        setError(err.message || "Failed to update subject")
        throw err
      }
    },
    [supabase, user],
  )

  const deleteSubject = useCallback(
    async (subjectId: string) => {
      if (!user) return

      setError(null)
      try {
        const { error } = await supabase.from("subjects").delete().eq("id", subjectId).eq("user_id", user.id)

        if (error) {
          throw error
        }

        setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject.id !== subjectId))
      } catch (err: any) {
        console.error("Error deleting subject:", err)
        setError(err.message || "Failed to delete subject")
        throw err
      }
    },
    [supabase, user],
  )

  return {
    subjects,
    loading,
    error,
    addSubject,
    updateSubject,
    deleteSubject,
    fetchSubjects,
  }
}

