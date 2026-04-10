import React from 'react';

export default function Compliance() {
  return (
    <div className="fade-in slide-up px-6 md:px-12 py-16" style={{maxWidth: '1000px', margin: '0 auto'}}>
      <div className="sub-label" style={{color: 'var(--accent-blue)', fontSize: '13px', marginBottom: 'var(--space-xs)'}}>Institutional Trust</div>
      <h1 className="big-title" style={{fontSize: '56px', marginBottom: 'var(--space-md)'}}>Compliance &<br/><span style={{color: 'var(--text-muted)'}}>Security Standards.</span></h1>
      
      <div className="card-light" style={{padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-xl)'}}>
          <div>
            <div className="sub-label" style={{marginBottom: 'var(--space-sm)'}}>Trust Matrix</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-md)'}}>
              <div className="card-blue" style={{background: 'var(--bg-navy)', color: 'white', padding: 'var(--space-md)', textAlign: 'center'}}>
                 <div style={{fontSize: '32px', marginBottom: '8px'}}>🛡️</div>
                 <div style={{fontSize: '14px', fontWeight: 800, letterSpacing: '0.1em'}}>SOC2 TYPE II</div>
                 <div style={{fontSize: '10px', opacity: 0.5, marginTop: '4px'}}>(MOCK CERTIFICATION)</div>
              </div>
              <div className="card-blue" style={{padding: '24px', textAlign: 'center', border: '1px solid var(--accent-emerald)'}}>
                 <div style={{fontSize: '32px', marginBottom: '8px'}}>🔒</div>
                 <div style={{fontSize: '14px', fontWeight: 800, color: 'var(--accent-emerald)'}}>AES-256 E2EE</div>
              </div>
              <div className="card-blue" style={{padding: '24px', textAlign: 'center', border: '1px solid var(--accent-blue)'}}>
                 <div style={{fontSize: '32px', marginBottom: '8px'}}>☁️</div>
                 <div style={{fontSize: '14px', fontWeight: 800, color: 'var(--accent-blue)'}}>ISO 27001 ALIGN</div>
              </div>
            </div>
          </div>

          <div>
            <h2 style={{fontSize: '24px', fontWeight: 900, marginBottom: 'var(--space-md)', color: 'var(--bg-navy)'}}>Security Architecture</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)'}}>
              <div>
                <h3 className="sub-label" style={{fontSize: '12px', color: 'var(--accent-blue)'}}>Cloud Layer</h3>
                <p style={{fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6}}>
                  Our infrastructure is hosted on isolated, encrypted volumes with zero-persistence hardware. All data transmission occurs over TLS 1.3 with Perfect Forward Secrecy (PFS).
                </p>
              </div>
              <div>
                <h3 className="sub-label" style={{fontSize: '12px', color: 'var(--accent-blue)'}}>Encryption at Rest (Mock)</h3>
                <p style={{fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6}}>
                  While we don't store your files longer than the session, all in-memory processing utilizes hardware-level AES-256 encryption within sovereign compute nodes.
                </p>
              </div>
              <div>
                <h3 className="sub-label" style={{fontSize: '12px', color: 'var(--accent-blue)'}}>Compliance Purge</h3>
                <p style={{fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6}}>
                  Upon completion of an analysis report, our system initiates a multi-pass wipe of all scratch volumes used during the parsing phase, meeting NIST SP 800-88 guidelines for media sanitization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
