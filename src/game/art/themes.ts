// ============================================================
// 2Life — Art Theme System
// Maps artTheme.tilesetId to rendering constants.
// Unknown IDs fall back to "generic" — never crashes.
// ============================================================
import type { TilesetId } from "../../types/world";

export interface ThemeConfig {
  id:          TilesetId;
  groundColor: number;   // Phaser hex
  skyColor:    number;
  buildingColors: {
    fill:   number;
    stroke: number;
  };
  pathColor:   number;
  borderColor: number;
  labelColor:  string;   // CSS colour for text
  treeEmoji:   string;
  playerColor: number;
  playerRadius: number;
}

const THEMES: Record<TilesetId, ThemeConfig> = {
  modern: {
    id:          "modern",
    groundColor:  0x4ade80,
    skyColor:     0xbae6fd,
    buildingColors: { fill: 0x6366f1, stroke: 0x4338ca },
    pathColor:    0xd4d4d4,
    borderColor:  0x1e293b,
    labelColor:   "#fff",
    treeEmoji:    "🌳",
    playerColor:  0xf97316,
    playerRadius: 10,
  },
  "medieval-fantasy": {
    id:          "medieval-fantasy",
    groundColor:  0x78350f,
    skyColor:     0x1e3a5f,
    buildingColors: { fill: 0x92400e, stroke: 0x78350f },
    pathColor:    0x713f12,
    borderColor:  0x1c1917,
    labelColor:   "#fde68a",
    treeEmoji:    "🌲",
    playerColor:  0x1e40af,
    playerRadius: 10,
  },
  generic: {
    id:          "generic",
    groundColor:  0x86efac,
    skyColor:     0x93c5fd,
    buildingColors: { fill: 0x64748b, stroke: 0x475569 },
    pathColor:    0xe2e8f0,
    borderColor:  0x1e293b,
    labelColor:   "#fff",
    treeEmoji:    "🌿",
    playerColor:  0xf43f5e,
    playerRadius: 10,
  },
};

export function getTheme(id?: string): ThemeConfig {
  return THEMES[(id ?? "generic") as TilesetId] ?? THEMES.generic;
}
