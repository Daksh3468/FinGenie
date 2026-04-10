export default function AISummary({ summary }) {
  if (!summary) return null;

  return (
    <div className="card-light fade-in hover-lift" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-lg)', border: '1px solid var(--border-light)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🤖</span>
          <h2 className="sub-label" style={{ margin: 0, color: 'var(--accent-blue)' }}>AI NARRATIVE SYNTHESIS</h2>
        </div>
        <span style={{ padding: '6px 12px', background: 'var(--bg-blue-light)', color: 'var(--accent-blue)', borderRadius: '12px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Powered by AI</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-blue-light)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', border: '1px solid hsl(var(--p-h), 100%, 94%)' }}>
        {summary.split('\n').map((paragraph, idx) => (
          paragraph.trim() ? <p key={idx} style={{ fontSize: '18px', color: 'var(--text-primary)', lineHeight: 1.8, fontStyle: 'italic', fontWeight: 500 }}>"{paragraph}"</p> : null
        ))}
      </div>
    </div>
  );
}
