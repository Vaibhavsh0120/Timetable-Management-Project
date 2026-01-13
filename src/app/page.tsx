import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TimetableManagement } from "@/components/TimetableManagement"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-background">
      <TimetableManagement />
    </main>
  )
}

