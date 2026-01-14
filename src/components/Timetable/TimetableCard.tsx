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
    <div className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg border bg-background flex items-center justify-center">
              <Calendar className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {timetable.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
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
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Created {formattedCreatedAt}</span>
          </div>
          <Button
            onClick={handleOpen}
            variant="ghost"
            size="sm"
            className="gap-2"
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
