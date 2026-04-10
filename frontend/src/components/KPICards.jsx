export default function KPICards({ kpis }) {
  if (!kpis || kpis.length === 0) return null;

  return (
    <div className="fade-in slide-up" style={{ marginBottom: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-md)' }}>
        <span style={{ fontSize: '28px' }}>📈</span>
        <h2 className="sub-label" style={{ margin: 0, color: 'var(--bg-navy)' }}>Key Performance Indicators</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
        {kpis.map((kpi, idx) => {
          const isUp = kpi.trend === 'up';
          const trendColor = isUp ? 'var(--accent-emerald)' : kpi.trend === 'down' ? 'var(--accent-rose)' : 'var(--text-muted)';
          return (
            <div
              key={idx}
              className="card-blue hover-lift"
              style={{ animationDelay: `${idx * 0.1}s`, padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '64px', opacity: 0.05 }}>📊</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                 <div className="sub-label" style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{kpi.name}</div>
                 <div style={{ fontSize: '14px', fontWeight: 900, color: trendColor }}>
                   {isUp ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
                 </div>
              </div>
              <div className="metric-big" style={{ fontSize: '40px', marginBottom: '8px' }}>{kpi.formatted_value || kpi.value}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{kpi.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
