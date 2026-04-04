export default function AISummary({ summary }) {
  if (!summary) return null;

  return (
    <section className="card ai-summary-card fade-in" id="ai-summary-section">
      <div className="card-header">
        <span className="card-icon">🤖</span>
        <h2>AI Analysis Summary</h2>
        <span className="badge badge-ai">Powered by AI</span>
      </div>
      <div className="summary-content">
        {summary.split('\n').map((paragraph, idx) => (
          paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
        ))}
      </div>
    </section>
  );
}
