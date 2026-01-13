"use client"

import { memo, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Clock,
  ArrowRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Timetable } from "@/types"
import { format } from "date-fns"

interface TimetableCardProps {
  timetable: Timetable
  onRename: () => void
  onDelete: () => void
}

export const TimetableCard = memo(({ timetable, onRename, onDelete }: TimetableCardProps) => {
  const router = useRouter()

  const handleOpen = useCallback(() => {
    router.push(`/timetable/${timetable.id}`)
  }, [router, timetable.id])

  const formattedUpdatedAt = useMemo(() => {
    try {
      return format(new Date(timetable.updated_at), "MMM d, yyyy")
    } catch {
      return "Recently"
    }
  }, [timetable.updated_at])

  const formattedCreatedAt = useMemo(() => {
    try {
      return format(new Date(timetable.created_at), "MMM d, yyyy")
    } catch {
      return "Recently"
    }
  }, [timetable.created_at])

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {timetable.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Updated {formattedUpdatedAt}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRename}>
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Created {formattedCreatedAt}</span>
          </div>
          <Button
            onClick={handleOpen}
            variant="ghost"
            size="sm"
            className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Open
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
})

TimetableCard.displayName = "TimetableCard"
