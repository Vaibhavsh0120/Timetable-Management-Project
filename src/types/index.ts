export type Teacher = {
  id: string  // UUID
  user_id: string  // UUID
  name: string
  subject_id: string  // UUID
}

export type Subject = {
  id: string  // UUID
  user_id: string  // UUID
  name: string
}

export type Section = {
  id: string  // UUID
  user_id: string  // UUID
  name: string
  class_id: string  // UUID
}

export type Class = {
  id: string  // UUID
  user_id: string  // UUID
  name: string
  sections: Section[]  // UUID
}

export type TimeSlot = {
  id: string  // UUID
  user_id: string  // UUID
  start_time: string
  end_time: string
  is_lunch?: boolean  // Whether this time slot is a lunch break
}

export type Day = {
  id: number
  name: string
}

export type Timetable = {
  id: string  // UUID
  user_id: string  // UUID
  name: string
  created_at: string
  updated_at: string
}

export type TimetableSettings = {
  id: string  // UUID
  timetable_id: string  // UUID
  user_id: string  // UUID
  enabled_days: number[]  // Array of day IDs (1-6)
  max_lunch_slots: number
  lunch_slot_ids: string[]  // Array of timeslot IDs marked as lunch
  created_at: string
  updated_at: string
}

export type TimeTableEntry = {
  id: string  // UUID
  user_id: string  // UUID
  timetable_id: string  // UUID - Reference to timetables table
  teacher_id: string | null  // UUID
  class_id: string  // UUID
  section_id: string  // UUID
  subject_id: string | null // UUID
  time_slot_id: string  // UUID
  day_id: number
}

