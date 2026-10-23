// ============================================================
// 2Life — Consequence Modal
// ============================================================
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";

const TYPE_STYLES = {
  positive: { bg: "modal-positive", border: "border-green-500/40", glow: "shadow-green-500/20" },
  negative: { bg: "modal-negative", border: "border-red-500/40", glow: "shadow-red-500/20" },
  neutral: { bg: "modal-neutral", border: "border-blue-500/40", glow: "shadow-blue-500/20" },
  warning: { bg: "modal-warning", border: "border-amber-500/40", glow: "shadow-amber-500/20" },
};

export default function ConsequenceModal() {
  const { pendingConsequence, dismissConsequence, pendingQuiz } = useGameStore();

  return (
    <AnimatePresence>
      {pendingConsequence && (
        <>
          {/* Backdrop */}
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissConsequence}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consequence-title"
            aria-describedby="consequence-body"
            className={`consequence-modal ${TYPE_STYLES[pendingConsequence.type].bg}`}
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            {/* Emoji */}
            <motion.div
              className="consequence-emoji"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
              aria-hidden="true"
            >
              {pendingConsequence.icon}
            </motion.div>

            {/* Text */}
            <h2 id="consequence-title" className="consequence-title">
              {pendingConsequence.title}
            </h2>
            <p id="consequence-body" className="consequence-body">
              {pendingConsequence.body}
            </p>

            {/* Action */}
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

            {/* Tap hint */}
            <p className="consequence-hint">Tap anywhere to continue</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
