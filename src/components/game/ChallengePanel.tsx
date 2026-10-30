// ============================================================
// 2Life — Challenge Panel (Phase 2C)
// Shows the active world's current level, available challenges,
// and the boss fight. Integrates with completeChallenge /
// defeatBoss / advanceLevel store actions.
// ============================================================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { getWorld } from "../../data/worlds/index";
import { rollStatCheck } from "../../game/levelSystem";
import type { WorldChallenge, ChallengeOption } from "../../types/world";

// ----------------------------------------------------------
// Challenge type badge
// ----------------------------------------------------------
function ChallengeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    "stat-check": { label: "Skill Check", cls: "badge-skill" },
    "choice":     { label: "Decision",    cls: "badge-choice" },
    "quiz":       { label: "Quiz",        cls: "badge-quiz" },
    "minigame":   { label: "Mini-game",   cls: "badge-minigame" },
  };
  const entry = map[type] ?? { label: type, cls: "badge-skill" };
  return (
    <span className={`challenge-badge ${entry.cls}`}>{entry.label}</span>
  );
}

// ----------------------------------------------------------
// Difficulty stars
// ----------------------------------------------------------
function DifficultyStars({ difficulty }: { difficulty: number }) {
  const filled = Math.round(difficulty / 2);
  return (
    <span className="challenge-difficulty" aria-label={`Difficulty: ${difficulty} / 10`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < filled ? "diff-star--on" : "diff-star--off"}>★</span>
      ))}
    </span>
  );
}

// ----------------------------------------------------------
// Choice option button
// ----------------------------------------------------------
function OptionButton({
  option, disabled, onPick,
}: {
  option: ChallengeOption;
  disabled: boolean;
  onPick: () => void;
}) {
  return (
    <motion.button
      id={`challenge-opt-${option.id}`}
      className="challenge-option"
      onClick={onPick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      aria-label={option.label}
    >
      <span className="challenge-opt-label">{option.label}</span>
      <span className="challenge-opt-desc">{option.description}</span>
      {(option.moneyDelta !== 0 || Object.keys(option.statDelta).length > 0) && (
        <div className="challenge-opt-effects">
          {option.moneyDelta !== 0 && (
            <span className={`eff-chip ${option.moneyDelta > 0 ? "eff-positive" : "eff-negative"}`}>
              {option.moneyDelta > 0 ? "+" : ""}₡{option.moneyDelta}
            </span>
          )}
          {Object.entries(option.statDelta)
            .filter(([, v]) => v !== 0)
            .slice(0, 3)
            .map(([k, v]) => (
              <span
                key={k}
                className={`eff-chip ${(v as number) > 0 ? "eff-positive" : "eff-negative"}`}
              >
                {(v as number) > 0 ? "+" : ""}{v} {k}
              </span>
            ))}
        </div>
      )}
    </motion.button>
  );
}

// ----------------------------------------------------------
// Stat-check result screen
// ----------------------------------------------------------
function StatCheckResult({
  outcome,
  onContinue,
}: {
  outcome: "success" | "failure";
  onContinue: () => void;
}) {
  return (
    <motion.div
      className={`stat-check-result ${outcome === "success" ? "result-success" : "result-failure"}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
    >
      <span className="result-icon">{outcome === "success" ? "🏆" : "💔"}</span>
      <p className="result-label">{outcome === "success" ? "Success!" : "Failed!"}</p>
      <button
        id="stat-check-continue"
        className="btn btn-primary"
        onClick={onContinue}
      >
        Continue →
      </button>
    </motion.div>
  );
}

// ----------------------------------------------------------
// Single challenge card
// ----------------------------------------------------------
function ChallengeCard({
  challenge,
  isBoss,
  completed,
  onComplete,
}: {
  challenge: WorldChallenge;
  isBoss?: boolean;
  completed: boolean;
  onComplete: (
    challengeId: string,
    outcome: "success" | "failure",
    statDelta: Record<string, number>,
    moneyDelta: number
  ) => void;
}) {
  const [open, setOpen]           = useState(false);
  const [rolling, setRolling]     = useState(false);
  const [rollResult, setRollResult] = useState<"success" | "failure" | null>(null);

  const worldStats = useGameStore((s) => s.worldStats);

  const handleStatCheck = () => {
    if (rolling) return;
    setRolling(true);
    // Brief "rolling" animation delay
    setTimeout(() => {
      const outcome = rollStatCheck(worldStats, challenge);
      setRollResult(outcome);

      const deltas =
        outcome === "success"
          ? challenge.outcomes?.success
          : challenge.outcomes?.failure;

      onComplete(
        challenge.id,
        outcome,
        deltas?.statDelta ?? {},
        deltas?.moneyDelta ?? 0
      );
    }, 700);
  };

  const handleChoice = (opt: ChallengeOption) => {
    onComplete(challenge.id, "success", opt.statDelta, opt.moneyDelta);
    setOpen(false);
  };

  if (completed) {
    return (
      <div className={`challenge-card challenge-card--done ${isBoss ? "challenge-card--boss" : ""}`}>
        <span className="challenge-done-icon">✅</span>
        <span className="challenge-done-label">{challenge.name}</span>
      </div>
    );
  }

  return (
    <motion.div
      className={`challenge-card ${isBoss ? "challenge-card--boss" : ""} ${open ? "challenge-card--open" : ""}`}
      layout
    >
      {/* Card header */}
      <button
        id={`challenge-card-${challenge.id}`}
        className="challenge-card-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="challenge-card-meta">
          {isBoss && <span className="boss-badge">👑 Boss</span>}
          <ChallengeBadge type={challenge.type} />
          <DifficultyStars difficulty={challenge.difficulty} />
        </div>
        <h4 className="challenge-card-name">{challenge.name}</h4>
        <p className="challenge-card-desc">{challenge.description}</p>
        <span className="challenge-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {/* Expanded body */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="challenge-card-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Stat-check type */}
            {challenge.type === "stat-check" && (
              <div className="stat-check-area">
                {rollResult ? (
                  <StatCheckResult
                    outcome={rollResult}
                    onContinue={() => {
                      setRollResult(null);
                      setOpen(false);
                    }}
                  />
                ) : (
                  <motion.button
                    id={`roll-btn-${challenge.id}`}
                    className={`roll-btn ${rolling ? "roll-btn--rolling" : ""}`}
                    onClick={handleStatCheck}
                    disabled={rolling}
                    whileHover={!rolling ? { scale: 1.04 } : undefined}
                    whileTap={!rolling ? { scale: 0.96 } : undefined}
                  >
                    {rolling ? (
                      <span className="roll-spinner">🎲 Rolling…</span>
                    ) : (
                      "🎲 Roll Skill Check"
                    )}
                  </motion.button>
                )}
              </div>
            )}

            {/* Choice type */}
            {challenge.type === "choice" && (
              <div className="choice-options">
                {challenge.options.map((opt) => (
                  <OptionButton
                    key={opt.id}
                    option={opt}
                    disabled={false}
                    onPick={() => handleChoice(opt)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ----------------------------------------------------------
// Level Complete banner
// ----------------------------------------------------------
function LevelCompleteBanner({ onAdvance }: { onAdvance: () => void }) {
  return (
    <motion.div
      className="level-complete"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
    >
      <span className="level-complete-icon">🎖️</span>
      <p className="level-complete-text">Level Complete!</p>
      <motion.button
        id="advance-level-btn"
        className="btn btn-primary"
        onClick={onAdvance}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        Next Level →
      </motion.button>
    </motion.div>
  );
}

// ----------------------------------------------------------
// Main Challenge Panel
// ----------------------------------------------------------
export default function ChallengePanel() {
  const {
    worldId,
    levelIndex,
    challengesDone,
    bossDefeated,
    worldComplete,
    completeChallenge,
    defeatBoss,
    advanceLevel,
  } = useGameStore();

  const world = getWorld(worldId);
  const currentLevel = world.levels[levelIndex] ?? null;

  if (!currentLevel || worldComplete) {
    return (
      <div className="challenge-panel challenge-panel--complete">
        <span className="challenge-panel-done-icon">🌟</span>
        <p className="challenge-panel-done-text">
          {worldComplete ? "World Complete! All levels mastered." : "No more levels."}
        </p>
      </div>
    );
  }

  const allChallengesDone = currentLevel.challenges.every((c) =>
    challengesDone.includes(c.id)
  );
  const canFightBoss = allChallengesDone && !!currentLevel.boss && !bossDefeated;
  const levelDone = allChallengesDone && (!currentLevel.boss || bossDefeated);

  return (
    <div className="challenge-panel" role="region" aria-label="World Challenges">
      {/* Panel header */}
      <div className="challenge-panel-header">
        <div className="challenge-panel-title-row">
          <span className="challenge-panel-level-badge">
            Lv. {levelIndex + 1}
          </span>
          <h3 className="challenge-panel-title">{currentLevel.name}</h3>
        </div>
        <p className="challenge-panel-goal">🎯 {currentLevel.goal}</p>

        {/* Progress bar */}
        {currentLevel.challenges.length > 0 && (
          <div className="challenge-progress">
            <div
              className="challenge-progress-fill"
              style={{
                width: `${(challengesDone.filter(id =>
                  currentLevel.challenges.some(c => c.id === id)
                ).length / currentLevel.challenges.length) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Level complete banner */}
      <AnimatePresence>
        {levelDone && (
          <LevelCompleteBanner onAdvance={advanceLevel} />
        )}
      </AnimatePresence>

      {/* Challenges list */}
      {!levelDone && (
        <div className="challenge-list" role="list">
          {currentLevel.challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              completed={challengesDone.includes(challenge.id)}
              onComplete={(id, outcome, statDelta, moneyDelta) =>
                completeChallenge(id, outcome, statDelta, moneyDelta)
              }
            />
          ))}

          {/* Boss (only shown after all challenges done) */}
          {currentLevel.boss && (
            <AnimatePresence>
              {(allChallengesDone || canFightBoss) && (
                <motion.div
                  key="boss"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ChallengeCard
                    challenge={currentLevel.boss}
                    isBoss
                    completed={bossDefeated}
                    onComplete={(_, __, statDelta, moneyDelta) =>
                      defeatBoss(statDelta, moneyDelta)
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}
