"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { TimeSlot } from "../../types"

interface TimeSlotEditorProps {
  timeSlot: TimeSlot | null
  onUpdate: (timeSlotId: string, start_time: string, end_time: string, is_lunch?: boolean) => Promise<void>
  onClose: () => void
}

export const TimeSlotEditor: React.FC<TimeSlotEditorProps> = ({ timeSlot, onUpdate, onClose }) => {
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  useEffect(() => {
    if (timeSlot) {
      // Convert from "hh:mm AM/PM" to "HH:mm" for input element
      const convert12To24 = (time12: string) => {
        const [timeStr, period] = time12.split(" ")
        const [hours, minutes] = timeStr.split(":")
        let hour = Number.parseInt(hours)

        if (period === "PM" && hour !== 12) {
          hour += 12
        } else if (period === "AM" && hour === 12) {
          hour = 0
        }

        return `${hour.toString().padStart(2, "0")}:${minutes}`
      }

      setStartTime(convert12To24(timeSlot.start_time))
      setEndTime(convert12To24(timeSlot.end_time))
    }
  }, [timeSlot])

  const handleUpdate = async () => {
    if (!timeSlot) return

    // Convert from "HH:mm" to "hh:mm AM/PM" for database
    const convert24To12 = (time24: string) => {
      const [hours, minutes] = time24.split(":")
      const hour = Number.parseInt(hours)
      const ampm = hour >= 12 ? "PM" : "AM"
      const hour12 = hour % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    }

    await onUpdate(timeSlot.id, convert24To12(startTime), convert24To12(endTime))
    onClose()
  }

  if (!timeSlot) return null

  return (
    <Dialog open={!!timeSlot} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Time Slot</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleUpdate}>Update Time Slot</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

