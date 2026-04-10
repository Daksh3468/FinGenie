export default function About() {
  return (
    <div className="fade-in slide-up px-6 md:px-12 py-16" style={{maxWidth: '900px', margin: '0 auto'}}>
      <div className="sub-label" style={{color: 'var(--accent-blue)', fontSize: '13px', marginBottom: 'var(--space-xs)'}}>The Mission</div>
      <h1 className="big-title" style={{fontSize: '56px', marginBottom: 'var(--space-md)'}}>Democratizing<br/><span className="green-text">Institutional Intel.</span></h1>
      
      <div className="card-light" style={{padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)'}}>
        <div style={{marginBottom: 'var(--space-lg)'}}>
          <h3 className="sub-label" style={{fontSize: '13px', marginBottom: 'var(--space-sm)'}}>Mathematical Foundation</h3>
          <p style={{color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.7, marginBottom: 'var(--space-md)', fontWeight: 500}}>
            FinGenie was built on the premise that traditional GAAP accounting principles could be combined with modern Bayesian inference models to provide the most objective financial outlook possible.
          </p>
          <p style={{color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.7, fontWeight: 500}}>
            Our sovereign engine ingests complex datasets and maps proprietary data points into normalized vectors. We apply deep technical analysis—including Ratio Synthesis and Anomaly Detection—to build an actionable narrative.
          </p>
        </div>
        
        <div className="card-dark" style={{padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)'}}>
          <h3 className="sub-label" style={{color: 'rgba(255,255,255,0.4)', fontSize: '12px'}}>Security & Privacy Ethics</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)'}}>
            <div style={{display: 'flex', gap: 'var(--space-md)'}}>
              <div style={{fontSize: '24px'}}>🛡</div>
              <div>
                <strong style={{color: 'white', display: 'block', marginBottom: '4px', fontSize: '16px'}}>Edge Encryption</strong>
                <span style={{color: '#9ca3af', fontSize: '13px'}}>Files are tokenized client-side before processing.</span>
              </div>
            </div>
            <div style={{display: 'flex', gap: '16px'}}>
              <div style={{fontSize: '24px'}}>🧼</div>
              <div>
                <strong style={{color: 'white', display: 'block', marginBottom: '4px', fontSize: '16px'}}>Zero-Knowledge</strong>
                <span style={{color: '#9ca3af', fontSize: '13px'}}>Artifacts are purged continuously after the session ends.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
