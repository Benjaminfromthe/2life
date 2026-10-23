// ============================================================
// 2Life — Core TypeScript Types
// ============================================================

export type CharacterId = "student" | "athlete" | "worker";
export type TimeSlot = "morning" | "afternoon" | "evening" | "night";
export type Screen = "welcome" | "character-select" | "game" | "quiz" | "game-over";
export type RoleStat = "grades" | "fitness" | "performance";

// ----------------------------------------------------------
// Stats
// ----------------------------------------------------------
export interface Stats {
  energy: number;      // 0-100  – depleted by actions, restored by rest / sleep
  health: number;      // 0-100  – long-term; drops when energy hits 0 repeatedly
  happiness: number;   // 0-100  – fun, social, stress
  grades: number;      // Student role stat  (0-100)
  fitness: number;     // Athlete role stat  (Phase 3)
  performance: number; // Worker  role stat  (Phase 3)
}

// ----------------------------------------------------------
// Actions
// ----------------------------------------------------------
export interface StatDelta {
  energy?: number;
  health?: number;
  happiness?: number;
  grades?: number;
  fitness?: number;
  performance?: number;
  [key: string]: number | undefined;
}


export interface Action {
  id: string;
  label: string;
  icon: string;              // emoji
  description: string;       // short flavour text for the consequence modal
  availableSlots: TimeSlot[];
  availableFor: CharacterId[];
  statDelta: StatDelta;
  creditDelta: number;       // positive = earn, negative = spend
  requiresCredits?: number;  // minimum credits needed to perform
  triggerQuiz?: boolean;     // set to true for "Go to School"
  absenceDelta?: number;     // +1 when skipping school
}

// ----------------------------------------------------------
// Consequence modal payload
// ----------------------------------------------------------
export interface ConsequencePayload {
  icon: string;
  title: string;
  body: string;
  type: "positive" | "negative" | "neutral" | "warning";
}

// ----------------------------------------------------------
// Quiz
// ----------------------------------------------------------
export interface QuizQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: "easy" | "normal" | "hard";
}

export interface QuizResult {
  score: number;   // 0-100 percentage
  passed: boolean;
}

// ----------------------------------------------------------
// History
// ----------------------------------------------------------
export interface HistoryEntry {
  day: number;
  slot: TimeSlot;
  actionId: string;
  statSnapshot: Stats;
  credits: number;
}

// ----------------------------------------------------------
// Random Events
// ----------------------------------------------------------
export interface RandomEvent {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: "positive" | "negative" | "neutral";
  statDelta: StatDelta;
  creditDelta: number;
  chance: number; // 0-1 probability per slot
}

// ----------------------------------------------------------
// Character definition
// ----------------------------------------------------------
export interface CharacterDef {
  id: CharacterId;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  startingStats: Stats;
  startingCredits: number;
  roleStat: RoleStat;
  color: string;   // accent colour class name
  bgColor: string; // background colour
}

// ----------------------------------------------------------
// Master Game State (Zustand)
// ----------------------------------------------------------
export interface GameState {
  // Meta
  screen: Screen;
  playerName: string;
  character: CharacterId | null;

  // Time
  day: number;
  slot: TimeSlot;

  // Resources
  stats: Stats;
  credits: number;

  // Student-specific
  absences: number;
  warnings: number;
  studyBonus: boolean;   // gives easier quiz next time
  consecutiveLowEnergy: number; // days in a row with energy hitting 0

  // Consequence modal
  pendingConsequence: ConsequencePayload | null;

  // Quiz
  pendingQuiz: boolean;

  // History
  history: HistoryEntry[];

  // Game-over reason
  gameOverReason: string;

  // Actions
  setPlayerName: (name: string) => void;
  selectCharacter: (id: CharacterId) => void;
  startGame: () => void;
  performAction: (action: Action) => void;
  dismissConsequence: () => void;
  submitQuiz: (result: QuizResult) => void;
  advanceSlot: () => void;
  resetGame: () => void;
}
