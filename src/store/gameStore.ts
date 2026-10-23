// ============================================================
// 2Life — Zustand Game Store
// Requirements: event choices (#9), life log (#10),
//               data-driven endings & goals (#11)
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
  EventChoice,
  LifeLogEntry,
  LifeLogCategory,
  GoalId,
  LifeEndingReason,
} from "../types/game";
import { CHARACTERS } from "../data/characters";
import { RANDOM_EVENTS, rollRandomEvent } from "../data/events";
import { GOALS } from "../data/goals";
import { LIFE_ENDINGS } from "../data/lifeEndings";

// ── Constants ─────────────────────────────────────────────
const END_OF_GAME_DAY   = 30;  // current campaign length
const DAYS_PER_YEAR     = 12;  // game-days per in-game year
const OLD_AGE_THRESHOLD = 60;  // age at which death roll begins
const OLD_AGE_DEATH_PROB= 0.03;// 3 % chance per new day after 60
const MAX_BANKRUPT_DAYS = 7;   // consecutive broke days → bankruptcy ending

// ── Helpers ───────────────────────────────────────────────
const clamp = (v: number) => Math.max(0, Math.min(100, v));

const applyStatDelta = (
  stats: Stats,
  delta: Record<string, number | undefined>
): Stats => ({
  energy:      clamp(stats.energy      + (delta.energy      ?? 0)),
  health:      clamp(stats.health      + (delta.health      ?? 0)),
  happiness:   clamp(stats.happiness   + (delta.happiness   ?? 0)),
  grades:      clamp(stats.grades      + (delta.grades      ?? 0)),
  fitness:     clamp(stats.fitness     + (delta.fitness     ?? 0)),
  performance: clamp(stats.performance + (delta.performance ?? 0)),
});

const SLOT_ORDER: TimeSlot[] = ["morning", "afternoon", "evening", "night"];

const nextSlot = (current: TimeSlot): TimeSlot | null => {
  const idx = SLOT_ORDER.indexOf(current);
  return idx < SLOT_ORDER.length - 1 ? SLOT_ORDER[idx + 1] : null;
};

const defaultStats = (): Stats => ({
  energy: 80, health: 90, happiness: 70,
  grades: 60, fitness: 60, performance: 60,
});

/** Evaluate all goals against current state and return achieved IDs. */
function evaluateGoals(state: GameState): GoalId[] {
  return GOALS.filter((g) => g.check(state)).map((g) => g.id);
}

/** Append a single entry to lifeLog — call via set() after using. */
function makeLogEntry(
  age: number,
  icon: string,
  text: string,
  category: LifeLogCategory
): LifeLogEntry {
  return { age, icon, text, category };
}

// ── Initial State ─────────────────────────────────────────
const initialState = {
  screen:               "welcome" as const,
  playerName:           "",
  character:            null as CharacterId | null,
  day:                  1,
  slot:                 "morning" as TimeSlot,
  stats:                defaultStats(),
  credits:              200,
  // Life-sim
  age:                  18,
  partner:              null as string | null,
  kids:                 0,
  careerLevel:          0,
  bankruptDays:         0,
  // Student-specific
  absences:             0,
  warnings:             0,
  studyBonus:           false,
  consecutiveLowEnergy: 0,
  // UI
  pendingConsequence:   null as ConsequencePayload | null,
  pendingQuiz:          false,
  // Logs
  history:              [] as GameState["history"],
  lifeLog:              [] as LifeLogEntry[],
  goalsAchieved:        [] as GoalId[],
  gameOverReason:       "" as LifeEndingReason | "",
};

// ── Store ─────────────────────────────────────────────────
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── setPlayerName ────────────────────────────────────
      setPlayerName: (name) => set({ playerName: name }),

      // ── selectCharacter ──────────────────────────────────
      selectCharacter: (id) => {
        const char = CHARACTERS.find((c) => c.id === id);
        if (!char) return;
        set({
          character:   id,
          stats:       { ...char.startingStats },
          credits:     char.startingCredits,
          age:         char.startingAge,
          careerLevel: 0,
          partner:     null,
          kids:        0,
        });
      },

      // ── startGame ────────────────────────────────────────
      startGame: () => {
        const state = get();
        const charDef = CHARACTERS.find((c) => c.id === state.character);
        const firstEntry = makeLogEntry(
          state.age,
          charDef?.emoji ?? "🌍",
          `${state.playerName || "You"} began life as a ${charDef?.name ?? "person"} at age ${state.age}.`,
          "milestone"
        );
        set({
          screen:  "game",
          day:     1,
          slot:    "morning",
          lifeLog: [firstEntry],
        });
      },

      // ── performAction ────────────────────────────────────
      performAction: (action: Action) => {
        const state = get();
        if (!state.character) return;

        const newStats   = applyStatDelta(state.stats, action.statDelta);
        const newCredits = Math.max(0, state.credits + action.creditDelta);
        const newAbsences= state.absences + (action.absenceDelta ?? 0);
        const newCareer  = Math.min(5, Math.max(0,
          state.careerLevel + (action.careerLevelDelta ?? 0)
        ));
        const newStudyBonus =
          action.id === "study_at_home" ? true : state.studyBonus;

        // History entry
        const historyEntry = {
          day:         state.day,
          slot:        state.slot,
          actionId:    action.id,
          statSnapshot:{ ...state.stats },
          credits:     state.credits,
        };

        // Life log — only for notable actions
        const newLifeLog = action.logEntry
          ? [...state.lifeLog, makeLogEntry(state.age, action.icon, action.logEntry, "event")]
          : state.lifeLog;

        // Consequence type derivation
        const consequenceType: ConsequencePayload["type"] =
          (action.statDelta.grades ?? 0) < 0  ? "negative"
          : action.id === "skip_school"        ? "warning"
          : action.creditDelta < 0             ? "neutral"
          :                                      "positive";

        const consequence: ConsequencePayload = {
          icon:  action.icon,
          title: action.label,
          body:  action.description,
          type:  consequenceType,
          // advanceOnDismiss defaults to true (undefined)
        };

        set({
          stats:              newStats,
          credits:            newCredits,
          absences:           newAbsences,
          careerLevel:        newCareer,
          studyBonus:         newStudyBonus,
          history:            [...state.history, historyEntry],
          lifeLog:            newLifeLog,
          pendingConsequence: consequence,
          pendingQuiz:        action.triggerQuiz === true,
        });

        checkGameOverConditions(get(), set);
      },

      // ── dismissConsequence ───────────────────────────────
      dismissConsequence: () => {
        const state = get();
        if (state.pendingQuiz) {
          set({ pendingConsequence: null, screen: "quiz" });
          return;
        }
        // advanceOnDismiss: false → day-start event; don't advance slot
        if (state.pendingConsequence?.advanceOnDismiss === false) {
          set({ pendingConsequence: null });
          return;
        }
        set({ pendingConsequence: null });
        advanceSlotIfNeeded(get(), set);
      },

      // ── submitQuiz ───────────────────────────────────────
      submitQuiz: (result: QuizResult) => {
        const state = get();
        let gradesDelta = 0;
        let consequence: ConsequencePayload;

        if (result.passed) {
          gradesDelta     = result.score >= 80 ? 12 : 6;
          const credits   = result.score >= 80 ? 50 : 25;
          set({
            stats:      applyStatDelta(state.stats, { grades: gradesDelta }),
            credits:    state.credits + credits,
            studyBonus: false,
            screen:     "game",
          });
          consequence = {
            icon:  "🎉",
            title: "Quiz Passed!",
            body:  `You scored ${result.score}%! ${
              result.score >= 80
                ? "Outstanding! Grades +12, ₡50 earned."
                : "Not bad! Grades +6, ₡25 earned."
            }`,
            type: "positive",
          };
          // Life log for high-score pass
          if (result.score >= 80) {
            const s = get();
            set({
              lifeLog: [...s.lifeLog, makeLogEntry(
                s.age, "📚",
                "Aced a school quiz with an outstanding score.",
                "education"
              )],
            });
          }
        } else {
          gradesDelta = -10;
          set({
            stats:      applyStatDelta(state.stats, { grades: gradesDelta }),
            studyBonus: false,
            screen:     "game",
          });
          consequence = {
            icon:  "😬",
            title: "Quiz Failed!",
            body:  `You scored ${result.score}%. Grades dropped. Study more next time!`,
            type:  "negative",
          };
        }

        set({ pendingConsequence: consequence, pendingQuiz: false });
        checkGameOverConditions(get(), set);
      },

      // ── advanceSlot ──────────────────────────────────────
      advanceSlot: () => advanceSlotIfNeeded(get(), set),

      // ── chooseEvent — Requirement #9 ─────────────────────
      chooseEvent: (choice: EventChoice) => {
        const state = get();

        // Resolve credit delta (handle creditRange for random outcomes)
        const creditChange = choice.creditRange
          ? Math.floor(
              Math.random() * (choice.creditRange[1] - choice.creditRange[0] + 1)
            ) + choice.creditRange[0]
          : choice.creditDelta;

        const newStats      = applyStatDelta(state.stats, choice.statDelta);
        const newCredits    = Math.max(0, state.credits + creditChange);
        const newCareer     = Math.min(5, Math.max(0,
          state.careerLevel + (choice.careerLevelDelta ?? 0)
        ));
        const newPartner    = choice.setsPartner !== undefined
          ? choice.setsPartner
          : state.partner;
        const newKids       = choice.kidsIncrease ? state.kids + 1 : state.kids;

        // Life log entry
        const newLifeLog: LifeLogEntry[] = choice.logEntry
          ? [
              ...state.lifeLog,
              makeLogEntry(
                state.age,
                state.pendingConsequence?.icon ?? "📅",
                choice.logEntry,
                "event"
              ),
            ]
          : state.lifeLog;

        // Show a brief outcome modal for major life changes
        const isLifeChanging =
          !!choice.setsPartner ||
          choice.kidsIncrease === true ||
          (choice.careerLevelDelta ?? 0) > 0;

        const outcomeModal: ConsequencePayload | null = isLifeChanging
          ? {
              icon:  choice.setsPartner
                ? "💑"
                : choice.kidsIncrease
                ? "👶"
                : "🏆",
              title: choice.label,
              body:  choice.description,
              type:  "positive",
              advanceOnDismiss: false, // player still acts this slot
            }
          : null;

        set({
          stats:              newStats,
          credits:            newCredits,
          careerLevel:        newCareer,
          partner:            newPartner,
          kids:               newKids,
          lifeLog:            newLifeLog,
          pendingConsequence: outcomeModal,
        });

        checkGameOverConditions(get(), set);
      },

      // ── resetGame ────────────────────────────────────────
      resetGame: () => set({ ...initialState, screen: "welcome" }),
    }),
    {
      name: "2life-game-state",
      partialize: (s) => ({
        playerName:           s.playerName,
        character:            s.character,
        day:                  s.day,
        slot:                 s.slot,
        stats:                s.stats,
        credits:              s.credits,
        age:                  s.age,
        partner:              s.partner,
        kids:                 s.kids,
        careerLevel:          s.careerLevel,
        bankruptDays:         s.bankruptDays,
        absences:             s.absences,
        warnings:             s.warnings,
        studyBonus:           s.studyBonus,
        consecutiveLowEnergy: s.consecutiveLowEnergy,
        history:              s.history,
        lifeLog:              s.lifeLog,
        goalsAchieved:        s.goalsAchieved,
        screen:               s.screen,
        gameOverReason:       s.gameOverReason,
        // Transient UI — never persisted
        pendingConsequence:   null,
        pendingQuiz:          false,
      }),
    }
  )
);

// ── Helpers (outside store to avoid circular refs) ────────

function advanceSlotIfNeeded(
  state:  GameState,
  set:    (partial: Partial<GameState>) => void
) {
  const next = nextSlot(state.slot);

  if (next) {
    set({ slot: next });
    return;
  }

  // ── End of day ────────────────────────────────────────
  const newDay = state.day + 1;

  // Overnight stat restore
  const refreshedStats = applyStatDelta(state.stats, {
    energy: 20,
    health: state.stats.energy < 20 ? -5 : 0,
  });

  const newConsecutiveLowEnergy =
    state.stats.energy < 20 ? state.consecutiveLowEnergy + 1 : 0;

  // Age — increments every DAYS_PER_YEAR game-days
  const newAge =
    newDay % DAYS_PER_YEAR === 0 ? state.age + 1 : state.age;

  // Bankruptcy tracking
  const newBankruptDays = state.credits <= 0 ? state.bankruptDays + 1 : 0;

  // ── Old-age death check — Requirement #11 ────────────
  if (newAge >= OLD_AGE_THRESHOLD && Math.random() < OLD_AGE_DEATH_PROB) {
    const goalsAchieved = evaluateGoals({ ...state, age: newAge });
    const logEntry = makeLogEntry(
      newAge, "🕊️",
      `Passed away peacefully at age ${newAge}.`,
      "milestone"
    );
    set({
      screen:        "game-over",
      gameOverReason:"old_age",
      age:           newAge,
      goalsAchieved,
      lifeLog:       [...state.lifeLog, logEntry],
    });
    return;
  }

  // ── Time-limit completion ─────────────────────────────
  if (newDay > END_OF_GAME_DAY) {
    const goalsAchieved = evaluateGoals({ ...state, age: newAge });
    const logEntry = makeLogEntry(
      newAge, "🎓",
      `Completed the journey after ${END_OF_GAME_DAY} days.`,
      "milestone"
    );
    set({
      screen:        "game-over",
      gameOverReason:"completed",
      age:           newAge,
      goalsAchieved,
      lifeLog:       [...state.lifeLog, logEntry],
    });
    return;
  }

  // ── Forced rest (consecutive low-energy) ─────────────
  const isForceRest = newConsecutiveLowEnergy >= 3;

  // ── Daily random event — NOW WIRED (fixes dead-code bug) ─
  let eventConsequence: ConsequencePayload | null = null;
  let finalStats   = refreshedStats;
  let finalCredits = state.credits;

  if (!isForceRest) {
    const event = rollRandomEvent(state.character ?? "student");
    if (event) {
      if (!event.choices) {
        // Auto-apply effects for choice-free events
        finalStats   = applyStatDelta(refreshedStats, event.statDelta);
        finalCredits = Math.max(0, state.credits + event.creditDelta);
      }
      eventConsequence = {
        icon:             event.icon,
        title:            event.title,
        body:             event.description,
        type:             event.type,
        choices:          event.choices,
        advanceOnDismiss: false, // day-start event — player acts this slot
      };
    }
  }

  // ── Commit new-day state ──────────────────────────────
  set({
    day:                  newDay,
    slot:                 "morning",
    age:                  newAge,
    bankruptDays:         newBankruptDays,
    studyBonus:           false,
    stats:                finalStats,
    credits:              finalCredits,
    consecutiveLowEnergy: newConsecutiveLowEnergy,
    pendingConsequence:   isForceRest
      ? {
          icon:             "🏥",
          title:            "Forced Rest Day",
          body:             "You've been burning the candle at both ends. Your body gave out — forced to stay in bed all day.",
          type:             "warning",
          advanceOnDismiss: false,
        }
      : eventConsequence,
  });

  // Forced rest skips the whole day
  if (isForceRest) {
    set({ slot: "night" });
  }

  // Check endings after day transition
  checkGameOverConditions(
    // Re-read state after all sets above
    { ...state, day: newDay, age: newAge, bankruptDays: newBankruptDays,
      stats: finalStats, credits: finalCredits } as GameState,
    set
  );
}

function checkGameOverConditions(
  state: GameState,
  set:   (partial: Partial<GameState>) => void
) {
  // ── Data-driven endings (Requirement #11) ────────────
  for (const ending of LIFE_ENDINGS) {
    if (!ending.check) continue; // manual-trigger endings
    if (ending.check(state)) {
      const goalsAchieved = evaluateGoals(state);
      const logEntry = makeLogEntry(
        state.age, ending.icon, ending.body, "milestone"
      );
      set({
        screen:        "game-over",
        gameOverReason: ending.reason,
        goalsAchieved,
        lifeLog:       [...state.lifeLog, logEntry],
      });
      return;
    }
  }

  // ── Warning conditions (not game-over) ───────────────
  if (state.character === "student") {
    if (state.absences === 5 && state.warnings < 1) {
      set({
        warnings: 1,
        pendingConsequence: {
          icon:  "⚠️",
          title: "First Warning!",
          body:  "You have 5 absences. Keep this up and you'll be suspended!",
          type:  "warning",
        },
      });
    } else if (state.absences === 8 && state.warnings < 2) {
      set({
        warnings: 2,
        pendingConsequence: {
          icon:  "🚨",
          title: "Suspended!",
          body:  "You have been suspended for 2 days due to excessive absences.",
          type:  "negative",
        },
      });
    }
  }

  // Broke warning (not an ending yet — bankruptcy check is in LIFE_ENDINGS)
  if (state.credits <= 0 && !state.pendingConsequence) {
    set({
      pendingConsequence: {
        icon:  "💸",
        title: "Broke!",
        body:  `You've run out of credits. ${
          state.bankruptDays >= 4
            ? `${MAX_BANKRUPT_DAYS - state.bankruptDays} more broke days and it's over.`
            : "Earn more before you can go out."
        }`,
        type:  "warning",
      },
    });
  }
}

// Re-export so data files stay accessible from one place
export { RANDOM_EVENTS };
