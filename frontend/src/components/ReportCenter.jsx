import { useState } from 'react';
import BoardroomPDF from './BoardroomPDF';
import AnalystDeck from './AnalystDeck';
import EmailDigest from './EmailDigest';

export default function ReportCenter({ analysisResult }) {
  const [activeLayer, setActiveLayer] = useState(1);

  if (!analysisResult) return null;

  const layers = [
    { id: 1, num: 'Layer 1', icon: '📋', title: 'Boardroom PDF' },
    { id: 2, num: 'Layer 2', icon: '📊', title: 'Analyst Deck' },
    { id: 3, num: 'Layer 3', icon: '📧', title: 'Email Digest' },
  ];

  return (
    <section className="card report-center-card fade-in" id="report-center-section">
      {/* Header */}
      <div className="rc-header">
        <div className="rc-logo">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M9 12h6M9 16h6M9 8h3M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
              stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="rc-header-text">
          <h2>Report Center</h2>
          <p>Three export layers — pick your format, configure, generate</p>
        </div>
      </div>

      {/* Layer Navigation */}
      <div className="layers-nav">
        {layers.map(layer => (
          <button
            key={layer.id}
            className={`layer-tab ${activeLayer === layer.id ? 'active' : ''}`}
            onClick={() => setActiveLayer(layer.id)}
          >
            <div className="lt-num">{layer.num}</div>
            <span className="lt-icon">{layer.icon}</span>
            <div className="lt-title">{layer.title}</div>
          </button>
        ))}
      </div>

      {/* Layer Panels */}
      <div className="layer-panels">
        {activeLayer === 1 && <BoardroomPDF analysisResult={analysisResult} />}
        {activeLayer === 2 && <AnalystDeck analysisResult={analysisResult} />}
        {activeLayer === 3 && <EmailDigest analysisResult={analysisResult} />}
      </div>
    </section>
  );
}
