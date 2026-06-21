import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  generateFamilyCode,
  createFamily,
  joinFamily,
  familyExists,
  saveMemories,
} from '../firebase';
import { generateMemoryChallenges } from '../services/gemini';
import './Setup.css';

function Setup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'parent';

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Memory step state
  const [showMemoryStep, setShowMemoryStep] = useState(false);
  const [memories, setMemories] = useState(['', '', '']);
  const [generatingMemories, setGeneratingMemories] = useState(false);
  const [memoriesError, setMemoriesError] = useState('');

  // Parent: create a new family
  const handleCreateFamily = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const newCode = generateFamilyCode();
      await createFamily(newCode, name.trim());

      // Save to localStorage
      localStorage.setItem('kincode_family', newCode);
      localStorage.setItem('kincode_role', 'parent');
      localStorage.setItem('kincode_name', name.trim());

      setGeneratedCode(newCode);
    } catch (err) {
      setError('Failed to create family. Check your Firebase connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Family member: join with a code
  const handleJoinFamily = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!code.trim() || code.length !== 4) {
      setError('Please enter the 4-digit family code');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const exists = await familyExists(code);
      if (!exists) {
        setError('Family not found. Check the code and try again.');
        setLoading(false);
        return;
      }

      const memberKey = await joinFamily(code, name.trim());

      // Save to localStorage
      localStorage.setItem('kincode_family', code);
      localStorage.setItem('kincode_role', 'child');
      localStorage.setItem('kincode_name', name.trim());
      localStorage.setItem('kincode_member_key', memberKey);

      navigate('/family');
    } catch (err) {
      setError('Failed to join family. Check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update a single memory string by index
  const handleMemoryChange = (index, value) => {
    setMemories((prev) => prev.map((m, i) => (i === index ? value : m)));
  };

  // Generate memory questions with Gemini and save to Firebase
  const handleGenerateMemories = async () => {
    const filled = memories.filter((m) => m.trim());
    if (filled.length === 0) {
      setMemoriesError('Please add at least one memory before generating.');
      return;
    }
    setGeneratingMemories(true);
    setMemoriesError('');
    try {
      const questions = await generateMemoryChallenges(filled);
      await saveMemories(generatedCode, questions);
      navigate('/parent');
    } catch (err) {
      console.error('Memory generation error:', err);
      setMemoriesError('Something went wrong — skipping to dashboard.');
      setTimeout(() => navigate('/parent'), 1500);
    } finally {
      setGeneratingMemories(false);
    }
  };

  // ── Memory collection step (after code shown) ──────────────────────────────
  if (generatedCode && showMemoryStep) {
    return (
      <div className="page setup-page">
        <div className="card animate-slide-up">
          <div className="setup-header">
            <span className="setup-icon">🧠</span>
            <h2 className="title">Add Secret Questions</h2>
            <p className="subtitle">
              Share up to 3 private memories only your real family would know.
              Gemini will turn them into verification questions.
            </p>
          </div>

          <div className="memory-inputs">
            {memories.map((mem, i) => (
              <div className="memory-input-row" key={i}>
                <div className="memory-input-pill">{i + 1}</div>
                <input
                  id={`mem-${i}`}
                  className="input"
                  type="text"
                  placeholder={
                    i === 0
                      ? 'e.g., Our first dog was named Buddy'
                      : i === 1
                      ? 'e.g., Dad proposed at Cape May beach'
                      : "e.g., Mom's secret recipe is banana bread"
                  }
                  value={mem}
                  onChange={(e) => handleMemoryChange(i, e.target.value)}
                  aria-label={`Memory ${i + 1}`}
                />
              </div>
            ))}
          </div>

          {memoriesError && <p className="setup-error">{memoriesError}</p>}

          <div className="memory-ai-badge">
            <span className="memory-ai-icon">✨</span>
            <span>Gemini AI will generate 3 personalised questions from your memories</span>
          </div>

          <button
            className="btn btn-danger"
            onClick={handleGenerateMemories}
            disabled={generatingMemories}
            aria-label="Generate memory challenge questions"
          >
            {generatingMemories ? '✨ Generating with Gemini...' : '🔐 Generate My KinCode'}
          </button>

          <button
            className="btn btn-outline setup-back"
            onClick={() => navigate('/parent')}
            aria-label="Skip and go to dashboard"
          >
            Skip this step →
          </button>
        </div>
      </div>
    );
  }

  // After code is generated, show it to the parent
  if (generatedCode) {
    return (
      <div className="page setup-page">
        <div className="card animate-slide-up">
          <div className="setup-success">
            <span className="setup-success-icon">✅</span>
            <h2 className="title">Family Created!</h2>
            <p className="subtitle">
              Share this code with your family member so they can connect:
            </p>

            <div className="code-display">
              <span className="code-digits">{generatedCode}</span>
            </div>

            {/* Memory questions CTA */}
            <div className="memory-cta">
              <p className="memory-cta-label">
                🧠 <strong>Level up your protection</strong>
              </p>
              <p className="memory-cta-desc">
                Add private family memories so Gemini AI can generate secret
                verification questions — a backup if your family member doesn't respond.
              </p>
              <button
                className="btn btn-danger"
                onClick={() => setShowMemoryStep(true)}
                aria-label="Add secret memory questions"
              >
                ✨ Add Secret Questions
              </button>
            </div>

            <button
              className="btn btn-outline"
              onClick={() => navigate('/parent')}
              aria-label="Continue to parent dashboard without memories"
            >
              Skip — Continue to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page setup-page">
      <div className="card animate-slide-up">
        {/* Header */}
        <div className="setup-header">
          <span className="setup-icon">
            {role === 'parent' ? '🏠' : '👨‍👩‍👧'}
          </span>
          <h2 className="title">
            {role === 'parent' ? 'Set Up Protection' : 'Join Your Family'}
          </h2>
          <p className="subtitle">
            {role === 'parent'
              ? "Create a family code and share it with the family member who'll verify your calls."
              : 'Enter the 4-digit code your parent shared with you.'}
          </p>
        </div>

        {/* Name input */}
        <div className="setup-field">
          <label className="label" htmlFor="name-input">Your Name</label>
          <input
            id="name-input"
            className="input"
            type="text"
            placeholder={role === 'parent' ? 'e.g., Mom' : 'e.g., Alex'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            aria-label="Enter your name"
          />
        </div>

        {/* Code input (only for family member joining) */}
        {role === 'child' && (
          <div className="setup-field">
            <label className="label" htmlFor="code-input">Family Code</label>
            <input
              id="code-input"
              className="input input-code"
              type="text"
              maxLength={4}
              placeholder="0000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoComplete="off"
              inputMode="numeric"
              aria-label="Enter 4-digit family code"
            />
          </div>
        )}

        {/* Error message */}
        {error && <p className="setup-error">{error}</p>}

        {/* Action button */}
        <button
          className={`btn ${role === 'parent' ? 'btn-danger' : 'btn-primary'}`}
          onClick={role === 'parent' ? handleCreateFamily : handleJoinFamily}
          disabled={loading}
          aria-label={role === 'parent' ? 'Create family' : 'Join family'}
        >
          {loading
            ? 'Connecting...'
            : role === 'parent'
            ? '🛡️ Create My Family Code'
            : '🔗 Join Family'}
        </button>

        {/* Back link */}
        <button
          className="btn btn-outline setup-back"
          onClick={() => navigate('/')}
          aria-label="Go back to home"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export default Setup;
