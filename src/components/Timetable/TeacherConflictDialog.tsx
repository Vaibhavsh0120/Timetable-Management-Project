"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface ConflictDialogProps {
  isOpen: boolean
  onClose: () => void
  teacherName: string
  conflictClassName: string
  conflictSectionName: string
  currentClassName: string
  currentSectionName: string
  timeSlotTime: string
  onReplace: () => void
  onAssignBoth: () => void
  isLoading?: boolean
}

export const TeacherConflictDialog = ({
  isOpen,
  onClose,
  teacherName,
  conflictClassName,
  conflictSectionName,
  currentClassName,
  currentSectionName,
  timeSlotTime,
  onReplace,
  onAssignBoth,
  isLoading = false,
}: ConflictDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <DialogTitle>Teacher Assignment Conflict</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2 text-sm">
            <p className="text-base">
              <strong className="text-foreground">{teacherName}</strong>{" "}
              <span className="text-muted-foreground">
                is already assigned to
              </span>{" "}
              <strong className="text-foreground">{conflictClassName} {conflictSectionName}</strong>{" "}
              <span className="text-muted-foreground">at</span>{" "}
              <strong className="text-foreground">{timeSlotTime}</strong>
              <span className="text-muted-foreground">.</span>
            </p>
            <p className="text-base text-muted-foreground">
              You are trying to assign them to{" "}
              <strong className="text-foreground">{currentClassName} {currentSectionName}</strong>{" "}
              at the same time.
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 border border-border">
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Current Assignment</p>
                <p className="font-medium">{conflictClassName} {conflictSectionName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Attempting Assignment</p>
                <p className="font-medium">{currentClassName} {currentSectionName}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground pt-2">
            What would you like to do?
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="order-3 sm:order-1"
          >
            Cancel
          </Button>

          <Button
            variant="secondary"
            onClick={onAssignBoth}
            disabled={isLoading}
            className="order-2"
          >
            {isLoading ? "Loading..." : "Allow Both Assignments"}
          </Button>

          <Button
            variant="destructive"
            onClick={onReplace}
            disabled={isLoading}
            className="order-1 sm:order-3"
          >
            {isLoading ? "Moving..." : "Move to New Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
