import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import JsonFormatter from './components/JsonFormatter';
import Decoder from './components/Decoder';
import CurlConverter from './components/CurlConverter';
import RegexTester from './components/RegexTester';
import ColorPicker from './components/ColorPicker';
import MarkdownPreview from './components/MarkdownPreview';
import ApiTester from './components/ApiTester';
import Home from './components/Home';
import './App.css';

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for menu navigation events from Electron
    if (window.electronAPI) {
      const handleNavigate = (event, route) => {
        navigate(route);
      };

      window.electronAPI.onNavigateTo(handleNavigate);

      return () => {
        window.electronAPI.removeAllListeners('navigate-to');
      };
    }
  }, [navigate]);

  const location = useLocation();
  const fullscreenRoutes = ['/api-tester'];
  const isFullscreen = fullscreenRoutes.includes(location.pathname);

  return (
    <div className="app">
      <Sidebar />
      <main className={`main-content${isFullscreen ? ' main-content--fullscreen' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/json-formatter" element={<JsonFormatter />} />
          <Route path="/decoder" element={<Decoder />} />
          <Route path="/curl-converter" element={<CurlConverter />} />
          <Route path="/regex-tester" element={<RegexTester />} />
          <Route path="/color-picker" element={<ColorPicker />} />
          <Route path="/markdown-preview" element={<MarkdownPreview />} />
          <Route path="/api-tester" element={<ApiTester />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 