import { Temporal } from '@js-temporal/polyfill'
import type { CalendarDay, CalendarState, CalendarEngine } from './types'

export class DatePickerEngine implements CalendarEngine {
  private yearMonth: Temporal.PlainYearMonth
  private selectedDate: Temporal.PlainDate | null = null
  private readonly today: Temporal.PlainDate

  constructor() {
    this.today = Temporal.Now.plainDateISO()
    this.yearMonth = Temporal.PlainYearMonth.from({ year: this.today.year, month: this.today.month })
  }

  nextMonth(): void {
    this.yearMonth = this.yearMonth.add({ months: 1 })
  }

  prevMonth(): void {
    this.yearMonth = this.yearMonth.subtract({ months: 1 })
  }

  nextYear(): void {
    this.yearMonth = this.yearMonth.add({ years: 1 })
  }

  prevYear(): void {
    this.yearMonth = this.yearMonth.subtract({ years: 1 })
  }

  goToToday(): void {
    this.yearMonth = Temporal.PlainYearMonth.from({ year: this.today.year, month: this.today.month })
  }

  selectDate(date: Temporal.PlainDate): void {
    this.selectedDate = date
    this.yearMonth = Temporal.PlainYearMonth.from({ year: date.year, month: date.month })
  }

  clearSelection(): void {
    this.selectedDate = null
  }

  getState(): CalendarState {
    return {
      currentYear: this.yearMonth.year,
      currentMonth: this.yearMonth.month,
      selectedDate: this.selectedDate,
      weeks: this.buildWeeks(),
    }
  }

  private buildWeeks(): CalendarDay[][] {
    const { year, month, daysInMonth } = this.yearMonth
    const firstOfMonth = Temporal.PlainDate.from({ year, month, day: 1 })

    // dayOfWeek: 1=Mon…7=Sun (ISO 8601). Leading offset for a Monday-first grid.
    const leadingDays = firstOfMonth.dayOfWeek - 1

    const days: CalendarDay[] = []

    for (let i = leadingDays; i > 0; i--) {
      days.push(this.buildDay(firstOfMonth.subtract({ days: i }), false))
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(this.buildDay(firstOfMonth.with({ day: d }), true))
    }

    const lastOfMonth = firstOfMonth.with({ day: daysInMonth })
    const trailing = days.length % 7 === 0 ? 0 : 7 - (days.length % 7)
    for (let i = 1; i <= trailing; i++) {
      days.push(this.buildDay(lastOfMonth.add({ days: i }), false))
    }

    const weeks: CalendarDay[][] = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    return weeks
  }

  private buildDay(date: Temporal.PlainDate, isCurrentMonth: boolean): CalendarDay {
    return {
      date,
      isCurrentMonth,
      isToday: date.equals(this.today),
      isSelected: this.selectedDate ? date.equals(this.selectedDate) : false,
      isDisabled: false,
    }
  }
}
