import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import InfoPage from './pages/InfoPage';
import AffiliatePage from './pages/AffiliatePage';
import { captureFromURL } from './utils/affiliateTracker';
import { API_BASE_URL } from './config';

function App() {
  // Capture affiliate referral from URL globally on app mount
  useEffect(() => {
    const ref = captureFromURL();
    if (ref) {
      // Track the click with the backend immediately
      fetch(`${API_BASE_URL}/api/affiliate/track-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: ref,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null
        })
      }).catch((err) => {
        console.error("[Affiliate] Click tracking failed:", err);
      });
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/affiliate" element={<AffiliatePage />} />
      <Route path="/about" element={<InfoPage />} />
      <Route path="/faq" element={<InfoPage />} />
      <Route path="/terms" element={<InfoPage />} />
      <Route path="/privacy" element={<InfoPage />} />
      <Route path="/refund" element={<InfoPage />} />
      <Route path="/cookies" element={<InfoPage />} />
    </Routes>
  );
}

export default App;

