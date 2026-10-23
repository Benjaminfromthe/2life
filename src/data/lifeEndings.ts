// ============================================================
// 2Life — Life Endings (Requirement #11: data-driven endings)
// Each entry describes one way the game can end.
// Deterministic conditions use check(); probabilistic ones
// (old_age) and time-based ones (completed) are fired directly
// from advanceSlotIfNeeded in the store.
// ============================================================
import type { LifeEnding } from "../types/game";

export const LIFE_ENDINGS: LifeEnding[] = [
  {
    reason: "health_death",
    icon: "🏥",
    title: "Hospitalised!",
    body: "Your health hit zero. You pushed yourself too hard and your body gave out. Take better care of yourself next time.",
    check: (s) => s.stats.health <= 0,
  },
  {
    reason: "bankruptcy",
    icon: "💸",
    title: "Bankrupt!",
    body: "You ran out of money for too many days in a row and couldn't recover. Time to start fresh.",
    check: (s) => s.bankruptDays >= 7,
  },
  {
    reason: "expelled",
    icon: "📛",
    title: "Expelled!",
    body: "Too many absences — you were expelled from school. Attendance really does matter.",
    check: (s) => s.character === "student" && s.absences >= 10,
  },
  {
    reason: "grades",
    icon: "📉",
    title: "Academic Failure!",
    body: "Your grades dropped to zero. The school held you back a year. Study harder next time!",
    check: (s) => s.character === "student" && s.stats.grades <= 0,
  },
  {
    reason: "old_age",
    icon: "🕊️",
    title: "A Life Well Lived",
    body: "You reached old age. Every day was a gift — and you made the most of yours.",
    // Fired by the store's advanceSlotIfNeeded when age >= 60 via a random roll.
  },
  {
    reason: "completed",
    icon: "🎓",
    title: "Life Completed!",
    body: "You made it through your journey. Every choice shaped the person you became.",
    // Fired by the store's advanceSlotIfNeeded when day > END_OF_GAME_DAY.
  },
  {
    reason: "default",
    icon: "😔",
    title: "Game Over",
    body: "Life didn't go as planned. But every ending is a chance to start again.",
  },
];

/** Look up an ending by reason (falls back to "default"). */
export const getLifeEnding = (reason: string): LifeEnding =>
  LIFE_ENDINGS.find((e) => e.reason === reason) ??
  LIFE_ENDINGS.find((e) => e.reason === "default")!;
