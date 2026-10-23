// ============================================================
// 2Life — Zustand Game Store
// ============================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GameState,
  CharacterId,
  TimeSlot,
  Action,
  QuizResult,
  Stats,
  ConsequencePayload,
} from "../types/game";
import { CHARACTERS } from "../data/characters";

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------
const clamp = (v: number) => Math.max(0, Math.min(100, v));

const applyStatDelta = (stats: Stats, delta: Record<string, number | undefined>): Stats => ({
  energy: clamp(stats.energy + (delta.energy ?? 0)),
  health: clamp(stats.health + (delta.health ?? 0)),
  happiness: clamp(stats.happiness + (delta.happiness ?? 0)),
  grades: clamp(stats.grades + (delta.grades ?? 0)),
  fitness: clamp(stats.fitness + (delta.fitness ?? 0)),
  performance: clamp(stats.performance + (delta.performance ?? 0)),
});

const SLOT_ORDER: TimeSlot[] = ["morning", "afternoon", "evening", "night"];

const nextSlot = (current: TimeSlot): TimeSlot | null => {
  const idx = SLOT_ORDER.indexOf(current);
  return idx < SLOT_ORDER.length - 1 ? SLOT_ORDER[idx + 1] : null;
};

const defaultStats = (): Stats => ({
  energy: 80,
  health: 90,
  happiness: 70,
  grades: 60,
  fitness: 60,
  performance: 60,
});

// ----------------------------------------------------------
// Initial State
// ----------------------------------------------------------
const initialState = {
  screen: "welcome" as const,
  playerName: "",
  character: null as CharacterId | null,
  day: 1,
  slot: "morning" as TimeSlot,
  stats: defaultStats(),
  credits: 200,
  absences: 0,
  warnings: 0,
  studyBonus: false,
  consecutiveLowEnergy: 0,
  pendingConsequence: null as ConsequencePayload | null,
  pendingQuiz: false,
  history: [] as GameState["history"],
  gameOverReason: "",
};

// ----------------------------------------------------------
// Store
// ----------------------------------------------------------
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // -------------------------------------------------------
      setPlayerName: (name) => set({ playerName: name }),

      // -------------------------------------------------------
      selectCharacter: (id) => {
        const char = CHARACTERS.find((c) => c.id === id);
        if (!char) return;
        set({
          character: id,
          stats: { ...char.startingStats },
          credits: char.startingCredits,
        });
      },

      // -------------------------------------------------------
      startGame: () => {
        set({ screen: "game", day: 1, slot: "morning" });
      },

      // -------------------------------------------------------
      performAction: (action: Action) => {
        const state = get();
        if (!state.character) return;

        // Apply stat deltas
        const newStats = applyStatDelta(state.stats, action.statDelta);

        // Apply credits
        const newCredits = Math.max(0, state.credits + action.creditDelta);

        // Absences
        const newAbsences = state.absences + (action.absenceDelta ?? 0);

        // Study bonus: set only for study_at_home
        const newStudyBonus =
          action.id === "study_at_home" ? true : state.studyBonus;

        // Push history entry
        const historyEntry = {
          day: state.day,
          slot: state.slot,
          actionId: action.id,
          statSnapshot: { ...state.stats },
          credits: state.credits,
        };

        // Build consequence
        const consequenceType: ConsequencePayload["type"] =
          action.statDelta.grades && action.statDelta.grades < 0
            ? "negative"
            : action.id === "skip_school"
            ? "warning"
            : action.creditDelta < 0
            ? "neutral"
            : "positive";

        const consequence: ConsequencePayload = {
          icon: action.icon,
          title: action.label,
          body: action.description,
          type: consequenceType,
        };

        set({
          stats: newStats,
          credits: newCredits,
          absences: newAbsences,
          studyBonus: newStudyBonus,
          history: [...state.history, historyEntry],
          pendingConsequence: consequence,
          pendingQuiz: action.triggerQuiz === true,
        });

        // Check consequences after setting
        const updated = get();
        checkGameOverConditions(updated, set);
      },

      // -------------------------------------------------------
      dismissConsequence: () => {
        const state = get();
        if (state.pendingQuiz) {
          set({ pendingConsequence: null, screen: "quiz" });
        } else {
          set({ pendingConsequence: null });
          advanceSlotIfNeeded(get(), set);
        }
      },

      // -------------------------------------------------------
      submitQuiz: (result: QuizResult) => {
        const state = get();
        let gradesDelta = 0;
        let consequence: ConsequencePayload;

        if (result.passed) {
          gradesDelta = result.score >= 80 ? 12 : 6;
          const creditsEarned = result.score >= 80 ? 50 : 25;
          set({
            stats: applyStatDelta(state.stats, { grades: gradesDelta }),
            credits: state.credits + creditsEarned,
            studyBonus: false,
            screen: "game",
          });
          consequence = {
            icon: "🎉",
            title: "Quiz Passed!",
            body: `You scored ${result.score}%! ${
              result.score >= 80
                ? "Outstanding! Grades +12, ₡50 earned."
                : "Not bad! Grades +6, ₡25 earned."
            }`,
            type: "positive",
          };
        } else {
          gradesDelta = -10;
          set({
            stats: applyStatDelta(state.stats, { grades: gradesDelta }),
            studyBonus: false,
            screen: "game",
          });
          consequence = {
            icon: "😬",
            title: "Quiz Failed!",
            body: `You scored ${result.score}%. Your grades dropped. Study more next time!`,
            type: "negative",
          };
        }

        set({ pendingConsequence: consequence, pendingQuiz: false });

        // Check game-over after quiz
        const updated = get();
        checkGameOverConditions(updated, set);
      },

      // -------------------------------------------------------
      advanceSlot: () => {
        const state = get();
        advanceSlotIfNeeded(state, set);
      },

      // -------------------------------------------------------
      resetGame: () => {
        set({ ...initialState, screen: "welcome" });
      },
    }),
    {
      name: "2life-game-state",
      // Only persist non-function fields
      partialize: (state) => ({
        playerName: state.playerName,
        character: state.character,
        day: state.day,
        slot: state.slot,
        stats: state.stats,
        credits: state.credits,
        absences: state.absences,
        warnings: state.warnings,
        studyBonus: state.studyBonus,
        consecutiveLowEnergy: state.consecutiveLowEnergy,
        history: state.history,
        screen: state.screen,
        gameOverReason: state.gameOverReason,
        pendingConsequence: null, // don't persist transient UI
        pendingQuiz: false,
      }),
    }
  )
);

// ----------------------------------------------------------
// Helpers (outside store to avoid circular ref)
// ----------------------------------------------------------
function advanceSlotIfNeeded(
  state: GameState,
  set: (partial: Partial<GameState>) => void
) {
  const next = nextSlot(state.slot);
  if (next) {
    set({ slot: next });
  } else {
    // End of day — advance to next morning
    const newDay = state.day + 1;
    const endOfGameDay = 30; // game lasts 30 days

    // Restore overnight energy
    const refreshedStats = applyStatDelta(state.stats, {
      energy: 20,
      health: state.stats.energy < 20 ? -5 : 0, // penalise if went to sleep exhausted
    });

    const newConsecutiveLowEnergy =
      state.stats.energy < 20 ? state.consecutiveLowEnergy + 1 : 0;

    if (newDay > endOfGameDay) {
      set({ screen: "game-over", gameOverReason: "completed" });
      return;
    }

    set({
      day: newDay,
      slot: "morning",
      studyBonus: false,
      stats: refreshedStats,
      consecutiveLowEnergy: newConsecutiveLowEnergy,
    });

    // Check for forced rest if consecutive low energy
    if (newConsecutiveLowEnergy >= 3) {
      set({
        pendingConsequence: {
          icon: "🏥",
          title: "Forced Rest Day",
          body: "You've been burning the candle at both ends. Your body gave out — you had to stay in bed all day.",
          type: "warning",
        },
        slot: "night", // skip the whole day
      });
    }
  }
}

function checkGameOverConditions(
  state: GameState,
  set: (partial: Partial<GameState>) => void
) {
  // Zero health
  if (state.stats.health <= 0) {
    set({ screen: "game-over", gameOverReason: "health" });
    return;
  }

  // Student-specific: too many absences
  if (state.character === "student") {
    if (state.absences >= 10) {
      set({ screen: "game-over", gameOverReason: "expelled" });
      return;
    }
    if (state.stats.grades <= 0) {
      set({ screen: "game-over", gameOverReason: "grades" });
      return;
    }
    // Warning thresholds
    if (state.absences === 5 && state.warnings < 1) {
      set({
        warnings: 1,
        pendingConsequence: {
          icon: "⚠️",
          title: "First Warning!",
          body: "You have 5 absences. One more warning and you'll be suspended!",
          type: "warning",
        },
      });
    } else if (state.absences === 8 && state.warnings < 2) {
      set({
        warnings: 2,
        pendingConsequence: {
          icon: "🚨",
          title: "Suspended!",
          body: "You have been suspended for 2 days due to excessive absences.",
          type: "negative",
        },
      });
    }
  }

  // Zero credits — just a warning for now
  if (state.credits <= 0 && !state.pendingConsequence) {
    set({
      pendingConsequence: {
        icon: "💸",
        title: "Broke!",
        body: "You've run out of credits. You can't buy food or go out until you earn more.",
        type: "warning",
      },
    });
  }
}
