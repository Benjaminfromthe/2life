// ============================================================
// 2Life — Scene View (Cartoon background scene)
// ============================================================
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import type { TimeSlot } from "../../types/game";

// Background sky colours by slot
const SKY: Record<TimeSlot, string> = {
  morning: "scene-sky-morning",
  afternoon: "scene-sky-afternoon",
  evening: "scene-sky-evening",
  night: "scene-sky-night",
};

// Character scenes
const SCENES: Record<string, Record<TimeSlot, { emoji: string; bg: string; caption: string }>> = {
  student: {
    morning: { emoji: "🎒", bg: "scene-school", caption: "Heading to school…" },
    afternoon: { emoji: "📖", bg: "scene-classroom", caption: "In class…" },
    evening: { emoji: "🏠", bg: "scene-home", caption: "Back home…" },
    night: { emoji: "😴", bg: "scene-bedroom", caption: "Time to sleep…" },
  },
  athlete: {
    morning: { emoji: "🌄", bg: "scene-track", caption: "Morning run…" },
    afternoon: { emoji: "🏃", bg: "scene-field", caption: "Training session…" },
    evening: { emoji: "🛁", bg: "scene-home", caption: "Cooling down…" },
    night: { emoji: "😴", bg: "scene-bedroom", caption: "Rest and recover…" },
  },
  worker: {
    morning: { emoji: "☕", bg: "scene-office", caption: "Starting the day…" },
    afternoon: { emoji: "💼", bg: "scene-office", caption: "In the office…" },
    evening: { emoji: "🏠", bg: "scene-home", caption: "Back home…" },
    night: { emoji: "😴", bg: "scene-bedroom", caption: "Rest up…" },
  },
};

export default function SceneView() {
  const { character, slot } = useGameStore();
  const charId = character ?? "student";
  const scene = SCENES[charId]?.[slot] ?? SCENES.student[slot];

  return (
    <div className={`scene-view ${SKY[slot]}`} aria-label={`Scene: ${scene.caption}`} role="img">
      {/* Animated clouds / stars */}
      <div className="scene-bg-elements" aria-hidden="true">
        {slot === "night" ? (
          <>
            {["✨", "⭐", "🌟", "✨", "⭐"].map((s, i) => (
              <motion.span
                key={i}
                className="scene-star"
                style={{ left: `${10 + i * 18}%`, top: `${10 + (i % 3) * 12}%` }}
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
                transition={{
                  duration: 2 + i * 0.4,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                {s}
              </motion.span>
            ))}
          </>
        ) : (
          <>
            {["☁️", "☁️", "☁️"].map((c, i) => (
              <motion.span
                key={i}
                className="scene-cloud"
                style={{ top: `${5 + i * 8}%` }}
                animate={{ x: ["-5%", "105%"] }}
                transition={{
                  duration: 18 + i * 6,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 5,
                }}
              >
                {c}
              </motion.span>
            ))}
          </>
        )}
      </div>

      {/* Ground */}
      <div className="scene-ground" aria-hidden="true">
        <div className="scene-ground-details">
          {slot !== "night" && (
            <>
              <span className="scene-tree">🌳</span>
              <span className="scene-tree" style={{ fontSize: "2rem" }}>🌲</span>
              <span className="scene-tree">🌳</span>
            </>
          )}
        </div>
      </div>

      {/* Main character */}
      <motion.div
        className="scene-character"
        key={`${charId}-${slot}`}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        aria-hidden="true"
      >
        <motion.span
          className="scene-char-emoji"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {scene.emoji}
        </motion.span>
      </motion.div>

      {/* Caption */}
      <motion.div
        className="scene-caption"
        key={scene.caption}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        aria-live="polite"
      >
        {scene.caption}
      </motion.div>
    </div>
  );
}
