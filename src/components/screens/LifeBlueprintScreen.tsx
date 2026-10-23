// ============================================================
// 2Life — Life Blueprint Wizard
// 5-step wizard: Name → Age → Career → Family → Summary
// Collects LifeBlueprint then calls beginLife() to start.
// ============================================================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import { CAREERS, type CareerId } from "../../data/careers";
import type { LifeBlueprint } from "../../types/game";

// ── Wizard state (local until step 5 commits) ─────────────
interface WizardState {
  name:         string;
  startingAge:  number;
  careerId:     CareerId | null;
  wantsPartner: boolean;
  targetKids:   number;
}

// ── Animation variants ────────────────────────────────────
const SLIDE_IN  = { opacity: 0, x: 60 };
const SLIDE_OUT = { opacity: 0, x: -60 };
const VISIBLE   = { opacity: 1, x: 0 };
const TRANSITION = { duration: 0.3, ease: "easeOut" as const };

// ── Step progress bar ─────────────────────────────────────
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="wizard-dots" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`wizard-dot ${i + 1 === step ? "wizard-dot--active" : i + 1 < step ? "wizard-dot--done" : ""}`}
        />
      ))}
    </div>
  );
}

// ── Step 1: Name ──────────────────────────────────────────
function StepName({
  name, onChange, onNext,
}: {
  name: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="wizard-step">
      <div className="wizard-step-icon">✏️</div>
      <h2 className="wizard-step-title">What's your name?</h2>
      <p className="wizard-step-sub">This will appear throughout your life story.</p>
      <input
        id="blueprint-name-input"
        className="name-input"
        type="text"
        maxLength={20}
        placeholder="Enter your name…"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && name.trim() && onNext()}
        autoFocus
        aria-label="Your name"
      />
      <button
        id="blueprint-name-next"
        className="btn btn-primary btn-large"
        onClick={onNext}
        disabled={!name.trim()}
      >
        Continue →
      </button>
    </div>
  );
}

// ── Step 2: Starting Age ──────────────────────────────────
function StepAge({
  age, onChange, onNext, onBack,
}: {
  age: number;
  onChange: (v: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const label =
    age <= 20 ? "Young starter — more time to grow, less experience." :
    age <= 25 ? "Fresh graduate — educated, ambitious, ready." :
    age <= 30 ? "Established adult — career is underway." :
    age <= 35 ? "Mid-career — experienced, maybe a family already." :
                "Late starter — pressure is on, but wisdom is high.";

  return (
    <div className="wizard-step">
      <div className="wizard-step-icon">🎂</div>
      <h2 className="wizard-step-title">At what age does your story begin?</h2>
      <p className="wizard-step-sub">{label}</p>

      <div className="age-display" aria-live="polite">
        <span className="age-number">{age}</span>
        <span className="age-unit">years old</span>
      </div>

      <input
        id="blueprint-age-slider"
        className="age-slider"
        type="range"
        min={18}
        max={40}
        value={age}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Starting age: ${age}`}
      />
      <div className="age-slider-labels">
        <span>18</span>
        <span>40</span>
      </div>

      <div className="wizard-nav">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button id="blueprint-age-next" className="btn btn-primary" onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Career ────────────────────────────────────────
function CareerCard({
  career,
  selected,
  onSelect,
}: {
  career: typeof CAREERS[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      id={`career-card-${career.id}`}
      className={`career-card ${selected ? "career-card--selected" : ""}`}
      onClick={onSelect}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      aria-pressed={selected}
      aria-label={`${career.name}: ${career.tagline}`}
    >
      <div className={`career-card-inner bg-gradient-to-br ${career.bgGradient}`}>
        <div className="career-card-emoji" aria-hidden="true">{career.emoji}</div>
        <div className="career-card-name">{career.name}</div>
        <div className="career-card-tagline">{career.tagline}</div>

        <div className="career-card-details">
          <div className="career-detail">
            <span className="career-detail-icon">🎓</span>
            <span className="career-detail-text">{career.educationPath}</span>
          </div>
          <div className="career-detail">
            <span className="career-detail-icon">💰</span>
            <span className="career-detail-text">{career.salaryRange}</span>
          </div>
          <div className="career-detail">
            <span className="career-detail-icon">📊</span>
            <span className="career-detail-text">{career.keyStats.join(" · ")}</span>
          </div>
        </div>

        {selected && (
          <motion.div
            className="career-card-check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            ✓
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

function StepCareer({
  careerId, onSelect, onNext, onBack,
}: {
  careerId: CareerId | null;
  onSelect: (id: CareerId) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="wizard-step wizard-step--wide">
      <div className="wizard-step-icon">🏢</div>
      <h2 className="wizard-step-title">What's your dream career?</h2>
      <p className="wizard-step-sub">Choose the path you want to pursue.</p>

      <div className="career-cards-grid">
        {CAREERS.map((career) => (
          <CareerCard
            key={career.id}
            career={career}
            selected={careerId === career.id}
            onSelect={() => onSelect(career.id)}
          />
        ))}
      </div>

      <div className="wizard-nav">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button
          id="blueprint-career-next"
          className="btn btn-primary"
          onClick={onNext}
          disabled={!careerId}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Family Goals ──────────────────────────────────
function StepFamily({
  wantsPartner, targetKids,
  onPartner, onKids,
  onNext, onBack,
}: {
  wantsPartner: boolean;
  targetKids: number;
  onPartner: (v: boolean) => void;
  onKids: (v: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const kidsLabel = ["No kids", "1 child", "2 children", "3 children", "4 children", "5 children", "6 children"];

  return (
    <div className="wizard-step">
      <div className="wizard-step-icon">👨‍👩‍👦</div>
      <h2 className="wizard-step-title">What are your family goals?</h2>
      <p className="wizard-step-sub">Set the life goals you want to achieve.</p>

      {/* Partner */}
      <div className="family-section">
        <p className="family-label">💑 Do you want a life partner?</p>
        <div className="toggle-row">
          <button
            id="family-partner-no"
            className={`toggle-btn ${!wantsPartner ? "toggle-btn--active" : ""}`}
            onClick={() => onPartner(false)}
          >
            🚶 Solo life
          </button>
          <button
            id="family-partner-yes"
            className={`toggle-btn ${wantsPartner ? "toggle-btn--active" : ""}`}
            onClick={() => onPartner(true)}
          >
            💑 Find a partner
          </button>
        </div>
      </div>

      {/* Kids */}
      <div className="family-section">
        <p className="family-label">👶 How many kids do you want?</p>
        <div className="kids-selector">
          {[0, 1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              id={`family-kids-${n}`}
              className={`kids-btn ${targetKids === n ? "kids-btn--active" : ""}`}
              onClick={() => onKids(n)}
              aria-label={kidsLabel[n]}
              aria-pressed={targetKids === n}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="family-sublabel">
          {targetKids === 0 ? "Living free and unattached 🌟"
            : targetKids === 1 ? "One little one to love 🍼"
            : targetKids <= 3 ? `A cosy family of ${targetKids + 2} 🏡`
            : `A big, beautiful family of ${targetKids + 2} 🎪`}
        </p>
      </div>

      <div className="wizard-nav">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button id="blueprint-family-next" className="btn btn-primary" onClick={onNext}>
          Review Blueprint →
        </button>
      </div>
    </div>
  );
}

// ── Step 5: Summary ───────────────────────────────────────
function StepSummary({
  wizard, onBegin, onBack,
}: {
  wizard: WizardState;
  onBegin: () => void;
  onBack: () => void;
}) {
  const career = CAREERS.find((c) => c.id === wizard.careerId);

  return (
    <div className="wizard-step">
      <div className="wizard-step-icon">📋</div>
      <h2 className="wizard-step-title">Your Life Blueprint</h2>
      <p className="wizard-step-sub">Here's the life you're about to live. Ready?</p>

      <div className="blueprint-summary-card">
        <div className="blueprint-row">
          <span className="blueprint-label">✏️ Name</span>
          <span className="blueprint-value">{wizard.name}</span>
        </div>
        <div className="blueprint-row">
          <span className="blueprint-label">🎂 Starting age</span>
          <span className="blueprint-value">{wizard.startingAge}</span>
        </div>
        <div className="blueprint-row">
          <span className="blueprint-label">💼 Dream career</span>
          <span className="blueprint-value">
            {career ? `${career.emoji} ${career.name}` : "—"}
          </span>
        </div>
        <div className="blueprint-row">
          <span className="blueprint-label">🎓 Education path</span>
          <span className="blueprint-value blueprint-value--small">
            {career?.educationPath ?? "—"}
          </span>
        </div>
        <div className="blueprint-row">
          <span className="blueprint-label">💰 Salary range</span>
          <span className="blueprint-value">{career?.salaryRange ?? "—"}</span>
        </div>
        <div className="blueprint-row">
          <span className="blueprint-label">💑 Partner goal</span>
          <span className="blueprint-value">
            {wizard.wantsPartner ? "Find a partner 💑" : "Solo life 🚶"}
          </span>
        </div>
        <div className="blueprint-row">
          <span className="blueprint-label">👶 Kids goal</span>
          <span className="blueprint-value">
            {wizard.targetKids === 0 ? "No kids" : `${wizard.targetKids} kid${wizard.targetKids > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      {career && (
        <div className="blueprint-starting-stats">
          <p className="blueprint-stats-label">Starting stats for {career.name}:</p>
          <div className="blueprint-stats-row">
            {[
              { icon: "⚡", val: career.startingStats.energy, label: "Energy" },
              { icon: "❤️", val: career.startingStats.health, label: "Health" },
              { icon: "😊", val: career.startingStats.happiness, label: "Happy" },
            ].map((s) => (
              <div key={s.label} className="blueprint-stat-chip">
                <span>{s.icon}</span>
                <span className="blueprint-stat-val">{s.val}</span>
                <span className="blueprint-stat-name">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="wizard-nav wizard-nav--begin">
        <button className="btn btn-ghost" onClick={onBack}>← Edit</button>
        <motion.button
          id="blueprint-begin-btn"
          className="btn btn-primary btn-large"
          onClick={onBegin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          Begin My Life ✨
        </motion.button>
      </div>
    </div>
  );
}

// ── Main wizard component ─────────────────────────────────
export default function LifeBlueprintScreen() {
  const { playerName, setBlueprint, beginLife } = useGameStore();

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

  const [wizard, setWizard] = useState<WizardState>({
    name:         playerName || "",
    startingAge:  22,
    careerId:     null,
    wantsPartner: false,
    targetKids:   0,
  });

  const update = <K extends keyof WizardState>(key: K, val: WizardState[K]) =>
    setWizard((prev) => ({ ...prev, [key]: val }));

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleBegin = () => {
    const bp: LifeBlueprint = {
      startingAge:  wizard.startingAge,
      careerId:     wizard.careerId,
      wantsPartner: wizard.wantsPartner,
      targetKids:   wizard.targetKids,
    };
    // Store name update + blueprint, then start
    useGameStore.setState({ playerName: wizard.name.trim() || "Player" });
    setBlueprint(bp);
    beginLife();
  };

  const steps: Record<number, React.ReactNode> = {
    1: (
      <StepName
        name={wizard.name}
        onChange={(v) => update("name", v)}
        onNext={next}
      />
    ),
    2: (
      <StepAge
        age={wizard.startingAge}
        onChange={(v) => update("startingAge", v)}
        onNext={next}
        onBack={back}
      />
    ),
    3: (
      <StepCareer
        careerId={wizard.careerId}
        onSelect={(id) => update("careerId", id)}
        onNext={next}
        onBack={back}
      />
    ),
    4: (
      <StepFamily
        wantsPartner={wizard.wantsPartner}
        targetKids={wizard.targetKids}
        onPartner={(v) => update("wantsPartner", v)}
        onKids={(v) => update("targetKids", v)}
        onNext={next}
        onBack={back}
      />
    ),
    5: (
      <StepSummary
        wizard={wizard}
        onBegin={handleBegin}
        onBack={back}
      />
    ),
  };

  return (
    <div className="blueprint-screen">
      {/* Background stars */}
      <div className="starfield" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top:  `${Math.random() * 100}%`,
              animationDelay:    `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              width:  `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
            }}
          />
        ))}
      </div>

      <div className="blueprint-content">
        {/* Header */}
        <div className="blueprint-header">
          <p className="blueprint-brand">🌍 2Life</p>
          <StepDots step={step} total={TOTAL_STEPS} />
          <p className="blueprint-step-label">Step {step} of {TOTAL_STEPS}</p>
        </div>

        {/* Animated step content */}
        <div className="wizard-stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={SLIDE_IN}
              animate={VISIBLE}
              exit={SLIDE_OUT}
              transition={TRANSITION}
              className="wizard-step-wrapper"
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
