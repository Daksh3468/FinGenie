import { useState } from 'react';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import AISummary from './components/AISummary';
import KPICards from './components/KPICards';
import TrendChart from './components/TrendChart';
import RiskCards from './components/RiskCards';
import Recommendations from './components/Recommendations';
import { uploadAndAnalyze } from './api/client';
import './App.css';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleFileSelect = async (file) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await uploadAndAnalyze(file, apiKey || null);
      setResult(data);
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="hero" id="hero-header">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">✨ AI-Powered Financial Intelligence</div>
          <h1 className="hero-title">
            <span className="gradient-text">Fin</span>Genie
          </h1>
          <p className="hero-tagline">
            Upload any financial document — balance sheet, income statement, or cash flow report —
            and get instant AI-powered insights in plain English.
          </p>
          <div className="hero-pills">
            <span className="pill">📄 PDF</span>
            <span className="pill">📊 Excel</span>
            <span className="pill">📋 CSV</span>
            <span className="pill">🤖 AI Summary</span>
            <span className="pill">📈 KPIs</span>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────── */}
      <main className="main-content">

        {/* API Key Input */}
        <div className="api-key-section" id="api-key-section">
          <button
            className="api-key-toggle"
            onClick={() => setShowApiKey(!showApiKey)}
            id="toggle-api-key-btn"
          >
            🔑 {showApiKey ? 'Hide' : 'Set'} Groq API Key
          </button>
          {showApiKey && (
            <div className="api-key-input-wrapper fade-in">
              <input
                type="password"
                className="api-key-input"
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                id="api-key-input"
              />
              <p className="api-key-hint">
                Get a free key at{' '}
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">
                  console.groq.com
                </a>
                . You can also set <code>GROQ_API_KEY</code> in backend <code>.env</code>.
              </p>
            </div>
          )}
        </div>

        {/* File Upload */}
        <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

        {/* Loading State */}
        {isLoading && (
          <div className="loading-banner fade-in" id="loading-banner">
            <div className="loading-spinner" />
            <div className="loading-text">
              <p className="loading-title">Analyzing your document…</p>
              <p className="loading-sub">Extracting data → Computing KPIs → Generating AI insights</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-card fade-in" id="error-card">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Analysis Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* ─── Results ───────────────────────────────────────── */}
        {result && (
          <div id="results-section">
            <div className="results-header fade-in">
              <div className="results-badge">
                ✅ Analysis Complete — <strong>{result.statement_type}</strong> detected
              </div>
              {result.parsing_mode === 'text' && (
                <div className="mode-badge ai-extraction-badge fade-in" title="Extracted from raw text using AI">
                  🤖 AI Text Extraction
                </div>
              )}
              {result.parsing_mode === 'sec' && (
                <div className="mode-badge sec-data-badge fade-in" title="Processed from official SEC XBRL datasets">
                  🏛️ SEC XBRL Data
                </div>
              )}
            </div>

            <AISummary summary={result.summary} />
            <KPICards kpis={result.kpis} />
            <TrendChart rawData={result.raw_data} columns={result.column_headers} trends={result.trends} />
            <RiskCards risks={result.risks} />
            <Recommendations recommendations={result.recommendations} />
            <DataPreview data={result.raw_data} columns={result.column_headers} statementType={result.statement_type} />
          </div>
        )}
      </main>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="footer">
        <p>FinGenie — AI Financial Analyst · Built with FastAPI + React · Powered by Groq Llama 3.3</p>
      </footer>
    </div>
  );
}
