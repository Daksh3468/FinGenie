import FileUpload from './FileUpload';

export default function Home({ onFileSelect, isLoading, error }) {
  return (
    <div className="analyzer-landing fade-in slide-up">
      {/* --- Hero Section --- */}
      <div className="landing-hero" style={{marginBottom: '64px'}}>
        <div className="hero-text-section">
          <div className="hero-badge">Sovereign Financial Intelligence</div>
          <h1 className="hero-title">Financial Logic.<br/>Automated.</h1>
          <p className="hero-subtitle">
            Securely process PDF, Excel, and SEC datasets through our sovereign analysis engine. Instant transparency for founders, analysts, and treasury teams.
          </p>
          <div className="hero-features" style={{gap: '24px'}}>
            <div className="hero-feat-item">
              <span className="feat-num">01</span> AES-256 Multi-Layer Processing
            </div>
            <div className="hero-feat-item">
              <span className="feat-num">02</span> Zero-Knowledge Data Retention
            </div>
          </div>
        </div>

        <div className="upload-card">
          <div className="card-light" style={{padding: '40px', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', alignItems: 'center'}}>
            <div style={{position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--bg-blue-light)', borderRadius: '50%', zIndex: 0}}></div>
            <div style={{position: 'relative', zIndex: 1, width: '100%'}}>
              <h2 className="upload-title" style={{fontSize: '36px', textAlign: 'left', marginBottom: '8px', color: 'var(--bg-navy)'}}>Upload Ledger</h2>
              <p className="upload-desc" style={{textAlign: 'left', marginBottom: '24px', fontSize: '16px', color: 'var(--text-secondary)'}}>PDF, XLSX, CSV, or SEC datasets</p>
              
              <FileUpload onFileSelect={onFileSelect} isLoading={isLoading} />
              
              {error && (
                <div className="fade-in" style={{marginTop: '24px', padding: '16px', background: 'hsl(0, 100%, 98%)', color: 'var(--accent-rose)', border: '1px solid hsl(0, 100%, 94%)', borderRadius: '12px', fontSize: '15px', textAlign: 'left', fontWeight: 600}}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* --- Intelligence Capabilities --- */}
      <div style={{marginTop: '100px'}}>
        <div style={{textAlign: 'center', marginBottom: '60px'}}>
          <div className="sub-label">Intelligence Layer</div>
          <h2 className="big-title" style={{fontSize: '48px'}}>Core Capabilities.</h2>
        </div>

        <div className="grid-2x2" style={{gap: '32px'}}>
          <div className="card-light">
             <div style={{fontSize: '32px', marginBottom: '20px'}}>📄</div>
             <h3 className="w-title" style={{fontSize: '20px', marginBottom: '12px'}}>PDF & Excel Synthesis</h3>
             <p className="w-desc" style={{fontSize: '15px', lineHeight: 1.6}}>High-fidelity extraction maps fragmented items into normalized data vectors.</p>
          </div>
          <div className="card-light">
             <div style={{fontSize: '32px', marginBottom: '20px'}}>🏛️</div>
             <h3 className="w-title" style={{fontSize: '20px', marginBottom: '12px'}}>SEC XBRL Support</h3>
             <p className="w-desc" style={{fontSize: '15px', lineHeight: 1.6}}>Direct support for official SEC datasets (SUB, NUM, TAG, PRE) for instant reports.</p>
          </div>
          <div className="card-light">
             <div style={{fontSize: '32px', marginBottom: '20px'}}>🧠</div>
             <h3 className="w-title" style={{fontSize: '20px', marginBottom: '12px'}}>AI Logic Synthesis</h3>
             <p className="w-desc" style={{fontSize: '15px', lineHeight: 1.6}}>Llama 3.3 models generate executive summaries identifying hidden risks.</p>
          </div>
          <div className="card-light">
             <div style={{fontSize: '32px', marginBottom: '20px'}}>📈</div>
             <h3 className="w-title" style={{fontSize: '20px', marginBottom: '12px'}}>Visual Analytics</h3>
             <p className="w-desc" style={{fontSize: '15px', lineHeight: 1.6}}>Instant charting of liquidity health and velocity using institutional wrappers.</p>
          </div>
        </div>
      </div>

      {/* --- Automated Pipeline --- */}
      <div className="workflow-section" style={{marginTop: '100px'}}>
        <div style={{textAlign: 'center', marginBottom: '60px'}}>
          <div className="sub-label">Proprietary Methodology</div>
          <h2 className="big-title" style={{fontSize: '48px'}}>Automated Pipeline.</h2>
        </div>
        
        <div className="workflow-cards" style={{gap: '40px'}}>
          <div className="w-card scale-in" style={{padding: '40px', animationDelay: '0.1s'}}>
            <div className="w-icon" style={{fontSize: '40px', marginBottom: '24px'}}>📥</div>
            <div className="w-title" style={{fontSize: '18px', fontWeight: 800, marginBottom: '12px'}}>Phase 01. Ingestion</div>
            <div className="w-desc" style={{fontSize: '15px', lineHeight: 1.6}}>Documents are parsed in ephemeral sandboxes. Supports standard GAAP and custom formats.</div>
          </div>
          <div className="w-card dark scale-in" style={{padding: '40px', animationDelay: '0.2s'}}>
            <div className="w-icon" style={{fontSize: '40px', marginBottom: '24px'}}>⚙️</div>
            <div className="w-title" style={{fontSize: '18px', fontWeight: 800, marginBottom: '12px'}}>Phase 02. Logic Mapping</div>
            <div className="w-desc" style={{fontSize: '15px', lineHeight: 1.6}}>Neural architectures reorganize raw counts into KPIs like Burn and Runway.</div>
          </div>
          <div className="w-card scale-in" style={{padding: '40px', animationDelay: '0.3s'}}>
            <div className="w-icon" style={{fontSize: '40px', marginBottom: '24px'}}>📄</div>
            <div className="w-title" style={{fontSize: '18px', fontWeight: 800, marginBottom: '12px'}}>Phase 03. Artifacts</div>
            <div className="w-desc" style={{fontSize: '15px', lineHeight: 1.6}}>Interactive dashboards featuring AI-detected risk vectors and trend audits.</div>
          </div>
        </div>
      </div>

      {/* --- Privacy Section --- */}
      <div style={{marginTop: '100px', padding: '80px 0', background: 'var(--bg-navy)', borderRadius: 'var(--radius-xl)', color: 'white', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', bottom: '-80px', right: '-80px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%'}}></div>
        <div style={{padding: '0 80px', position: 'relative', zIndex: 1}}>
          <div className="grid-cols-12" style={{alignItems: 'center', gap: '80px'}}>
            <div className="col-span-6">
              <div className="sub-label" style={{color: 'var(--accent-emerald)'}}>Sovereignty & Trust</div>
              <h2 className="big-title" style={{color: 'white', fontSize: '48px', marginBottom: '24px'}}>Your data stays yours.</h2>
              <p style={{fontSize: '18px', opacity: 0.7, lineHeight: 1.7, marginBottom: '40px'}}>
                Built on zero-retention architecture. We utilize edge-compute to tokenize data. Once session ends, artifacts are purged from sovereign nodes.
              </p>
              <div style={{display: 'flex', gap: '40px'}}>
                <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                  <div style={{width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-emerald)'}}></div>
                  <span style={{fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em'}}>SOC2 COMPLIANT MOCK</span>
                </div>
                <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                  <div style={{width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-emerald)'}}></div>
                  <span style={{fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em'}}>AES-256 ENCRYPTED</span>
                </div>
              </div>
            </div>
            <div className="col-span-6">
               <div className="card-light" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '48px'}}>
                  <h3 className="sub-label" style={{color: 'white'}}>Cloud Security</h3>
                  <div style={{marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    <div style={{background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px'}}>
                      <div style={{fontWeight: 800, fontSize: '18px', marginBottom: '8px'}}>Isolated Sandbox</div>
                      <div style={{fontSize: '14px', opacity: 0.6}}>Every file is analyzed in ephemeral compute.</div>
                    </div>
                    <div style={{background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px'}}>
                      <div style={{fontWeight: 800, fontSize: '18px', marginBottom: '8px'}}>Tokenized Ledger</div>
                      <div style={{fontSize: '14px', opacity: 0.6}}>Ledger hashed before processing by nodes.</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FAQ Section --- */}
      <div style={{marginTop: '100px', maxWidth: '900px', margin: '100px auto 100px auto'}}>
        <div style={{textAlign: 'center', marginBottom: '60px'}}>
           <div className="sub-label">Information Hub</div>
           <h2 className="big-title" style={{fontSize: '44px'}}>Common Questions.</h2>
        </div>
        
        <div className="faq-item" style={{padding: '32px 0'}}>
          <div className="faq-question" style={{fontSize: '20px'}}>What file formats are supported?</div>
          <div className="faq-answer" style={{fontSize: '16px', marginTop: '8px'}}>PDF statements, XLSX workbooks, CSV extracts, and SEC XBRL ZIP datasets. Supports raw text extraction for table-less docs.</div>
        </div>
        <div className="faq-item" style={{padding: '32px 0'}}>
          <div className="faq-question" style={{fontSize: '20px'}}>Is my data shared with AI models?</div>
          <div className="faq-answer" style={{fontSize: '16px', marginTop: '8px'}}>Utilizes dedicated private instances. Data is processed in-memory and never used for training or stored persistently.</div>
        </div>
        <div className="faq-item" style={{padding: '32px 0'}}>
          <div className="faq-question" style={{fontSize: '20px'}}>How accurate are the extracted KPIs?</div>
          <div className="faq-answer" style={{fontSize: '16px', marginTop: '8px'}}>99.9% verifiable source fidelity. Review the "Raw Data Ledger" section to confirm against source.</div>
        </div>
      </div>
    </div>
  );
}
