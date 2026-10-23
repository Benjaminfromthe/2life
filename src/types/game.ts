// ============================================================
// 2Life — Core TypeScript Types
// ============================================================

export type CharacterId = "student" | "athlete" | "worker";
export type TimeSlot   = "morning" | "afternoon" | "evening" | "night";
export type Screen     = "welcome" | "life-blueprint" | "game" | "quiz" | "game-over";
export type RoleStat   = "grades" | "fitness" | "performance";

// Re-export so consumers import from one place
export type { CareerId } from "../data/careers";

// ----------------------------------------------------------
// Stats
// ----------------------------------------------------------
export interface Stats {
  energy:      number; // 0-100  depleted by actions, restored by rest/sleep
  health:      number; // 0-100  hits 0 → game over for all characters
  happiness:   number; // 0-100  social & emotional wellbeing
  grades:      number; // student/teacher/doctor role stat
  fitness:     number; // athlete role stat
  performance: number; // worker/engineer/doctor role stat
}

// ----------------------------------------------------------
// Stat Delta
// ----------------------------------------------------------
export interface StatDelta {
  energy?:      number;
  health?:      number;
  happiness?:   number;
  grades?:      number;
  fitness?:     number;
  performance?: number;
  [key: string]: number | undefined;
}

// ----------------------------------------------------------
// Life Blueprint (collected in the wizard before game start)
// ----------------------------------------------------------
export interface LifeBlueprint {
  startingAge:  number;           // 18-40
  careerId:     import("../data/careers").CareerId | null;
  wantsPartner: boolean;
  targetKids:   number;           // 0-6
}

// ----------------------------------------------------------
// Event Choices — Requirement #9
// ----------------------------------------------------------
export interface EventChoice {
  id:               string;
  label:            string;
  description:      string;
  icon?:            string;
  statDelta:        StatDelta;
  creditDelta:      number;
  creditRange?:     [number, number];
  careerLevelDelta?: number;
  setsPartner?:     string;
  kidsIncrease?:    boolean;
  logEntry?:        string;
}

// ----------------------------------------------------------
// Actions
// ----------------------------------------------------------
export interface Action {
  id:              string;
  label:           string;
  icon:            string;
  description:     string;
  availableSlots:  TimeSlot[];
  availableFor:    CharacterId[];
  statDelta:       StatDelta;
  creditDelta:     number;
  requiresCredits?: number;
  triggerQuiz?:    boolean;
  absenceDelta?:   number;
  careerLevelDelta?: number;
  logEntry?:       string;
}

// ----------------------------------------------------------
// Consequence Modal Payload
// ----------------------------------------------------------
export interface ConsequencePayload {
  icon:              string;
  title:             string;
  body:              string;
  type:              "positive" | "negative" | "neutral" | "warning";
  choices?:          EventChoice[];
  advanceOnDismiss?: boolean;
}

// ----------------------------------------------------------
// Quiz
// ----------------------------------------------------------
export interface QuizQuestion {
  id:           string;
  subject:      string;
  question:     string;
  options:      string[];
  correctIndex: number;
  difficulty:   "easy" | "normal" | "hard";
}

export interface QuizResult {
  score:  number;
  passed: boolean;
}

// ----------------------------------------------------------
// History
// ----------------------------------------------------------
export interface HistoryEntry {
  day:          number;
  slot:         TimeSlot;
  actionId:     string;
  statSnapshot: Stats;
  credits:      number;
}

// ----------------------------------------------------------
// Life Log — Requirement #10
// ----------------------------------------------------------
export type LifeLogCategory =
  | "career"
  | "family"
  | "health"
  | "social"
  | "finance"
  | "education"
  | "event"
  | "milestone";

export interface LifeLogEntry {
  age:      number;
  icon:     string;
  text:     string;
  category: LifeLogCategory;
}

// ----------------------------------------------------------
// Goals — Requirement #11
// ----------------------------------------------------------
export type GoalId =
  | "career_peak"
  | "found_partner"
  | "had_kids"
  | "wealthy"
  | "healthy"
  | "happy"
  | "educated";

export interface GoalDef {
  id:          GoalId;
  label:       string;
  icon:        string;
  description: string;
  check:       (state: GameState) => boolean;
}

// ----------------------------------------------------------
// Life Endings — Requirement #11
// ----------------------------------------------------------
export type LifeEndingReason =
  | "completed"
  | "health_death"
  | "old_age"
  | "bankruptcy"
  | "expelled"
  | "grades"
  | "default";

export interface LifeEnding {
  reason: LifeEndingReason;
  icon:   string;
  title:  string;
  body:   string;
  check?: (state: GameState) => boolean;
}

// ----------------------------------------------------------
// Random Events
// ----------------------------------------------------------
export interface RandomEvent {
  id:          string;
  icon:        string;
  title:       string;
  description: string;
  type:        "positive" | "negative" | "neutral";
  statDelta:   StatDelta;
  creditDelta: number;
  chance:      number;
  availableFor?: CharacterId[];
  choices?:    EventChoice[];
}

// ----------------------------------------------------------
// Character definition (kept for legacy action filtering)
// ----------------------------------------------------------
export interface CharacterDef {
  id:              CharacterId;
  name:            string;
  emoji:           string;
  tagline:         string;
  description:     string;
  startingStats:   Stats;
  startingCredits: number;
  startingAge:     number;
  roleStat:        RoleStat;
  color:           string;
  bgColor:         string;
}

// ----------------------------------------------------------
// Master Game State (Zustand)
// ----------------------------------------------------------
export interface GameState {
  // ── Meta ─────────────────────────────────────────────────
  screen:     Screen;
  playerName: string;
  character:  CharacterId | null;  // derived from career for action filtering

  // ── Life Blueprint ───────────────────────────────────────
  blueprint:  LifeBlueprint;

  // ── Time (yearly loop: day = year, slot = quarter) ────────
  day:  number;   // current year of life (1 = first year)
  slot: TimeSlot; // quarter within the year (Q1-Q4)

  // ── Resources ────────────────────────────────────────────
  stats:   Stats;
  credits: number;

  // ── Life simulation ───────────────────────────────────────
  age:          number;
  partner:      string | null;
  kids:         number;
  careerLevel:  number;        // 0 → 5
  bankruptDays: number;

  // ── Student / teacher / doctor specific ──────────────────
  absences:             number;
  warnings:             number;
  studyBonus:           boolean;
  consecutiveLowEnergy: number;

  // ── Consequence modal ────────────────────────────────────
  pendingConsequence: ConsequencePayload | null;

  // ── Quiz ─────────────────────────────────────────────────
  pendingQuiz: boolean;

  // ── Logs ─────────────────────────────────────────────────
  history:       HistoryEntry[];
  lifeLog:       LifeLogEntry[];
  goalsAchieved: GoalId[];

  // ── Game over ────────────────────────────────────────────
  gameOverReason: LifeEndingReason | "";

  // ── Actions ──────────────────────────────────────────────
  setPlayerName:      (name: string)              => void;
  setBlueprint:       (bp: LifeBlueprint)         => void;
  beginLife:          ()                          => void;
  performAction:      (action: Action)            => void;
  dismissConsequence: ()                          => void;
  submitQuiz:         (result: QuizResult)        => void;
  advanceSlot:        ()                          => void;
  chooseEvent:        (choice: EventChoice)       => void;
  resetGame:          ()                          => void;
}
