import type { TimeTableEntry, Day, TimeSlot, Teacher, Subject } from "../types"

export const generateEmptyTimetable = (
  classId: string,
  sectionId: string,
  timetableId: string,
  days: Day[],
  timeSlots: TimeSlot[],
): TimeTableEntry[] => {
  const emptyTimetable: TimeTableEntry[] = []

  days.forEach((day) => {
    timeSlots.forEach((slot) => {
      emptyTimetable.push({
        id: `${classId}-${sectionId}-${day.id}-${slot.id}`,
        user_id: "", // This should be set when creating the actual entry
        timetable_id: timetableId,
        class_id: classId,
        section_id: sectionId,
        teacher_id: null,
        subject_id: null,
        time_slot_id: slot.id,
        day_id: day.id,
      })
    })
  })

  return emptyTimetable
}

export const getTeacherName = (teacherId: string | null, teachers: Teacher[]): string => {
  return teachers.find((t) => t.id === teacherId)?.name || ""
}

export const getSubjectName = (subjectId: string | null, subjects: Subject[]): string => {
  return subjects.find((s) => s.id === subjectId)?.name || ""
}

export const checkConflictsAcrossTimeTables = (
  teacherId: string,
  timeSlotId: string,
  dayId: number,
  currentClassId: string,
  currentSectionId: string,
  savedTimeTables: { [key: string]: TimeTableEntry[] },
): boolean => {
  return Object.entries(savedTimeTables).some(([key, savedTimeTable]) => {
    const [classId, sectionId] = key.split("-")
    return savedTimeTable.some(
      (entry) =>
        entry.teacher_id === teacherId &&
        entry.time_slot_id === timeSlotId &&
        entry.day_id === dayId &&
        (classId !== currentClassId || sectionId !== currentSectionId),
    )
  })
}

