// ============================================================
// 2Life — Welcome Screen
// "Start Your Life" now navigates to life-blueprint wizard.
// ============================================================
import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";

export default function WelcomeScreen() {
  const { setPlayerName, playerName } = useGameStore();
  const [localName, setLocalName] = useState(playerName || "");

  const handleContinue = () => {
    setPlayerName(localName.trim() || "Player");
    useGameStore.setState({ screen: "life-blueprint" });
  };

  return (
    <div className="welcome-screen">
      {/* Animated starfield */}
      <div className="starfield" aria-hidden="true">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left:              `${Math.random() * 100}%`,
              top:               `${Math.random() * 100}%`,
              animationDelay:    `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              width:             `${1 + Math.random() * 3}px`,
              height:            `${1 + Math.random() * 3}px`,
            }}
          />
        ))}
      </div>

      <div className="welcome-content">
        {/* Logo */}
        <motion.div
          className="logo-container"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="logo-planet" aria-hidden="true">🌍</div>
          <h1 className="logo-title">2Life</h1>
          <p className="logo-tagline">Live it. Choose it. Own it.</p>
        </motion.div>

        {/* Input card */}
        <motion.div
          className="welcome-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <p className="welcome-card-label">What's your name?</p>
          <input
            id="player-name-input"
            className="name-input"
            type="text"
            placeholder="Enter your name…"
            maxLength={20}
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            aria-label="Enter your name"
          />
          <button
            id="welcome-start-btn"
            className="btn btn-primary btn-large"
            onClick={handleContinue}
          >
            Start Your Life ✨
          </button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="feature-pills"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            "🏢 5 Careers",
            "📅 Yearly Life Sim",
            "🎲 Life Events",
            "👨‍👩‍👦 Family Goals",
          ].map((f) => (
            <span key={f} className="feature-pill">
              {f}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
