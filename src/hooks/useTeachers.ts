"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Teacher } from "../types"

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const supabase = createClient()

  const fetchTeachers = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from("teachers").select("*").eq("user_id", user.id)

    if (error) {
      console.error("Error fetching teachers:", error)
      return
    }

    setTeachers(data)
  }, [supabase])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  const addTeacher = useCallback(
    async (name: string, subject_id: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("teachers")
        .insert({ name, subject_id, user_id: user.id })
        .select()
        .single()

      if (error) {
        console.error("Error adding teacher:", error)
        return
      }

      setTeachers((prevTeachers) => [...prevTeachers, data])
    },
    [supabase],
  )

  const updateTeacher = useCallback(
    async (teacherId: string, name: string, subject_id: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("teachers")
        .update({ name, subject_id })
        .eq("id", teacherId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating teacher:", error)
        return
      }

      setTeachers((prevTeachers) =>
        prevTeachers.map((teacher) => (teacher.id === teacherId ? { ...teacher, name, subject_id } : teacher)),
      )
    },
    [supabase],
  )

  const deleteTeacher = useCallback(
    async (teacherId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("teachers").delete().eq("id", teacherId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting teacher:", error)
        return
      }

      setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher.id !== teacherId))
    },
    [supabase],
  )

  return {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    fetchTeachers,
  }
}

