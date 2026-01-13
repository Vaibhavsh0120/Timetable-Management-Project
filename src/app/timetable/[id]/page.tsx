"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TimetableManagement } from "@/components/TimetableManagement"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Timetable } from "@/types"

export default function TimetablePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const supabase = createClient()
  const [timetable, setTimetable] = useState<Timetable | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTimetable = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const timetableId = params.id as string
      const { data, error } = await supabase
        .from("timetables")
        .select("*")
        .eq("id", timetableId)
        .eq("user_id", user.id)
        .single()

      if (error || !data) {
        toast({
          title: "Error",
          description: "Timetable not found",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      setTimetable(data)
      setIsLoading(false)
    }

    fetchTimetable()
  }, [params.id, router, supabase, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading timetable...</p>
        </div>
      </div>
    )
  }

  if (!timetable) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
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
            <h1 className="text-xl font-semibold text-gray-900">{timetable.name}</h1>
          </div>
        </div>
      </div>
      <TimetableManagement timetableId={timetable.id} />
    </div>
  )
}
