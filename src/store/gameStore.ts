// ============================================================
// 2Life — Zustand Game Store  (Yearly Loop Edition)
// Flow: welcome → life-blueprint → game → (quiz) → game-over
// Yearly loop: each "day" = 1 life year; 4 quarters per year.
// Age = blueprint.startingAge + (day - 1)
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
  LifeBlueprint,
} from "../types/game";
import { CAREER_CHARACTER_MAP, getCareer } from "../data/careers";
import { rollRandomEvent } from "../data/events";
import { GOALS } from "../data/goals";
import { LIFE_ENDINGS } from "../data/lifeEndings";

// ── Constants ─────────────────────────────────────────────
const OLD_AGE_THRESHOLD  = 60;
const OLD_AGE_DEATH_PROB = 0.04; // 4% chance per new year after 60
const MAX_BANKRUPT_YEARS = 7;    // consecutive broke years → bankruptcy

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

const defaultBlueprint = (): LifeBlueprint => ({
  startingAge:  22,
  careerId:     null,
  wantsPartner: false,
  targetKids:   0,
});

const makeLogEntry = (
  age: number,
  icon: string,
  text: string,
  category: LifeLogCategory
): LifeLogEntry => ({ age, icon, text, category });

function evaluateGoals(state: GameState): GoalId[] {
  return GOALS.filter((g) => g.check(state)).map((g) => g.id);
}

// ── Initial State ─────────────────────────────────────────
const initialState = {
  screen:               "welcome" as const,
  playerName:           "",
  character:            null as CharacterId | null,
  blueprint:            defaultBlueprint(),
  day:                  1,
  slot:                 "morning" as TimeSlot,
  stats:                defaultStats(),
  credits:              300,
  age:                  22,
  partner:              null as string | null,
  kids:                 0,
  careerLevel:          0,
  bankruptDays:         0,
  absences:             0,
  warnings:             0,
  studyBonus:           false,
  consecutiveLowEnergy: 0,
  pendingConsequence:   null as ConsequencePayload | null,
  pendingQuiz:          false,
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

      // ── setBlueprint ─────────────────────────────────────
      setBlueprint: (bp: LifeBlueprint) => set({ blueprint: bp }),

      // ── beginLife ────────────────────────────────────────
      // Called from the Life Blueprint wizard step 5.
      // Derives character from career mapping, seeds stats & credits.
      beginLife: () => {
        const state     = get();
        const bp        = state.blueprint;
        const career    = getCareer(bp.careerId ?? undefined);
        const character = bp.careerId
          ? CAREER_CHARACTER_MAP[bp.careerId]
          : ("worker" as CharacterId);

        const startingStats   = career ? { ...career.startingStats } : defaultStats();
        const startingCredits = career ? career.startingCredits      : 300;
        const age             = bp.startingAge;

        const firstEntry = makeLogEntry(
          age,
          career?.emoji ?? "🌍",
          `${state.playerName || "You"} began life as a ${career?.name ?? "person"} at age ${age}.`,
          "milestone"
        );

        set({
          screen:               "game",
          character,
          day:                  1,
          slot:                 "morning",
          stats:                startingStats,
          credits:              startingCredits,
          age,
          partner:              null,
          kids:                 0,
          careerLevel:          0,
          bankruptDays:         0,
          absences:             0,
          warnings:             0,
          studyBonus:           false,
          consecutiveLowEnergy: 0,
          pendingConsequence:   null,
          pendingQuiz:          false,
          history:              [],
          lifeLog:              [firstEntry],
          goalsAchieved:        [],
          gameOverReason:       "",
        });
      },

      // ── performAction ────────────────────────────────────
      performAction: (action: Action) => {
        const state = get();
        if (!state.character) return;

        const newStats    = applyStatDelta(state.stats, action.statDelta);
        const newCredits  = Math.max(0, state.credits + action.creditDelta);
        const newAbsences = state.absences + (action.absenceDelta ?? 0);
        const newCareer   = Math.min(5, Math.max(0,
          state.careerLevel + (action.careerLevelDelta ?? 0)
        ));
        const newStudy = action.id === "professional_development" ? true : state.studyBonus;

        const historyEntry = {
          day:          state.day,
          slot:         state.slot,
          actionId:     action.id,
          statSnapshot: { ...state.stats },
          credits:      state.credits,
        };

        const newLifeLog = action.logEntry
          ? [...state.lifeLog, makeLogEntry(state.age, action.icon, action.logEntry, "career")]
          : state.lifeLog;

        const consequenceType: ConsequencePayload["type"] =
          action.statDelta.grades as number < 0  ? "negative"
          : action.id === "skip_work"            ? "warning"
          : action.creditDelta < 0               ? "neutral"
          :                                        "positive";

        set({
          stats:              newStats,
          credits:            newCredits,
          absences:           newAbsences,
          careerLevel:        newCareer,
          studyBonus:         newStudy,
          history:            [...state.history, historyEntry],
          lifeLog:            newLifeLog,
          pendingConsequence: {
            icon:  action.icon,
            title: action.label,
            body:  action.description,
            type:  consequenceType,
          },
          pendingQuiz: action.triggerQuiz === true,
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
        // advanceOnDismiss: false → day-start event; don't advance quarter
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
        let consequence: ConsequencePayload;

        if (result.passed) {
          const gradesDelta = result.score >= 80 ? 12 : 6;
          const credits     = result.score >= 80 ? 50 : 25;
          set({
            stats:      applyStatDelta(state.stats, { grades: gradesDelta }),
            credits:    state.credits + credits,
            studyBonus: false,
            screen:     "game",
          });
          consequence = {
            icon:  "🎉",
            title: "Assessment Passed!",
            body:  `You scored ${result.score}%! ${
              result.score >= 80
                ? "Outstanding! Grades +12, ₡50 earned."
                : "Not bad! Grades +6, ₡25 earned."
            }`,
            type: "positive",
          };
          if (result.score >= 80) {
            const s = get();
            set({
              lifeLog: [...s.lifeLog, makeLogEntry(
                s.age, "📚",
                "Passed a professional assessment with an outstanding score.",
                "education"
              )],
            });
          }
        } else {
          set({
            stats:      applyStatDelta(state.stats, { grades: -10 }),
            studyBonus: false,
            screen:     "game",
          });
          consequence = {
            icon:  "😬",
            title: "Assessment Failed!",
            body:  `You scored ${result.score}%. Study more next quarter!`,
            type:  "negative",
          };
        }

        set({ pendingConsequence: consequence, pendingQuiz: false });
        checkGameOverConditions(get(), set);
      },

      // ── advanceSlot ──────────────────────────────────────
      advanceSlot: () => advanceSlotIfNeeded(get(), set),

      // ── chooseEvent ──────────────────────────────────────
      chooseEvent: (choice: EventChoice) => {
        const state = get();

        const creditChange = choice.creditRange
          ? Math.floor(
              Math.random() * (choice.creditRange[1] - choice.creditRange[0] + 1)
            ) + choice.creditRange[0]
          : choice.creditDelta;

        const newStats   = applyStatDelta(state.stats, choice.statDelta);
        const newCredits = Math.max(0, state.credits + creditChange);
        const newCareer  = Math.min(5, Math.max(0,
          state.careerLevel + (choice.careerLevelDelta ?? 0)
        ));
        const newPartner = choice.setsPartner !== undefined
          ? choice.setsPartner : state.partner;
        const newKids = choice.kidsIncrease ? state.kids + 1 : state.kids;

        const newLifeLog: LifeLogEntry[] = choice.logEntry
          ? [...state.lifeLog, makeLogEntry(
              state.age,
              state.pendingConsequence?.icon ?? "📅",
              choice.logEntry,
              "event"
            )]
          : state.lifeLog;

        const isLifeChanging =
          !!choice.setsPartner ||
          choice.kidsIncrease === true ||
          (choice.careerLevelDelta ?? 0) > 0;

        const outcomeModal: ConsequencePayload | null = isLifeChanging
          ? {
              icon:  choice.setsPartner ? "💑" : choice.kidsIncrease ? "👶" : "🏆",
              title: choice.label,
              body:  choice.description,
              type:  "positive",
              advanceOnDismiss: false,
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
      resetGame: () =>
        set({ ...initialState, screen: "welcome", blueprint: defaultBlueprint() }),
    }),

    // ── Persistence ──────────────────────────────────────
    {
      name: "2life-game-state-v2", // bumped version to avoid stale state issues
      partialize: (s) => ({
        playerName:           s.playerName,
        character:            s.character,
        blueprint:            s.blueprint,
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

// ── Store helpers (outside to avoid circular refs) ────────

function advanceSlotIfNeeded(
  state: GameState,
  set:   (partial: Partial<GameState>) => void
) {
  const next = nextSlot(state.slot);

  // ── Mid-year: just advance the quarter ───────────────
  if (next) {
    set({ slot: next });
    return;
  }

  // ── End of year ───────────────────────────────────────
  const newYear = state.day + 1;

  // Yearly stat restore (end-of-year rest)
  const refreshedStats = applyStatDelta(state.stats, {
    energy: 20,
    health: state.stats.energy < 20 ? -5 : 0,
  });

  const newConsecutiveLow =
    state.stats.energy < 20 ? state.consecutiveLowEnergy + 1 : 0;

  // Age advances every year (day = year in the yearly loop)
  const newAge = state.blueprint.startingAge + (newYear - 1);

  // Bankruptcy tracking
  const newBankruptDays = state.credits <= 0 ? state.bankruptDays + 1 : 0;

  // Salary payment: career base salary at end of each year
  const career      = getCareer(state.blueprint.careerId ?? undefined);
  const annualPay   = career
    ? Math.floor(career.salaryPerYear * (1 + state.careerLevel * 0.3))
    : 0;
  const newCredits  = Math.max(0, state.credits + annualPay);

  // ── Old-age death check — Requirement #11 ────────────
  if (newAge >= OLD_AGE_THRESHOLD && Math.random() < OLD_AGE_DEATH_PROB) {
    const goalsAchieved = evaluateGoals({ ...state, age: newAge });
    const logEntry = makeLogEntry(newAge, "🕊️", `Passed away peacefully at age ${newAge}.`, "milestone");
    set({
      screen:        "game-over",
      gameOverReason:"old_age",
      age:           newAge,
      goalsAchieved,
      lifeLog:       [...state.lifeLog, logEntry],
    });
    return;
  }

  // ── Forced rest (consecutive exhausted years) ─────────
  const isForceRest = newConsecutiveLow >= 3;

  // ── Daily random event ────────────────────────────────
  let eventConsequence: ConsequencePayload | null = null;
  let finalStats   = refreshedStats;
  let finalCredits = newCredits;

  if (!isForceRest) {
    const event = rollRandomEvent(state.character ?? "worker");
    if (event) {
      if (!event.choices) {
        finalStats   = applyStatDelta(refreshedStats, event.statDelta);
        finalCredits = Math.max(0, newCredits + event.creditDelta);
      }
      eventConsequence = {
        icon:             event.icon,
        title:            event.title,
        body:             event.description,
        type:             event.type,
        choices:          event.choices,
        advanceOnDismiss: false,
      };
    }
  }

  // ── New year life log entry (milestone every 5 years) ─
  const newLifeLog = [...state.lifeLog];
  if (newAge % 5 === 0) {
    newLifeLog.push(makeLogEntry(newAge, "🎂", `Celebrated turning ${newAge}.`, "milestone"));
  }

  // ── Commit new-year state ─────────────────────────────
  set({
    day:                  newYear,
    slot:                 "morning",
    age:                  newAge,
    bankruptDays:         newBankruptDays,
    studyBonus:           false,
    stats:                finalStats,
    credits:              finalCredits,
    consecutiveLowEnergy: newConsecutiveLow,
    lifeLog:              newLifeLog,
    pendingConsequence:   isForceRest
      ? {
          icon:             "🏥",
          title:            "Burnout Year",
          body:             "You've been running on empty for years. Your body forced a full year of rest.",
          type:             "warning",
          advanceOnDismiss: false,
        }
      : eventConsequence,
  });

  if (isForceRest) {
    set({ slot: "night" });
  }

  // Check endings after year transition
  checkGameOverConditions(
    { ...state, day: newYear, age: newAge, bankruptDays: newBankruptDays,
      stats: finalStats, credits: finalCredits } as GameState,
    set
  );
}

function checkGameOverConditions(
  state: GameState,
  set:   (partial: Partial<GameState>) => void
) {
  // Data-driven endings (Requirement #11)
  for (const ending of LIFE_ENDINGS) {
    if (!ending.check) continue;
    if (ending.check(state)) {
      const goalsAchieved = evaluateGoals(state);
      const logEntry = makeLogEntry(state.age, ending.icon, ending.body, "milestone");
      set({
        screen:        "game-over",
        gameOverReason: ending.reason,
        goalsAchieved,
        lifeLog:       [...state.lifeLog, logEntry],
      });
      return;
    }
  }

  // ── Warnings (not game-over) ───────────────────────────
  if (state.character === "student" || state.blueprint?.careerId === "teacher") {
    if (state.absences === 5 && state.warnings < 1) {
      set({
        warnings: 1,
        pendingConsequence: {
          icon:  "⚠️",
          title: "First Warning!",
          body:  "You have missed 5 obligations. Keep this up and you'll be removed from your role!",
          type:  "warning",
        },
      });
    } else if (state.absences === 8 && state.warnings < 2) {
      set({
        warnings: 2,
        pendingConsequence: {
          icon:  "🚨",
          title: "Suspended!",
          body:  "Suspended for excessive absences. Get back on track immediately.",
          type:  "negative",
        },
      });
    }
  }

  if (state.credits <= 0 && !state.pendingConsequence) {
    set({
      pendingConsequence: {
        icon:  "💸",
        title: "Broke!",
        body:  `You've run out of credits. ${MAX_BANKRUPT_YEARS - state.bankruptDays} more broke years and it's over.`,
        type:  "warning",
      },
    });
  }
}
