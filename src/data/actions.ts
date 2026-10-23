// ============================================================
// 2Life — Actions Data
// ============================================================
import type { Action } from "../types/game";

export const ACTIONS: Action[] = [
  // ---- STUDENT -----------------------------------------------
  {
    id: "go_to_school",
    label: "Go to School",
    icon: "🏫",
    description:
      "You headed to school and attended class. A quiz is waiting for you!",
    availableSlots: ["morning", "afternoon"],
    availableFor: ["student"],
    statDelta: { energy: -15, happiness: -5, grades: 0 }, // grades adjusted by quiz result
    creditDelta: 0,
    triggerQuiz: true,
  },
  {
    id: "study_at_home",
    label: "Study at Home",
    icon: "📚",
    description:
      "You cracked open the textbooks. Your brain hurts, but next quiz should be easier!",
    availableSlots: ["afternoon", "evening"],
    availableFor: ["student"],
    statDelta: { energy: -10, happiness: -5, grades: 3 },
    creditDelta: 0,
  },
  {
    id: "skip_school",
    label: "Skip School",
    icon: "😈",
    description:
      "You ditched class and chilled at home. Felt amazing in the moment, but your attendance record took a hit.",
    availableSlots: ["morning", "afternoon"],
    availableFor: ["student"],
    statDelta: { energy: 10, happiness: 15, grades: -8 },
    creditDelta: 20,
    absenceDelta: 1,
  },

  // ---- SHARED ------------------------------------------------
  {
    id: "rest",
    label: "Rest",
    icon: "😴",
    description:
      "You kicked back and did absolutely nothing productive. You feel recharged!",
    availableSlots: ["morning", "afternoon", "evening", "night"],
    availableFor: ["student", "athlete", "worker"],
    statDelta: { energy: 25, health: 5, happiness: 5 },
    creditDelta: 0,
  },
  {
    id: "sleep",
    label: "Sleep",
    icon: "🌙",
    description:
      "A full night of sleep. Tomorrow is a new day — let's make the most of it!",
    availableSlots: ["night"],
    availableFor: ["student", "athlete", "worker"],
    statDelta: { energy: 40, health: 8, happiness: 5 },
    creditDelta: 0,
  },
  {
    id: "go_shopping",
    label: "Go Shopping",
    icon: "🛍️",
    description:
      "Retail therapy hits different. Your happiness skyrocketed, but your wallet felt it.",
    availableSlots: ["afternoon", "evening"],
    availableFor: ["student", "athlete", "worker"],
    statDelta: { energy: -10, happiness: 20 },
    creditDelta: -50,
    requiresCredits: 50,
  },
  {
    id: "hang_out",
    label: "Hang Out",
    icon: "🎉",
    description:
      "You met up with friends and had a blast. Sometimes you just need to decompress!",
    availableSlots: ["afternoon", "evening"],
    availableFor: ["student", "athlete", "worker"],
    statDelta: { energy: -10, happiness: 25, health: 2 },
    creditDelta: -20,
    requiresCredits: 20,
  },
  {
    id: "eat_meal",
    label: "Eat a Meal",
    icon: "🍔",
    description:
      "You grabbed something to eat. Energy restored, health slightly improved.",
    availableSlots: ["morning", "afternoon", "evening"],
    availableFor: ["student", "athlete", "worker"],
    statDelta: { energy: 15, health: 5, happiness: 5 },
    creditDelta: -15,
    requiresCredits: 15,
  },
  {
    id: "exercise",
    label: "Exercise",
    icon: "🏋️",
    description:
      "A solid workout session. Your body is tired but your health is improving.",
    availableSlots: ["morning", "afternoon", "evening"],
    availableFor: ["student", "athlete", "worker"],
    statDelta: { energy: -20, health: 15, happiness: 10, fitness: 5 },
    creditDelta: 0,
  },

  // ---- ATHLETE -----------------------------------------------
  {
    id: "train",
    label: "Train",
    icon: "🏃",
    description:
      "Intense training session. Your fitness is improving, but you're exhausted.",
    availableSlots: ["morning", "afternoon"],
    availableFor: ["athlete"],
    statDelta: { energy: -25, health: -5, happiness: 5, fitness: 12 },
    creditDelta: 30,
  },
  {
    id: "compete",
    label: "Compete",
    icon: "🏆",
    description:
      "You entered a competition. Win or lose, the experience is invaluable.",
    availableSlots: ["afternoon"],
    availableFor: ["athlete"],
    statDelta: { energy: -30, happiness: 20, fitness: 8 },
    creditDelta: 80,
    requiresCredits: 0,
  },

  // ---- WORKER -----------------------------------------------
  {
    id: "work_shift",
    label: "Work Shift",
    icon: "💼",
    description:
      "You put in a full shift. The performance review won't be bad at all.",
    availableSlots: ["morning", "afternoon"],
    availableFor: ["worker"],
    statDelta: { energy: -20, happiness: -5, performance: 10 },
    creditDelta: 100,
  },
  {
    id: "overtime",
    label: "Overtime",
    icon: "⏰",
    description:
      "Extra hours, extra pay — but your energy and happiness took the hit.",
    availableSlots: ["evening"],
    availableFor: ["worker"],
    statDelta: { energy: -25, happiness: -15, health: -5, performance: 5 },
    creditDelta: 60,
  },
];

export const getActionsForSlotAndCharacter = (
  slot: string,
  characterId: string,
  credits: number
): Action[] =>
  ACTIONS.filter(
    (a) =>
      a.availableSlots.includes(slot as Action["availableSlots"][number]) &&
      a.availableFor.includes(characterId as Action["availableFor"][number]) &&
      (!a.requiresCredits || credits >= a.requiresCredits)
  );
