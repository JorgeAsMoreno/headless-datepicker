import { Temporal } from '@js-temporal/polyfill'

export function formatDisplayDate(date: Temporal.PlainDate): string {
  return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`
}
