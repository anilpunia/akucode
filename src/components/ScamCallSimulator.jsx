import { useState, useRef, useEffect, useCallback } from 'react';
import './ScamCallSimulator.css';

/**
 * ScamCallSimulator — the demo centerpiece.
 *
 * Plays a realistic incoming "scam call" using the browser's built-in speech
 * synthesis (no audio files needed, works offline). This lets the team stage
 * the full emotional arc live on stage: the panic call comes in, then KinCode
 * defuses it. Clearly labelled as a demo so judges know it's a simulation.
 *
 * Props:
 *   - callerName: the name to impersonate (e.g. the family member's name)
 *   - onAnswer:   called when the user "answers" the call (so the parent screen
 *                 can nudge them toward the Verify button)
 */
const SCAM_SCRIPT =
  "Mom? Mom it's me. I'm in trouble — I got in an accident and I'm at the police station. " +
  "I need you to wire five thousand dollars for bail right now. Please, don't tell Dad, " +
  "just send it quickly, I don't have much time.";

export default function ScamCallSimulator({ callerName = 'Alex', onAnswer }) {
  const [phase, setPhase] = useState('idle'); // idle, ringing, answered
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);
  const ringTimerRef = useRef(null);

  // Load available speech-synthesis voices (async on some browsers)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const stopEverything = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    if (navigator.vibrate) navigator.vibrate(0);
  }, []);

  useEffect(() => () => stopEverything(), [stopEverything]);

  const startRinging = () => {
    setPhase('ringing');
    // Buzz like an incoming call
    if (navigator.vibrate) navigator.vibrate([500, 300, 500, 300, 500]);
  };

  const answerCall = () => {
    setPhase('answered');
    if (navigator.vibrate) navigator.vibrate(0);

    // Speak the scam script in a panicked, urgent tone
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(SCAM_SCRIPT);
      // Try to pick a natural-sounding voice
      const preferred =
        voices.find((v) => /natural|google|samantha|zira/i.test(v.name)) ||
        voices.find((v) => v.lang?.startsWith('en')) ||
        voices[0];
      if (preferred) u.voice = preferred;
      u.rate = 1.08;   // slightly fast = urgent
      u.pitch = 1.15;  // raised = distressed
      u.volume = 1;
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    }

    if (onAnswer) onAnswer();
  };

  const endCall = () => {
    stopEverything();
    setPhase('idle');
  };

  // ── Trigger button (shown when idle) ──────────────────────────────
  if (phase === 'idle') {
    return (
      <button
        className="sim-trigger"
        onClick={startRinging}
        aria-label="Simulate an incoming scam call for the demo"
      >
        <span className="sim-trigger-icon">🎭</span>
        <span className="sim-trigger-text">
          <strong>Demo: Simulate a scam call</strong>
          <span className="sim-trigger-sub">Hear what an AI-cloned voice sounds like</span>
        </span>
      </button>
    );
  }

  // ── Full-screen incoming / active call overlay ────────────────────
  return (
    <div className="sim-overlay" role="dialog" aria-label="Simulated incoming call">
      <div className="sim-demo-badge">🎭 DEMO SIMULATION</div>

      <div className="sim-call-content">
        <div className={`sim-avatar ${phase === 'ringing' ? 'sim-avatar--ringing' : ''}`}>
          {callerName.charAt(0).toUpperCase()}
        </div>

        <p className="sim-caller-label">
          {phase === 'ringing' ? 'Incoming call' : 'On call'}
        </p>
        <h2 className="sim-caller-name">{callerName}</h2>
        <p className="sim-caller-number">mobile · +1 (201) 555‑0148</p>

        {phase === 'ringing' && (
          <div className="sim-ring-actions">
            <button className="sim-call-btn sim-call-btn--decline" onClick={endCall} aria-label="Decline call">
              <span>✕</span>
            </button>
            <button className="sim-call-btn sim-call-btn--accept" onClick={answerCall} aria-label="Answer call">
              <span>📞</span>
            </button>
          </div>
        )}

        {phase === 'answered' && (
          <>
            <div className="sim-speaking">
              <span className="sim-wave" />
              <span className="sim-wave" />
              <span className="sim-wave" />
              <span className="sim-wave" />
              <span className="sim-speaking-label">"{callerName}" is speaking…</span>
            </div>
            <p className="sim-prompt">
              👉 This feels real — but is it? Tap <strong>VERIFY THIS CALL</strong> below.
            </p>
            <button className="sim-call-btn sim-call-btn--end" onClick={endCall} aria-label="End simulated call">
              End demo call
            </button>
          </>
        )}
      </div>
    </div>
  );
}
