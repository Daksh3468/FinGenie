import { useState, useEffect } from 'react';
import Home from './components/Home';
import About from './components/About';
import Analyzer from './components/Analyzer';
import TrendsAudit from './components/TrendsAudit';
import RiskAssessment from './components/RiskAssessment';
import Privacy from './components/Privacy';
import Compliance from './components/Compliance';
import Terms from './components/Terms';
import { uploadAndAnalyze } from './api/client';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Hash Routing Sync ---
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['home', 'about', 'analyzer', 'trends', 'risk', 'privacy', 'compliance', 'terms'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      } else if (!hash) {
        setActiveTab('home');
      }
    };

    // Initialize on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync scroll on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const navigateTo = (tab) => {
    window.location.hash = tab === 'home' ? '' : tab;
  };

  const handleFileSelect = async (file) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await uploadAndAnalyze(file, '');
      setResult(data);
      navigateTo('analyzer');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeNew = () => {
    setResult(null);
    navigateTo('home');
  };

  return (
    <div className="app-container">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="navbar">
        <div 
          className="brand-text" 
          onClick={() => navigateTo('home')}
          style={{ cursor: 'pointer' }}
        >
          FinGenie
        </div>
        
        <nav className="nav-links">
          {result && (
            <>
              <button 
                className={`nav-item ${activeTab === 'analyzer' ? 'active' : ''}`}
                onClick={() => navigateTo('analyzer')}
              >
                Analyzer
              </button>
              <button 
                className={`nav-item ${activeTab === 'trends' ? 'active' : ''}`}
                onClick={() => navigateTo('trends')}
              >
                Trends
              </button>
              <button 
                className={`nav-item ${activeTab === 'risk' ? 'active' : ''}`}
                onClick={() => navigateTo('risk')}
              >
                Risk
              </button>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {result && (
            <button className="btn-dark" onClick={handleAnalyzeNew}>Analyze New File</button>
          )}
        </div>
      </header>

      {/* ─── Main Content Views ─────────────────────────────── */}
      <main className="main-content">
        {activeTab === 'home' && (
           <Home onFileSelect={handleFileSelect} isLoading={isLoading} error={error} />
        )}
        {activeTab === 'about' && <About />}
        {activeTab === 'analyzer' && result && <Analyzer result={result} />}
        {activeTab === 'trends' && result && <TrendsAudit result={result} />}
        {activeTab === 'risk' && result && <RiskAssessment result={result} />}
        {activeTab === 'privacy' && <Privacy />}
        {activeTab === 'compliance' && <Compliance />}
        {activeTab === 'terms' && <Terms />}
      </main>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="footer-content" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div className="footer-left" style={{display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start'}}>
            <div className="brand-text" style={{fontSize: '24px', color: 'var(--text-white)', cursor: 'pointer'}} onClick={() => navigateTo('home')}>FinGenie</div>
            <div className="footer-copyright" style={{fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.04em'}}>
              © 2024 FINGENIE FINANCIAL UTILITIES. ALL RIGHTS RESERVED.
            </div>
          </div>

          <div className="footer-right" style={{display: 'flex', gap: '0', alignItems: 'center'}}>
            <span className="footer-link" onClick={() => navigateTo('about')}>About</span>
            <span className="footer-link" onClick={() => navigateTo('privacy')}>Privacy</span>
            <span className="footer-link" onClick={() => navigateTo('compliance')}>Compliance</span>
            <span className="footer-link" onClick={() => navigateTo('terms')}>Terms</span>
            <div className="footer-socials" style={{marginLeft: '16px'}}>
              <div className="social-icon">𝕏</div>
              <div className="social-icon">in</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
