// ============================================================
// 2Life — Character Definitions
// ============================================================
import type { CharacterDef, Stats } from "../types/game";

const baseStats: Stats = {
  energy: 80,
  health: 90,
  happiness: 70,
  grades: 60,
  fitness: 60,
  performance: 60,
};

export const CHARACTERS: CharacterDef[] = [
  {
    id: "student",
    name: "Student",
    emoji: "🎓",
    tagline: "Books, quizzes & drama",
    description:
      "Hit the classroom, ace quizzes, and survive high school. Your Grades stat is what matters — keep them up or face the consequences.",
    startingStats: { ...baseStats, grades: 60 },
    startingCredits: 200,
    roleStat: "grades",
    color: "text-violet-400",
    bgColor: "from-violet-900/60 to-indigo-900/60",
  },
  {
    id: "athlete",
    name: "Athlete",
    emoji: "🏃",
    tagline: "Train hard, compete harder",
    description:
      "Push your limits on the field. Fitness is your currency — train daily, win matches, and don't burn out.",
    startingStats: { ...baseStats, fitness: 70, energy: 90 },
    startingCredits: 150,
    roleStat: "fitness",
    color: "text-emerald-400",
    bgColor: "from-emerald-900/60 to-teal-900/60",
  },
  {
    id: "worker",
    name: "Worker",
    emoji: "💼",
    tagline: "Hustle, grind, repeat",
    description:
      "Clock in, deliver results, and climb the career ladder. Performance reviews and pay days keep you motivated.",
    startingStats: { ...baseStats, performance: 65, happiness: 60 },
    startingCredits: 300,
    roleStat: "performance",
    color: "text-amber-400",
    bgColor: "from-amber-900/60 to-orange-900/60",
  },
];

export const getCharacter = (id: string) =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
