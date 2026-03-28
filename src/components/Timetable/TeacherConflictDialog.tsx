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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <DialogTitle>Teacher Assignment Conflict</DialogTitle>
          </div>
        </DialogHeader>

         <div className="space-y-4">
           <DialogDescription className="space-y-3 text-sm">
             <div>
               <p>
                 <strong>{teacherName}</strong> is already assigned to <strong>{conflictClassName} {conflictSectionName}</strong> at <strong>{timeSlotTime}</strong>.
               </p>
               <p>
                 You are trying to assign them to <strong>{currentClassName} {currentSectionName}</strong> at the same time.
               </p>
               <p className="text-xs text-muted-foreground mt-2">
                 What would you like to do?
               </p>
             </div>
           </DialogDescription>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Current Assignment: {conflictClassName} {conflictSectionName}
              <br />
              Attempting: {currentClassName} {currentSectionName}
            </p>
          </div>
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
