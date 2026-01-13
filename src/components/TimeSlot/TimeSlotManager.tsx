"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import type { TimeSlot } from "../../types"
import { DAYS } from "@/constants"

interface TimeSlotManagerProps {
  timeSlots: TimeSlot[]
  addTimeSlot: (start_time: string, end_time: string) => Promise<void>
  updateTimeSlot: (timeSlotId: string, start_time: string, end_time: string, is_lunch?: boolean) => Promise<void>
  deleteTimeSlot: (timeSlotId: string) => Promise<void>
  onEditTimeSlot: (timeSlot: TimeSlot) => void
  toggleLunch: (timeSlotId: string, isLunch: boolean) => Promise<void>
  maxLunchSlots: number
  setMaxLunchSlots: (max: number) => Promise<void>
  enabledDays: number[]
  toggleDay: (dayId: number) => void
  timetableId: string
  lunchSlotIds: string[]
}

export const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({
  timeSlots,
  addTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  onEditTimeSlot,
  toggleLunch,
  maxLunchSlots,
  setMaxLunchSlots,
  enabledDays,
  toggleDay,
  timetableId,
  lunchSlotIds,
}) => {
  const { toast } = useToast()
  const [newStartTime, setNewStartTime] = useState("")
  const [newEndTime, setNewEndTime] = useState("")
  
  const lunchCount = useMemo(() => {
    return lunchSlotIds.length
  }, [lunchSlotIds])

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

  const handleLunchToggle = async (timeSlotId: string, currentLunchState: boolean) => {
    const newLunchState = !currentLunchState
    
    // Check if we're trying to add a lunch slot and would exceed max
    if (newLunchState && lunchCount >= maxLunchSlots) {
      toast({
        title: "Maximum Lunch Slots Reached",
        description: `You can only have ${maxLunchSlots} lunch slot(s). Please uncheck another lunch slot first.`,
        variant: "destructive",
      })
      return
    }
    
    await toggleLunch(timeSlotId, newLunchState)
  }
  
  const handleMaxLunchChange = async (value: number) => {
    if (lunchCount > value) {
      toast({
        title: "Warning",
        description: `You have ${lunchCount} lunch slot(s) selected, but max is set to ${value}. Please uncheck some lunch slots.`,
        variant: "destructive",
      })
    }
    await setMaxLunchSlots(value)
  }

  return (
    <div>
      <div className="mb-4 space-y-4">
        <div className="flex items-end space-x-2">
          <div>
            <label htmlFor="newStartTime" className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <Input id="newStartTime" type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} />
          </div>
          <div>
            <label htmlFor="newEndTime" className="block text-sm font-medium text-gray-700">
              End Time
            </label>
            <Input id="newEndTime" type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
          </div>
          <Button onClick={handleAddTimeSlot}>Add Time Slot</Button>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="maxLunch" className="text-sm font-medium text-gray-700">
            Max Lunch Slots:
          </Label>
          <Input
            id="maxLunch"
            type="number"
            min="0"
            value={maxLunchSlots}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value) || 0
              handleMaxLunchChange(value)
            }}
            className="w-20"
          />
          <span className="text-sm text-gray-600">
            (Current: {lunchCount}/{maxLunchSlots})
          </span>
        </div>
        <div className="flex items-center space-x-4 pt-2 border-t">
          <Label className="text-sm font-medium text-gray-700">Days:</Label>
          <div className="flex items-center space-x-4">
            {DAYS.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`day-${day.id}`}
                  checked={enabledDays.includes(day.id)}
                  onChange={() => toggleDay(day.id)}
                  className="w-4 h-4"
                />
                <Label htmlFor={`day-${day.id}`} className="text-sm text-gray-700 cursor-pointer">
                  {day.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Lunch</TableHead>
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
              <TableCell>
                <input
                  type="checkbox"
                  checked={lunchSlotIds.includes(timeSlot.id)}
                  onChange={() => handleLunchToggle(timeSlot.id, lunchSlotIds.includes(timeSlot.id))}
                  className="w-4 h-4"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

