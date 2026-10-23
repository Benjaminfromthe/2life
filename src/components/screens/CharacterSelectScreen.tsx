// ============================================================
// 2Life — Character Select Screen
// ============================================================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { CHARACTERS } from "../../data/characters";
import type { CharacterDef } from "../../types/game";

const statLabels: Record<string, string> = {
  energy: "⚡ Energy",
  health: "❤️ Health",
  happiness: "😊 Happiness",
  grades: "📚 Grades",
  fitness: "💪 Fitness",
  performance: "📈 Performance",
};

function StatPreview({
  stat,
  value,
  accent,
}: {
  stat: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="stat-preview">
      <span className="stat-preview-label">{statLabels[stat] ?? stat}</span>
      <div className="stat-preview-bar-bg">
        <motion.div
          className={`stat-preview-bar-fill ${accent}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="stat-preview-value">{value}</span>
    </div>
  );
}

function CharacterCard({
  char,
  selected,
  onClick,
}: {
  char: CharacterDef;
  selected: boolean;
  onClick: () => void;
}) {
  const roleStat = char.roleStat;
  const coreStats = ["energy", "health", "happiness"] as const;
  const statsToShow = [...coreStats, roleStat];

  return (
    <motion.button
      id={`char-card-${char.id}`}
      className={`char-card ${selected ? "char-card--selected" : ""}`}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={selected}
      aria-label={`Select ${char.name} character`}
    >
      {/* Glow effect when selected */}
      {selected && (
        <motion.div
          className="char-card-glow"
          layoutId="char-glow"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}

      <div className="char-card-emoji" aria-hidden="true">
        {char.emoji}
      </div>
      <h3 className="char-card-name">{char.name}</h3>
      <p className="char-card-tagline">{char.tagline}</p>

      {selected && (
        <motion.div
          className="char-card-stats"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          {statsToShow.map((s) => (
            <StatPreview
              key={s}
              stat={s}
              value={char.startingStats[s as keyof typeof char.startingStats]}
              accent={
                s === roleStat ? "stat-fill-role" : "stat-fill-default"
              }
            />
          ))}
          <div className="char-card-credits">
            Starting Credits: <strong>₡{char.startingCredits}</strong>
          </div>
        </motion.div>
      )}
    </motion.button>
  );
}

export default function CharacterSelectScreen() {
  const { playerName, character, selectCharacter, startGame } = useGameStore();
  const [selected, setSelected] = useState<string | null>(character);

  const handleSelect = (id: string) => {
    setSelected(id);
    selectCharacter(id as CharacterDef["id"]);
  };

  const selectedChar = CHARACTERS.find((c) => c.id === selected);

  return (
    <div className="charselect-screen">
      {/* Back button */}
      <button
        id="charselect-back-btn"
        className="back-btn"
        onClick={() => useGameStore.setState({ screen: "welcome" })}
        aria-label="Go back to welcome screen"
      >
        ← Back
      </button>

      <motion.div
        className="charselect-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="charselect-title">
          Hey {playerName || "Player"}! 👋
        </h2>
        <p className="charselect-subtitle">Choose your character to begin.</p>
      </motion.div>

      <div className="charselect-grid">
        {CHARACTERS.map((char, i) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <CharacterCard
              char={char}
              selected={selected === char.id}
              onClick={() => handleSelect(char.id)}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && selectedChar && (
          <motion.div
            className="charselect-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <p className="charselect-description">{selectedChar.description}</p>
            <button
              id="charselect-start-btn"
              className="btn btn-primary btn-large"
              onClick={startGame}
            >
              Play as {selectedChar.emoji} {selectedChar.name} →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
