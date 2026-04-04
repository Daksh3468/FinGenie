export default function Recommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section className="card recommendations-card fade-in" id="recommendations-section">
      <div className="card-header">
        <span className="card-icon">💡</span>
        <h2>Actionable Recommendations</h2>
      </div>
      <div className="recommendations-list">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="recommendation-item"
            id={`recommendation-${idx}`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="rec-number">{idx + 1}</div>
            <p className="rec-text">{rec}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
