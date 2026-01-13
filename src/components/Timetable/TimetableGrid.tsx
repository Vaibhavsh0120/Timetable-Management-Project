import { memo, useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TimeTableEntry, Day, TimeSlot, Teacher, Subject } from "../../types"
import { TimetableCell } from "./TimetableCell"

interface TimetableGridProps {
  timeTable: TimeTableEntry[]
  days: Day[]
  timeSlots: TimeSlot[]
  teachers: Teacher[]
  subjects: Subject[]
  enabledDays: number[]
  timetableId: string
  lunchSlotIds: string[]
  onCellClick: (entry: TimeTableEntry) => void
}

export const TimetableGrid = memo(({
  timeTable,
  days,
  timeSlots,
  teachers,
  subjects,
  enabledDays,
  timetableId,
  lunchSlotIds,
  onCellClick,
}: TimetableGridProps) => {
  // Create a map for faster lookups
  const entryMap = useMemo(() => {
    const map = new Map<string, TimeTableEntry>()
    timeTable.forEach((entry) => {
      map.set(`${entry.day_id}-${entry.time_slot_id}`, entry)
    })
    return map
  }, [timeTable])

  const getEntry = useCallback((dayId: number, slotId: string) => {
    return entryMap.get(`${dayId}-${slotId}`)
  }, [entryMap])
  
  // Check if Mon-Fri are all enabled OR Mon-Sat are all enabled
  const shouldShowLunchText = useMemo(() => {
    const monFri = [1, 2, 3, 4, 5]
    const monSat = [1, 2, 3, 4, 5, 6]
    const monFriAllEnabled = monFri.every(id => enabledDays.includes(id))
    const monSatAllEnabled = monSat.every(id => enabledDays.includes(id))
    return monFriAllEnabled || monSatAllEnabled
  }, [enabledDays])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">Day / Time</TableHead>
          {timeSlots.map((slot) => {
            const isLunchSlot = lunchSlotIds.includes(slot.id)
            return (
              <TableHead key={slot.id} className={isLunchSlot ? "bg-yellow-100" : ""}>
                {isLunchSlot && shouldShowLunchText ? "LUNCH" : isLunchSlot ? "" : `${slot.start_time} - ${slot.end_time}`}
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {days.map((day) => (
          <TableRow key={day.id}>
            <TableCell className="font-medium">{day.name}</TableCell>
            {timeSlots.map((slot) => {
              const entry = getEntry(day.id, slot.id)
              const isLunchSlot = lunchSlotIds.includes(slot.id)
              return (
                <TimetableCell
                  key={`${day.id}-${slot.id}`}
                  entry={entry}
                  teachers={teachers}
                  subjects={subjects}
                  day={day}
                  isLunch={isLunchSlot}
                  showLunchText={shouldShowLunchText}
                  onClick={() => !isLunchSlot && entry && onCellClick(entry)}
                />
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
})

TimetableGrid.displayName = "TimetableGrid"

