// ============================================================
// 2Life — Game Over Screen
// ============================================================
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { CHARACTERS } from "../../data/characters";
import type { Stats } from "../../types/game";


const REASONS: Record<string, { icon: string; title: string; body: string }> = {
  completed: {
    icon: "🎓",
    title: "Life Completed!",
    body: "You made it through all 30 days! Time to reflect on the choices you made.",
  },
  health: {
    icon: "🏥",
    title: "Hospitalised!",
    body: "Your health hit zero. You overdid it and your body gave out. Take better care of yourself next time!",
  },
  expelled: {
    icon: "📛",
    title: "Expelled!",
    body: "Too many absences — you were expelled from school. Attendance matters!",
  },
  grades: {
    icon: "📉",
    title: "Academic Failure!",
    body: "Your grades dropped to zero. The school held you back. Study harder next time!",
  },
  default: {
    icon: "😔",
    title: "Game Over",
    body: "Life didn't go as planned. But every day is a new chance to do better!",
  },
};

function StatResult({ label, value, max = 100, color }: {
  label: string;
  value: number;
  max?: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
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

function getGrade(stats: Stats, character: string | null) {
  const roleStat =
    character === "student"
      ? stats.grades
      : character === "athlete"
      ? stats.fitness
      : stats.performance;

  const avg = (stats.energy + stats.health + stats.happiness + roleStat) / 4;
  if (avg >= 80) return { letter: "S", label: "Outstanding", color: "#ffd700" };
  if (avg >= 65) return { letter: "A", label: "Excellent", color: "#a3e635" };
  if (avg >= 50) return { letter: "B", label: "Good", color: "#34d399" };
  if (avg >= 35) return { letter: "C", label: "Average", color: "#60a5fa" };
  return { letter: "F", label: "Needs Improvement", color: "#f87171" };
}

export default function GameOverScreen() {
  const { stats, credits, day, character, gameOverReason, history, resetGame, playerName } =
    useGameStore();

  const reason = REASONS[gameOverReason] ?? REASONS.default;
  const charDef = CHARACTERS.find((c) => c.id === character);
  const grade = getGrade(stats, character);
  const daysPlayed = day - 1;
  const actionsCount = history.length;
  const isCompleted = gameOverReason === "completed";

  return (
    <div className="gameover-screen">
      {/* Particles */}
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
        {/* Icon */}
        <motion.div
          className="gameover-icon"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          aria-hidden="true"
        >
          {reason.icon}
        </motion.div>

        {/* Title */}
        <motion.h1
          className="gameover-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {reason.title}
        </motion.h1>
        <motion.p
          className="gameover-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {reason.body}
        </motion.p>

        {/* Grade */}
        <motion.div
          className="gameover-grade"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          style={{ borderColor: grade.color, color: grade.color }}
          aria-label={`Final grade: ${grade.letter} - ${grade.label}`}
        >
          <span className="grade-letter">{grade.letter}</span>
          <span className="grade-label">{grade.label}</span>
        </motion.div>

        {/* Life summary */}
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
              <span>⚡ Actions taken</span>
              <strong>{actionsCount}</strong>
            </div>
            <div className="summary-fact">
              <span>₡ Credits left</span>
              <strong>{credits}</strong>
            </div>
            <div className="summary-fact">
              <span>{charDef?.emoji} Character</span>
              <strong>{charDef?.name}</strong>
            </div>
          </div>

          <div className="summary-stats">
            <StatResult label="⚡ Energy" value={stats.energy} color="stat-fill-yellow" />
            <StatResult label="❤️ Health" value={stats.health} color="stat-fill-red" />
            <StatResult label="😊 Happiness" value={stats.happiness} color="stat-fill-pink" />
            {character === "student" && (
              <StatResult label="📚 Grades" value={stats.grades} color="stat-fill-violet" />
            )}
            {character === "athlete" && (
              <StatResult label="💪 Fitness" value={stats.fitness} color="stat-fill-emerald" />
            )}
            {character === "worker" && (
              <StatResult label="📈 Performance" value={stats.performance} color="stat-fill-amber" />
            )}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          id="gameover-restart-btn"
          className="btn btn-primary btn-large"
          onClick={resetGame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          🔄 Play Again
        </motion.button>
      </div>
    </div>
  );
}
