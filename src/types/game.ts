// ============================================================
// 2Life — Core TypeScript Types
// Covers: base game + event choices (#9) + life log (#10) +
//         data-driven endings & goals (#11)
// ============================================================

export type CharacterId = "student" | "athlete" | "worker";
export type TimeSlot   = "morning" | "afternoon" | "evening" | "night";
export type Screen     = "welcome" | "character-select" | "game" | "quiz" | "game-over";
export type RoleStat   = "grades" | "fitness" | "performance";

// ----------------------------------------------------------
// Stats
// ----------------------------------------------------------
export interface Stats {
  energy:      number; // 0-100  depleted by actions, restored by rest/sleep
  health:      number; // 0-100  hits 0 → game over for all characters
  happiness:   number; // 0-100  social & emotional wellbeing
  grades:      number; // student role stat (0-100)
  fitness:     number; // athlete role stat (0-100)
  performance: number; // worker  role stat (0-100)
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
// Event Choices — Requirement #9
// Each RandomEvent can carry 2-3 EventChoice objects.
// The logEntry field is a plain-English sentence designed so
// it can later be replaced by an AI-generated narrative.
// ----------------------------------------------------------
export interface EventChoice {
  id:               string;
  label:            string;
  description:      string;         // shown inside the choice button
  icon?:            string;         // optional emoji decoration
  statDelta:        StatDelta;
  creditDelta:      number;
  /** If present the store rolls a random integer in [min, max] instead of creditDelta. */
  creditRange?:     [number, number];
  careerLevelDelta?: number;        // +1 promotion, -1 demotion
  setsPartner?:     string;         // sets partner name (e.g. "Alex")
  kidsIncrease?:    boolean;        // increments kids by 1
  /** Life-log sentence — plain English, AI-replaceable. */
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
  /** If set, a LifeLogEntry is auto-appended when this action is performed. */
  logEntry?:       string;
}

// ----------------------------------------------------------
// Consequence Modal Payload
// When choices is present the modal renders choice buttons
// instead of the "Got it" dismiss button (Requirement #9).
// advanceOnDismiss = false → dismissing doesn't advance the
// time slot (used for day-start event notifications).
// ----------------------------------------------------------
export interface ConsequencePayload {
  icon:              string;
  title:             string;
  body:              string;
  type:              "positive" | "negative" | "neutral" | "warning";
  choices?:          EventChoice[];
  advanceOnDismiss?: boolean; // defaults to true; false for day-start events
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
  score:  number; // 0-100 percentage
  passed: boolean;
}

// ----------------------------------------------------------
// History (fine-grained per-action log)
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
// Notable moments for "Your Life Story" on the game-over screen.
// `text` is a plain-English sentence intentionally designed for
// AI generation/replacement in a future pass.
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
  text:     string;           // narrative sentence — AI-replaceable
  category: LifeLogCategory;
}

// ----------------------------------------------------------
// Goals — Requirement #11
// ----------------------------------------------------------
export type GoalId =
  | "career_peak"    // careerLevel >= 5
  | "found_partner"  // partner !== null
  | "had_kids"       // kids >= 1
  | "wealthy"        // credits >= 2000
  | "healthy"        // health >= 80 at game over
  | "happy"          // happiness >= 80 at game over
  | "educated";      // grades >= 80 at game over (student only)

export interface GoalDef {
  id:          GoalId;
  label:       string;
  icon:        string;
  description: string;
  check:       (state: GameState) => boolean;
}

// ----------------------------------------------------------
// Life Endings — Requirement #11 (data-driven)
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
  /**
   * Deterministic check: returns true when this ending fires.
   * Omit for endings triggered manually by the store
   * (old_age uses a probabilistic roll; completed fires when day > endDay).
   */
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
  /** Auto-applied when choices is absent. Ignored when choices are present. */
  statDelta:   StatDelta;
  creditDelta: number;
  chance:      number;              // 0-1 probability per day
  availableFor?: CharacterId[];     // if omitted: all characters
  choices?:    EventChoice[];       // Requirement #9
}

// ----------------------------------------------------------
// Character definition
// ----------------------------------------------------------
export interface CharacterDef {
  id:              CharacterId;
  name:            string;
  emoji:           string;
  tagline:         string;
  description:     string;
  startingStats:   Stats;
  startingCredits: number;
  startingAge:     number;  // character's age at game start
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
  character:  CharacterId | null;

  // ── Time ─────────────────────────────────────────────────
  day:  number;
  slot: TimeSlot;

  // ── Resources ────────────────────────────────────────────
  stats:   Stats;
  credits: number;

  // ── Life simulation — Requirements #10 & #11 ─────────────
  age:          number;        // character's current age
  partner:      string | null; // null = single
  kids:         number;        // number of children
  careerLevel:  number;        // 0 (entry) → 5 (peak)
  bankruptDays: number;        // consecutive days that ended with credits ≤ 0

  // ── Student-specific ─────────────────────────────────────
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
  lifeLog:       LifeLogEntry[];  // Requirement #10
  goalsAchieved: GoalId[];        // Requirement #11 — populated at game over

  // ── Game over ────────────────────────────────────────────
  gameOverReason: LifeEndingReason | "";

  // ── Actions ──────────────────────────────────────────────
  setPlayerName:      (name: string)        => void;
  selectCharacter:    (id: CharacterId)     => void;
  startGame:          ()                    => void;
  performAction:      (action: Action)      => void;
  dismissConsequence: ()                    => void;
  submitQuiz:         (result: QuizResult)  => void;
  advanceSlot:        ()                    => void;
  chooseEvent:        (choice: EventChoice) => void; // Requirement #9
  resetGame:          ()                    => void;
}
