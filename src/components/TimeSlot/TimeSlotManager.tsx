"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import type { TimeSlot } from "../../types"

interface TimeSlotManagerProps {
  timeSlots: TimeSlot[]
  addTimeSlot: (start_time: string, end_time: string) => Promise<void>
  updateTimeSlot: (timeSlotId: string, start_time: string, end_time: string, is_lunch?: boolean) => Promise<void>
  deleteTimeSlot: (timeSlotId: string) => Promise<void>
  onEditTimeSlot: (timeSlot: TimeSlot) => void
}

export const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({
  timeSlots,
  addTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  onEditTimeSlot,
}) => {
  const { toast } = useToast()
  const [newStartTime, setNewStartTime] = useState("")
  const [newEndTime, setNewEndTime] = useState("")

  const handleAddTimeSlot = async () => {
    // Convert from "HH:mm" to "hh:mm AM/PM" for database
    const convert24To12 = (time24: string) => {
      const [hours, minutes] = time24.split(":")
      const hour = Number.parseInt(hours)
      const ampm = hour >= 12 ? "PM" : "AM"
      const hour12 = hour % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    }

    await addTimeSlot(convert24To12(newStartTime), convert24To12(newEndTime))
    setNewStartTime("")
    setNewEndTime("")
  }

  return (
    <div>
      <div className="mb-4 space-y-4">
        <div className="flex items-end space-x-2">
          <div>
            <label htmlFor="newStartTime" className="block text-sm font-medium">
              Start Time
            </label>
            <Input id="newStartTime" type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} />
          </div>
          <div>
            <label htmlFor="newEndTime" className="block text-sm font-medium">
              End Time
            </label>
            <Input id="newEndTime" type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
          </div>
          <Button onClick={handleAddTimeSlot}>Add Time Slot</Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map((timeSlot) => (
            <TableRow key={timeSlot.id}>
              <TableCell>{timeSlot.start_time}</TableCell>
              <TableCell>{timeSlot.end_time}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onEditTimeSlot(timeSlot)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteTimeSlot(timeSlot.id)} className="ml-2">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

