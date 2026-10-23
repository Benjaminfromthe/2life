// ============================================================
// 2Life — Game Over Screen
// Requirements:
//   #10 — "Your Life Story" section from lifeLog[]
//   #11 — data-driven ending text + goals summary
// ============================================================
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { CHARACTERS } from "../../data/characters";
import { GOALS } from "../../data/goals";
import { getLifeEnding } from "../../data/lifeEndings";
import type { Stats, LifeLogEntry } from "../../types/game";

// ── Stat result bar ───────────────────────────────────────
function StatResult({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round(value));
  return (
    <div className="gameover-stat">
      <div className="gameover-stat-header">
        <span>{label}</span>
        <span className="gameover-stat-value">{Math.round(value)}</span>
      </div>
      <div className="gameover-stat-bar-bg">
        <motion.div
          className={`gameover-stat-bar-fill ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Final grade derivation ────────────────────────────────
function getGrade(stats: Stats, character: string | null) {
  const roleStat =
    character === "student"  ? stats.grades
    : character === "athlete"? stats.fitness
    :                          stats.performance;
  const avg = (stats.energy + stats.health + stats.happiness + roleStat) / 4;
  if (avg >= 80) return { letter: "S", label: "Outstanding",       color: "#ffd700" };
  if (avg >= 65) return { letter: "A", label: "Excellent",         color: "#a3e635" };
  if (avg >= 50) return { letter: "B", label: "Good",              color: "#34d399" };
  if (avg >= 35) return { letter: "C", label: "Average",           color: "#60a5fa" };
  return         { letter: "F", label: "Needs Improvement",       color: "#f87171" };
}

// ── Life Story timeline entry ─────────────────────────────
function LifeLogRow({ entry, index }: { entry: LifeLogEntry; index: number }) {
  return (
    <motion.div
      className="life-log-entry"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.35 }}
    >
      <span className="life-log-age">Age {entry.age}</span>
      <span className="life-log-icon" aria-hidden="true">{entry.icon}</span>
      <span className="life-log-text">{entry.text}</span>
    </motion.div>
  );
}

// ── Goal chip ────────────────────────────────────────────
function GoalChip({
  icon,
  label,
  achieved,
  delay,
}: {
  icon:     string;
  label:    string;
  achieved: boolean;
  delay:    number;
}) {
  return (
    <motion.div
      className={`goal-chip ${achieved ? "goal-chip--achieved" : "goal-chip--missed"}`}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      title={achieved ? "Achieved ✓" : "Not achieved"}
      aria-label={`${label}: ${achieved ? "achieved" : "not achieved"}`}
    >
      <span className="goal-chip-icon">{icon}</span>
      <span className="goal-chip-label">{label}</span>
      <span className="goal-chip-status">{achieved ? "✓" : "✗"}</span>
    </motion.div>
  );
}

// ── Main screen ───────────────────────────────────────────
export default function GameOverScreen() {
  const {
    stats, credits, day, age, character, partner, kids, careerLevel,
    gameOverReason, history, lifeLog, goalsAchieved,
    resetGame, playerName,
  } = useGameStore();

  const ending      = getLifeEnding(gameOverReason || "default");
  const charDef     = CHARACTERS.find((c) => c.id === character);
  const grade       = getGrade(stats, character);
  const daysPlayed  = day - 1;
  const isCompleted = gameOverReason === "completed" || gameOverReason === "old_age";

  return (
    <div className="gameover-screen">
      {/* Confetti for good endings */}
      {isCompleted && (
        <div className="gameover-confetti" aria-hidden="true">
          {["🎉", "⭐", "🎊", "✨", "🏆"].map((e, i) => (
            <motion.span
              key={i}
              className="confetti-piece"
              style={{ left: `${10 + i * 18}%` }}
              animate={{ y: ["0%", "110%"], opacity: [1, 0], rotate: [0, 360] }}
              transition={{ duration: 2 + i * 0.3, delay: i * 0.2, ease: "easeIn" }}
            >
              {e}
            </motion.span>
          ))}
        </div>
      )}

      <div className="gameover-content">

        {/* ── Ending icon + title ───────────────────────── */}
        <motion.div
          className="gameover-icon"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          aria-hidden="true"
        >
          {ending.icon}
        </motion.div>

        <motion.h1
          className="gameover-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {ending.title}
        </motion.h1>

        <motion.p
          className="gameover-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {ending.body}
        </motion.p>

        {/* ── Grade badge ───────────────────────────────── */}
        <motion.div
          className="gameover-grade"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          style={{ borderColor: grade.color, color: grade.color }}
          aria-label={`Final grade: ${grade.letter} — ${grade.label}`}
        >
          <span className="grade-letter">{grade.letter}</span>
          <span className="grade-label">{grade.label}</span>
        </motion.div>

        {/* ── Life summary ──────────────────────────────── */}
        <motion.div
          className="gameover-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="summary-title">📊 Life Summary — {playerName}</h3>

          <div className="summary-facts">
            <div className="summary-fact">
              <span>🗓️ Days lived</span>
              <strong>{daysPlayed}</strong>
            </div>
            <div className="summary-fact">
              <span>🎂 Final age</span>
              <strong>{age}</strong>
            </div>
            <div className="summary-fact">
              <span>⚡ Actions taken</span>
              <strong>{history.length}</strong>
            </div>
            <div className="summary-fact">
              <span>₡ Credits left</span>
              <strong>{credits}</strong>
            </div>
            <div className="summary-fact">
              <span>{charDef?.emoji} Character</span>
              <strong>{charDef?.name ?? "—"}</strong>
            </div>
            <div className="summary-fact">
              <span>🏢 Career level</span>
              <strong>{careerLevel} / 5</strong>
            </div>
            <div className="summary-fact">
              <span>💑 Partner</span>
              <strong>{partner ?? "None"}</strong>
            </div>
            <div className="summary-fact">
              <span>👶 Kids</span>
              <strong>{kids}</strong>
            </div>
          </div>

          <div className="summary-stats">
            <StatResult label="⚡ Energy"    value={stats.energy}      color="stat-fill-yellow" />
            <StatResult label="❤️ Health"    value={stats.health}      color="stat-fill-red"    />
            <StatResult label="😊 Happiness" value={stats.happiness}    color="stat-fill-pink"   />
            {character === "student"  && <StatResult label="📚 Grades"      value={stats.grades}      color="stat-fill-violet"  />}
            {character === "athlete"  && <StatResult label="💪 Fitness"     value={stats.fitness}     color="stat-fill-emerald" />}
            {character === "worker"   && <StatResult label="📈 Performance" value={stats.performance} color="stat-fill-amber"   />}
          </div>
        </motion.div>

        {/* ── Goals summary — Requirement #11 ──────────── */}
        <motion.div
          className="gameover-goals"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <h3 className="summary-title">🎯 Life Goals</h3>
          <div className="goals-grid">
            {GOALS.map((goal, i) => (
              <GoalChip
                key={goal.id}
                icon={goal.icon}
                label={goal.label}
                achieved={goalsAchieved.includes(goal.id)}
                delay={0.8 + i * 0.06}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Your Life Story — Requirement #10 ────────── */}
        {lifeLog.length > 0 && (
          <motion.div
            className="gameover-lifestory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h3 className="summary-title">📖 Your Life Story</h3>
            <div className="life-log-list" role="list">
              {lifeLog.map((entry, i) => (
                <LifeLogRow key={i} entry={entry} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Play again ───────────────────────────────── */}
        <motion.button
          id="gameover-restart-btn"
          className="btn btn-primary btn-large"
          onClick={resetGame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          🔄 Play Again
        </motion.button>

      </div>
    </div>
  );
}
