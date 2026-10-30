// ============================================================
// 2Life — Level System
// Manages the current level, challenge completion, boss fights,
// and world win conditions based on WorldDef.
// ============================================================
import type {
  WorldDef,
  WorldLevel,
  WorldChallenge,
  WorldStatDelta,
  LevelCondition,
} from "../types/world.ts";

// ----------------------------------------------------------
// Level state (serializable for persistence)
// ----------------------------------------------------------
export interface LevelState {
  currentLevelIndex:    number;
  challengesCompleted:  string[];  // challenge IDs
  bossDefeated:         boolean;
  levelComplete:        boolean;
  worldComplete:        boolean;
}

export const DEFAULT_LEVEL_STATE: LevelState = {
  currentLevelIndex:   0,
  challengesCompleted: [],
  bossDefeated:        false,
  levelComplete:       false,
  worldComplete:       false,
};

// ----------------------------------------------------------
// Check if a level's win condition is met
// ----------------------------------------------------------
export function checkWinCondition(
  condition: LevelCondition,
  stats:     Record<string, number>,
  _money:    number,
  age:       number,
  challengesCompleted: string[],
  bossDefeated:        boolean,
  _level:              WorldLevel,
): boolean {
  switch (condition.type) {
    case "stat-threshold":
      return (stats[condition.statId] ?? 0) >= condition.min;
    case "complete-challenges":
      return challengesCompleted.length >= condition.count;
    case "defeat-boss":
      return bossDefeated;
    case "age":
      return age <= condition.max;
    default:
      return false;
  }
}

// ----------------------------------------------------------
// Roll a stat-check challenge: success probability based on
// the relevant stat vs difficulty
// ----------------------------------------------------------
export function rollStatCheck(
  stats:      Record<string, number>,
  challenge:  WorldChallenge,
): "success" | "failure" {
  // Average all stats as power proxy
  const statValues = Object.values(stats).filter(v => typeof v === "number");
  const avgStat = statValues.length
    ? statValues.reduce((a, b) => a + b, 0) / statValues.length
    : 50;

  // Success chance: stat-based with difficulty scaling
  // difficulty 1 → ~85% at avg 50; difficulty 10 → ~25%
  const difficultyPenalty = challenge.difficulty * 6;
  const successChance = Math.max(0.05, Math.min(0.95,
    (avgStat - difficultyPenalty) / 100 + 0.6
  ));

  return Math.random() < successChance ? "success" : "failure";
}

// ----------------------------------------------------------
// Apply a WorldStatDelta to a stats record
// ----------------------------------------------------------
export function applyWorldStatDelta(
  stats: Record<string, number>,
  delta: WorldStatDelta,
): Record<string, number> {
  const result = { ...stats };
  for (const [key, value] of Object.entries(delta)) {
    result[key] = Math.max(0, Math.min(100, (result[key] ?? 50) + value));
  }
  return result;
}

// ----------------------------------------------------------
// Get the current level from a WorldDef
// ----------------------------------------------------------
export function getCurrentLevel(
  worldDef: WorldDef,
  index:    number,
): WorldLevel | null {
  return worldDef.levels[index] ?? null;
}

// ----------------------------------------------------------
// Format a WorldStatDelta for display
// ----------------------------------------------------------
export function formatDelta(delta: WorldStatDelta, money: number): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(delta)) {
    if (value !== 0) {
      parts.push(`${value > 0 ? "+" : ""}${value} ${key}`);
    }
  }
  if (money !== 0) {
    parts.push(`${money > 0 ? "+" : ""}₡${money}`);
  }
  return parts.join(", ");
}
