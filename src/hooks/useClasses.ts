"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { Class, Section } from "../types"

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const fetchClasses = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Fetch both classes and sections in parallel
      const [
        { data: classesData, error: classesError },
        { data: sectionsData, error: sectionsError }
      ] = await Promise.all([
        supabase.from("classes").select("*").eq("user_id", user.id),
        supabase.from("sections").select("*").eq("user_id", user.id)
      ])

      if (classesError) {
        throw classesError
      }
      
      if (sectionsError) {
        throw sectionsError
      }

      const classesWithSections = classesData.map((cls: Class) => ({
        ...cls,
        sections: sectionsData.filter((section: Section) => section.class_id === cls.id),
      }))

      setClasses(classesWithSections)
    } catch (err: any) {
      console.error("Error fetching classes:", err)
      setError(err.message || "Failed to fetch classes")
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      fetchClasses()
    }
  }, [user, fetchClasses])

  const addClass = useCallback(
    async (name: string) => {
      if (!user) return

      setError(null)
      try {
        const { data, error } = await supabase.from("classes").insert({ name, user_id: user.id }).select().single()

        if (error) {
          throw error
        }

        setClasses((prevClasses) => [...prevClasses, { ...data, sections: [] }])
      } catch (err: any) {
        console.error("Error adding class:", err)
        setError(err.message || "Failed to add class")
        throw err
      }
    },
    [supabase, user],
  )

  const updateClass = useCallback(
    async (updatedClass: Class) => {
      if (!user) return

      setError(null)
      try {
        const { error } = await supabase
          .from("classes")
          .update({ name: updatedClass.name })
          .eq("id", updatedClass.id)
          .eq("user_id", user.id)

        if (error) {
          throw error
        }

        setClasses((prevClasses) => prevClasses.map((c) => (c.id === updatedClass.id ? updatedClass : c)))
      } catch (err: any) {
        console.error("Error updating class:", err)
        setError(err.message || "Failed to update class")
        throw err
      }
    },
    [supabase, user],
  )

  const deleteClass = useCallback(
    async (classId: string) => {
      if (!user) return

      setError(null)
      try {
        const { error } = await supabase.from("classes").delete().eq("id", classId).eq("user_id", user.id)

        if (error) {
          throw error
        }

        setClasses((prevClasses) => prevClasses.filter((c) => c.id !== classId))
      } catch (err: any) {
        console.error("Error deleting class:", err)
        setError(err.message || "Failed to delete class")
        throw err
      }
    },
    [supabase, user],
  )

  const addSection = useCallback(
    async (classId: string, sectionName: string) => {
      if (!user) return

      setError(null)
      try {
        const { data, error } = await supabase
          .from("sections")
          .insert({ name: sectionName, class_id: classId, user_id: user.id })
          .select()
          .single()

        if (error) {
          throw error
        }

        setClasses((prevClasses) =>
          prevClasses.map((c) => {
            if (c.id === classId) {
              return {
                ...c,
                sections: [...c.sections, data],
              }
            }
            return c
          }),
        )
      } catch (err: any) {
        console.error("Error adding section:", err)
        setError(err.message || "Failed to add section")
        throw err
      }
    },
    [supabase, user],
  )

  const updateSection = useCallback(
    async (classId: string, updatedSection: Section) => {
      if (!user) return

      setError(null)
      try {
        const { error } = await supabase
          .from("sections")
          .update({ name: updatedSection.name })
          .eq("id", updatedSection.id)
          .eq("class_id", classId)
          .eq("user_id", user.id)

        if (error) {
          throw error
        }

        setClasses((prevClasses) =>
          prevClasses.map((c) => {
            if (c.id === classId) {
              return {
                ...c,
                sections: c.sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
              }
            }
            return c
          }),
        )
      } catch (err: any) {
        console.error("Error updating section:", err)
        setError(err.message || "Failed to update section")
        throw err
      }
    },
    [supabase, user],
  )

  const deleteSection = useCallback(
    async (classId: string, sectionId: string) => {
      if (!user) return

      setError(null)
      try {
        const { error } = await supabase
          .from("sections")
          .delete()
          .eq("id", sectionId)
          .eq("class_id", classId)
          .eq("user_id", user.id)

        if (error) {
          throw error
        }

        setClasses((prevClasses) =>
          prevClasses.map((c) => {
            if (c.id === classId) {
              return {
                ...c,
                sections: c.sections.filter((s) => s.id !== sectionId),
              }
            }
            return c
          }),
        )
      } catch (err: any) {
        console.error("Error deleting section:", err)
        setError(err.message || "Failed to delete section")
        throw err
      }
    },
    [supabase, user],
  )

  return {
    classes,
    loading,
    error,
    addClass,
    updateClass,
    deleteClass,
    addSection,
    updateSection,
    deleteSection,
    fetchClasses,
  }
}

