// ============================================================
// 2Life — World Registry
// All available worlds indexed by id.
// ============================================================
import type { WorldDef } from "../../types/world";
import { MODERN_WORLD }       from "./modern";
import { DRAGON_KNIGHT_WORLD } from "./dragon-knight";

export const WORLDS: Record<string, WorldDef> = {
  modern:        MODERN_WORLD,
  "dragon-knight": DRAGON_KNIGHT_WORLD,
};

export const WORLD_LIST: WorldDef[] = Object.values(WORLDS);

export function getWorld(id: string): WorldDef {
  return WORLDS[id] ?? MODERN_WORLD;
}

export const DEFAULT_WORLD_ID = "modern";
