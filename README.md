# Headless Date Picker

A fully functional Date Picker built with Vue 3 + TypeScript, where the core calendar logic is entirely decoupled from the UI framework.

## How to run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Architecture

### State management between Engine and Component

The project is split into three layers:

**Engine** (`src/engine/DatePickerEngine.ts`) — pure TypeScript class, zero Vue imports. Owns all calendar state (`Temporal.PlainYearMonth`, selected date) and exposes an immutable snapshot via `getState()`. Each mutation method returns `void` and the caller is responsible for requesting a new snapshot.

**Composable** (`src/composables/useDatePicker.ts`) — the bridge layer. Wraps the engine in a Vue `ref`, exposes reactive state and handler functions. Every engine mutation is immediately followed by a `sync()` call that replaces the ref with the new snapshot. This pattern is explicit by design: the composable is the only place that knows about both the engine API and Vue reactivity. The component is kept completely ignorant of the engine.

**Component** (`src/components/DatePicker.vue`) — pure UI. Imports only from the composable. Owns its own template refs (`wrapperRef`, `inputRef`) and passes them to the composable so DOM operations (click-outside, focus restoration, arrow-key focus) are handled in one place.

### Temporal API observations

The `Temporal` API (`@js-temporal/polyfill`) replaces every use of the legacy `Date` object:

- `Temporal.Now.plainDateISO()` — returns today's date without timezone ambiguity. Unlike `new Date()`, it never shifts the calendar day depending on the user's UTC offset.
- `Temporal.PlainYearMonth` — models the "current view" cleanly. Navigation is `yearMonth.add({ months: 1 })`, which handles year rollovers automatically with no manual arithmetic.
- `Temporal.PlainDate` — calendar day representation. `.equals()` replaces hand-rolled `isSameDay`, `.with({ day: n })` replaces `new Date(year, month-1, day)`, and `.dayOfWeek` follows ISO 8601 (1=Mon, 7=Sun) making Monday-first grids trivial to compute without a `rawDay === 0 ? 6 : rawDay - 1` guard.
- Immutability — all Temporal objects are immutable. Navigating months produces a new `PlainYearMonth` rather than mutating state, which makes the engine's data flow easy to reason about.

The main limitation: `Temporal` is still a stage-3 proposal and requires the `@js-temporal/polyfill` package in environments where native support is absent (most current runtimes as of 2026).

## Keyboard support

| Key | Behavior |
|-----|----------|
| `Enter` / `Click` on input | Toggle calendar |
| `Esc` | Close calendar, return focus to input |
| `Arrow keys` on a day cell | Move focus to adjacent day (navigates month if needed) |
| `Enter` / `Click` on a day cell | Select date |

## Project structure

```
src/
  engine/
    DatePickerEngine.ts   # Pure TS — zero Vue imports
    types.ts              # CalendarEngine interface, CalendarState, CalendarDay
  composables/
    useDatePicker.ts      # Vue ↔ Engine bridge
  components/
    DatePicker.vue        # Template + scoped CSS only
  helpers/
    constants.ts          # DAY_NAMES, MONTH_NAMES
    date.ts               # formatDisplayDate utility
```
