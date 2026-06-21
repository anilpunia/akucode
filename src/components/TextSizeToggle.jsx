import { useState, useEffect } from 'react';
import './TextSizeToggle.css';

const SIZES = ['normal', 'large', 'xl'];
const LABELS = { normal: 'A', large: 'A+', xl: 'A++' };
const ARIA  = { normal: 'Normal text size', large: 'Large text size', xl: 'Extra large text size' };

function applySize(size) {
  document.body.classList.remove('text-large', 'text-xl');
  if (size === 'large') document.body.classList.add('text-large');
  if (size === 'xl')    document.body.classList.add('text-xl');
}

export default function TextSizeToggle() {
  const [size, setSize] = useState(
    () => localStorage.getItem('kincode_text_size') || 'normal'
  );

  // Apply persisted size on first render
  useEffect(() => {
    applySize(size);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cycle = () => {
    const next = SIZES[(SIZES.indexOf(size) + 1) % SIZES.length];
    setSize(next);
    applySize(next);
    localStorage.setItem('kincode_text_size', next);
  };

  return (
    <button
      className={`text-size-toggle text-size-toggle--${size}`}
      onClick={cycle}
      aria-label={`${ARIA[size]}. Tap to increase.`}
      title="Toggle text size"
    >
      {LABELS[size]}
    </button>
  );
}
