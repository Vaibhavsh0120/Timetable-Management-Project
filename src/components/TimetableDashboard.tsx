"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTimetables } from "@/hooks/useTimetables"
import { TimetableCard } from "./Timetable/TimetableCard"
import { 
  Plus, 
  Calendar, 
  LogOut, 
  Search,
  Grid3x3,
  Clock,
  Users
} from "lucide-react"
import type { Timetable } from "@/types"

export const TimetableDashboard = () => {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  const { timetables, isLoading, createTimetable, updateTimetable, deleteTimetable, fetchTimetables } = useTimetables()
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null)
  const [newTimetableName, setNewTimetableName] = useState("")
  const [renameValue, setRenameValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      router.push("/login")
      router.refresh()
    }
  }

  const handleCreateTimetable = async () => {
    if (!newTimetableName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a timetable name",
        variant: "destructive",
      })
      return
    }

    try {
      const timetable = await createTimetable(newTimetableName)
      toast({
        title: "Success",
        description: "Timetable created successfully!",
      })
      setIsCreateDialogOpen(false)
      setNewTimetableName("")
      // Navigate to the timetable editor
      router.push(`/timetable/${timetable.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create timetable",
        variant: "destructive",
      })
    }
  }

  const handleRenameTimetable = async () => {
    if (!selectedTimetable || !renameValue.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a timetable name",
        variant: "destructive",
      })
      return
    }

    try {
      await updateTimetable(selectedTimetable.id, renameValue)
      toast({
        title: "Success",
        description: "Timetable renamed successfully!",
      })
      setIsRenameDialogOpen(false)
      setSelectedTimetable(null)
      setRenameValue("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to rename timetable",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTimetable = async () => {
    if (!selectedTimetable) return

    try {
      await deleteTimetable(selectedTimetable.id)
      toast({
        title: "Success",
        description: "Timetable deleted successfully!",
      })
      setIsDeleteDialogOpen(false)
      setSelectedTimetable(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete timetable",
        variant: "destructive",
      })
    }
  }

  const openRenameDialog = (timetable: Timetable) => {
    setSelectedTimetable(timetable)
    setRenameValue(timetable.name)
    setIsRenameDialogOpen(true)
  }

  const openDeleteDialog = (timetable: Timetable) => {
    setSelectedTimetable(timetable)
    setIsDeleteDialogOpen(true)
  }

  const filteredTimetables = timetables.filter((timetable) =>
    timetable.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Timetable Manager</h1>
                <p className="text-xs text-gray-500">Manage your schedules</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Timetables</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{timetables.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Grid3x3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{timetables.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {timetables.filter(t => {
                    const created = new Date(t.created_at)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search timetables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Timetable
          </Button>
        </div>

        {/* Timetables Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading timetables...</p>
            </div>
          </div>
        ) : filteredTimetables.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            {searchQuery ? (
              <>
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No timetables found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search query</p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No timetables yet</h3>
                <p className="text-gray-600 mb-6">Create your first timetable to get started</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Timetable
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTimetables.map((timetable) => (
              <TimetableCard
                key={timetable.id}
                timetable={timetable}
                onRename={() => openRenameDialog(timetable)}
                onDelete={() => openDeleteDialog(timetable)}
              />
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Timetable</DialogTitle>
              <DialogDescription>
                Give your timetable a name to get started
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="e.g., Spring 2024 Schedule"
                value={newTimetableName}
                onChange={(e) => setNewTimetableName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTimetable()
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    setNewTimetableName("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTimetable}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Rename Dialog */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Timetable</DialogTitle>
              <DialogDescription>
                Enter a new name for this timetable
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Timetable name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameTimetable()
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRenameDialogOpen(false)
                    setSelectedTimetable(null)
                    setRenameValue("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRenameTimetable}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Timetable</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedTimetable?.name}&quot;? This action cannot be undone and will delete all associated entries.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setSelectedTimetable(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteTimetable}
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
