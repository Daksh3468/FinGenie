import React from 'react';

export default function Terms() {
  return (
    <div className="fade-in slide-up px-6 md:px-12 py-16" style={{maxWidth: '900px', margin: '0 auto'}}>
      <div className="sub-label" style={{color: 'var(--accent-blue)', fontSize: '13px', marginBottom: 'var(--space-xs)'}}>Governance Layer</div>
      <h1 className="big-title" style={{fontSize: '56px', marginBottom: 'var(--space-md)'}}>Terms of<br/><span className="green-text">Sovereign Engagement.</span></h1>
      
      <div className="card-light" style={{padding: 'var(--space-xl)', borderRadius: 'var(--radius-xl)'}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)'}}>
          <section>
            <h2 className="sub-label" style={{fontSize: '14px', marginBottom: 'var(--space-sm)', color: 'var(--bg-navy)'}}>01. Sovereign Data Ownership</h2>
            <p style={{fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7}}>
              By using FinGenie, you retain 100% ownership of any data uploaded. We do not claim any intellectual property rights over your financial inputs or the resulting intelligence reports. You grant us an ephemeral license to process data for the sole purpose of generating your requested analysis.
            </p>
          </section>

          <section>
            <h2 className="sub-label" style={{fontSize: '14px', marginBottom: 'var(--space-sm)', color: 'var(--bg-navy)'}}>02. Intelligence Accuracy</h2>
            <p style={{fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7}}>
              Our reports are generated using advanced neural architectures and Llama-based models. While we achieve high technical fidelity, these reports are for informational purposes only. FinGenie is not a substitute for professional legal, tax, or financial advice from certified public accountants.
            </p>
          </section>
 
          <section>
            <h2 className="sub-label" style={{fontSize: '14px', marginBottom: 'var(--space-sm)', color: 'var(--bg-navy)'}}>03. Prohibited Usage</h2>
            <p style={{fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7}}>
              Users agree not to utilize FinGenie for any illegal, fraudulent, or malicious data manipulation. Attempting to reverse-engineer our proprietary parsing logic or circumvent security sandboxes is strictly prohibited and will result in permanent node-level bans.
            </p>
          </section>
 
          <section>
            <h2 className="sub-label" style={{fontSize: '14px', marginBottom: 'var(--space-sm)', color: 'var(--bg-navy)'}}>04. Service Availability</h2>
            <p style={{fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7}}>
              We strive for institutional-grade uptime. However, service may be periodically interrupted for sovereign engine upgrades or security patches. FinGenie is not liable for any losses resulting from temporary service unavailability.
            </p>
          </section>
        </div>

        <div className="card-blue" style={{marginTop: 'var(--space-lg)', padding: 'var(--space-md)', textAlign: 'center'}}>
           <div style={{fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)', opacity: 0.6}}>
             LAST UPDATED: APRIL 08, 2024 / PROTOCOL v2.4
           </div>
        </div>
      </div>
    </div>
  );
}
