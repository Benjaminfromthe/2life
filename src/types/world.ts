// ============================================================
// 2Life — WorldDef Type System
// All world-specific content is driven by this schema.
// No hardcoded world logic in engine code.
// ============================================================

export type ContentRating = "all-ages" | "teen";
export type GeneratedBy   = "handwritten" | "ai";
export type ChallengeType = "stat-check" | "choice" | "quiz" | "minigame";
export type TilesetId     = "modern" | "medieval-fantasy" | "generic";

// ----------------------------------------------------------
// Stat definition
// ----------------------------------------------------------
export interface WorldStatDef {
  id:         string;
  name:       string;
  icon:       string;
  color:      string;        // CSS colour token or hex
  startValue: number;        // 0-100
}

// ----------------------------------------------------------
// Map position for a place
// ----------------------------------------------------------
export interface MapPosition {
  x: number;   // 0-1 fraction of map width
  y: number;   // 0-1 fraction of map height
}

// ----------------------------------------------------------
// Place (building/zone on the world map)
// ----------------------------------------------------------
export interface WorldPlace {
  id:          string;
  name:        string;
  icon:        string;
  description: string;
  mapPosition: MapPosition;
  width:       number;  // tile width
  height:      number;  // tile height
  actionIds:   string[];
}

// ----------------------------------------------------------
// Stat delta (world-specific — any stat key)
// ----------------------------------------------------------
export type WorldStatDelta = Record<string, number>;

// ----------------------------------------------------------
// Action (available inside a place)
// ----------------------------------------------------------
export interface WorldAction {
  id:                string;
  name:              string;
  icon:              string;
  description:       string;
  placeId:           string;
  statDelta:         WorldStatDelta;
  moneyDelta:        number;
  energyCost:        number;
  availableAtLevels: number[];   // empty = always available
}

// ----------------------------------------------------------
// Career rank (progression ladder)
// ----------------------------------------------------------
export interface WorldRank {
  id:       string;
  name:     string;
  minLevel: number;
  salary:   number;
}

// ----------------------------------------------------------
// Challenge option (for choice / stat-check types)
// ----------------------------------------------------------
export interface ChallengeOption {
  id:          string;
  label:       string;
  description: string;
  statDelta:   WorldStatDelta;
  moneyDelta:  number;
  logEntry?:   string;
}

// ----------------------------------------------------------
// Challenge
// ----------------------------------------------------------
export interface WorldChallenge {
  id:          string;
  name:        string;
  description: string;
  type:        ChallengeType;
  difficulty:  number;    // 1-10
  options:     ChallengeOption[];
  outcomes?: {
    success: { statDelta: WorldStatDelta; moneyDelta: number; logEntry?: string };
    failure: { statDelta: WorldStatDelta; moneyDelta: number; logEntry?: string };
  };
}

// ----------------------------------------------------------
// Level
// ----------------------------------------------------------
export interface WorldLevel {
  id:             string;
  name:           string;
  description:    string;
  goal:           string;
  challenges:     WorldChallenge[];
  boss?:          WorldChallenge;
  winCondition:   LevelCondition;
  loseCondition?: LevelCondition;
  reward: {
    statDelta:   WorldStatDelta;
    moneyDelta:  number;
    logEntry:    string;
  };
}

// ----------------------------------------------------------
// Level condition (win / lose trigger)
// ----------------------------------------------------------
export type LevelCondition =
  | { type: "stat-threshold"; statId: string; min: number }
  | { type: "complete-challenges"; count: number }
  | { type: "defeat-boss" }
  | { type: "age"; max: number };

// ----------------------------------------------------------
// World Event choice
// ----------------------------------------------------------
export interface WorldEventChoice {
  id:               string;
  label:            string;
  description:      string;
  statDelta:        WorldStatDelta;
  moneyDelta:       number;
  logEntry?:        string;
  setsPartner?:     string;
  kidsIncrease?:    boolean;
  careerLevelDelta?: number;
}

// ----------------------------------------------------------
// Event condition (when to show)
// ----------------------------------------------------------
export type EventCondition =
  | { type: "stat-above"; statId: string; value: number }
  | { type: "stat-below"; statId: string; value: number }
  | { type: "level-gte"; value: number }
  | { type: "has-partner" }
  | { type: "no-partner" }
  | { type: "age-range"; min: number; max: number }
  | { type: "always" };

// ----------------------------------------------------------
// World Event
// ----------------------------------------------------------
export interface WorldEvent {
  id:          string;
  icon:        string;
  title:       string;
  description: string;
  type:        "positive" | "negative" | "neutral";
  chance:      number;        // 0-1 probability per year turn
  conditions:  EventCondition[];
  choices:     WorldEventChoice[];
}

// ----------------------------------------------------------
// Art theme
// ----------------------------------------------------------
export interface ArtTheme {
  tilesetId:      TilesetId;
  palette: {
    primary:    string;
    secondary:  string;
    accent:     string;
    ground:     string;
    sky:        string;
  };
  characterStyle: string;  // e.g. "knight", "modern", "astronaut"
  musicMood:      string;  // e.g. "medieval", "upbeat", "ambient"
}

// ----------------------------------------------------------
// WorldDef — root schema
// ----------------------------------------------------------
export interface WorldDef {
  id:            string;
  name:          string;
  tagline:       string;
  theme:         string;
  tone:          string;
  contentRating: ContentRating;
  generatedBy:   GeneratedBy;
  playerRole:    string;

  stats:     WorldStatDef[];
  places:    WorldPlace[];
  actions:   WorldAction[];
  ranks:     WorldRank[];
  levels:    WorldLevel[];
  events:    WorldEvent[];
  artTheme:  ArtTheme;
  safetyNotes?: string;
}

// ----------------------------------------------------------
// Validation
// ----------------------------------------------------------
export interface ValidationError {
  field:   string;
  message: string;
}

export function validateWorldDef(world: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!world || typeof world !== "object") {
    return [{ field: "root", message: "WorldDef must be an object" }];
  }

  const w = world as Partial<WorldDef>;

  if (!w.id)            errors.push({ field: "id",            message: "id is required" });
  if (!w.name)          errors.push({ field: "name",          message: "name is required" });
  if (!w.contentRating) errors.push({ field: "contentRating", message: "contentRating is required" });
  if (!w.playerRole)    errors.push({ field: "playerRole",    message: "playerRole is required" });

  if (!w.places  || w.places.length  === 0) errors.push({ field: "places",  message: "At least one place is required" });
  if (!w.levels  || w.levels.length  === 0) errors.push({ field: "levels",  message: "At least one level is required" });
  if (!w.actions || w.actions.length === 0) errors.push({ field: "actions", message: "At least one action is required" });

  // Cross-reference: action placeIds must exist
  const placeIds = new Set((w.places ?? []).map((p) => p.id));
  for (const action of w.actions ?? []) {
    if (action.placeId && !placeIds.has(action.placeId)) {
      errors.push({
        field: `actions.${action.id}.placeId`,
        message: `Action "${action.id}" references unknown place "${action.placeId}"`,
      });
    }
  }

  // Cross-reference: place actionIds must exist in actions
  const actionIds = new Set((w.actions ?? []).map((a) => a.id));
  for (const place of w.places ?? []) {
    for (const aId of place.actionIds ?? []) {
      if (!actionIds.has(aId)) {
        errors.push({
          field: `places.${place.id}.actionIds`,
          message: `Place "${place.id}" references unknown action "${aId}"`,
        });
      }
    }
  }

  return errors;
}
