import { ref, computed, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import { Temporal } from '@js-temporal/polyfill'
import { DatePickerEngine } from '../engine/DatePickerEngine'
import { MONTH_NAMES } from '../helpers/constants'
import { formatDisplayDate } from '../helpers/date'
import type { CalendarDay, NavAction } from '../engine/types'

export function useDatePicker(
  wrapperRef: Ref<HTMLElement | null>,
  inputRef: Ref<HTMLInputElement | null>,
) {
  const engine = new DatePickerEngine()
  const state = ref(engine.getState())
  const isOpen = ref(false)

  function sync(): void {
    state.value = engine.getState()
  }

  const weeks = computed(() => state.value.weeks)

  const monthLabel = computed(
    () => `${MONTH_NAMES[state.value.currentMonth - 1]} ${state.value.currentYear}`,
  )

  const displayValue = computed<string>(() => {
    const d = state.value.selectedDate
    return d ? formatDisplayDate(d) : ''
  })

  function open(): void {
    isOpen.value = true
  }

  function close(): void {
    isOpen.value = false
    inputRef.value?.focus()
  }

  function toggle(): void {
    isOpen.value ? close() : open()
  }

  function navigate(action: NavAction): void {
    engine[action]()
    sync()
  }

  function selectDate(date: Temporal.PlainDate): void {
    engine.selectDate(date)
    sync()
    close()
  }

  function goToToday(): void {
    engine.goToToday()
    sync()
  }

  function navigateToDate(date: Temporal.PlainDate): void {
    const { currentYear, currentMonth } = state.value
    if (date.year === currentYear && date.month === currentMonth) return
    const isForward =
      date.year > currentYear || (date.year === currentYear && date.month > currentMonth)
    navigate(isForward ? 'nextMonth' : 'prevMonth')
  }

  async function handleDayKeydown(e: KeyboardEvent, day: CalendarDay): Promise<void> {
    const offsets: Partial<Record<string, { days: number }>> = {
      ArrowRight: { days: 1 },
      ArrowLeft: { days: -1 },
      ArrowDown: { days: 7 },
      ArrowUp: { days: -7 },
    }

    const offset = offsets[e.key]
    if (!offset) return

    e.preventDefault()
    const target = day.date.add(offset)
    navigateToDate(target)

    await nextTick()

    const key = `${target.year}-${target.month}-${target.day}`
    wrapperRef.value
      ?.querySelector<HTMLButtonElement>(`[data-date="${key}"]`)
      ?.focus()
  }

  function handleClickOutside(e: MouseEvent): void {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
      close()
    }
  }

  onMounted(() => document.addEventListener('mousedown', handleClickOutside))
  onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

  return {
    isOpen,
    weeks,
    monthLabel,
    displayValue,
    toggle,
    close,
    navigate,
    selectDate,
    goToToday,
    handleDayKeydown,
  }
}
