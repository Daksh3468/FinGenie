const SEVERITY_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '🔴', label: 'CRITICAL' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: '🟠', label: 'HIGH' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '🟡', label: 'MEDIUM' },
  low:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '🟢', label: 'LOW' },
};

export default function RiskCards({ risks }) {
  if (!risks || risks.length === 0) return null;

  return (
    <section className="card risk-section fade-in" id="risk-section">
      <div className="card-header">
        <span className="card-icon">⚠️</span>
        <h2>Risk Assessment</h2>
      </div>
      <div className="risk-grid">
        {risks.map((risk, idx) => {
          const config = SEVERITY_CONFIG[risk.severity] || SEVERITY_CONFIG.low;
          return (
            <div
              key={idx}
              className="risk-card"
              id={`risk-card-${idx}`}
              style={{
                borderLeft: `4px solid ${config.color}`,
                background: config.bg,
                animationDelay: `${idx * 0.12}s`,
              }}
            >
              <div className="risk-header">
                <span className="risk-icon">{config.icon}</span>
                <span className="risk-name">{risk.risk}</span>
                <span className="risk-badge" style={{ background: config.color }}>
                  {config.label}
                </span>
              </div>
              <p className="risk-description">{risk.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
