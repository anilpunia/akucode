import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  respondVerification,
  onVerificationChange,
  getFamilyMembers,
  setFamilyAvailability,
} from '../firebase';
import './Family.css';

function Family() {
  const navigate = useNavigate();
  const familyCode = localStorage.getItem('kincode_family');
  const myName = localStorage.getItem('kincode_name');
  const memberKey = localStorage.getItem('kincode_member_key');

  const [status, setStatus] = useState('idle');
  const [parentName, setParentName] = useState('Your Parent');
  const [responded, setResponded] = useState(false);
  const [available, setAvailable] = useState(true);

  // Redirect if not set up
  useEffect(() => {
    if (!familyCode) {
      navigate('/');
    }
  }, [familyCode, navigate]);

  // Load parent name
  useEffect(() => {
    if (!familyCode) return;

    getFamilyMembers(familyCode).then((members) => {
      if (members?.parent?.name) {
        setParentName(members.parent.name);
      }
    });
  }, [familyCode]);

  // Listen for verification status changes
  useEffect(() => {
    if (!familyCode) return;

    const unsubscribe = onVerificationChange(familyCode, (data) => {
      if (data?.status) {
        setStatus(data.status);

        // Reset "responded" flag when status goes back to idle
        if (data.status === 'idle') {
          setResponded(false);
        }

        // Vibrate when a new verification request comes in
        if (data.status === 'pending' && !responded) {
          if (navigator.vibrate) {
            navigator.vibrate([300, 100, 300, 100, 300]);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [familyCode, responded]);

  // Handle response: "I'm NOT calling"
  const handleNotCalling = useCallback(async () => {
    if (!familyCode) return;
    setResponded(true);
    await respondVerification(familyCode, 'scam');
  }, [familyCode]);

  // Handle response: "Yes, it's me"
  const handleItIsMe = useCallback(async () => {
    if (!familyCode) return;
    setResponded(true);
    await respondVerification(familyCode, 'safe');
  }, [familyCode]);

  // Toggle availability and sync to Firebase
  const handleToggleAvailability = useCallback(async () => {
    if (!familyCode || !memberKey) return;
    const newVal = !available;
    setAvailable(newVal);
    await setFamilyAvailability(familyCode, memberKey, newVal);
  }, [familyCode, memberKey, available]);

  // Disconnect / log out
  const handleDisconnect = () => {
    localStorage.removeItem('kincode_family');
    localStorage.removeItem('kincode_role');
    localStorage.removeItem('kincode_name');
    navigate('/');
  };

  // ──────────────────────────────────────────
  // RENDER: ALERT — Verification Request!
  // ──────────────────────────────────────────
  if (status === 'pending' && !responded) {
    return (
      <div className="page family-page alert-active" role="alert">
        <div className="alert-content animate-fade-in">
          {/* Flashing border effect */}
          <div className="alert-flash" />

          <span className="alert-icon">🚨</span>

          <h1 className="alert-title">
            {parentName} needs you!
          </h1>

          <p className="alert-subtitle">
            {parentName} is verifying a suspicious call.
          </p>

          <p className="alert-question">
            Are YOU calling {parentName} right now?
          </p>

          <div className="alert-buttons">
            <button
              className="btn btn-safe btn-giant"
              onClick={handleItIsMe}
              aria-label={`Confirm that you are calling ${parentName}`}
            >
              ✅ Yes, it's me calling
            </button>

            <button
              className="btn btn-danger btn-giant"
              onClick={handleNotCalling}
              aria-label={`Confirm that you are not calling ${parentName}`}
            >
              🚫 No — I'm NOT calling!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // RENDER: Responded — Waiting for reset
  // ──────────────────────────────────────────
  if (responded) {
    return (
      <div className="page family-page">
        <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '56px', display: 'block', marginBottom: '16px' }}>
            ✅
          </span>
          <h2 className="title">Response Sent</h2>
          <p className="subtitle">
            {parentName} has been notified. You can close this screen.
          </p>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // RENDER: IDLE — All is well
  // ──────────────────────────────────────────
  return (
    <div className="page family-page">
      <div className="idle-family-content animate-fade-in">
        <div className="family-shield-container">
          <div className="family-shield-glow" />
          <span className="family-shield-icon">🛡️</span>
        </div>

        <h2 className="family-idle-title">KinCode Active</h2>
        <p className="family-idle-subtitle">
          {parentName} is protected. You'll be alerted instantly if they need to verify a call.
        </p>

        <div className="family-status-card card">
          <div className="family-status-row">
            <span className="family-status-label">Status</span>
            <span className="family-status-value safe">
              <span className="status-dot" /> Protected
            </span>
          </div>
          <div className="family-status-row">
            <span className="family-status-label">Connected to</span>
            <span className="family-status-value">{parentName}</span>
          </div>
          <div className="family-status-row">
            <span className="family-status-label">Your name</span>
            <span className="family-status-value">{myName}</span>
          </div>
          <div className="family-status-row">
            <span className="family-status-label">Family Code</span>
            <span className="family-status-value">{familyCode}</span>
          </div>
        </div>

        <button
          className={`btn availability-toggle ${available ? 'availability-on' : 'availability-off'}`}
          onClick={handleToggleAvailability}
          aria-label={available ? 'Mark yourself as unavailable' : 'Mark yourself as available'}
        >
          {available ? '\uD83D\uDFE2 I\'m Available' : '\uD83D\uDD34 I\'m Unavailable'}
        </button>

        <p className="family-idle-hint">
          Keep this page open. You'll receive an alert if {parentName} needs verification.
        </p>

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

export default Family;
