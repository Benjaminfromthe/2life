// ============================================================
// 2Life — Random Events
// ============================================================
import type { RandomEvent } from "../types/game";

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: "found_money",
    icon: "💰",
    title: "Found Money!",
    description:
      "You found a ₡50 bill on the sidewalk. Today is your lucky day!",
    type: "positive",
    statDelta: { happiness: 15 },
    creditDelta: 50,
    chance: 0.08,
  },
  {
    id: "sick_day",
    icon: "🤒",
    title: "Sick Day",
    description:
      "You woke up feeling terrible. You had to rest and couldn't do anything productive today.",
    type: "negative",
    statDelta: { health: -15, energy: -20, happiness: -10 },
    creditDelta: 0,
    chance: 0.06,
  },
  {
    id: "surprise_test",
    icon: "📝",
    title: "Surprise Test!",
    description:
      "Your teacher announced a pop quiz out of nowhere! Better hope you've been studying...",
    type: "negative",
    statDelta: { happiness: -10, energy: -5 },
    creditDelta: 0,
    chance: 0.1,
  },
  {
    id: "friend_invite",
    icon: "🎈",
    title: "Friend Invite!",
    description:
      "Your friend texted: 'Come hang out, we're all going to the park!' Sounds fun!",
    type: "positive",
    statDelta: { happiness: 20, energy: -10 },
    creditDelta: -10,
    chance: 0.12,
  },
  {
    id: "compliment",
    icon: "⭐",
    title: "Teacher's Praise",
    description:
      "Your teacher praised your work in front of the whole class. Embarrassing but nice!",
    type: "positive",
    statDelta: { happiness: 15, grades: 3 },
    creditDelta: 0,
    chance: 0.07,
  },
  {
    id: "cafeteria_mess",
    icon: "🍲",
    title: "Cafeteria Chaos",
    description:
      "Someone knocked their tray on you. Now your shirt is ruined and everyone is laughing.",
    type: "negative",
    statDelta: { happiness: -15, health: -2 },
    creditDelta: 0,
    chance: 0.06,
  },
  {
    id: "bonus_homework",
    icon: "📋",
    title: "Extra Credit!",
    description:
      "You found bonus homework that could really boost your grades if you complete it.",
    type: "positive",
    statDelta: { grades: 8, energy: -5, happiness: -5 },
    creditDelta: 0,
    chance: 0.09,
  },
  {
    id: "lost_wallet",
    icon: "😱",
    title: "Lost Your Wallet!",
    description:
      "You can't find your wallet anywhere. Someone may have taken it.",
    type: "negative",
    statDelta: { happiness: -20 },
    creditDelta: -30,
    chance: 0.05,
  },
];

export const rollRandomEvent = (): RandomEvent | null => {
  for (const event of RANDOM_EVENTS) {
    if (Math.random() < event.chance) {
      return event;
    }
  }
  return null;
};
