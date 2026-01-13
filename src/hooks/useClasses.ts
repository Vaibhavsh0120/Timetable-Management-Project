"use client"

import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Class, Section } from "../types"

export const useClasses = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const supabase = createClient()

  const fetchClasses = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
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
  }, [supabase])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const addClass = useCallback(
    async (name: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("classes").insert({ name, user_id: user.id }).select().single()

      if (error) {
        console.error("Error adding class:", error)
        return
      }

      setClasses((prevClasses) => [...prevClasses, { ...data, sections: [] }])
    },
    [supabase],
  )

  const updateClass = useCallback(
    async (updatedClass: Class) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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
    [supabase],
  )

  const deleteClass = useCallback(
    async (classId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("classes").delete().eq("id", classId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting class:", error)
        return
      }

      setClasses((prevClasses) => prevClasses.filter((c) => c.id !== classId))
    },
    [supabase],
  )

  const addSection = useCallback(
    async (classId: string, sectionName: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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
    [supabase],
  )

  const updateSection = useCallback(
    async (classId: string, updatedSection: Section) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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
    [supabase],
  )

  const deleteSection = useCallback(
    async (classId: string, sectionId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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
    [supabase],
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

