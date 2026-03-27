"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { Teacher } from "../types"

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const fetchTeachers = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.from("teachers").select("*").eq("user_id", user.id)

      if (error) {
        throw error
      }

      setTeachers(data)
    } catch (err: any) {
      console.error("Error fetching teachers:", err)
      setError(err.message || "Failed to fetch teachers")
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      fetchTeachers()
    }
  }, [user, fetchTeachers])

  const addTeacher = useCallback(
    async (name: string, subject_id: string) => {
      if (!user) return

      setError(null)
      try {
        const { data, error } = await supabase
          .from("teachers")
          .insert({ name, subject_id, user_id: user.id })
          .select()
          .single()

        if (error) {
          throw error
        }

        setTeachers((prevTeachers) => [...prevTeachers, data])
      } catch (err: any) {
        console.error("Error adding teacher:", err)
        setError(err.message || "Failed to add teacher")
        throw err
      }
    },
    [supabase, user],
  )

  const updateTeacher = useCallback(
    async (teacherId: string, name: string, subject_id: string) => {
      if (!user) return

      setError(null)
      try {
        const { error } = await supabase
          .from("teachers")
          .update({ name, subject_id })
          .eq("id", teacherId)
          .eq("user_id", user.id)

        if (error) {
          throw error
        }

        setTeachers((prevTeachers) =>
          prevTeachers.map((teacher) => (teacher.id === teacherId ? { ...teacher, name, subject_id } : teacher)),
        )
      } catch (err: any) {
        console.error("Error updating teacher:", err)
        setError(err.message || "Failed to update teacher")
        throw err
      }
    },
    [supabase, user],
  )

  const deleteTeacher = useCallback(
    async (teacherId: string) => {
      if (!user) return

      setError(null)
      try {
        const { error } = await supabase.from("teachers").delete().eq("id", teacherId).eq("user_id", user.id)

        if (error) {
          throw error
        }

        setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher.id !== teacherId))
      } catch (err: any) {
        console.error("Error deleting teacher:", err)
        setError(err.message || "Failed to delete teacher")
        throw err
      }
    },
    [supabase, user],
  )

  return {
    teachers,
    loading,
    error,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    fetchTeachers,
  }
}

