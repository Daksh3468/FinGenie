import { 
  Rocket, Target, PieChart, Database, Shield, Upload, 
  Search, Zap, CheckCircle2, ChevronRight, HelpCircle,
  FileText, Activity, Lock, Layers, Cpu, Server, Globe, Globe2
} from 'lucide-react';
import { useRef } from 'react';
import FileUpload from './FileUpload';

export default function Home({ onFileSelect, isLoading, error }) {
  const specsRef = useRef(null);

  const scrollToUpload = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSpecs = () => {
    specsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="analyzer-landing fade-in">
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="landing-hero">
        <div className="hero-text-section slide-up">
          <div className="hero-badge">Institutional-Grade Financial Intelligence</div>
          <h1 className="hero-title mb-md">
            Decode <span className="page-header__accent">Sovereign</span> <br /> Institutional Data.
          </h1>
          <p className="hero-subtitle mb-lg">
            Upload balance sheets, income statements, or cash flow reports to extract semantic narratives, risk vectors, and actionable intelligence instantly.
          </p>
          
          <div className="hero-actions d-flex gap-4">
            <button className="btn-primary" onClick={scrollToUpload}>
              <Zap size={18} />
              <span>Analyze Statement</span>
            </button>
            <button className="btn-outline" onClick={scrollToSpecs}>
              Technical Specs
            </button>
          </div>

          <div className="hero-trust-signals">
            <div className="trust-item">
              <CheckCircle2 size={16} className="text-emerald" style={{ color: 'var(--accent-emerald)' }} />
              <span>No signup required</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="text-emerald" style={{ color: 'var(--accent-emerald)' }} />
              <span>AES-256 encrypted</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="text-emerald" style={{ color: 'var(--accent-emerald)' }} />
              <span>Zero data retention</span>
            </div>
          </div>
        </div>

        <div className="upload-card slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-light glass-glow" style={{ padding: 'var(--space-md)', border: 'none', boxShadow: 'var(--shadow-xl)' }}>
            <div className="d-flex items-center gap-3 mb-md">
               <div style={{ background: 'var(--bg-blue-light)', padding: '10px', borderRadius: '12px' }}>
                  <Activity size={20} className="text-accent" />
               </div>
               <div>
                  <h2 className="text-primary font-bold" style={{ fontSize: '20px', margin: 0 }}>Analyze Document</h2>
                  <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>Institutional Ledger Ingestion</p>
               </div>
            </div>
            
            <FileUpload onFileSelect={onFileSelect} isLoading={isLoading} error={error} />
          </div>
        </div>
      </section>


      {/* ─── Outcome-Driven Features ────────────────────────── */}
      <section style={{ padding: 'var(--space-2xl) 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <span className="sub-label">Capabilities</span>
          <h2 className="big-title">Built for Performance.</h2>
        </div>

        <div className="grid-2x2">
          <div className="card-light hover-lift">
             <div className="mb-md" style={{ background: 'var(--bg-blue-light)', width: 'fit-content', padding: '16px', borderRadius: '16px' }}>
                <Rocket className="text-accent" size={32} />
             </div>
             <h3 style={{ fontSize: '22px', marginBottom: 'var(--space-xs)' }}>No Manual Entry</h3>
             <p className="text-secondary" style={{ lineHeight: 1.6 }}>Upload fragmented statements and get structured, audit-ready data instantly. Skip the modeling grunt work.</p>
          </div>
          <div className="card-light hover-lift">
             <div className="mb-md" style={{ background: 'rgba(235, 29, 72, 0.05)', width: 'fit-content', padding: '16px', borderRadius: '16px' }}>
                <Target className="text-rose" size={32} style={{ color: 'var(--accent-rose)' }} />
             </div>
             <h3 style={{ fontSize: '22px', marginBottom: 'var(--space-xs)' }}>Automated Anomalies</h3>
             <p className="text-secondary" style={{ lineHeight: 1.6 }}>Identify risks, trends, and financial outliers automatically before they become institutional liabilities.</p>
          </div>
          <div className="card-light hover-lift">
             <div className="mb-md" style={{ background: 'rgba(8, 145, 178, 0.05)', width: 'fit-content', padding: '16px', borderRadius: '16px' }}>
                <PieChart className="text-cyan" size={32} style={{ color: 'var(--accent-cyan)' }} />
             </div>
             <h3 style={{ fontSize: '22px', marginBottom: 'var(--space-xs)' }}>Clean Dashboards</h3>
             <p className="text-secondary" style={{ lineHeight: 1.6 }}>Instant visualization for liquidity, burn rate, and performance momentum using institutional standard design.</p>
          </div>
          <div className="card-light hover-lift">
             <div className="mb-md" style={{ background: 'rgba(5, 150, 105, 0.05)', width: 'fit-content', padding: '16px', borderRadius: '16px' }}>
                <Database className="text-emerald" size={32} style={{ color: 'var(--accent-emerald)' }} />
             </div>
             <h3 style={{ fontSize: '22px', marginBottom: 'var(--space-xs)' }}>Institutional Intelligence</h3>
             <p className="text-secondary" style={{ lineHeight: 1.6 }}>Process complex financial datasets and generate audit-ready competitive landscape reports in seconds.</p>
          </div>
        </div>
      </section>

      {/* ─── Storytelling Pipeline ─────────────────────────── */}
      <section style={{ padding: 'var(--space-2xl) 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <span className="sub-label">Implementation</span>
          <h2 className="big-title">Three Steps to Insight.</h2>
        </div>
        
        <div className="pipeline-container">
          <div className="pipeline-step">
            <div className="card-light hover-lift d-flex flex-column" style={{ height: '100%', padding: '40px' }}>
              <div className="mb-md" style={{ color: 'var(--accent-blue)' }}><Upload size={32} /></div>
              <h3 className="section-heading__label mb-sm" style={{ color: 'var(--accent-blue)', opacity: 0.8 }}>01 Ingestion</h3>
              <p className="text-secondary" style={{ fontSize: '15px' }}>Upload institutional financial PDFs, Excel sheets, or CSV files for automated auditing.</p>
            </div>
          </div>

          <div className="pipeline-connector d-none d-lg-block"><ChevronRight /></div>

          <div className="pipeline-step">
            <div className="card-light hover-lift d-flex flex-column" style={{ height: '100%', padding: '40px' }}>
              <div className="mb-md" style={{ color: 'var(--accent-blue)' }}><Search size={32} /></div>
              <h3 className="section-heading__label mb-sm" style={{ color: 'var(--accent-blue)', opacity: 0.8 }}>02 Semantic Parsing</h3>
              <p className="text-secondary" style={{ fontSize: '15px' }}>Neural mapping of line items to institutional standard GAAP/IFRS vectors using Llama 3 LLMs.</p>
            </div>
          </div>

          <div className="pipeline-connector d-none d-lg-block"><ChevronRight /></div>

          <div className="pipeline-step">
            <div className="card-light hover-lift d-flex flex-column" style={{ height: '100%', padding: '40px' }}>
              <div className="mb-md" style={{ color: 'var(--accent-blue)' }}><Zap size={32} /></div>
              <h3 className="section-heading__label mb-sm" style={{ color: 'var(--accent-blue)', opacity: 0.8 }}>03 Intelligence</h3>
              <p className="text-secondary" style={{ fontSize: '15px' }}>Instant generation of KPI grids, risk matrices, and board-ready strategic summaries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Security Section ─────────────────────────────── */}
      <section style={{ margin: 'var(--space-2xl) 0', padding: 'var(--space-xl) 5%', background: 'var(--bg-navy)', borderRadius: 'var(--radius-xl)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'var(--accent-blue)', opacity: 0.15, borderRadius: '50%', filter: 'blur(100px)' }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="grid-cols-12" style={{ alignItems: 'center', gap: 'var(--space-xl)' }}>
            <div className="col-span-12 col-span-lg-7">
              <span className="sub-label" style={{ color: 'var(--accent-emerald)' }}>Privacy & Sovereignty</span>
              <h2 className="big-title" style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 'var(--space-md)' }}>Your data stays yours.</h2>
              <p style={{ fontSize: '18px', opacity: 0.7, lineHeight: 1.7, marginBottom: 'var(--space-lg)' }}>
                FinGenie utilizes an ephemeral "process-and-purge" cycle. We process your data in volatile memory nodes and delete it the moment your session ends.
              </p>
              <div className="d-flex gap-responsive flex-wrap">
                 <div className="d-flex flex-column gap-1">
                    <div className="metric-big" style={{ color: 'white', fontSize: '32px' }}>AES-256</div>
                    <div style={{ fontSize: '10px', opacity: 0.5, fontWeight: 800, letterSpacing: '2px', maxWidth: '140px' }}>ENCRYPTION STANDARD</div>
                 </div>
                 <div className="d-flex flex-column gap-1">
                    <div className="metric-big" style={{ color: 'white', fontSize: '32px' }}>ZERO</div>
                    <div style={{ fontSize: '10px', opacity: 0.5, fontWeight: 800, letterSpacing: '2px', maxWidth: '140px' }}>DATA RETENTION</div>
                 </div>
              </div>
            </div>
            <div className="col-span-12 col-span-lg-5">
               <div className="card-light" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '40px' }}>
                  <div className="d-flex flex-column gap-5">
                    <div className="d-flex gap-4">
                       <Shield className="text-emerald" size={28} style={{ color: 'var(--accent-emerald)' }} />
                       <div>
                          <div className="font-bold" style={{ fontSize: '18px', marginBottom: '4px' }}>Isolated Sandbox</div>
                          <div style={{ fontSize: '14px', opacity: 0.6 }}>Every file is analyzed in a strictly single-use compute node.</div>
                       </div>
                    </div>
                    <div className="d-flex gap-4">
                       <Lock className="text-cyan" size={28} style={{ color: 'var(--accent-cyan)' }} />
                       <div>
                          <div className="font-bold" style={{ fontSize: '18px', marginBottom: '4px' }}>Private Inference</div>
                          <div style={{ fontSize: '14px', opacity: 0.6 }}>Data is never used for training LLMs. High-fidelity private APIs only.</div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Technical Specifications Section ──────────────── */}
      <section ref={specsRef} style={{ padding: 'var(--space-2xl) 0', background: 'var(--bg-blue-light)', borderRadius: 'var(--radius-xl)', margin: 'var(--space-xl) 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
           <span className="sub-label">Architecture</span>
           <h2 className="big-title">Technical Specifications.</h2>
           <p className="text-secondary" style={{ maxWidth: '600px', margin: '12px auto 0' }}>Built with institutional-grade stacks for deterministic accuracy and zero-latency analysis.</p>
        </div>

        <div className="main-content grid-2x2">
          <div className="card-light" style={{ background: 'white' }}>
             <div className="d-flex items-center gap-3 mb-md">
                <Cpu style={{ color: 'black' }} size={24} />
                <h4 style={{ margin: 0, fontSize: '18px' }}>Intelligence Layer</h4>
             </div>
             <ul className="text-secondary" style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: 2 }}>
                <li>Llama 3.3 70B (State-of-the-art Reasoning)</li>
                <li>Groq Inference Engine (Real-time speed)</li>
                <li>Semantic JSON Schema Mapping</li>
                <li>Context-Aware Document Chunking</li>
             </ul>
          </div>

          <div className="card-light" style={{ background: 'white' }}>
             <div className="d-flex items-center gap-3 mb-md">
                <Server className="text-cyan" size={24} />
                <h4 style={{ margin: 0, fontSize: '18px' }}>Core Infrastructure</h4>
             </div>
             <ul className="text-secondary" style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: 2 }}>
                <li>FastAPI High-Performance Backend</li>
                <li>PDFPlumber Structural Extraction</li>
                <li>Multi-Format Data Ingestion Engine</li>
                <li>Pandas Vectorized Data Processing</li>
             </ul>
          </div>

          <div className="card-light" style={{ background: 'white' }}>
             <div className="d-flex items-center gap-3 mb-md">
                <Shield className="text-emerald" size={24} />
                <h4 style={{ margin: 0, fontSize: '18px' }}>Security & Sovereignty</h4>
             </div>
             <ul className="text-secondary" style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: 2 }}>
                <li>AES-256 GCM In-Transit Encryption</li>
                <li>Zero-Retention Ephemeral Processing</li>
                <li>Isolated Memory Execution Nodes</li>
                <li>OAuth 2.0 Identity Standards</li>
             </ul>
          </div>

          <div className="card-light" style={{ background: 'white' }}>
             <div className="d-flex items-center gap-3 mb-md">
                <Globe2 className="text-rose" size={24} />
                <h4 style={{ margin: 0, fontSize: '18px' }}>System Fidelity</h4>
             </div>
             <ul className="text-secondary" style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: 2 }}>
                <li>GAAP & IFRS Accounting Alignment</li>
                <li>Cross-Document Trend Correlation</li>
                <li>Source-Fidelity Audit Ledgering</li>
                <li>Multi-Entity Comparative Analysis</li>
             </ul>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─────────────────────────────────── */}
      <section style={{ padding: 'var(--space-2xl) 0', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
           <span className="sub-label">Information</span>
           <h2 className="big-title">Common Questions.</h2>
        </div>
        
        <div className="faq-item">
          <div className="faq-question">How is this different from manual Excel modeling?</div>
          <div className="faq-answer">FinGenie automates the extraction and normalization of data from static PDFs and spreadsheets, saving hours of manual data entry while providing AI-detected risk insights that human analysts often miss.</div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Can I trust the AI-generated KPIs?</div>
          <div className="faq-answer">Yes. Every KPI is linked back to the source document. You can verify all synthesized figures in the "Raw Data Ledger" section of the analyzer to ensure 100% source fidelity.</div>
        </div>
        <div className="faq-item">
          <div className="faq-question">Is my financial data stored?</div>
          <div className="faq-answer">No. We maintain a zero-retention policy. Your data exists only in memory during your session and is permanently purged once you close the application or clear the analysis.</div>
        </div>
      </section>

      {/* ─── Final CTA Section ─────────────────────────────── */}
      <section style={{ padding: 'var(--space-xl) 0', textAlign: 'center' }}>
         <div className="cta-portal slide-up" style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div className="bg-mesh-vibrant" />
            <div className="data-grid-overlay" />
            
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
               <span className="sub-label mb-md" style={{ color: 'var(--accent-emerald)', opacity: 0.8 }}>Ready to Transform?</span>
               <h2 className="big-title text-balance cta-highlight" style={{ fontSize: 'clamp(32px, 5vw, 64px)', marginBottom: 'var(--space-md)' }}>
                  Stop Analyzing. <br /> Start Understanding.
               </h2>
               <p className="text-balance" style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
                  Upload your financials and get board-ready strategic insights in seconds. Join the future of institutional intelligence.
               </p>
               
               <div className="d-flex justify-center gap-4 flex-wrap">
                  <button className="btn-primary" style={{ background: 'white', color: 'var(--accent-blue)', padding: '18px 48px', fontSize: '18px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={scrollToUpload}>
                     <span>Upload Financials Now</span>
                     <ChevronRight size={20} />
                  </button>
               </div>

               <div className="d-flex justify-center gap-5 mt-xl" style={{ opacity: 0.4 }}>
                  <div className="d-flex items-center gap-2" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
                     <Lock size={14} /> SECURE ISO-27001
                  </div>
                  <div className="d-flex items-center gap-2" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>
                     <Shield size={14} /> SOC2 COMPLIANT
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
