import { memo, useMemo } from "react"
import { TableCell } from "@/components/ui/table"
import type { TimeTableEntry, Teacher, Subject, Day } from "../../types"
import { LUNCH_LETTERS } from "@/constants"

interface TimetableCellProps {
  entry: TimeTableEntry | undefined
  teachers: Teacher[]
  subjects: Subject[]
  day: Day
  isLunch?: boolean
  showLunchText?: boolean
  onClick: () => void
}

export const TimetableCell = memo(({ entry, teachers, subjects, day, isLunch = false, showLunchText = false, onClick }: TimetableCellProps) => {
  const teacherName = useMemo(() => {
    if (!entry?.teacher_id) return ""
    return teachers.find((t) => t.id === entry.teacher_id)?.name || ""
  }, [entry?.teacher_id, teachers])

  const subjectName = useMemo(() => {
    if (!entry?.subject_id) return ""
    return subjects.find((s) => s.id === entry.subject_id)?.name || ""
  }, [entry?.subject_id, subjects])

  if (isLunch) {
    // Saturday (id: 6) shows lunch symbol, others show letters
    if (day.id === 6) {
      return (
        <TableCell className="bg-yellow-50 text-center">
          <div className="flex items-center justify-center h-20">
            <span className="text-2xl">🍽️</span>
          </div>
        </TableCell>
      )
    }
    
    // Show one letter per day: Monday=L, Tuesday=U, Wednesday=N, Thursday=C, Friday=H
    const letterIndex = day.id - 1
    const letter = LUNCH_LETTERS[letterIndex] || ""
    return (
      <TableCell className="bg-yellow-50 text-center">
        <div className="flex items-center justify-center h-20">
          {showLunchText ? (
            <span className="text-lg font-bold text-yellow-800">{letter}</span>
          ) : (
            <span className="text-yellow-800 opacity-50">-</span>
          )}
        </div>
      </TableCell>
    )
  }

  return (
    <TableCell className="cursor-pointer hover:bg-gray-100" onClick={onClick}>
      {entry && entry.teacher_id ? (
        <>
          <div>{subjectName}</div>
          <div>{teacherName}</div>
        </>
      ) : (
        "-"
      )}
    </TableCell>
  )
})

TimetableCell.displayName = "TimetableCell"

