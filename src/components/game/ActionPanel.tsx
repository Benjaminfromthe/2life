// ============================================================
// 2Life — Action Panel
// ============================================================
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { getActionsForSlotAndCharacter } from "../../data/actions";
import type { Action } from "../../types/game";

function ActionButton({ action, onClick, disabled }: {
  action: Action;
  onClick: () => void;
  disabled: boolean;
}) {
  const hasCredit = !action.requiresCredits; // already filtered, just for styling
  const energyCost = action.statDelta.energy ?? 0;
  const creditDelta = action.creditDelta;

  return (
    <motion.button
      id={`action-${action.id}`}
      className={`action-btn ${disabled ? "action-btn--disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.04, y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      aria-label={`${action.label}. ${action.description}`}
      title={action.description}
    >
      <span className="action-btn-icon" aria-hidden="true">{action.icon}</span>
      <span className="action-btn-label">{action.label}</span>
      <div className="action-btn-deltas" aria-hidden="true">
        {energyCost < 0 && (
          <span className="delta delta--negative">⚡{energyCost}</span>
        )}
        {creditDelta !== 0 && (
          <span className={`delta ${creditDelta > 0 ? "delta--positive" : "delta--negative"}`}>
            ₡{creditDelta > 0 ? "+" : ""}{creditDelta}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export default function ActionPanel() {
  const { slot, character, credits, performAction, stats } = useGameStore();

  const actions = getActionsForSlotAndCharacter(
    slot,
    character ?? "student",
    credits
  );

  const isExhausted = stats.energy <= 5;

  if (isExhausted) {
    return (
      <div className="action-panel" role="region" aria-label="Actions">
        <div className="action-panel-header">
          <h3 className="action-panel-title">What will you do?</h3>
        </div>
        <div className="exhausted-notice">
          <span className="exhausted-icon">😵</span>
          <p>You're completely exhausted! You need to rest.</p>
          <motion.button
            id="action-force-rest"
            className="btn btn-primary"
            onClick={() => {
              const restAction = actions.find((a) => a.id === "rest") ?? {
                id: "rest",
                label: "Rest",
                icon: "😴",
                description: "You had to rest — you were completely drained.",
                availableSlots: ["morning", "afternoon", "evening", "night"] as any,
                availableFor: ["student", "athlete", "worker"] as any,
                statDelta: { energy: 25, health: 5, happiness: 5 },
                creditDelta: 0,
              };
              performAction(restAction);
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            😴 Rest Now
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="action-panel" role="region" aria-label="Actions">
      <div className="action-panel-header">
        <h3 className="action-panel-title">What will you do?</h3>
        <span className="action-panel-hint">Choose one action</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={slot}
          className="action-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          role="list"
        >
          {actions.map((action) => (
            <div key={action.id} role="listitem">
              <ActionButton
                action={action}
                disabled={false}
                onClick={() => performAction(action)}
              />
            </div>
          ))}

          {actions.length === 0 && (
            <div className="no-actions">
              <p>No actions available right now. Try advancing to the next time slot.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
