"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Subject } from "../types"

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const supabase = createClient()

  const fetchSubjects = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from("subjects").select("*").eq("user_id", user.id)

    if (error) {
      console.error("Error fetching subjects:", error)
      return
    }

    setSubjects(data)
  }, [supabase])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  const addSubject = useCallback(
    async (name: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("subjects").insert({ name, user_id: user.id }).select().single()

      if (error) {
        console.error("Error adding subject:", error)
        return
      }

      setSubjects((prevSubjects) => [...prevSubjects, data])
    },
    [supabase],
  )

  const updateSubject = useCallback(
    async (subjectId: string, name: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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
    [supabase],
  )

  const deleteSubject = useCallback(
    async (subjectId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("subjects").delete().eq("id", subjectId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting subject:", error)
        return
      }

      setSubjects((prevSubjects) => prevSubjects.filter((subject) => subject.id !== subjectId))
    },
    [supabase],
  )

  return {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    fetchSubjects,
  }
}

