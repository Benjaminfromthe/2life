// ============================================================
// 2Life — Goal Definitions (Requirement #11)
// check() is evaluated once at game-over to populate
// GameState.goalsAchieved.
// ============================================================
import type { GoalDef } from "../types/game";

export const GOALS: GoalDef[] = [
  {
    id: "career_peak",
    label: "Career Peak",
    icon: "🏆",
    description: "Reach career level 5",
    check: (s) => s.careerLevel >= 5,
  },
  {
    id: "found_partner",
    label: "Found Love",
    icon: "💑",
    description: "Find a life partner",
    check: (s) => s.partner !== null,
  },
  {
    id: "had_kids",
    label: "Started a Family",
    icon: "👨‍👩‍👦",
    description: "Have at least one child",
    check: (s) => s.kids >= 1,
  },
  {
    id: "wealthy",
    label: "Financially Secure",
    icon: "💰",
    description: "End with ₡2,000 or more",
    check: (s) => s.credits >= 2000,
  },
  {
    id: "healthy",
    label: "Healthy Life",
    icon: "❤️",
    description: "Maintain health at 80 or above",
    check: (s) => s.stats.health >= 80,
  },
  {
    id: "happy",
    label: "Happy Life",
    icon: "😊",
    description: "Maintain happiness at 80 or above",
    check: (s) => s.stats.happiness >= 80,
  },
  {
    id: "educated",
    label: "Academic Excellence",
    icon: "🎓",
    description: "Graduate with grades ≥ 80 (student only)",
    check: (s) => s.character === "student" && s.stats.grades >= 80,
  },
];
