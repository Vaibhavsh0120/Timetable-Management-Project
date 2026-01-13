"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { Teacher } from "../types"

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const fetchTeachers = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase.from("teachers").select("*").eq("user_id", user.id)

    if (error) {
      console.error("Error fetching teachers:", error)
      return
    }

    setTeachers(data)
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      fetchTeachers()
    }
  }, [user, fetchTeachers])

  const addTeacher = useCallback(
    async (name: string, subject_id: string) => {
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
    [supabase, user],
  )

  const updateTeacher = useCallback(
    async (teacherId: string, name: string, subject_id: string) => {
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
    [supabase, user],
  )

  const deleteTeacher = useCallback(
    async (teacherId: string) => {
      if (!user) return

      const { error } = await supabase.from("teachers").delete().eq("id", teacherId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting teacher:", error)
        return
      }

      setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher.id !== teacherId))
    },
    [supabase, user],
  )

  return {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    fetchTeachers,
  }
}

