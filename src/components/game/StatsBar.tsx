// ============================================================
// 2Life — Stats Bar Component
// ============================================================
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { CHARACTERS } from "../../data/characters";

interface StatItemProps {
  icon: string;
  label: string;
  value: number;
  colorClass: string;
  id: string;
}

function StatItem({ icon, label, value, colorClass, id }: StatItemProps) {
  const isLow = value < 25;
  const isCritical = value < 15;

  return (
    <div className="stat-item" title={`${label}: ${value}/100`}>
      <div className="stat-item-header">
        <span className="stat-icon" aria-hidden="true">{icon}</span>
        <span className="stat-label">{label}</span>
        <span
          className={`stat-value ${isCritical ? "stat-value--critical" : isLow ? "stat-value--low" : ""}`}
          aria-label={`${label} ${value} out of 100`}
        >
          {Math.round(value)}
        </span>
      </div>
      <div className="stat-bar-bg" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} id={id}>
        <motion.div
          className={`stat-bar-fill ${colorClass} ${isCritical ? "stat-bar--critical" : ""}`}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function StatsBar() {
  const { stats, credits, character } = useGameStore();
  const charDef = CHARACTERS.find((c) => c.id === character);
  const roleStat = charDef?.roleStat ?? "grades";

  const roleStatConfig = {
    grades: { icon: "📚", label: "Grades", color: "stat-fill-violet" },
    fitness: { icon: "💪", label: "Fitness", color: "stat-fill-emerald" },
    performance: { icon: "📈", label: "Performance", color: "stat-fill-amber" },
  }[roleStat];

  return (
    <div className="stats-bar" role="region" aria-label="Character stats">
      <div className="stats-credits">
        <span className="credits-icon" aria-hidden="true">₡</span>
        <span className="credits-value" aria-label={`${credits} credits`}>
          {credits}
        </span>
      </div>

      <div className="stats-grid">
        <StatItem
          id="stat-energy"
          icon="⚡"
          label="Energy"
          value={stats.energy}
          colorClass="stat-fill-yellow"
        />
        <StatItem
          id="stat-health"
          icon="❤️"
          label="Health"
          value={stats.health}
          colorClass="stat-fill-red"
        />
        <StatItem
          id="stat-happiness"
          icon="😊"
          label="Happy"
          value={stats.happiness}
          colorClass="stat-fill-pink"
        />
        <StatItem
          id="stat-role"
          icon={roleStatConfig.icon}
          label={roleStatConfig.label}
          value={stats[roleStat]}
          colorClass={roleStatConfig.color}
        />
      </div>
    </div>
  );
}
