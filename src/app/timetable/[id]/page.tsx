"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { ArrowLeft, Loader2, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Timetable } from "@/types"

// Lazy load the heavy component
const TimetableManagement = dynamic(() => import("@/components/TimetableManagement").then(mod => ({ default: mod.TimetableManagement })), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  ),
  ssr: false
})

export default function TimetablePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const supabase = useMemo(() => createClient(), [])
  const [timetable, setTimetable] = useState<Timetable | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Extract id from params to avoid serialization issues
  const timetableId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''

  useEffect(() => {
    if (!timetableId) {
      router.push("/")
      return
    }

    const fetchTimetable = async () => {
      try {
        // Get user - middleware should have already verified authentication
        const {
          data: { user },
        } = await supabase.auth.getUser()
        
        if (!user) {
          // If no user, middleware should redirect, but just in case:
          console.warn("No user found, redirecting to login")
          router.push("/login")
          return
        }

        // Fetch the timetable
        const { data, error } = await supabase
          .from("timetables")
          .select("*")
          .eq("id", timetableId)
          .eq("user_id", user.id)
          .single()

        if (error) {
          console.error("Error fetching timetable:", error)
          toast({
            title: "Error",
            description: error.message || "Timetable not found",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        if (!data) {
          toast({
            title: "Error",
            description: "Timetable not found",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setTimetable(data)
      } catch (error) {
        console.error("Unexpected error:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimetable()
  }, [timetableId, router, supabase, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading timetable...</p>
        </div>
      </div>
    )
  }

  if (!timetable) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-foreground flex-1 truncate">{timetable.name}</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  // handled inside TimetableManagement (gear opens settings)
                  window.dispatchEvent(new CustomEvent("timetable:open-settings"))
                }}
                aria-label="Timetable settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <TimetableManagement timetableId={timetable.id} />
    </div>
  )
}
