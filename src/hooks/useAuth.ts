"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

// Global cache for user to avoid repeated calls across hooks
let cachedUser: User | null = null
let userPromise: Promise<User | null> | null = null

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(cachedUser)
  const supabase = createClient()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    // If we have a cached user, use it immediately
    if (cachedUser) {
      setUser(cachedUser)
      return
    }

    // If there's already a pending request, wait for it
    if (userPromise) {
      userPromise.then((userData) => {
        setUser(userData)
      })
      return
    }

    // Create a new request
    userPromise = supabase.auth.getUser().then(({ data: { user } }) => {
      cachedUser = user
      userPromise = null
      setUser(user)
      return user
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      cachedUser = session?.user ?? null
      setUser(cachedUser)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const refreshUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    cachedUser = user
    setUser(user)
    return user
  }

  return { user, refreshUser }
}
