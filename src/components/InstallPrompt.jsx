import { useState, useEffect } from 'react';
import './InstallPrompt.css';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS Safari (no beforeinstallprompt event on iOS)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    const inStandaloneMode = window.navigator.standalone === true;
    const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');

    if (ios && !inStandaloneMode && !dismissed) {
      setIsIOS(true);
      setVisible(true);
    }

    // Android Chrome: listen for the native install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('pwa-prompt-dismissed', '1');
  };

  if (!visible) return null;

  return (
    <div className="install-prompt" role="banner" aria-label="Install KinCode app">
      <div className="install-prompt-icon">🛡️</div>
      <div className="install-prompt-text">
        <p className="install-prompt-title">Add KinCode to Home Screen</p>
        <p className="install-prompt-sub">
          {isIOS
            ? 'Tap Share → "Add to Home Screen" for one-tap access'
            : 'Install for instant one-tap access during scam calls'}
        </p>
      </div>
      <div className="install-prompt-actions">
        {!isIOS && (
          <button
            className="install-btn install-btn-primary"
            onClick={handleInstall}
            aria-label="Install KinCode as an app"
          >
            Install
          </button>
        )}
        <button
          className="install-btn install-btn-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
