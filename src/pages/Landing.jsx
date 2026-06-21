import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  // Check if already paired — redirect to the correct view
  useEffect(() => {
    const role = localStorage.getItem('kincode_role');
    const code = localStorage.getItem('kincode_family');
    if (role && code) {
      navigate(role === 'parent' ? '/parent' : '/family');
    }
  }, [navigate]);

  return (
    <div className="page landing-page">
      {/* Background glow effect */}
      <div className="landing-glow" />

      <div className="landing-content animate-fade-in">
        {/* Logo */}
        <div className="landing-logo">
          <span className="landing-logo-icon">🛡️</span>
          <h1 className="landing-title">KinCode</h1>
        </div>

        {/* Tagline */}
        <p className="landing-tagline">
          They can clone his voice.
          <br />
          <strong>They can't crack your KinCode.</strong>
        </p>

        {/* Description */}
        <p className="landing-description">
          One-tap family verification against AI voice scams.
        </p>

        {/* Role selection cards */}
        <div className="landing-buttons">
          <button
            className="role-card role-card--parent"
            onClick={() => navigate('/setup?role=parent')}
            aria-label="Set up as a parent or grandparent"
          >
            <div className="role-card-icon-wrap">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <div className="role-card-text">
              <span className="role-card-title">I'm a Parent</span>
              <span className="role-card-sub">Protect yourself from phone scams</span>
            </div>
            <svg className="role-card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <button
            className="role-card role-card--family"
            onClick={() => navigate('/setup?role=child')}
            aria-label="Set up as a family member"
          >
            <div className="role-card-icon-wrap">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="role-card-text">
              <span className="role-card-title">I'm Family</span>
              <span className="role-card-sub">Be the alert for someone you love</span>
            </div>
            <svg className="role-card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* Footer */}
        <p className="landing-footer">
          Built by Team TechTitan · NJx Hackathon 2026
        </p>
        <div className="landing-powered">
          ✨ Powered by Gemini AI + Firebase
        </div>
      </div>
    </div>
  );
}

export default Landing;
