"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ClassSectionSelector } from "./ClassSection/ClassSectionSelector"
import { ClassSectionManager } from "./ClassSection/ClassSectionManager"
import { TeacherSubjectManager } from "./TeacherSubject/TeacherSubjectManager"
import { TimeSlotManager } from "./TimeSlot/TimeSlotManager"
import { TimeSlotEditor } from "./TimeSlot/TimeSlotEditor"
import { TimetableGrid } from "./Timetable/TimetableGrid"
import { TimetableSettingsDialog } from "./Timetable/TimetableSettingsDialog"
import { useClasses } from "../hooks/useClasses"
import { useTeachers } from "../hooks/useTeachers"
import { useSubjects } from "../hooks/useSubjects"
import { useTimeSlots } from "../hooks/useTimeSlots"
import { useTimetable } from "../hooks/useTimetable"
import { useTimetableSettings } from "../hooks/useTimetableSettings"
import type { TimeTableEntry, TimeSlot } from "../types"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DAYS } from "@/constants"

interface TimetableManagementProps {
  timetableId: string
}

export const TimetableManagement = ({ timetableId }: TimetableManagementProps) => {
  const { toast } = useToast()
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [isManagingClasses, setIsManagingClasses] = useState(false)
  const [selectedCell, setSelectedCell] = useState<TimeTableEntry | null>(null)
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null)
  const [isManagingTimeSlots, setIsManagingTimeSlots] = useState(false)
  const [isManagingTeachersSubjects, setIsManagingTeachersSubjects] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const hasInitializedRef = useRef<string | null>(null)
  
  // Use timetable settings hook instead of localStorage
  const {
    enabledDays,
    maxLunchSlots,
    lunchSlotIds,
    updateEnabledDays,
    updateMaxLunchSlots,
    toggleLunchSlot,
  } = useTimetableSettings(timetableId)
  
  const toggleDay = useCallback(
    (dayId: number) => {
      const newEnabledDays = enabledDays.includes(dayId)
        ? enabledDays.filter((id) => id !== dayId)
        : [...enabledDays, dayId].sort()
      updateEnabledDays(newEnabledDays)
    },
    [enabledDays, updateEnabledDays],
  )
  
  const filteredDays = DAYS.filter((day) => enabledDays.includes(day.id))

  const { classes, addClass, updateClass, deleteClass, addSection, updateSection, deleteSection } = useClasses()
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useTeachers()
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjects()
  const { timeSlots, addTimeSlot, updateTimeSlot, deleteTimeSlot } = useTimeSlots()
  const {
    timeTable,
    isLoading,
    initializeTimeTable,
    fetchTimetable,
    updateTeacherInTimeTable,
    clearTimeTable,
    checkTeacherConflict,
  } = useTimetable(timetableId)

  // Listen for header gear click (page header dispatches a custom event)
  useEffect(() => {
    const handler = () => setIsSettingsOpen(true)
    window.addEventListener("timetable:open-settings", handler as EventListener)
    return () => window.removeEventListener("timetable:open-settings", handler as EventListener)
  }, [])

  // Initialize timetable when time slots become available after section is selected
  useEffect(() => {
    if (!selectedClass || !selectedSection) {
      hasInitializedRef.current = null
      return
    }
    
    const sectionKey = `${selectedClass}-${selectedSection}`
    const timeSlotsCount = Array.isArray(timeSlots) ? timeSlots.length : 0
    const timeTableCount = Array.isArray(timeTable) ? timeTable.length : 0
    
    if (timeSlotsCount > 0 && !isLoading && hasInitializedRef.current !== sectionKey) {
      // Only initialize if we don't have entries yet (new timetable or first load)
      if (timeTableCount === 0 && Array.isArray(timeSlots)) {
        hasInitializedRef.current = sectionKey
        initializeTimeTable(selectedClass, selectedSection, filteredDays, timeSlots)
      }
    }
  }, [
    selectedClass ?? '',
    selectedSection ?? '',
    Array.isArray(timeSlots) ? timeSlots.length : 0,
    isLoading,
    Array.isArray(timeTable) ? timeTable.length : 0,
    initializeTimeTable,
  ])

  const handleClassChange = useCallback(
    (classId: string) => {
      clearTimeTable()
      hasInitializedRef.current = null
      setSelectedClass(classId)
      setSelectedSection(null)
    },
    [clearTimeTable],
  )

  const handleSectionChange = useCallback(
    async (sectionId: string) => {
      if (!selectedClass) return
      
      setSelectedSection(sectionId)
      hasInitializedRef.current = null // Reset so effect can initialize if needed
      
      // Don't initialize if time slots haven't loaded yet
      if (!timeSlots || timeSlots.length === 0) {
        console.warn("Time slots not loaded yet, skipping initialization")
        // Try to fetch existing timetable entries instead
        await fetchTimetable(selectedClass, sectionId)
        return
      }
      
      // If time slots are available, try to fetch first (in case entries already exist)
      await fetchTimetable(selectedClass, sectionId)
      // The useEffect will handle initialization if no entries exist
    },
    [selectedClass, fetchTimetable, timeSlots],
  )

  const handleCellClick = useCallback((entry: TimeTableEntry) => {
    setSelectedCell(entry)
  }, [])

  const handleTeacherChange = useCallback(
    async (newTeacherId: string) => {
      if (selectedCell && selectedClass && selectedSection) {
        const teacher = teachers.find((t) => t.id === newTeacherId)
        if (!teacher) {
          console.error("Teacher not found")
          return
        }

        try {
          const hasConflict = await checkTeacherConflict(
            newTeacherId,
            selectedCell.class_id,
            selectedCell.section_id,
            selectedCell.time_slot_id,
            selectedCell.day_id,
          )

          if (hasConflict) {
            const conflictClass = classes.find((c) => c.id === selectedCell.class_id)
            const conflictSection = conflictClass?.sections.find((s) => s.id === selectedCell.section_id)
            toast({
              title: "Teacher Assignment Conflict",
              description: `${teacher.name} is already assigned to ${conflictClass?.name} ${conflictSection?.name} during this time slot.`,
              variant: "destructive",
            })
            return
          }

          await updateTeacherInTimeTable(
            newTeacherId,
            teacher.subject_id,
            selectedCell.class_id,
            selectedCell.section_id,
            selectedCell.time_slot_id,
            selectedCell.day_id,
          )
          setSelectedCell(null)
          toast({
            title: "Teacher Updated",
            description: "The teacher has been successfully assigned to this time slot.",
          })
        } catch (error) {
          console.error("Error updating teacher:", error)
          toast({
            title: "Error",
            description: "An error occurred while updating the teacher.",
            variant: "destructive",
          })
        }
      }
    },
    [
      selectedCell,
      selectedClass,
      selectedSection,
      teachers,
      updateTeacherInTimeTable,
      checkTeacherConflict,
      classes,
      toast,
    ],
  )

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Timetable Management System</h1>
      </div>
      <div className="mb-4 flex items-center space-x-2">
        <ClassSectionSelector
          classes={classes}
          selectedClass={selectedClass}
          selectedSection={selectedSection}
          onClassChange={handleClassChange}
          onSectionChange={handleSectionChange}
        />
        <Button onClick={() => setIsManagingClasses(true)}>Manage Classes</Button>
      </div>
      {selectedClass &&
        selectedSection &&
        (isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <TimetableGrid
            timeTable={timeTable}
            days={filteredDays}
            timeSlots={timeSlots}
            teachers={teachers}
            subjects={subjects}
            enabledDays={enabledDays}
            timetableId={timetableId}
            lunchSlotIds={lunchSlotIds}
            onCellClick={handleCellClick}
          />
        ))}
      {selectedClass && selectedSection && (
        <div className="mt-4 flex space-x-2">
          <Button onClick={() => setIsManagingTeachersSubjects(true)}>Manage Teachers and Subjects</Button>
          <Button onClick={() => setIsManagingTimeSlots(true)}>Edit Time Slots</Button>
        </div>
      )}
      <Dialog
        open={!!selectedCell}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCell(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Teacher</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="teacher">Select Teacher</Label>
            <Select onValueChange={handleTeacherChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {`${teacher.name} (${subjects.find((s) => s.id === teacher.subject_id)?.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isManagingClasses} onOpenChange={setIsManagingClasses}>
        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Classes and Sections</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <ClassSectionManager
              classes={classes}
              addClass={addClass}
              updateClass={updateClass}
              deleteClass={deleteClass}
              addSection={addSection}
              updateSection={updateSection}
              deleteSection={deleteSection}
            />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isManagingTimeSlots} onOpenChange={setIsManagingTimeSlots}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Time Slots</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <TimeSlotManager
              timeSlots={timeSlots}
              addTimeSlot={addTimeSlot}
              updateTimeSlot={updateTimeSlot}
              deleteTimeSlot={deleteTimeSlot}
              onEditTimeSlot={(timeSlot) => setEditingTimeSlot(timeSlot)}
            />
          </div>
        </DialogContent>
      </Dialog>
      <TimeSlotEditor timeSlot={editingTimeSlot} onUpdate={updateTimeSlot} onClose={() => setEditingTimeSlot(null)} />

      <TimetableSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        enabledDays={enabledDays}
        onToggleDay={toggleDay}
        maxLunchSlots={maxLunchSlots}
        onChangeMaxLunchSlots={(value) => updateMaxLunchSlots(value)}
        lunchSlotIds={lunchSlotIds}
        onToggleLunchSlot={(timeSlotId, nextIsLunch) => toggleLunchSlot(timeSlotId, nextIsLunch)}
        timeSlots={timeSlots}
      />
      <Dialog open={isManagingTeachersSubjects} onOpenChange={setIsManagingTeachersSubjects}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Teachers and Subjects</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <TeacherSubjectManager
              teachers={teachers}
              subjects={subjects}
              addTeacher={addTeacher}
              updateTeacher={updateTeacher}
              deleteTeacher={deleteTeacher}
              addSubject={addSubject}
              updateSubject={updateSubject}
              deleteSubject={deleteSubject}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

