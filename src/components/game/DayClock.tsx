// ============================================================
// 2Life — Day Clock Component
// ============================================================
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import type { TimeSlot } from "../../types/game";

const SLOT_INFO: Record<TimeSlot, { icon: string; label: string; color: string }> = {
  morning: { icon: "🌅", label: "Morning", color: "slot-morning" },
  afternoon: { icon: "☀️", label: "Afternoon", color: "slot-afternoon" },
  evening: { icon: "🌆", label: "Evening", color: "slot-evening" },
  night: { icon: "🌙", label: "Night", color: "slot-night" },
};

const SLOTS: TimeSlot[] = ["morning", "afternoon", "evening", "night"];

export default function DayClock() {
  const { day, slot } = useGameStore();
  const currentInfo = SLOT_INFO[slot];
  const currentIdx = SLOTS.indexOf(slot);

  return (
    <div className="day-clock" role="region" aria-label="Current time">
      {/* Day counter */}
      <div className="day-counter">
        <span className="day-label">Day</span>
        <motion.span
          key={day}
          className="day-number"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label={`Day ${day} of 30`}
        >
          {day}
        </motion.span>
        <span className="day-total">/30</span>
      </div>

      {/* Time slot indicators */}
      <div className="slot-track" role="list" aria-label="Time slots">
        {SLOTS.map((s, i) => {
          const info = SLOT_INFO[s];
          const isActive = i === currentIdx;
          const isPast = i < currentIdx;

          return (
            <div
              key={s}
              role="listitem"
              className={`slot-pip ${isActive ? "slot-pip--active" : ""} ${isPast ? "slot-pip--past" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="slot-pip-icon" aria-hidden="true">
                {info.icon}
              </span>
              <span className="slot-pip-label">{info.label}</span>
            </div>
          );
        })}
      </div>

      {/* Current slot badge */}
      <motion.div
        key={slot}
        className={`slot-badge ${currentInfo.color}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        aria-live="polite"
      >
        {currentInfo.icon} {currentInfo.label}
      </motion.div>
    </div>
  );
}
