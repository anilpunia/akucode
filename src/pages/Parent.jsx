import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  sendVerification,
  resetVerification,
  onVerificationChange,
  getFamilyMembers,
  getMemories,
  addHistoryEntry,
  getHistory,
  onFamilyMembersChange,
} from '../firebase';
import './Parent.css';

// Anti-panic coaching tips + stalling scripts that rotate during the wait
const COACHING_TIPS = [
  "Breathe. Real emergencies never demand gift cards.",
  "Real police will never ask you to wire bail money.",
  "If they say 'don't tell anyone' — that's a scammer's #1 trick.",
  "Hang up and call your family member directly if unsure.",
  "No legitimate emergency requires payment in the next 10 minutes.",
  "Scammers create panic so you can't think. Take your time.",
  "\uD83D\uDCAC Say: \"Hold on, I need to get my reading glasses.\"",
  "\uD83D\uDCAC Say: \"Could you repeat that slowly? I'm writing it down.\"",
  "\uD83D\uDCAC Say: \"My phone is cutting out — can you hold one moment?\"",
];

function formatHistoryTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function Parent() {
  const navigate = useNavigate();
  const familyCode = localStorage.getItem('kincode_family');
  const parentName = localStorage.getItem('kincode_name');

  const [status, setStatus] = useState('idle'); // idle, pending, scam, safe
  const [childName, setChildName] = useState('Family Member');
  const [childNames, setChildNames] = useState([]);
  const [allUnavailable, setAllUnavailable] = useState(false);
  const [history, setHistory] = useState([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [memories, setMemories] = useState([]);
  const [showMemoryChallenge, setShowMemoryChallenge] = useState(false);
  const [currentMemory, setCurrentMemory] = useState(null);
  const prevStatusRef = useRef('idle');

  // Redirect if not set up
  useEffect(() => {
    if (!familyCode) {
      navigate('/');
    }
  }, [familyCode, navigate]);

  // Load family member name and memories
  useEffect(() => {
    if (!familyCode) return;

    getFamilyMembers(familyCode).then((members) => {
      if (members) {
        const children = Object.entries(members)
          .filter(([k]) => k !== 'parent')
          .map(([, v]) => v);
        if (children.length > 0) {
          setChildName(children[0].name);
          setChildNames(children.map((c) => c.name));
        }
      }
    });

    getHistory(familyCode).then(setHistory);

    getMemories(familyCode).then((mems) => {
      if (mems && mems.length > 0) {
        setMemories(mems);
      }
    });
  }, [familyCode]);

  // Listen for verification status changes (real-time from Firebase)
  useEffect(() => {
    if (!familyCode) return;

    const unsubscribe = onVerificationChange(familyCode, (data) => {
      if (data?.status) {
        setStatus(data.status);
        if (data.status === 'scam' || data.status === 'safe') {
          // Vibrate on result
          if (navigator.vibrate) {
            navigator.vibrate(data.status === 'scam' ? [200, 100, 200, 100, 200] : [200]);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [familyCode]);

  // Rotate coaching tips while waiting
  useEffect(() => {
    if (status !== 'pending') return;

    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % COACHING_TIPS.length);
    }, 5000);

    return () => clearInterval(tipTimer);
  }, [status]);

  // Track wait time and trigger memory challenge fallback
  // If all family members are unavailable, trigger after 5s instead of 30s
  useEffect(() => {
    if (status !== 'pending') {
      setWaitTime(0);
      setShowMemoryChallenge(false);
      return;
    }

    const threshold = allUnavailable ? 5 : 30;

    const waitTimer = setInterval(() => {
      setWaitTime((prev) => {
        const next = prev + 1;
        if (next >= threshold && memories.length > 0 && !showMemoryChallenge) {
          // Pick a random memory challenge
          const randomMem = memories[Math.floor(Math.random() * memories.length)];
          setCurrentMemory(randomMem);
          setShowMemoryChallenge(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(waitTimer);
  }, [status, memories, showMemoryChallenge, allUnavailable]);

  // Handle verify button tap
  const handleVerify = useCallback(async () => {
    if (!familyCode) return;
    setStatus('pending');
    setWaitTime(0);
    setShowMemoryChallenge(false);
    await sendVerification(familyCode);
  }, [familyCode]);

  // Reset back to idle
  const handleReset = useCallback(async () => {
    if (!familyCode) return;
    setStatus('idle');
    setShowMemoryChallenge(false);
    setCurrentMemory(null);
    await resetVerification(familyCode);
  }, [familyCode]);

  // Memory challenge response
  const handleMemoryResponse = useCallback(async (correct) => {
    if (!familyCode) return;
    if (correct) {
      setStatus('safe');
    } else {
      setStatus('scam');
    }
    if (navigator.vibrate) {
      navigator.vibrate(correct ? [200] : [200, 100, 200, 100, 200]);
    }
  }, [familyCode]);

  // Read aloud the result (accessibility)
  const readAloud = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Subscribe to family member changes for real-time availability
  useEffect(() => {
    if (!familyCode) return;
    const unsubscribe = onFamilyMembersChange(familyCode, (members) => {
      const children = Object.entries(members).filter(([k]) => k !== 'parent');
      if (children.length > 0) {
        setChildNames(children.map(([, v]) => v.name));
        setChildName(children[0][1].name);
        const allBusy = children.every(([, v]) => v.available === false);
        setAllUnavailable(allBusy);
      }
    });
    return () => unsubscribe();
  }, [familyCode]);

  // Record history entry when a verification result arrives
  useEffect(() => {
    if ((status === 'scam' || status === 'safe') && prevStatusRef.current === 'pending') {
      if (familyCode) {
        addHistoryEntry(familyCode, status, childName)
          .then(() => getHistory(familyCode).then(setHistory))
          .catch(console.error);
      }
    }
    prevStatusRef.current = status;
  }, [status, familyCode, childName]);

  // Disconnect / log out
  const handleDisconnect = () => {
    localStorage.removeItem('kincode_family');
    localStorage.removeItem('kincode_role');
    localStorage.removeItem('kincode_name');
    navigate('/');
  };

  // ──────────────────────────────────────────
  // RENDER: SCAM DETECTED
  // ──────────────────────────────────────────
  if (status === 'scam') {
    return (
      <div className="page parent-page result-scam" role="alert">
        {/* Flashing red border strobe overlay */}
        <div className="result-border-flash result-border-flash--danger" />
        <div className="result-content animate-fade-in">
          <span className="result-icon result-icon--shake">🚨</span>
          <h1 className="result-title">SCAM DETECTED</h1>
          <p className="result-subtitle">HANG UP NOW</p>
          <p className="result-detail">
            {childName} confirmed they are <strong>NOT</strong> calling you.
            This is a scam. Do not send any money.
          </p>
          <button
            className="btn btn-outline result-btn"
            onClick={() => {
              readAloud('Scam detected. Hang up now. Do not send any money.');
            }}
            aria-label="Read aloud the warning"
          >
            🔊 Read Aloud
          </button>
          <button
            className="btn btn-outline result-btn"
            onClick={handleReset}
            aria-label="Start over"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // RENDER: VERIFIED SAFE
  // ──────────────────────────────────────────
  if (status === 'safe') {
    return (
      <div className="page parent-page result-safe" role="alert">
        {/* Pulsing green glow orb */}
        <div className="result-safe-orb" />
        {/* Safe border */}
        <div className="result-border-flash result-border-flash--safe" />
        <div className="result-content animate-fade-in">
          <span className="result-icon">✅</span>
          <h1 className="result-title">VERIFIED</h1>
          <p className="result-subtitle">This is really {childName}</p>
          <p className="result-detail">
            The call has been confirmed as genuine.
          </p>
          <button
            className="btn btn-outline result-btn"
            onClick={() => {
              readAloud(`Verified. This is really ${childName}. The call is genuine.`);
            }}
            aria-label="Read aloud the confirmation"
          >
            🔊 Read Aloud
          </button>
          <button
            className="btn btn-outline result-btn"
            onClick={handleReset}
            aria-label="Start over"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // RENDER: WAITING FOR RESPONSE
  // ──────────────────────────────────────────
  if (status === 'pending') {
    return (
      <div className="page parent-page">
        <div className="pending-content animate-fade-in">
          {/* Memory challenge fallback */}
          {showMemoryChallenge && currentMemory ? (
            <div className="memory-challenge card">
              <span className="memory-icon">🧠</span>
              <h2 className="title">{childName} hasn't responded</h2>
              <p className="subtitle">Ask the caller this question:</p>
              <div className="memory-question">
                "{currentMemory.question}"
              </div>
              <div className="memory-buttons">
                <button
                  className="btn btn-safe"
                  onClick={() => handleMemoryResponse(true)}
                  aria-label="Caller answered correctly"
                >
                  ✅ They answered correctly
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleMemoryResponse(false)}
                  aria-label="Caller got it wrong"
                >
                  ❌ They got it wrong
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Pulsing ring animation */}
              <div className="pending-pulse-container">
                <div className="pending-pulse-ring" />
                <div className="pending-pulse-ring delay-1" />
                <div className="pending-pulse-ring delay-2" />
                <div className="pending-icon">📡</div>
              </div>

              <h2 className="pending-title">
                Checking with {childName}...
              </h2>

              <p className="pending-timer">
                Waiting: {waitTime}s
              </p>

              {/* Live safety tip card */}
              <div className="coaching-card" key={tipIndex}>
                <div className="coaching-card-header">
                  <span className="coaching-live-badge">💡 Safety Tip</span>
                  <span className="coaching-counter">{tipIndex + 1} / {COACHING_TIPS.length}</span>
                </div>
                <p className="coaching-card-text">"{COACHING_TIPS[tipIndex]}"</p>
                <div className="coaching-dots">
                  {COACHING_TIPS.map((_, i) => (
                    <span key={i} className={`coaching-dot${i === tipIndex ? ' active' : ''}`} />
                  ))}
                </div>
              </div>

              <button
                className="btn btn-outline"
                onClick={handleReset}
                style={{ marginTop: '24px' }}
                aria-label="Cancel verification"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // RENDER: IDLE — THE BIG VERIFY BUTTON
  // ──────────────────────────────────────────
  return (
    <div className="page parent-page">
      <div className="idle-content animate-fade-in">
        <div className="idle-status">
          <div className="connected-pill">
            <span className="connected-dot" />
            Connected to <strong>{childNames.length > 0 ? childNames.join(', ') : childName}</strong>
            {allUnavailable && <span className="unavailable-badge"> · All Unavailable</span>}
          </div>
          <p className="idle-code">Family Code: {familyCode}</p>
        </div>

        {allUnavailable && (
          <div className="unavailable-notice card">
            <span>⚠️</span>
            <p>Family marked as unavailable. Memory challenge will trigger after 5s.</p>
          </div>
        )}

        {/* Circular verify button with pulsing rings */}
        <div className="verify-circle-outer">
          <div className="verify-ring verify-ring--1" />
          <div className="verify-ring verify-ring--2" />
          <div className="verify-ring verify-ring--3" />
          <button
            className="btn-verify-circle"
            onClick={handleVerify}
            aria-label="Verify this call"
          >
            <span className="verify-circle-icon">🚨</span>
            <span className="verify-circle-label">VERIFY</span>
          </button>
        </div>

        <p className="idle-hint">
          Got a suspicious call? Tap above to check if it's really {childNames.length > 0 ? childNames.join(' or ') : childName}.
        </p>

        {history.length > 0 && (
          <div className="history-log card" aria-label="Recent verification history">
            <p className="history-title">Recent Verifications</p>
            {history.slice(0, 3).map((entry, i) => (
              <div key={i} className={`history-row history-row--${entry.type}`}>
                <span className="history-icon">{entry.type === 'scam' ? '🚨' : '✅'}</span>
                <span className="history-text">
                  <strong>{entry.type === 'safe' ? 'Safe' : 'Scam blocked'}</strong>
                  <span className="history-time"> · {formatHistoryTime(entry.timestamp)}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-outline disconnect-btn"
          onClick={handleDisconnect}
          aria-label="Disconnect and return to home"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export default Parent;
