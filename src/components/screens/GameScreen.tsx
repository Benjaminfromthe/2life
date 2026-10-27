// ============================================================
// 2Life — Main Game Screen
// Layout: header → stats bar → [Phaser world] → action panel
// The Phaser world sits in the empty area between stats & actions.
// ============================================================
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import StatsBar from "../game/StatsBar";
import DayClock from "../game/DayClock";
import PhaserWorld from "../game/PhaserWorld";
import ActionPanel from "../game/ActionPanel";
import ConsequenceModal from "../game/ConsequenceModal";
import { CHARACTERS } from "../../data/characters";
import { WORLD_LIST } from "../../data/worlds/index";

export default function GameScreen() {
  const {
    character, playerName, absences, resetGame, advanceSlot, slot,
    worldId, setWorldId, currentPlaceName, currentPlaceIcon,
  } = useGameStore();

  const charDef = CHARACTERS.find((c) => c.id === character);

  return (
    <div className="game-screen" role="main">
      {/* Top header bar */}
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

      {/* Stats */}
      <StatsBar />

      {/* Phaser World — fills the area between stats bar and action panel */}
      <motion.div layout className="game-main">
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
        <PhaserWorld />
      </motion.div>

      {/* Actions */}
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

      {/* Consequence modal (overlays everything) */}
      <ConsequenceModal />
    </div>
  );
}
