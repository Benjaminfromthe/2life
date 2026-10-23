// ============================================================
// 2Life — Random Events
// Requirement #9: events carry 2-3 EventChoice objects.
//   • Auto-events (no choices): effects applied immediately,
//     modal informs the player.
//   • Choice events: modal shows buttons; player must pick one;
//     store applies the chosen effects.
// logEntry fields are plain-English sentences designed to be
// replaced by AI-generated text in a future iteration.
// ============================================================
import type { RandomEvent, CharacterId } from "../types/game";

export const RANDOM_EVENTS: RandomEvent[] = [

  // ── AUTO EVENTS (no choices) ─────────────────────────────

  {
    id: "found_money",
    icon: "💰",
    title: "Found Money!",
    description: "You found a ₡50 bill on the sidewalk. Today is your lucky day!",
    type: "positive",
    statDelta: { happiness: 15 },
    creditDelta: 50,
    chance: 0.08,
  },
  {
    id: "sick_day",
    icon: "🤒",
    title: "Sick Day",
    description: "You woke up feeling awful. Your body demanded rest — couldn't do much today.",
    type: "negative",
    statDelta: { health: -15, energy: -20, happiness: -10 },
    creditDelta: 0,
    chance: 0.06,
  },
  {
    id: "surprise_test",
    icon: "📝",
    title: "Surprise Test!",
    description: "Your teacher sprung a pop quiz. Hope you studied…",
    type: "negative",
    statDelta: { happiness: -10, energy: -5 },
    creditDelta: 0,
    chance: 0.10,
    availableFor: ["student"],
  },
  {
    id: "compliment",
    icon: "⭐",
    title: "Teacher's Praise",
    description: "Your teacher praised your work in front of the whole class. Embarrassing but nice!",
    type: "positive",
    statDelta: { happiness: 15, grades: 3 },
    creditDelta: 0,
    chance: 0.07,
    availableFor: ["student"],
  },
  {
    id: "cafeteria_mess",
    icon: "🍲",
    title: "Cafeteria Chaos",
    description: "Someone knocked their tray all over you. Your shirt is ruined and everyone is laughing.",
    type: "negative",
    statDelta: { happiness: -15, health: -2 },
    creditDelta: 0,
    chance: 0.06,
    availableFor: ["student"],
  },
  {
    id: "bonus_homework",
    icon: "📋",
    title: "Extra Credit!",
    description: "You found bonus homework that could boost your grades.",
    type: "positive",
    statDelta: { grades: 8, energy: -5, happiness: -5 },
    creditDelta: 0,
    chance: 0.09,
    availableFor: ["student"],
  },
  {
    id: "lost_wallet",
    icon: "😱",
    title: "Lost Your Wallet!",
    description: "You can't find your wallet anywhere. Someone may have taken it.",
    type: "negative",
    statDelta: { happiness: -20 },
    creditDelta: -30,
    chance: 0.05,
  },
  {
    id: "injury",
    icon: "🤕",
    title: "Minor Injury",
    description: "You got hurt during training. You'll need to take it easy for a while.",
    type: "negative",
    statDelta: { health: -15, fitness: -8, happiness: -10 },
    creditDelta: 0,
    chance: 0.06,
    availableFor: ["athlete"],
  },
  {
    id: "fan_recognition",
    icon: "📸",
    title: "Fan Recognition!",
    description: "A fan recognised you and asked for an autograph. You're getting noticed!",
    type: "positive",
    statDelta: { happiness: 20, fitness: 3 },
    creditDelta: 0,
    chance: 0.07,
    availableFor: ["athlete"],
  },
  {
    id: "good_review",
    icon: "📊",
    title: "Excellent Review",
    description: "Your manager gave you a glowing performance review. Hard work pays off!",
    type: "positive",
    statDelta: { happiness: 15, performance: 8 },
    creditDelta: 50,
    chance: 0.07,
    availableFor: ["worker"],
  },
  {
    id: "office_drama",
    icon: "😤",
    title: "Office Drama",
    description: "A workplace conflict dragged you in. Not a great way to start the day.",
    type: "negative",
    statDelta: { happiness: -15, performance: -5, energy: -10 },
    creditDelta: 0,
    chance: 0.06,
    availableFor: ["worker"],
  },

  // ── CHOICE EVENTS — Requirement #9 ───────────────────────

  {
    id: "job_offer_abroad",
    icon: "✈️",
    title: "Job Offer Abroad!",
    description:
      "A company in another city wants to hire you at a much higher salary. It's a big life decision.",
    type: "positive",
    statDelta: {},
    creditDelta: 0,
    chance: 0.06,
    availableFor: ["worker"],
    choices: [
      {
        id: "accept",
        icon: "✈️",
        label: "Accept & Move",
        description: "Big pay raise and career boost — but leaving comfort and friends behind.",
        statDelta: { performance: 15, happiness: -10 },
        creditDelta: 300,
        careerLevelDelta: 1,
        logEntry:
          "Accepted a job offer abroad and packed up for a new adventure.",
      },
      {
        id: "negotiate",
        icon: "🤝",
        label: "Negotiate Remote",
        description: "Counter-offer: keep the career growth, skip the relocation.",
        statDelta: { performance: 8, happiness: 5 },
        creditDelta: 150,
        logEntry:
          "Negotiated a remote arrangement with the company abroad.",
      },
      {
        id: "decline",
        icon: "🏠",
        label: "Stay Home",
        description: "Turn it down. Stability and comfort over the unknown.",
        statDelta: { happiness: 8 },
        creditDelta: 0,
        logEntry:
          "Turned down a job offer abroad to stay close to home.",
      },
    ],
  },

  {
    id: "scholarship_offer",
    icon: "🏅",
    title: "Scholarship Offer!",
    description:
      "You've been offered a partial scholarship. It could change your academic future.",
    type: "positive",
    statDelta: {},
    creditDelta: 0,
    chance: 0.06,
    availableFor: ["student"],
    choices: [
      {
        id: "accept",
        icon: "🎓",
        label: "Accept",
        description: "Commit to it. Grades boost and a healthy credit injection.",
        statDelta: { grades: 10, happiness: 10 },
        creditDelta: 200,
        logEntry: "Accepted a scholarship that boosted academic standing.",
      },
      {
        id: "decline",
        icon: "🙅",
        label: "Decline",
        description: "Pass on it — the extra pressure isn't worth it right now.",
        statDelta: { happiness: 3 },
        creditDelta: 0,
        logEntry: "Passed on a scholarship opportunity.",
      },
    ],
  },

  {
    id: "health_scare",
    icon: "💊",
    title: "Health Scare",
    description:
      "You've been feeling off lately. Something might be wrong. Do you get it checked out?",
    type: "negative",
    statDelta: {},
    creditDelta: 0,
    chance: 0.05,
    choices: [
      {
        id: "see_doctor",
        icon: "👨‍⚕️",
        label: "See a Doctor",
        description: "Spend the money, get peace of mind, and come out healthier.",
        statDelta: { health: 20, happiness: 5, energy: 5 },
        creditDelta: -100,
        logEntry:
          "Visited a doctor after a health scare and came out feeling much better.",
      },
      {
        id: "ignore",
        icon: "🙈",
        label: "Ignore It",
        description: "Probably nothing. Push through — you're fine.",
        statDelta: { health: -10, energy: -5 },
        creditDelta: 0,
        logEntry: "Ignored a health warning and hoped for the best.",
      },
    ],
  },

  {
    id: "met_someone",
    icon: "💘",
    title: "You Met Someone!",
    description:
      "You crossed paths with someone interesting. There's a definite spark. What do you do?",
    type: "positive",
    statDelta: {},
    creditDelta: 0,
    chance: 0.07,
    choices: [
      {
        id: "pursue",
        icon: "💑",
        label: "Ask Them Out",
        description: "Go for it! Start something new and exciting.",
        statDelta: { happiness: 20 },
        creditDelta: -30,
        setsPartner: "Alex",
        logEntry: "Asked someone out and started a wonderful new relationship.",
      },
      {
        id: "befriend",
        icon: "🤗",
        label: "Keep It Friendly",
        description: "You're not ready for anything serious. Good company is enough.",
        statDelta: { happiness: 8 },
        creditDelta: 0,
        logEntry: "Made a new friend and kept things platonic.",
      },
      {
        id: "ignore",
        icon: "🚶",
        label: "Do Nothing",
        description: "The timing isn't right. You let the moment pass.",
        statDelta: {},
        creditDelta: 0,
        logEntry: "Passed on a chance at romance — the timing wasn't right.",
      },
    ],
  },

  {
    id: "investment_opportunity",
    icon: "📈",
    title: "Investment Opportunity",
    description:
      "A friend is pitching a business investment. Could make a lot — or lose it all.",
    type: "neutral",
    statDelta: {},
    creditDelta: 0,
    chance: 0.05,
    choices: [
      {
        id: "invest_big",
        icon: "🚀",
        label: "Invest Big",
        description:
          "Go all in. Fortune favours the bold — but also punishes the reckless.",
        statDelta: { happiness: 5 },
        creditDelta: 0,
        creditRange: [-200, 400], // store picks a random value in this range
        logEntry: "Made a bold investment bet that could go either way.",
      },
      {
        id: "invest_small",
        icon: "💵",
        label: "Invest Small",
        description: "Dip a toe in with a modest amount. Steady, safe gains.",
        statDelta: {},
        creditDelta: 80,
        logEntry: "Made a small, cautious investment.",
      },
      {
        id: "pass",
        icon: "🤚",
        label: "Pass",
        description: "Not interested. Your money stays right where it is.",
        statDelta: {},
        creditDelta: 0,
        logEntry: "Passed on an investment opportunity.",
      },
    ],
  },

  {
    id: "competition_invite",
    icon: "🏆",
    title: "Competition Invite",
    description:
      "You've been invited to enter a big regional competition. Do you sign up?",
    type: "positive",
    statDelta: {},
    creditDelta: 0,
    chance: 0.08,
    availableFor: ["athlete"],
    choices: [
      {
        id: "enter",
        icon: "🏃",
        label: "Enter & Compete",
        description: "Push hard. Great for fitness, reputation, and prize money.",
        statDelta: { fitness: 10, happiness: 15, energy: -20 },
        creditDelta: 100,
        careerLevelDelta: 1,
        logEntry: "Entered a regional competition and gave it everything.",
      },
      {
        id: "train_instead",
        icon: "💪",
        label: "Train Instead",
        description: "Use the time to build up for a future event.",
        statDelta: { fitness: 5, energy: 5 },
        creditDelta: 0,
        logEntry: "Chose to train harder instead of entering the competition.",
      },
    ],
  },
];

/**
 * Roll a random event for the given character.
 * Filters by availableFor, then walks the pool and
 * returns the first event that beats its chance roll.
 */
export const rollRandomEvent = (characterId: CharacterId): RandomEvent | null => {
  const pool = RANDOM_EVENTS.filter(
    (e) => !e.availableFor || e.availableFor.includes(characterId)
  );
  for (const event of pool) {
    if (Math.random() < event.chance) {
      return event;
    }
  }
  return null;
};
