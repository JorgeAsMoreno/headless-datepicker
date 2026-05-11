<template>
  <div class="dp-wrapper" ref="wrapperRef">

    <!-- Input -->
    <div class="dp-input-wrapper">
      <input
        ref="inputRef"
        class="dp-input"
        type="text"
        :value="displayValue"
        placeholder="DD/MM/AAAA"
        readonly
        @click="toggle"
        @keydown.esc="close"
        @keydown.enter="toggle"
        aria-haspopup="true"
        :aria-expanded="isOpen"
        aria-label="Seleccionar fecha"
      />
      <span class="dp-icon" aria-hidden="true" @click="toggle">📅</span>
    </div>

    <!-- Calendar popover -->
    <div
      v-if="isOpen"
      class="dp-popover"
      role="dialog"
      aria-modal="true"
      aria-label="Calendario"
      @keydown.esc="close"
    >

      <!-- Navigation header -->
      <div class="dp-header">
        <button class="dp-nav-btn" @click="navigate('prevYear')" aria-label="Año anterior">«</button>
        <button class="dp-nav-btn" @click="navigate('prevMonth')" aria-label="Mes anterior">‹</button>
        <span class="dp-title">{{ monthLabel }}</span>
        <button class="dp-nav-btn" @click="navigate('nextMonth')" aria-label="Mes siguiente">›</button>
        <button class="dp-nav-btn" @click="navigate('nextYear')" aria-label="Año siguiente">»</button>
      </div>

      <!-- Day name column headers (visual only) -->
      <div class="dp-day-names" aria-hidden="true">
        <span v-for="day in DAY_NAMES" :key="day" class="dp-day-name">{{ day }}</span>
      </div>

      <!-- Date grid -->
      <div role="grid" class="dp-grid">
        <div
          v-for="(week, wi) in weeks"
          :key="wi"
          role="row"
          class="dp-grid-row"
        >
          <button
            v-for="day in week"
            :key="`${day.date.year}-${day.date.month}-${day.date.day}`"
            role="gridcell"
            class="dp-day"
            :class="{
              'dp-day--other-month': !day.isCurrentMonth,
              'dp-day--today':       day.isToday,
              'dp-day--selected':    day.isSelected,
              'dp-day--disabled':    day.isDisabled,
            }"
            :disabled="day.isDisabled"
            :aria-label="`${day.date.day} de ${MONTH_NAMES[day.date.month - 1]} de ${day.date.year}`"
            :aria-selected="day.isSelected"
            :tabindex="day.isCurrentMonth ? 0 : -1"
            :data-date="`${day.date.year}-${day.date.month}-${day.date.day}`"
            @click="selectDate(day.date)"
            @keydown="(e) => handleDayKeydown(e, day)"
          >
            {{ day.date.day }}
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="dp-footer">
        <button class="dp-today-btn" @click="goToToday">Hoy</button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DAY_NAMES, MONTH_NAMES } from '../helpers/constants'
import { useDatePicker } from '../composables/useDatePicker'

const wrapperRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const {
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
} = useDatePicker(wrapperRef, inputRef)
</script>

<style scoped>
/* ─── Design tokens ─────────────────────────────────────────────────────────── */
.dp-wrapper {
  --dp-primary:          #3b82f6;
  --dp-primary-hover:    #2563eb;
  --dp-primary-light:    #eff6ff;
  --dp-text:             #1e293b;
  --dp-text-muted:       #94a3b8;
  --dp-text-other-month: #cbd5e1;
  --dp-text-on-primary:  #ffffff;
  --dp-bg:               #ffffff;
  --dp-border:           #e2e8f0;
  --dp-today-ring:       #3b82f6;
  --dp-shadow:           0 8px 30px rgba(0, 0, 0, 0.12);
  --dp-radius:           10px;
  --dp-radius-sm:        6px;
  --dp-font-size:        14px;
  --dp-font-size-sm:     12px;
  --dp-day-size:         36px;
  --dp-transition:       0.15s ease;

  position: relative;
  display: inline-block;
  font-family: system-ui, sans-serif;
  font-size: var(--dp-font-size);
  color: var(--dp-text);
}

/* ─── Input ─────────────────────────────────────────────────────────────────── */
.dp-input-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.dp-input {
  width: 180px;
  padding: 8px 36px 8px 12px;
  border: 1.5px solid var(--dp-border);
  border-radius: var(--dp-radius-sm);
  font-size: var(--dp-font-size);
  color: var(--dp-text);
  background: var(--dp-bg);
  cursor: pointer;
  outline: none;
  transition: border-color var(--dp-transition);
}

.dp-input:focus-visible {
  border-color: var(--dp-primary);
}

.dp-icon {
  position: absolute;
  right: 10px;
  cursor: pointer;
  font-size: 16px;
  pointer-events: all;
  user-select: none;
}

/* ─── Popover ───────────────────────────────────────────────────────────────── */
.dp-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  background: var(--dp-bg);
  border: 1px solid var(--dp-border);
  border-radius: var(--dp-radius);
  box-shadow: var(--dp-shadow);
  padding: 16px;
  width: 280px;
  animation: dp-fade-in var(--dp-transition);
}

@keyframes dp-fade-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Header ────────────────────────────────────────────────────────────────── */
.dp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.dp-title {
  font-weight: 600;
  font-size: var(--dp-font-size);
  color: var(--dp-text);
  flex: 1;
  text-align: center;
}

.dp-nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--dp-text-muted);
  font-size: 16px;
  width: 28px;
  height: 28px;
  border-radius: var(--dp-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--dp-transition), color var(--dp-transition);
  padding: 0;
}

.dp-nav-btn:hover {
  background: var(--dp-primary-light);
  color: var(--dp-primary);
}

.dp-nav-btn:focus-visible {
  outline: 2px solid var(--dp-primary);
  outline-offset: 1px;
}

/* ─── Day name column headers ───────────────────────────────────────────────── */
.dp-day-names {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.dp-day-name {
  text-align: center;
  font-size: var(--dp-font-size-sm);
  font-weight: 600;
  color: var(--dp-text-muted);
  padding: 4px 0;
}

/* ─── Date grid ─────────────────────────────────────────────────────────────── */
.dp-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.dp-grid-row {
  display: contents;
}

.dp-day {
  width: var(--dp-day-size);
  height: var(--dp-day-size);
  border: none;
  background: none;
  border-radius: var(--dp-radius-sm);
  font-size: var(--dp-font-size);
  color: var(--dp-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--dp-transition), color var(--dp-transition);
  padding: 0;
  margin: 0 auto;
}

.dp-day:hover:not(:disabled) {
  background: var(--dp-primary-light);
  color: var(--dp-primary);
}

.dp-day:focus-visible {
  outline: 2px solid var(--dp-primary);
  outline-offset: 1px;
}

.dp-day--other-month {
  color: var(--dp-text-other-month);
}

.dp-day--today {
  font-weight: 700;
  box-shadow: inset 0 0 0 1.5px var(--dp-today-ring);
  color: var(--dp-primary);
}

.dp-day--selected {
  background: var(--dp-primary);
  color: var(--dp-text-on-primary);
  font-weight: 600;
}

.dp-day--selected:hover:not(:disabled) {
  background: var(--dp-primary-hover);
  color: var(--dp-text-on-primary);
}

.dp-day--disabled {
  color: var(--dp-text-other-month);
  cursor: not-allowed;
  opacity: 0.5;
}

/* ─── Footer ────────────────────────────────────────────────────────────────── */
.dp-footer {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--dp-border);
  padding-top: 10px;
}

.dp-today-btn {
  background: none;
  border: 1.5px solid var(--dp-primary);
  color: var(--dp-primary);
  border-radius: var(--dp-radius-sm);
  padding: 4px 16px;
  font-size: var(--dp-font-size-sm);
  cursor: pointer;
  font-weight: 600;
  transition: background var(--dp-transition), color var(--dp-transition);
}

.dp-today-btn:hover {
  background: var(--dp-primary);
  color: var(--dp-text-on-primary);
}

.dp-today-btn:focus-visible {
  outline: 2px solid var(--dp-primary);
  outline-offset: 2px;
}
</style>
