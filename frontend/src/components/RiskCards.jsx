const SEVERITY_CONFIG = {
  critical: { color: 'var(--accent-rose)', bg: 'rgba(239,68,68,0.05)', icon: '🔴', label: 'CRITICAL' },
  high:     { color: 'var(--accent-cyan)', bg: 'rgba(6,182,212,0.05)', icon: '🟠', label: 'HIGH' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.05)', icon: '🟡', label: 'MEDIUM' },
  low:      { color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.05)', icon: '🟢', label: 'LOW' },
};

export default function RiskCards({ risks }) {
  if (!risks || risks.length === 0) return null;

  return (
    <div className="fade-in slide-up" style={{ marginBottom: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-md)' }}>
        <span style={{ fontSize: '28px' }}>⚠️</span>
        <h2 className="sub-label" style={{ margin: 0, color: 'var(--bg-navy)' }}>Risk Assessment</h2>
      </div>
      <div className="grid-2x2" style={{ gap: 'var(--space-md)' }}>
        {risks.map((risk, idx) => {
          const config = SEVERITY_CONFIG[risk.severity] || SEVERITY_CONFIG.low;
          return (
            <div
              key={idx}
              className="card-light hover-lift"
              style={{
                borderLeft: `4px solid ${config.color}`,
                padding: 'var(--space-md)',
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{config.icon}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{risk.risk}</h3>
                </div>
                <span style={{ background: config.color, color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.05em' }}>
                  {config.label}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{risk.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
