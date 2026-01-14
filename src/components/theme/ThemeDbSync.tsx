"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/useAuth"

type ThemeChoice = "system" | "light" | "dark"

export function ThemeDbSync() {
  const { user } = useAuth()
  const supabase = React.useMemo(() => createClient(), [])
  const { theme, setTheme } = useTheme()

  const hasAppliedRemoteRef = React.useRef(false)
  const skipNextWriteRef = React.useRef(false)

  // Load theme preference from DB when user becomes available.
  React.useEffect(() => {
    const run = async () => {
      if (!user?.id) return

      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("theme")
          .eq("user_id", user.id)
          .single()

        if (error) {
          // If the table isn't set up yet (or no row), don't break the app.
          hasAppliedRemoteRef.current = true
          return
        }

        const remoteTheme = (data?.theme ?? "system") as ThemeChoice
        if (remoteTheme && remoteTheme !== theme) {
          skipNextWriteRef.current = true
          setTheme(remoteTheme)
        }

        hasAppliedRemoteRef.current = true
      } catch {
        hasAppliedRemoteRef.current = true
      }
    }

    run()
  }, [user?.id, supabase, setTheme]) // intentionally not depending on theme to avoid refetch loop

  // Persist theme changes to DB.
  React.useEffect(() => {
    const run = async () => {
      if (!user?.id) return
      if (!hasAppliedRemoteRef.current) return
      if (skipNextWriteRef.current) {
        skipNextWriteRef.current = false
        return
      }

      const current = (theme ?? "system") as ThemeChoice
      if (!current) return

      try {
        await supabase.from("user_preferences").upsert(
          {
            user_id: user.id,
            theme: current,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
      } catch {
        // ignore (e.g., table missing) — UI still works via system default
      }
    }

    run()
  }, [theme, user?.id, supabase])

  return null
}

