import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for time formatting
export function formatTime12Hour(time: string): string {
  try {
    // If time is already in correct format, return it
    if (/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(time)) {
      return time
    }

    // If time is in HTML input format (HH:mm), convert it to 12-hour format
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  } catch (error) {
    console.error("Error formatting time:", error)
    return time
  }
}

// Utility function to check if two time ranges overlap
export function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Convert times to minutes since midnight for easy comparison
  const toMinutes = (timeStr: string) => {
    const [time, period] = timeStr.split(" ")
    let [hours, minutes] = time.split(":").map(Number)
    
    if (period === "PM" && hours !== 12) {
      hours += 12
    }
    if (period === "AM" && hours === 12) {
      hours = 0
    }
    
    return hours * 60 + minutes
  }

  const start1Min = toMinutes(start1)
  const end1Min = toMinutes(end1)
  const start2Min = toMinutes(start2)
  const end2Min = toMinutes(end2)

  // Check if ranges overlap
  return Math.max(start1Min, start2Min) < Math.min(end1Min, end2Min)
}