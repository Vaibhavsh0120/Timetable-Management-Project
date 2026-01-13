"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { Subject } from "../types"

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const fetchSubjects = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase.from("subjects").select("*").eq("user_id", user.id)

    if (error) {
      console.error("Error fetching subjects:", error)
      return
    }

    setSubjects(data)
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      fetchSubjects()
    }
  }, [user, fetchSubjects])

  const addSubject = useCallback(
    async (name: string) => {
      if (!user) return

      const { data, error } = await supabase.from("subjects").insert({ name, user_id: user.id }).select().single()

      if (error) {
        console.error("Error adding subject:", error)
        return
      }

      setSubjects((prevSubjects) => [...prevSubjects, data])
    },
    [supabase, user],
  )

  const updateSubject = useCallback(
    async (subjectId: string, name: string) => {
      if (!user) return

      const { error } = await supabase.from("subjects").update({ name }).eq("id", subjectId).eq("user_id", user.id)

      if (error) {
        console.error("Error updating subject:", error)
        return
      }

      setSubjects((prevSubjects) =>
        prevSubjects.map((subject) => (subject.id === subjectId ? { ...subject, name } : subject)),
      )
    },
    [supabase, user],
  )

  const deleteSubject = useCallback(
    async (subjectId: string) => {
      if (!user) return

      const { error } = await supabase.from("subjects").delete().eq("id", subjectId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting subject:", error)
        return
      }

      setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject.id !== subjectId))
    },
    [supabase, user],
  )

  return {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    fetchSubjects,
  }
}

