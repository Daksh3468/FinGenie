export default function About() {
  return (
    <div className="fade-in slide-up" style={{maxWidth: '900px', margin: '80px auto'}}>
      <div className="sub-label" style={{color: 'var(--accent-blue)', fontSize: '13px', marginBottom: '8px'}}>The Mission</div>
      <h1 className="big-title" style={{fontSize: '56px', marginBottom: '32px'}}>Democratizing<br/><span className="green-text">Institutional Intel.</span></h1>
      
      <div className="card-light" style={{padding: '48px', borderRadius: 'var(--radius-xl)'}}>
        <div style={{marginBottom: '40px'}}>
          <h3 className="sub-label" style={{fontSize: '13px', marginBottom: '12px'}}>Mathematical Foundation</h3>
          <p style={{color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.7, marginBottom: '24px', fontWeight: 500}}>
            FinGenie was built on the premise that traditional GAAP accounting principles could be combined with modern Bayesian inference models to provide the most objective financial outlook possible.
          </p>
          <p style={{color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.7, fontWeight: 500}}>
            Our sovereign engine ingests complex datasets and maps proprietary data points into normalized vectors. We apply deep technical analysis—including Ratio Synthesis and Anomaly Detection—to build an actionable narrative.
          </p>
        </div>
        
        <div className="card-dark" style={{padding: '32px', borderRadius: 'var(--radius-lg)'}}>
          <h3 className="sub-label" style={{color: 'rgba(255,255,255,0.4)', fontSize: '12px'}}>Security & Privacy Ethics</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px'}}>
            <div style={{display: 'flex', gap: '16px'}}>
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
