import { Temporal } from '@js-temporal/polyfill'

export interface CalendarDay {
  date: Temporal.PlainDate
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
}

export interface CalendarState {
  currentYear: number
  currentMonth: number
  selectedDate: Temporal.PlainDate | null
  weeks: CalendarDay[][]
}

export type NavAction = 'prevMonth' | 'nextMonth' | 'prevYear' | 'nextYear'

export interface CalendarEngine {
  getState(): CalendarState
  nextMonth(): void
  prevMonth(): void
  nextYear(): void
  prevYear(): void
  selectDate(date: Temporal.PlainDate): void
  clearSelection(): void
  goToToday(): void
}
