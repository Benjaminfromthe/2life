// ============================================================
// 2Life — Career Definitions
// Five playable careers, each with education path, salary
// range, key stats, and the CharacterId used for action
// filtering (bridges old system to new career system).
// ============================================================
import type { Stats, CharacterId, RoleStat } from "../types/game";

export type CareerId =
  | "doctor"
  | "teacher"
  | "athlete"
  | "engineer"
  | "entrepreneur";

/** Maps each career to the CharacterId used internally for action filtering. */
export const CAREER_CHARACTER_MAP: Record<CareerId, CharacterId> = {
  doctor:       "worker",
  teacher:      "student",
  athlete:      "athlete",
  engineer:     "worker",
  entrepreneur: "worker",
};

export interface CareerDef {
  id:             CareerId;
  name:           string;
  emoji:          string;
  tagline:        string;
  description:    string;
  educationPath:  string;           // e.g. "6 yrs med school → residency"
  salaryRange:    string;           // e.g. "₡1,200 – ₡5,000 / yr"
  salaryPerYear:  number;           // base credits per completed year at level 0
  keyStats:       string[];         // human-readable list for the wizard card
  roleStat:       RoleStat;
  startingStats:  Stats;
  startingCredits: number;
  color:          string;           // Tailwind text-colour class
  bgGradient:     string;           // Tailwind gradient classes for card bg
}

export const CAREERS: CareerDef[] = [
  {
    id:             "doctor",
    name:           "Doctor",
    emoji:          "🩺",
    tagline:        "Save lives. Build expertise.",
    description:
      "Years of demanding education followed by a deeply rewarding career in medicine. High stress, high respect, and excellent pay.",
    educationPath:  "6 yrs med school → 3 yrs residency",
    salaryRange:    "₡1,200 – ₡5,000 / yr",
    salaryPerYear:  1200,
    keyStats:       ["Health", "Performance", "Grades"],
    roleStat:       "performance",
    startingStats:  {
      energy: 70, health: 85, happiness: 65,
      grades: 75, fitness: 55, performance: 50,
    },
    startingCredits: 100,
    color:          "text-red-400",
    bgGradient:     "from-red-900/60 to-rose-900/60",
  },
  {
    id:             "teacher",
    name:           "Teacher",
    emoji:          "📚",
    tagline:        "Shape minds. Change futures.",
    description:
      "You live to inspire. Lower pay than most careers, but the fulfilment of watching students grow is priceless.",
    educationPath:  "4 yrs university → teaching degree",
    salaryRange:    "₡600 – ₡2,500 / yr",
    salaryPerYear:  600,
    keyStats:       ["Happiness", "Grades", "Health"],
    roleStat:       "grades",
    startingStats:  {
      energy: 75, health: 80, happiness: 80,
      grades: 70, fitness: 55, performance: 55,
    },
    startingCredits: 200,
    color:          "text-blue-400",
    bgGradient:     "from-blue-900/60 to-indigo-900/60",
  },
  {
    id:             "athlete",
    name:           "Athlete",
    emoji:          "🏃",
    tagline:        "Train hard. Compete harder.",
    description:
      "Your body is your instrument. Train relentlessly, compete at the highest level, and manage your health before time catches up.",
    educationPath:  "Sports academy → professional contracts",
    salaryRange:    "₡400 – ₡4,000 / yr",
    salaryPerYear:  400,
    keyStats:       ["Fitness", "Health", "Energy"],
    roleStat:       "fitness",
    startingStats:  {
      energy: 90, health: 90, happiness: 70,
      grades: 50, fitness: 75, performance: 55,
    },
    startingCredits: 150,
    color:          "text-emerald-400",
    bgGradient:     "from-emerald-900/60 to-teal-900/60",
  },
  {
    id:             "engineer",
    name:           "Engineer",
    emoji:          "⚙️",
    tagline:        "Build systems. Solve problems.",
    description:
      "Methodical, well-paid, and always in demand. Climb the technical ladder, ship products, and solve problems that matter.",
    educationPath:  "4 yrs engineering degree → entry level",
    salaryRange:    "₡900 – ₡4,500 / yr",
    salaryPerYear:  900,
    keyStats:       ["Performance", "Grades", "Energy"],
    roleStat:       "performance",
    startingStats:  {
      energy: 75, health: 80, happiness: 65,
      grades: 70, fitness: 55, performance: 60,
    },
    startingCredits: 300,
    color:          "text-amber-400",
    bgGradient:     "from-amber-900/60 to-orange-900/60",
  },
  {
    id:             "entrepreneur",
    name:           "Entrepreneur",
    emoji:          "🚀",
    tagline:        "Disrupt. Build. Grow.",
    description:
      "High risk, absurd upside. You're building something from nothing — failure is part of the path to success.",
    educationPath:  "Self-taught → hustle → build a business",
    salaryRange:    "₡200 – ₡8,000 / yr",
    salaryPerYear:  200,
    keyStats:       ["Performance", "Happiness", "Health"],
    roleStat:       "performance",
    startingStats:  {
      energy: 80, health: 75, happiness: 70,
      grades: 55, fitness: 60, performance: 65,
    },
    startingCredits: 500,
    color:          "text-purple-400",
    bgGradient:     "from-purple-900/60 to-violet-900/60",
  },
];

export const getCareer = (id: CareerId | null | undefined): CareerDef | undefined =>
  CAREERS.find((c) => c.id === id);
