"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./useAuth"
import type { Class, Section } from "../types"

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const supabase = useMemo(() => createClient(), [])
  const { user } = useAuth()

  const fetchClasses = useCallback(async () => {
    if (!user) return

    const { data: classesData, error: classesError } = await supabase.from("classes").select("*").eq("user_id", user.id)

    if (classesError) {
      console.error("Error fetching classes:", classesError)
      return
    }

    const { data: sectionsData, error: sectionsError } = await supabase
      .from("sections")
      .select("*")
      .eq("user_id", user.id)

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError)
      return
    }

    const classesWithSections = classesData.map((cls: Class) => ({
      ...cls,
      sections: sectionsData.filter((section: Section) => section.class_id === cls.id),
    }))

    setClasses(classesWithSections)
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      fetchClasses()
    }
  }, [user, fetchClasses])

  const addClass = useCallback(
    async (name: string) => {
      if (!user) return

      const { data, error } = await supabase.from("classes").insert({ name, user_id: user.id }).select().single()

      if (error) {
        console.error("Error adding class:", error)
        return
      }

      setClasses((prevClasses) => [...prevClasses, { ...data, sections: [] }])
    },
    [supabase, user],
  )

  const updateClass = useCallback(
    async (updatedClass: Class) => {
      if (!user) return

      const { error } = await supabase
        .from("classes")
        .update({ name: updatedClass.name })
        .eq("id", updatedClass.id)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating class:", error)
        return
      }

      setClasses((prevClasses) => prevClasses.map((c) => (c.id === updatedClass.id ? updatedClass : c)))
    },
    [supabase, user],
  )

  const deleteClass = useCallback(
    async (classId: string) => {
      if (!user) return

      const { error } = await supabase.from("classes").delete().eq("id", classId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting class:", error)
        return
      }

      setClasses((prevClasses) => prevClasses.filter((c) => c.id !== classId))
    },
    [supabase, user],
  )

  const addSection = useCallback(
    async (classId: string, sectionName: string) => {
      if (!user) return

      const { data, error } = await supabase
        .from("sections")
        .insert({ name: sectionName, class_id: classId, user_id: user.id })
        .select()
        .single()

      if (error) {
        console.error("Error adding section:", error)
        return
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
    },
    [supabase, user],
  )

  const updateSection = useCallback(
    async (classId: string, updatedSection: Section) => {
      if (!user) return

      const { error } = await supabase
        .from("sections")
        .update({ name: updatedSection.name })
        .eq("id", updatedSection.id)
        .eq("class_id", classId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating section:", error)
        return
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
    },
    [supabase, user],
  )

  const deleteSection = useCallback(
    async (classId: string, sectionId: string) => {
      if (!user) return

      const { error } = await supabase
        .from("sections")
        .delete()
        .eq("id", sectionId)
        .eq("class_id", classId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error deleting section:", error)
        return
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
    },
    [supabase, user],
  )

  return {
    classes,
    addClass,
    updateClass,
    deleteClass,
    addSection,
    updateSection,
    deleteSection,
    fetchClasses,
  }
}

