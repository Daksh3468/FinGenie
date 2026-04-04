export default function KPICards({ kpis }) {
  if (!kpis || kpis.length === 0) return null;

  return (
    <section className="kpi-section fade-in" id="kpi-section">
      <div className="section-header">
        <span className="card-icon">📈</span>
        <h2>Key Performance Indicators</h2>
      </div>
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`kpi-card kpi-${kpi.status}`}
            id={`kpi-card-${idx}`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="kpi-header">
              <span className="kpi-name">{kpi.name}</span>
              <span className={`kpi-trend trend-${kpi.trend}`}>
                {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}
              </span>
            </div>
            <div className="kpi-value">{kpi.formatted_value}</div>
            <div className="kpi-description">{kpi.description}</div>
            <div className={`kpi-status-bar status-${kpi.status}`}></div>
          </div>
        ))}
      </div>
    </section>
  );
}
