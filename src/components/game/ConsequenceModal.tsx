// ============================================================
// 2Life — Consequence Modal
// Requirement #9: when pendingConsequence.choices is present,
// renders 2-3 choice buttons instead of the "Got it" dismiss.
// ============================================================
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import type { EventChoice } from "../../types/game";

const TYPE_STYLES = {
  positive: "modal-positive",
  negative: "modal-negative",
  neutral:  "modal-neutral",
  warning:  "modal-warning",
};

function ChoiceButton({
  choice,
  onSelect,
}: {
  choice:   EventChoice;
  onSelect: (c: EventChoice) => void;
}) {
  return (
    <motion.button
      id={`choice-${choice.id}`}
      className="choice-btn"
      onClick={() => onSelect(choice)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      aria-label={`${choice.label}: ${choice.description}`}
    >
      <div className="choice-btn-top">
        {choice.icon && (
          <span className="choice-btn-icon" aria-hidden="true">
            {choice.icon}
          </span>
        )}
        <span className="choice-btn-label">{choice.label}</span>
        {/* Show credit change as a hint */}
        {(choice.creditDelta !== 0 || choice.creditRange) && (
          <span
            className={`choice-credit-hint ${
              (choice.creditRange ? choice.creditRange[1] : choice.creditDelta) > 0
                ? "choice-credit-hint--pos"
                : "choice-credit-hint--neg"
            }`}
          >
            {choice.creditRange
              ? `₡${choice.creditRange[0]}…${choice.creditRange[1]}`
              : `${choice.creditDelta > 0 ? "+" : ""}₡${choice.creditDelta}`}
          </span>
        )}
      </div>
      <p className="choice-btn-desc">{choice.description}</p>
    </motion.button>
  );
}

export default function ConsequenceModal() {
  const {
    pendingConsequence,
    dismissConsequence,
    chooseEvent,
    pendingQuiz,
  } = useGameStore();

  const hasChoices = (pendingConsequence?.choices?.length ?? 0) > 0;

  return (
    <AnimatePresence>
      {pendingConsequence && (
        <>
          {/* Backdrop — only clickable when there are no mandatory choices */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hasChoices ? undefined : dismissConsequence}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consequence-title"
            aria-describedby="consequence-body"
            className={`consequence-modal ${TYPE_STYLES[pendingConsequence.type]} ${hasChoices ? "consequence-modal--choices" : ""}`}
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            {/* Icon */}
            <motion.div
              className="consequence-emoji"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
              aria-hidden="true"
            >
              {pendingConsequence.icon}
            </motion.div>

            {/* Title + body */}
            <h2 id="consequence-title" className="consequence-title">
              {pendingConsequence.title}
            </h2>
            <p id="consequence-body" className="consequence-body">
              {pendingConsequence.body}
            </p>

            {/* Choices (Requirement #9) */}
            {hasChoices ? (
              <div className="choice-grid" role="group" aria-label="Your options">
                {pendingConsequence.choices!.map((choice) => (
                  <ChoiceButton
                    key={choice.id}
                    choice={choice}
                    onSelect={chooseEvent}
                  />
                ))}
              </div>
            ) : (
              /* Standard dismiss */
              <>
                <motion.button
                  id="consequence-dismiss-btn"
                  className="btn btn-primary consequence-btn"
                  onClick={dismissConsequence}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  autoFocus
                >
                  {pendingQuiz ? "Take the Quiz →" : "Got it! ✓"}
                </motion.button>
                <p className="consequence-hint">Tap anywhere to continue</p>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
