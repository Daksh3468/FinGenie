export default function Recommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="fade-in slide-up" style={{ marginBottom: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-md)' }}>
        <span style={{ fontSize: '28px' }}>💡</span>
        <h2 className="sub-label" style={{ margin: 0, color: 'var(--bg-navy)' }}>Actionable Recommendations</h2>
      </div>
      <div className="card-light" style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="hover-lift"
            style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', animationDelay: `${idx * 0.1}s`, padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.5)' }}
          >
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-blue)', fontFamily: 'Outfit', opacity: 0.8 }}>
              0{idx + 1}
            </div>
            <div style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.7, fontWeight: 500 }}>
              {rec}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
