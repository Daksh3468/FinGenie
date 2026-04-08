import React from 'react';

export default function Privacy() {
  return (
    <div className="fade-in slide-up" style={{maxWidth: '900px', margin: '60px auto'}}>
      <div className="sub-label" style={{color: 'var(--accent-emerald)', fontSize: '13px', marginBottom: '8px'}}>Governance & Privacy</div>
      <h1 className="big-title" style={{fontSize: '56px', marginBottom: '32px'}}>Zero-Retention<br/><span style={{color: 'var(--text-secondary)'}}>Sovereign Protocol.</span></h1>
      
      <div className="card-light" style={{padding: '48px', borderRadius: 'var(--radius-xl)'}}>
        <div className="mb-12">
          <h2 className="sub-label" style={{fontSize: '14px', marginBottom: '16px', color: 'var(--bg-navy)'}}>Data Philosophy</h2>
          <p style={{fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px'}}>
            At FinGenie, we believe financial data belongs exclusively to its creator. Our infrastructure is engineered to process information, not store it. We maintain no persistent databases of uploaded financial artifacts.
          </p>
        </div>

        <div className="grid-2x2" style={{gap: '32px', marginBottom: '48px'}}>
          <div className="card-blue" style={{background: 'hsl(var(--p-h), 100%, 98%)', padding: '32px'}}>
            <h3 style={{fontSize: '18px', fontWeight: 900, marginBottom: '12px'}}>Ephemeral Sandboxing</h3>
            <p style={{fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6}}>
              Every file upload triggers an isolated compute sandbox. Once you navigate away or close the tab, the sandbox and all associated metadata are purged instantly.
            </p>
          </div>
          <div className="card-blue" style={{background: 'hsl(var(--p-h), 100%, 98%)', padding: '32px'}}>
            <h3 style={{fontSize: '18px', fontWeight: 900, marginBottom: '12px'}}>No-Tracking Policy</h3>
            <p style={{fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6}}>
              We do not use tracking pixels, cookies, or any form of behavioral analysis. Your interactions with the "Sovereign Intelligence" engine are private and non-attributable.
            </p>
          </div>
        </div>

        <div className="card-dark" style={{padding: '40px'}}>
          <h3 className="sub-label" style={{color: 'rgba(255,255,255,0.4)', marginBottom: '16px', fontSize: '12px'}}>Technical Safeguards</h3>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <li style={{display: 'flex', gap: '16px'}}>
              <div style={{color: 'var(--accent-emerald)', fontSize: '20px'}}>✔</div>
              <div style={{fontSize: '15px', color: '#e5e7eb'}}><strong>LLM Isolation:</strong> Proprietary models run on dedicated, non-training nodes.</div>
            </li>
            <li style={{display: 'flex', gap: '16px'}}>
              <div style={{color: 'var(--accent-emerald)', fontSize: '20px'}}>✔</div>
              <div style={{fontSize: '15px', color: '#e5e7eb'}}><strong>Traffic Purge:</strong> All API requests for analysis are encrypted via TLS 1.3 and deleted upon response.</div>
            </li>
            <li style={{display: 'flex', gap: '16px'}}>
              <div style={{color: 'var(--accent-emerald)', fontSize: '20px'}}>✔</div>
              <div style={{fontSize: '15px', color: '#e5e7eb'}}><strong>Source Fidelity:</strong> Raw files are never saved to disk; they exist only in volatile memory during parsing.</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
