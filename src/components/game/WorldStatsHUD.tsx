// ============================================================
// 2Life — World Stats HUD
// Compact overlay showing world-specific stats + rank + money.
// Appears at the top of the game-main area.
// ============================================================
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { getWorld } from "../../data/worlds/index";

export default function WorldStatsHUD() {
  const { worldId, worldStats, worldMoney, levelIndex } = useGameStore();
  const world = getWorld(worldId);

  const currentRank = [...world.ranks]
    .reverse()
    .find((r) => levelIndex >= r.minLevel) ?? world.ranks[0];

  return (
    <motion.div
      className="world-hud"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="World stats"
    >
      {/* World name + rank */}
      <div className="world-hud-header">
        <span className="world-hud-name">{world.name}</span>
        {currentRank && (
          <span className="world-hud-rank">{currentRank.name}</span>
        )}
        <span className="world-hud-money" aria-label={`Credits: ${worldMoney}`}>
          ₡{worldMoney.toLocaleString()}
        </span>
      </div>

      {/* World stat bars */}
      <div className="world-hud-stats" role="list">
        {world.stats.map((statDef) => {
          const value = worldStats[statDef.id] ?? statDef.startValue;
          return (
            <div
              key={statDef.id}
              className="world-hud-stat"
              role="listitem"
              aria-label={`${statDef.name}: ${Math.round(value)}`}
            >
              <span className="world-hud-stat-icon" aria-hidden="true">
                {statDef.icon}
              </span>
              <div className="world-hud-stat-bar-bg">
                <motion.div
                  className="world-hud-stat-bar-fill"
                  style={{ background: statDef.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="world-hud-stat-val">{Math.round(value)}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
