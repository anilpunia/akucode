import { useState } from 'react';
import { analyzeScamTactics } from '../services/gemini';
import './ScamTacticAnalysis.css';

/**
 * ScamTacticAnalysis — surfaces the previously-unused analyzeScamTactics()
 * Gemini call. After a scam is flagged (or any time), the user can paste the
 * message/threat they received and have Gemini name the social-engineering
 * tactics in plain English. This is the "AI where it wins" layer: it analyzes
 * the manipulation playbook (stable), not the audio (an arms race).
 */

const TACTIC_META = {
  'false urgency':        { icon: '⏱️', label: 'False Urgency' },
  'urgency':              { icon: '⏱️', label: 'False Urgency' },
  'isolation':            { icon: '🤫', label: 'Isolation' },
  'false authority':      { icon: '🎖️', label: 'False Authority' },
  'authority':            { icon: '🎖️', label: 'False Authority' },
  'emotional manipulation': { icon: '💔', label: 'Emotional Manipulation' },
  'financial pressure':   { icon: '💸', label: 'Financial Pressure' },
};

function tacticDisplay(raw) {
  const key = String(raw).toLowerCase().trim();
  for (const k of Object.keys(TACTIC_META)) {
    if (key.includes(k)) return TACTIC_META[k];
  }
  return { icon: '⚠️', label: raw };
}

const SAMPLE =
  "I'm in jail and need $5,000 for bail right now. Don't tell anyone, just wire it immediately.";

export default function ScamTacticAnalysis() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    const text = message.trim();
    if (!text) {
      setError('Paste the message you received first.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await analyzeScamTactics(text);
      setResult(res);
    } catch {
      setError('Could not analyze right now.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        className="tactic-trigger"
        onClick={() => setOpen(true)}
        aria-label="Analyze why this was a scam using AI"
      >
        <span>🔎</span> Why was this a scam? <span className="tactic-trigger-ai">AI</span>
      </button>
    );
  }

  return (
    <div className="tactic-panel card" aria-label="Scam tactic analysis">
      <p className="tactic-panel-title">🔎 Scam Tactic Analyzer</p>
      <p className="tactic-panel-sub">
        Paste the message or describe what the caller said. Gemini will name the
        manipulation tactics being used.
      </p>

      <textarea
        className="tactic-textarea"
        rows={3}
        placeholder="e.g., They said I had to wire money in the next hour or my grandson goes to jail…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        aria-label="Paste the scam message"
      />

      <button
        className="tactic-sample-link"
        onClick={() => setMessage(SAMPLE)}
        type="button"
      >
        Use an example message
      </button>

      {error && <p className="tactic-error">{error}</p>}

      <button
        className="btn btn-primary tactic-analyze-btn"
        onClick={analyze}
        disabled={loading}
        aria-label="Analyze the message with AI"
      >
        {loading ? '✨ Analyzing with Gemini…' : '✨ Analyze with AI'}
      </button>

      {result && (
        <div className="tactic-result animate-fade-in">
          {result.riskLevel && (
            <div className={`tactic-risk tactic-risk--${String(result.riskLevel).toLowerCase()}`}>
              Risk level: <strong>{result.riskLevel}</strong>
            </div>
          )}

          <div className="tactic-list">
            {(result.tactics || []).map((t, i) => {
              const d = tacticDisplay(t);
              return (
                <div className="tactic-chip" key={i}>
                  <span className="tactic-chip-icon">{d.icon}</span>
                  <span>{d.label}</span>
                </div>
              );
            })}
          </div>

          {result.explanation && (
            <p className="tactic-explanation">{result.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}
