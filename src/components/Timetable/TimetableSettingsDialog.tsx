"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DAYS } from "@/constants"
import type { TimeSlot } from "@/types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  enabledDays: number[]
  onToggleDay: (dayId: number) => void
  maxLunchSlots: number
  onChangeMaxLunchSlots: (value: number) => void
  lunchSlotIds: string[]
  onToggleLunchSlot: (timeSlotId: string, nextIsLunch: boolean) => void
  timeSlots: TimeSlot[]
}

export function TimetableSettingsDialog({
  open,
  onOpenChange,
  enabledDays,
  onToggleDay,
  maxLunchSlots,
  onChangeMaxLunchSlots,
  lunchSlotIds,
  onToggleLunchSlot,
  timeSlots,
}: Props) {
  const lunchCount = lunchSlotIds.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Timetable settings</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          <section className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Enabled days</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // quick reset to Mon-Fri
                    const defaultDays = [1, 2, 3, 4, 5]
                    const current = new Set(enabledDays)
                    const isDefault = defaultDays.every((d) => current.has(d)) && enabledDays.length === defaultDays.length
                    if (isDefault) return
                    // toggle to match default: remove extras, add missing
                    for (const d of DAYS.map((x) => x.id)) {
                      const shouldBeEnabled = defaultDays.includes(d)
                      const isEnabled = current.has(d)
                      if (shouldBeEnabled !== isEnabled) onToggleDay(d)
                    }
                  }}
                >
                  Mon–Fri
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {DAYS.map((day) => (
                <label key={day.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enabledDays.includes(day.id)}
                    onChange={() => onToggleDay(day.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-foreground">{day.name}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <Label className="font-medium">Lunch slots</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="maxLunch" className="text-sm text-muted-foreground">
                  Max lunch
                </Label>
                <Input
                  id="maxLunch"
                  type="number"
                  min={0}
                  value={maxLunchSlots}
                  onChange={(e) => onChangeMaxLunchSlots(Number.parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  {lunchCount}/{maxLunchSlots}
                </span>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-3">
              {timeSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Create time slots to choose lunch periods.</p>
              ) : (
                <div className="grid gap-2">
                  {timeSlots.map((ts) => {
                    const checked = lunchSlotIds.includes(ts.id)
                    return (
                      <label key={ts.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-foreground">
                          {ts.start_time} – {ts.end_time}
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleLunchSlot(ts.id, !checked)}
                          className="h-4 w-4"
                        />
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

