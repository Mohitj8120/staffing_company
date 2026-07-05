import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import InfoPage from './pages/InfoPage';
import AffiliatePage from './pages/AffiliatePage';

function App() {
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

