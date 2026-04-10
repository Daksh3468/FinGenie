import FileUpload from './FileUpload';

export default function Home({ onFileSelect, isLoading, error }) {
  const scrollToUpload = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="analyzer-landing">
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="landing-hero" style={{ padding: 'var(--space-md) 0 var(--space-lg) 0' }}>
        <div className="hero-text-section slide-up">
          <div className="hero-badge" style={{ marginBottom: 'var(--space-sm)' }}>Sovereign Financial Intelligence</div>
          <h1 className="hero-title" style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.1, marginBottom: 'var(--space-xs)' }}>
            Turn Financial Statements into <span style={{ color: 'var(--accent-blue)' }}>Actionable Insights</span>
          </h1>
          <p className="hero-subtitle" style={{ fontSize: '16px', marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
            Upload PDFs, Excel sheets, or SEC filings — instantly extract KPIs, detect risks, and generate executive-ready summaries.
          </p>
          
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
            <button className="btn-primary" onClick={scrollToUpload}>
              Upload Financials →
            </button>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></div>
              No signup required
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></div>
              AES-256 encrypted
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></div>
              Zero data retention
            </span>
          </div>
        </div>

        <div className="upload-card slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-light glass-glow" style={{ padding: 'var(--space-md)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 className="upload-title" style={{ fontSize: '24px', marginBottom: 'var(--space-xs)', color: 'var(--bg-navy)' }}>Analyze Document</h2>
              <p className="upload-desc" style={{ marginBottom: 'var(--space-sm)', fontSize: '14px', color: 'var(--text-secondary)' }}>Get started by dropping your ledger below</p>
              
              <FileUpload onFileSelect={onFileSelect} isLoading={isLoading} />
              
              {error && (
                <div className="animate-fade-in-up" style={{ marginTop: '24px', padding: '16px', background: 'hsl(0, 100%, 98%)', color: 'var(--accent-rose)', border: '1px solid hsl(0, 100%, 94%)', borderRadius: '12px', fontSize: '15px', fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ─── Outcome-Driven Features ────────────────────────── */}
      <section style={{ padding: 'var(--space-md) 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div className="sub-label">Capabilities</div>
          <h2 className="big-title">Built for Performance.</h2>
        </div>

        <div className="grid-2x2" style={{ gap: 'var(--space-lg)' }}>
          <div className="card-light hover-lift">
             <div style={{ fontSize: '32px', marginBottom: 'var(--space-md)' }}>⚡</div>
             <h3 style={{ fontSize: '22px', marginBottom: 'var(--space-xs)' }}>No Manual Entry</h3>
             <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Upload fragmented statements and get structured, audit-ready data instantly. Skip the modeling grunt work.</p>
          </div>
          <div className="card-light hover-lift">
             <div style={{ fontSize: '32px', marginBottom: 'var(--space-md)' }}>🎯</div>
             <h3 style={{ fontSize: '22px', marginBottom: 'var(--space-xs)' }}>Automated Anomalies</h3>
             <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Identify risks, trends, and financial outliers automatically before they become institutional liabilities.</p>
          </div>
          <div className="card-light hover-lift">
             <div style={{ fontSize: '32px', marginBottom: 'var(--space-md)' }}>📊</div>
             <h3 style={{ fontSize: '22px', marginBottom: 'var(--space-xs)' }}>Clean Dashboards</h3>
             <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Instant visualization for liquidity, burn rate, and performance momentum using institutional standard design.</p>
          </div>
          <div className="card-light hover-lift">
             <div style={{ fontSize: '32px', marginBottom: 'var(--space-md)' }}>🏛️</div>
             <h3 style={{ fontSize: '22px', marginBottom: 'var(--space-xs)' }}>SEC-Ready Intelligence</h3>
             <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Process massive XBRL datasets (10-K, 10-Q) and generate competitive landscape reports in seconds.</p>
          </div>
        </div>
      </section>

      {/* ─── Storytelling Pipeline ─────────────────────────── */}
      <section style={{ padding: 'var(--space-md) 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div className="sub-label">Implementation</div>
          <h2 className="big-title">Three Steps to Insight.</h2>
        </div>
        
        <div className="pipeline-container">
          <div className="pipeline-step card-light hover-lift">
            <div style={{ fontSize: '40px', marginBottom: 'var(--space-md)' }}>📥</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>01. Instant Ingestion</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Drag and drop any financial PDF or Excel. Our engine normalizes fragmented line items in real-time.</p>
          </div>
          <div className="pipeline-connector" style={{ marginTop: 'calc(var(--space-md) + 12px)' }}></div>
          <div className="pipeline-step card-dark glass-glow hover-lift" style={{ background: 'var(--gradient-dark)' }}>
            <div style={{ fontSize: '40px', marginBottom: 'var(--space-md)' }}>⚙️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: 'var(--space-xs)', color: 'white' }}>02. AI Processing</h3>
            <p style={{ fontSize: '15px', opacity: 0.7, lineHeight: 1.6 }}>Logic mapping reorganizes raw ledger counts into high-fidelity KPIs using sovereign neural nodes.</p>
          </div>
          <div className="pipeline-connector" style={{ marginTop: 'calc(var(--space-md) + 12px)' }}></div>
          <div className="pipeline-step card-light hover-lift">
            <div style={{ fontSize: '40px', marginBottom: 'var(--space-md)' }}>💎</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>03. Executive Artifacts</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>Receive custom-tailored dashboards featuring AI-detected risk vectors and trend audit visualizations.</p>
          </div>
        </div>
      </section>

      {/* ─── Use Cases ─────────────────────────────────────── */}
      <section style={{ padding: 'var(--space-md) 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div className="sub-label">Community</div>
          <h2 className="big-title">Built for Decision Makers.</h2>
        </div>

        <div className="grid-cols-12" style={{ gap: 'var(--space-lg)' }}>
          <div className="col-span-4 card-light hover-lift" style={{ borderLeft: '4px solid var(--accent-blue)', padding: 'var(--space-lg)' }}>
             <h3 style={{ marginBottom: 'var(--space-sm)' }}>Founders</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>Master your runway. Get instant clarity on monthly burn and cash dynamics without touching a spreadsheet.</p>
          </div>
          <div className="col-span-4 card-light hover-lift" style={{ borderLeft: '4px solid var(--accent-cyan)', padding: 'var(--space-lg)' }}>
             <h3 style={{ marginBottom: 'var(--space-sm)' }}>Analysts</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>Skip the manual data entry. Upload filings and move straight to strategic modeling and trend analysis.</p>
          </div>
          <div className="col-span-4 card-light hover-lift" style={{ borderLeft: '4px solid var(--accent-emerald)', padding: 'var(--space-lg)' }}>
             <h3 style={{ marginBottom: 'var(--space-sm)' }}>Finance Teams</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>Automate standardized reporting and identify institutional vulnerabilities across the entire balance sheet.</p>
          </div>
        </div>
      </section>

      {/* ─── Security Section ─────────────────────────────── */}
      <section style={{ margin: 'var(--space-md) 0', padding: 'var(--space-lg) 0', background: 'var(--gradient-dark)', borderRadius: 'var(--radius-xl)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '400px', height: '400px', background: 'var(--accent-blue)', opacity: 0.1, borderRadius: '50%', filter: 'blur(80px)' }}></div>
        <div style={{ padding: '0 8%', position: 'relative', zIndex: 1 }}>
          <div className="grid-cols-12" style={{ alignItems: 'center', gap: 'var(--space-xl)' }}>
            <div className="col-span-6">
              <div className="sub-label" style={{ color: 'var(--accent-emerald)' }}>Privacy First</div>
              <h2 className="big-title" style={{ color: 'white', fontSize: '56px', marginBottom: 'var(--space-md)' }}>Your data stays yours.</h2>
              <p style={{ fontSize: '19px', opacity: 0.7, lineHeight: 1.7, marginBottom: 'var(--space-lg)' }}>
                FinGenie utilizes an ephemeral "process-and-purge" cycle. We process your data in volatile memory nodes and delete it the moment your session ends.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900 }}>AES-256</div>
                    <div style={{ fontSize: '12px', opacity: 0.5, fontWeight: 700 }}>ENCRYPTION STANDARD</div>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900 }}>ZERO</div>
                    <div style={{ fontSize: '12px', opacity: 0.5, fontWeight: 700 }}>DATA RETENTION</div>
                 </div>
              </div>
            </div>
            <div className="col-span-6">
               <div className="card-light glass-glow" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: 'var(--space-lg)' }}>
                  <div style={{ marginBottom: '0', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                       <div style={{ fontSize: '28px' }}>🛡️</div>
                       <div>
                          <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: 'var(--space-xs)' }}>Isolated Sandbox</div>
                          <div style={{ fontSize: '14px', opacity: 0.5 }}>Every file is analyzed in a single-use compute node.</div>
                       </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                       <div style={{ fontSize: '28px' }}>🔑</div>
                       <div>
                          <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: 'var(--space-xs)' }}>Private Models</div>
                          <div style={{ fontSize: '14px', opacity: 0.5 }}>Utilizes private LLM instances—data is never used for training.</div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─────────────────────────────────── */}
      <section style={{ padding: 'var(--space-md) 0', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
           <div className="sub-label">Information</div>
           <h2 className="big-title">Common Questions.</h2>
        </div>
        
        <div className="faq-item" style={{ padding: 'var(--space-md) 0' }}>
          <div className="faq-question">How is this different from manual Excel modeling?</div>
          <div className="faq-answer" style={{ paddingTop: 'var(--space-xs)' }}>FinGenie automates the extraction and normalization of data from static PDFs and SEC filings, saving hours of manual data entry while providing AI-detected risk insights that human analysts often miss.</div>
        </div>
        <div className="faq-item" style={{ padding: 'var(--space-md) 0' }}>
          <div className="faq-question">Can I trust the AI-generated KPIs?</div>
          <div className="faq-answer" style={{ paddingTop: 'var(--space-xs)' }}>Yes. Every KPI is linked back to the source document. You can verify all synthesized figures in the "Raw Data Ledger" section of the analyzer to ensure 100% source fidelity.</div>
        </div>
        <div className="faq-item" style={{ padding: 'var(--space-md) 0' }}>
          <div className="faq-question">Is my financial data stored?</div>
          <div className="faq-answer" style={{ paddingTop: 'var(--space-xs)' }}>No. We maintain a zero-retention policy. Your data exists only in memory during your session and is permanently purged once you close the application or clear the analysis.</div>
        </div>
      </section>

      {/* ─── Final CTA Section ─────────────────────────────── */}
      <section style={{ padding: 'var(--space-xl) 0', textAlign: 'center' }}>
         <div className="card-blue slide-up" style={{ padding: 'var(--space-lg) var(--space-md)', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className="big-title" style={{ fontSize: '56px', marginBottom: 'var(--space-sm)' }}>Stop Analyzing. Start Understanding.</h2>
            <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>Upload your financials and get executive-ready insights in seconds.</p>
            <button className="btn-primary" style={{ padding: 'var(--space-md) var(--space-xl)', fontSize: '18px' }} onClick={scrollToUpload}>
               Upload Financials Now →
            </button>
         </div>
      </section>
    </div>
  );
}
