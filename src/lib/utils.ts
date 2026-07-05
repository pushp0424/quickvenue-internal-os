import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formats a Date's local calendar date as YYYY-MM-DD.
// Deliberately avoids toISOString() here — that converts through UTC, which
// shifts the date by one day in any timezone ahead of UTC (e.g. IST) for
// local-midnight Date objects such as `new Date(y, m, d)`.
export function toLocalDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
