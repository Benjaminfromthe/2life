// ============================================================
// 2Life — Actions (Yearly Loop Scale)
// Each action represents a quarter-year decision.
// availableFor maps to the CharacterId used for career routing:
//   doctor/engineer/entrepreneur → "worker"
//   teacher                     → "student"
//   athlete                     → "athlete"
// ============================================================
import type { Action } from "../types/game";

export const ACTIONS: Action[] = [

  // ── SHARED ACTIONS (all careers) ────────────────────────

  {
    id:             "rest_recover",
    label:          "Rest & Recover",
    icon:           "😴",
    description:    "You took a full quarter to rest, recover, and recharge. Your body and mind thank you.",
    availableSlots: ["morning", "afternoon", "evening", "night"],
    availableFor:   ["student", "athlete", "worker"],
    statDelta:      { energy: 30, health: 10, happiness: 8 },
    creditDelta:    0,
  },
  {
    id:             "exercise_regimen",
    label:          "Exercise Regimen",
    icon:           "🏋️",
    description:    "You committed to a full training regimen this quarter. Strength and health improved significantly.",
    availableSlots: ["morning", "afternoon", "evening"],
    availableFor:   ["student", "athlete", "worker"],
    statDelta:      { energy: -15, health: 20, happiness: 10, fitness: 8 },
    creditDelta:    0,
  },
  {
    id:             "invest_savings",
    label:          "Invest Savings",
    icon:           "📈",
    description:    "You put your money to work. A modest but consistent return on your portfolio.",
    availableSlots: ["morning", "afternoon", "evening", "night"],
    availableFor:   ["student", "athlete", "worker"],
    statDelta:      { happiness: 5 },
    creditDelta:    120,
    requiresCredits: 200,
    logEntry:       "Invested savings and watched the portfolio grow.",
  },
  {
    id:             "socialize",
    label:          "Social Life",
    icon:           "🎉",
    description:    "You put energy into friendships and social activities. Connections are the spice of life!",
    availableSlots: ["afternoon", "evening"],
    availableFor:   ["student", "athlete", "worker"],
    statDelta:      { energy: -10, happiness: 30, health: 3 },
    creditDelta:    -40,
    requiresCredits: 40,
  },
  {
    id:             "travel",
    label:          "Travel",
    icon:           "✈️",
    description:    "You explored a new place this quarter. Perspective broadened, happiness soared.",
    availableSlots: ["afternoon", "evening"],
    availableFor:   ["student", "athlete", "worker"],
    statDelta:      { energy: -5, happiness: 35, health: 5 },
    creditDelta:    -150,
    requiresCredits: 150,
    logEntry:       "Travelled somewhere new and gained fresh perspective.",
  },
  {
    id:             "healthy_lifestyle",
    label:          "Healthy Lifestyle",
    icon:           "🥗",
    description:    "You ate well, slept well, and took care of yourself. Long-term investment in your wellbeing.",
    availableSlots: ["morning", "afternoon", "evening", "night"],
    availableFor:   ["student", "athlete", "worker"],
    statDelta:      { energy: 10, health: 20, happiness: 5 },
    creditDelta:    -30,
    requiresCredits: 30,
  },

  // ── TEACHER / STUDENT actions ─────────────────────────

  {
    id:             "teach_classes",
    label:          "Teach Classes",
    icon:           "🏫",
    description:    "A productive quarter in the classroom. Grades and performance both improved this term.",
    availableSlots: ["morning", "afternoon"],
    availableFor:   ["student"],
    statDelta:      { energy: -20, happiness: -5, grades: 0, performance: 10 },
    creditDelta:    0,
    triggerQuiz:    true,
    logEntry:       "Taught a full term of classes.",
  },
  {
    id:             "professional_development",
    label:          "Professional Development",
    icon:           "📖",
    description:    "You invested in courses, workshops, and skill-building. Next year will be even better.",
    availableSlots: ["afternoon", "evening"],
    availableFor:   ["student"],
    statDelta:      { energy: -10, grades: 10, performance: 5, happiness: -5 },
    creditDelta:    0,
    studyBonus:     true,
  } as Action & { studyBonus?: boolean },
  {
    id:             "write_curriculum",
    label:          "Write Curriculum",
    icon:           "📝",
    description:    "You spent the quarter developing new learning materials. A creative and fulfilling challenge.",
    availableSlots: ["evening", "night"],
    availableFor:   ["student"],
    statDelta:      { energy: -15, grades: 8, happiness: 10 },
    creditDelta:    50,
    logEntry:       "Wrote new curriculum that will help students for years to come.",
  },
  {
    id:             "skip_work",
    label:          "Take a Sabbatical",
    icon:           "🏖️",
    description:    "You took an extended break. Your attendance record suffered, but your soul needed it.",
    availableSlots: ["morning", "afternoon"],
    availableFor:   ["student"],
    statDelta:      { energy: 20, happiness: 20, grades: -12 },
    creditDelta:    0,
    absenceDelta:   1,
    logEntry:       "Took a sabbatical year to rest and reconsider priorities.",
  },

  // ── ATHLETE actions ──────────────────────────────────

  {
    id:             "intense_training",
    label:          "Intense Training",
    icon:           "🏃",
    description:    "You pushed your limits all quarter. Fitness gains are extraordinary, but your body needs care.",
    availableSlots: ["morning", "afternoon"],
    availableFor:   ["athlete"],
    statDelta:      { energy: -30, health: -8, happiness: 5, fitness: 18 },
    creditDelta:    50,
    logEntry:       "Completed an intense training block.",
  },
  {
    id:             "enter_competition",
    label:          "Enter Competition",
    icon:           "🏆",
    description:    "You competed at the highest level this quarter. Win or lose, you grew as an athlete.",
    availableSlots: ["afternoon"],
    availableFor:   ["athlete"],
    statDelta:      { energy: -25, happiness: 25, fitness: 10 },
    creditDelta:    200,
    careerLevelDelta: 1,
    logEntry:       "Competed in a major event.",
  },
  {
    id:             "cross_training",
    label:          "Cross-Training",
    icon:           "🚴",
    description:    "You diversified your fitness routine. Balanced gains across all physical stats.",
    availableSlots: ["morning", "afternoon", "evening"],
    availableFor:   ["athlete"],
    statDelta:      { energy: -15, health: 10, fitness: 10, happiness: 10 },
    creditDelta:    20,
  },
  {
    id:             "recovery_camp",
    label:          "Recovery Camp",
    icon:           "🏥",
    description:    "A full quarter of rehabilitation and recovery. Your body is restored and ready to perform.",
    availableSlots: ["morning", "afternoon", "evening", "night"],
    availableFor:   ["athlete"],
    statDelta:      { energy: 25, health: 25, fitness: -5, happiness: 5 },
    creditDelta:    -80,
    requiresCredits: 80,
  },

  // ── WORKER / DOCTOR / ENGINEER / ENTREPRENEUR ────────

  {
    id:             "focus_on_career",
    label:          "Focus on Career",
    icon:           "💼",
    description:    "A quarter of hard work. Performance climbed and your professional reputation grew.",
    availableSlots: ["morning", "afternoon"],
    availableFor:   ["worker"],
    statDelta:      { energy: -20, happiness: -8, performance: 15 },
    creditDelta:    150,
    logEntry:       "Dedicated a full quarter to career advancement.",
  },
  {
    id:             "learn_skills",
    label:          "Learn New Skills",
    icon:           "🧠",
    description:    "You invested in education and upskilling. Your value in the market just increased.",
    availableSlots: ["afternoon", "evening"],
    availableFor:   ["worker"],
    statDelta:      { energy: -15, grades: 8, performance: 10, happiness: 5 },
    creditDelta:    -50,
    requiresCredits: 50,
    logEntry:       "Completed a skills course to stay ahead of the curve.",
  },
  {
    id:             "overtime_push",
    label:          "Overtime Push",
    icon:           "⏰",
    description:    "Extra hours, extra earnings — but your energy and happiness paid the price.",
    availableSlots: ["evening", "night"],
    availableFor:   ["worker"],
    statDelta:      { energy: -25, happiness: -15, health: -8, performance: 8 },
    creditDelta:    200,
    careerLevelDelta: 0,
  },
  {
    id:             "side_project",
    label:          "Side Project",
    icon:           "⚡",
    description:    "You built something on the side. Modest income, huge satisfaction.",
    availableSlots: ["evening", "night"],
    availableFor:   ["worker"],
    statDelta:      { energy: -20, happiness: 15, performance: 8 },
    creditDelta:    100,
    logEntry:       "Shipped a side project.",
  },
  {
    id:             "network",
    label:          "Network",
    icon:           "🤝",
    description:    "You invested in relationships and professional connections. Opportunities will follow.",
    availableSlots: ["afternoon", "evening"],
    availableFor:   ["worker"],
    statDelta:      { energy: -10, happiness: 15, performance: 5 },
    creditDelta:    -30,
    requiresCredits: 30,
    careerLevelDelta: 0,
  },
];

export const getActionsForSlotAndCharacter = (
  slot:        string,
  characterId: string,
  credits:     number
): Action[] =>
  ACTIONS.filter(
    (a) =>
      a.availableSlots.includes(slot as Action["availableSlots"][number]) &&
      a.availableFor.includes(characterId as Action["availableFor"][number]) &&
      (!a.requiresCredits || credits >= a.requiresCredits)
  );
