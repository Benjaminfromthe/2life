// ============================================================
// 2Life — Main Game Screen
// ============================================================
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import StatsBar from "../game/StatsBar";
import DayClock from "../game/DayClock";
import SceneView from "../game/SceneView";
import ActionPanel from "../game/ActionPanel";
import ConsequenceModal from "../game/ConsequenceModal";
import { CHARACTERS } from "../../data/characters";

export default function GameScreen() {
  const { character, playerName, absences, resetGame, advanceSlot, slot } =
    useGameStore();
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

      {/* Scene */}
      <motion.div
        layout
        className="game-main"
      >
        <SceneView />
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
