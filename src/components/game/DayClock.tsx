// ============================================================
// 2Life — Day Clock  (Yearly Loop Edition)
// Shows: Year counter · Age · Q1 / Q2 / Q3 / Q4 tracker
// ============================================================
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import type { TimeSlot } from "../../types/game";

const QUARTER_INFO: Record<TimeSlot, { label: string; short: string; color: string }> = {
  morning:   { label: "Q1 — Spring", short: "Q1", color: "slot-morning"  },
  afternoon: { label: "Q2 — Summer", short: "Q2", color: "slot-afternoon" },
  evening:   { label: "Q3 — Autumn", short: "Q3", color: "slot-evening"  },
  night:     { label: "Q4 — Winter", short: "Q4", color: "slot-night"    },
};

const SLOTS: TimeSlot[] = ["morning", "afternoon", "evening", "night"];

export default function DayClock() {
  const { day, slot, age } = useGameStore();
  const currentInfo = QUARTER_INFO[slot];
  const currentIdx  = SLOTS.indexOf(slot);

  return (
    <div className="day-clock" role="region" aria-label="Current life period">

      {/* Year + Age counter */}
      <div className="day-counter">
        <span className="day-label">Age</span>
        <motion.span
          key={age}
          className="day-number"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label={`Age ${age}, Year ${day}`}
        >
          {age}
        </motion.span>
        <span className="day-total">yr&nbsp;{day}</span>
      </div>

      {/* Quarter pips */}
      <div className="slot-track" role="list" aria-label="Quarters of the year">
        {SLOTS.map((s, i) => {
          const info     = QUARTER_INFO[s];
          const isActive = i === currentIdx;
          const isPast   = i < currentIdx;

          return (
            <div
              key={s}
              role="listitem"
              className={`slot-pip ${isActive ? "slot-pip--active" : ""} ${isPast ? "slot-pip--past" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="slot-pip-icon" aria-hidden="true">
                {info.short}
              </span>
              <span className="slot-pip-label">{info.label}</span>
            </div>
          );
        })}
      </div>

      {/* Current quarter badge */}
      <motion.div
        key={slot}
        className={`slot-badge ${currentInfo.color}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        aria-live="polite"
      >
        {currentInfo.label}
      </motion.div>
    </div>
  );
}
