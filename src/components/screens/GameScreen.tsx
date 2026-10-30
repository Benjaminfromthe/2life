// ============================================================
// 2Life — Main Game Screen (Phase 2C update)
// Layout:
//   header → stats bar → game-main (tabs: World / Challenges)
//   → footer (actions + skip)
// ============================================================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import StatsBar from "../game/StatsBar";
import DayClock from "../game/DayClock";
import PhaserWorld from "../game/PhaserWorld";
import ActionPanel from "../game/ActionPanel";
import ConsequenceModal from "../game/ConsequenceModal";
import WorldStatsHUD from "../game/WorldStatsHUD";
import ChallengePanel from "../game/ChallengePanel";
import { CHARACTERS } from "../../data/characters";
import { WORLD_LIST } from "../../data/worlds/index";

type Tab = "world" | "challenges";

export default function GameScreen() {
  const {
    character, playerName, absences, resetGame, advanceSlot, slot,
    worldId, setWorldId, currentPlaceName, currentPlaceIcon,
    challengesDone, levelIndex, worldComplete,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<Tab>("world");

  const charDef = CHARACTERS.find((c) => c.id === character);

  // Badge count: uncompleted challenges in current level
  const world = WORLD_LIST.find((w) => w.id === worldId);
  const currentLevel = world ? (world as any).levels?.[levelIndex] : null;
  const pendingChallenges = currentLevel
    ? currentLevel.challenges.filter((c: any) => !challengesDone.includes(c.id)).length
    : 0;

  return (
    <div className="game-screen" role="main">
      {/* ── Top header bar ────────────────────────────────── */}
      <header className="game-header">
        <div className="game-header-left">
          <span className="game-char-avatar" aria-hidden="true">
            {charDef?.emoji ?? "🎓"}
          </span>
          <div>
            <p className="game-player-name">{playerName || "Player"}</p>
            <p className="game-char-name">{charDef?.name ?? "Student"}</p>
          </div>
        </div>

        <DayClock />

        <div className="game-header-right">
          {/* World Selector */}
          <select
            id="world-selector"
            className="world-selector"
            value={worldId}
            onChange={(e) => setWorldId(e.target.value)}
            aria-label="Select world"
            title="Switch world"
          >
            {WORLD_LIST.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {character === "student" && absences > 0 && (
            <div
              className={`absence-badge ${absences >= 8 ? "absence-badge--critical" : absences >= 5 ? "absence-badge--warning" : ""}`}
              aria-label={`${absences} absences`}
              title={`Absences: ${absences} / 10`}
            >
              🚫 {absences}
            </div>
          )}
          <button
            id="game-menu-btn"
            className="icon-btn"
            aria-label="Open menu"
            onClick={() => {
              if (confirm("Reset and go to main menu?")) resetGame();
            }}
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <StatsBar />

      {/* ── Tab bar (World / Challenges) ──────────────────── */}
      <div className="game-tab-bar" role="tablist" aria-label="Game view">
        <button
          id="tab-world"
          role="tab"
          aria-selected={activeTab === "world"}
          className={`game-tab ${activeTab === "world" ? "game-tab--active" : ""}`}
          onClick={() => setActiveTab("world")}
        >
          🗺️ World
        </button>
        <button
          id="tab-challenges"
          role="tab"
          aria-selected={activeTab === "challenges"}
          className={`game-tab ${activeTab === "challenges" ? "game-tab--active" : ""}`}
          onClick={() => setActiveTab("challenges")}
        >
          ⚔️ Challenges
          {!worldComplete && pendingChallenges > 0 && (
            <span className="tab-badge" aria-label={`${pendingChallenges} pending`}>
              {pendingChallenges}
            </span>
          )}
        </button>
      </div>

      {/* ── Main content area ─────────────────────────────── */}
      <div className="game-main">
        <AnimatePresence mode="wait">
          {activeTab === "world" ? (
            <motion.div
              key="world"
              className="game-tab-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* World stats HUD */}
              <WorldStatsHUD />

              {/* Active place indicator */}
              {currentPlaceName && (
                <motion.div
                  className="place-indicator"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <span>{currentPlaceIcon}</span>
                  <span>{currentPlaceName}</span>
                  <span className="place-indicator-hint">Actions below ↓</span>
                </motion.div>
              )}

              {/* Phaser world */}
              <PhaserWorld />
            </motion.div>
          ) : (
            <motion.div
              key="challenges"
              className="game-tab-content game-tab-content--scroll"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ChallengePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer (actions + skip) ───────────────────────── */}
      <div className="game-footer">
        <ActionPanel />
        {slot !== "night" && (
          <button
            id="skip-slot-btn"
            className="skip-slot-btn"
            onClick={advanceSlot}
            aria-label="Skip this time slot"
          >
            Skip slot →
          </button>
        )}
      </div>

      {/* ── Consequence modal (overlays everything) ───────── */}
      <ConsequenceModal />
    </div>
  );
}
