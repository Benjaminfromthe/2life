// ============================================================
// 2Life — Quiz Questions Pool
// ============================================================
import type { QuizQuestion } from "../types/game";

export const QUIZ_POOL: QuizQuestion[] = [
  // --- Math ---
  {
    id: "math_1",
    subject: "📐 Math",
    question: "What is 7 × 8?",
    options: ["54", "56", "63", "48"],
    correctIndex: 1,
    difficulty: "easy",
  },
  {
    id: "math_2",
    subject: "📐 Math",
    question: "Solve: 3x + 6 = 21. What is x?",
    options: ["5", "9", "7", "3"],
    correctIndex: 0,
    difficulty: "normal",
  },
  {
    id: "math_3",
    subject: "📐 Math",
    question: "What is the area of a circle with radius 5? (Use π ≈ 3.14)",
    options: ["78.5", "31.4", "15.7", "62.8"],
    correctIndex: 0,
    difficulty: "normal",
  },
  {
    id: "math_4",
    subject: "📐 Math",
    question: "What is 15% of 200?",
    options: ["25", "30", "35", "20"],
    correctIndex: 1,
    difficulty: "easy",
  },
  {
    id: "math_5",
    subject: "📐 Math",
    question: "What is the square root of 144?",
    options: ["11", "14", "12", "13"],
    correctIndex: 2,
    difficulty: "easy",
  },

  // --- Science ---
  {
    id: "sci_1",
    subject: "🔬 Science",
    question: "What is the chemical symbol for water?",
    options: ["HO₂", "H₂O", "O₂H", "OH"],
    correctIndex: 1,
    difficulty: "easy",
  },
  {
    id: "sci_2",
    subject: "🔬 Science",
    question: "Which planet is closest to the Sun?",
    options: ["Venus", "Earth", "Mars", "Mercury"],
    correctIndex: 3,
    difficulty: "easy",
  },
  {
    id: "sci_3",
    subject: "🔬 Science",
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"],
    correctIndex: 2,
    difficulty: "easy",
  },
  {
    id: "sci_4",
    subject: "🔬 Science",
    question: "How many chromosomes do humans normally have?",
    options: ["23", "44", "46", "48"],
    correctIndex: 2,
    difficulty: "normal",
  },
  {
    id: "sci_5",
    subject: "🔬 Science",
    question: "What type of bond holds water molecules together?",
    options: ["Ionic", "Covalent", "Hydrogen", "Metallic"],
    correctIndex: 2,
    difficulty: "hard",
  },

  // --- History ---
  {
    id: "hist_1",
    subject: "📜 History",
    question: "In which year did World War II end?",
    options: ["1943", "1944", "1946", "1945"],
    correctIndex: 3,
    difficulty: "easy",
  },
  {
    id: "hist_2",
    subject: "📜 History",
    question: "Who invented the telephone?",
    options: ["Edison", "Tesla", "Bell", "Marconi"],
    correctIndex: 2,
    difficulty: "easy",
  },
  {
    id: "hist_3",
    subject: "📜 History",
    question: "Which ancient wonder of the world still stands today?",
    options: [
      "Colossus of Rhodes",
      "Great Pyramid of Giza",
      "Lighthouse of Alexandria",
      "Hanging Gardens of Babylon",
    ],
    correctIndex: 1,
    difficulty: "normal",
  },

  // --- English ---
  {
    id: "eng_1",
    subject: "📝 English",
    question: "Which word is a synonym for 'happy'?",
    options: ["Gloomy", "Elated", "Weary", "Anxious"],
    correctIndex: 1,
    difficulty: "easy",
  },
  {
    id: "eng_2",
    subject: "📝 English",
    question: "What is the past tense of 'run'?",
    options: ["Runned", "Running", "Ran", "Runed"],
    correctIndex: 2,
    difficulty: "easy",
  },
  {
    id: "eng_3",
    subject: "📝 English",
    question:
      "Which literary device is used in 'The wind whispered through the trees'?",
    options: ["Simile", "Metaphor", "Alliteration", "Personification"],
    correctIndex: 3,
    difficulty: "normal",
  },
];

export const getRandomQuestions = (
  count: number = 3,
  studyBonus: boolean = false
): QuizQuestion[] => {
  // With study bonus, prefer easy questions
  const pool = studyBonus
    ? QUIZ_POOL.filter((q) => q.difficulty !== "hard")
    : QUIZ_POOL;

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
