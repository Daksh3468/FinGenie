import React from 'react';

export default function Compliance() {
  return (
    <div className="fade-in slide-up" style={{maxWidth: '1000px', margin: '60px auto'}}>
      <div className="sub-label" style={{color: 'var(--accent-blue)', fontSize: '13px', marginBottom: '8px'}}>Institutional Trust</div>
      <h1 className="big-title" style={{fontSize: '56px', marginBottom: '32px'}}>Compliance &<br/><span style={{color: 'var(--text-muted)'}}>Security Standards.</span></h1>
      
      <div className="card-light" style={{padding: '56px', borderRadius: 'var(--radius-xl)'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '60px'}}>
          <div>
            <div className="sub-label" style={{marginBottom: '16px'}}>Trust Matrix</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div className="card-blue" style={{background: 'var(--bg-navy)', color: 'white', padding: '24px', textAlign: 'center'}}>
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
            <h2 style={{fontSize: '24px', fontWeight: 900, marginBottom: '24px', color: 'var(--bg-navy)'}}>Security Architecture</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
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
