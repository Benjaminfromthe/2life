// ============================================================
// 2Life — App Root
// ============================================================
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "./store/gameStore";
import WelcomeScreen from "./components/screens/WelcomeScreen";
import CharacterSelectScreen from "./components/screens/CharacterSelectScreen";
import GameScreen from "./components/screens/GameScreen";
import QuizScreen from "./components/screens/QuizScreen";
import GameOverScreen from "./components/screens/GameOverScreen";

export default function App() {
  const { screen } = useGameStore();

  return (
    <div className="app-root" id="app-root">
      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <motion.div
            key="welcome"
            className="screen-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WelcomeScreen />
          </motion.div>
        )}

        {screen === "character-select" && (
          <motion.div
            key="character-select"
            className="screen-wrapper"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <CharacterSelectScreen />
          </motion.div>
        )}

        {screen === "game" && (
          <motion.div
            key="game"
            className="screen-wrapper"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
          >
            <GameScreen />
          </motion.div>
        )}

        {screen === "quiz" && (
          <motion.div
            key="quiz"
            className="screen-wrapper"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4 }}
          >
            <QuizScreen />
          </motion.div>
        )}

        {screen === "game-over" && (
          <motion.div
            key="game-over"
            className="screen-wrapper"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GameOverScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
