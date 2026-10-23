// ============================================================
// 2Life — Quiz Screen
// ============================================================
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { getRandomQuestions } from "../../data/quizzes";
import type { QuizQuestion } from "../../types/game";

function QuestionCard({
  question,
  qIndex,
  total,
  onAnswer,
}: {
  question: QuizQuestion;
  qIndex: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    setTimeout(() => onAnswer(idx === question.correctIndex), 900);
  };

  return (
    <motion.div
      className="quiz-card"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
    >
      <div className="quiz-progress">
        <span className="quiz-progress-text">
          Question {qIndex + 1} of {total}
        </span>
        <div className="quiz-progress-bar-bg">
          <div
            className="quiz-progress-bar-fill"
            style={{ width: `${((qIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="quiz-subject">{question.subject}</div>
      <h3 className="quiz-question">{question.question}</h3>

      <div className="quiz-options" role="list">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correctIndex;
          const showResult = revealed;

          let stateClass = "";
          if (showResult) {
            if (isCorrect) stateClass = "quiz-opt--correct";
            else if (isSelected && !isCorrect) stateClass = "quiz-opt--wrong";
          }

          return (
            <motion.button
              key={i}
              id={`quiz-opt-${i}`}
              role="listitem"
              className={`quiz-option ${isSelected ? "quiz-opt--selected" : ""} ${stateClass}`}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              whileHover={!revealed ? { scale: 1.02 } : undefined}
              whileTap={!revealed ? { scale: 0.98 } : undefined}
              aria-pressed={isSelected}
            >
              <span className="quiz-opt-letter" aria-hidden="true">
                {["A", "B", "C", "D"][i]}
              </span>
              <span className="quiz-opt-text">{opt}</span>
              {showResult && isCorrect && (
                <span className="quiz-opt-badge" aria-hidden="true">✓</span>
              )}
              {showResult && isSelected && !isCorrect && (
                <span className="quiz-opt-badge quiz-opt-badge--wrong" aria-hidden="true">✗</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function QuizScreen() {
  const { studyBonus, submitQuiz } = useGameStore();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correct, setCorrect] = useState(0);

  useEffect(() => {
    setQuestions(getRandomQuestions(3, studyBonus));
  }, [studyBonus]);

  const handleAnswer = (isCorrect: boolean) => {
    const newCorrect = correct + (isCorrect ? 1 : 0);
    setCorrect(newCorrect);

    if (currentIdx + 1 >= questions.length) {
      // Quiz done
      const score = Math.round((newCorrect / questions.length) * 100);
      const passed = score >= 50;
      submitQuiz({ score, passed });
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="quiz-screen">
        <div className="quiz-loading">Loading quiz…</div>
      </div>
    );
  }

  return (
    <div className="quiz-screen" role="main" aria-label="Quiz">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-header-icon" aria-hidden="true">📝</div>
        <h2 className="quiz-header-title">Class Quiz</h2>
        {studyBonus && (
          <div className="quiz-study-bonus" aria-label="Study bonus active">
            ✨ Study Bonus Active!
          </div>
        )}
      </div>

      {/* Question */}
      <div className="quiz-content">
        <AnimatePresence mode="wait">
          {questions[currentIdx] && (
            <QuestionCard
              key={questions[currentIdx].id}
              question={questions[currentIdx]}
              qIndex={currentIdx}
              total={questions.length}
              onAnswer={handleAnswer}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Score preview */}
      <div className="quiz-score-preview" aria-live="polite">
        {correct > 0 && (
          <span>✅ {correct} correct so far</span>
        )}
      </div>
    </div>
  );
}
