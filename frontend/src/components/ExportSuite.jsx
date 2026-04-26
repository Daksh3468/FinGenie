import { useState } from 'react';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
import './ExportSuite.css';

const ACCENT = '#2563eb';

// ── Mock analysis data for preview/testing ──────────────────────────────────
const MOCK_RESULT = {
  statement_type: 'Income Statement',
  summary: 'Revenue grew 18% YoY driven by strong SaaS subscriptions. Operating margins improved to 24% from 19%. Cash position remains healthy at $4.2B with no significant debt obligations in the near term.',
  kpis: [
    { name: 'Total Revenue',     formatted_value: '$12.4B',  trend: 'up'   },
    { name: 'Net Income',        formatted_value: '$2.97B',  trend: 'up'   },
    { name: 'Operating Margin',  formatted_value: '24%',     trend: 'up'   },
    { name: 'EPS',               formatted_value: '$4.82',   trend: 'up'   },
    { name: 'Free Cash Flow',    formatted_value: '$3.1B',   trend: 'up'   },
    { name: 'Debt-to-Equity',    formatted_value: '0.38',    trend: 'flat' },
  ],
  risks: [
    'Macro headwinds may compress consumer spending in H2.',
    'Regulatory scrutiny in EU markets remains elevated.',
  ],
  recommendations: [
    'Maintain current capital allocation strategy.',
    'Accelerate share buyback program given strong FCF.',
  ],
};

// ── HTML report builder ──────────────────────────────────────────────────────
export function buildPDFReport({ analysisResult, company, author, title, color }) {
  const displayTitle  = title   || 'Financial Intelligence Review';
  const displayAuthor = author  || 'FinGenie Analyst';
  const displayCo     = company || 'Private Institutional Access';
  const kpis    = analysisResult?.kpis            || [];
  const risks   = analysisResult?.risks           || [];
  const recs    = analysisResult?.recommendations || [];
  const summary = analysisResult?.summary         || '';

  const kpiHtml = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-name">${k.name}</div>
      <div class="kpi-value">${k.formatted_value || k.value || ''}</div>
      <span class="kpi-badge kpi-${k.trend}">
        ${k.trend === 'up' ? '↑ Up' : k.trend === 'down' ? '↓ Down' : '→ Stable'}
      </span>
    </div>`).join('');

  const riskHtml  = risks.map(r => `<li>${r}</li>`).join('');
  const recHtml   = recs.map(r  => `<li>${r}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${displayTitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; color: #0f172a; }

  .cover {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
    padding: 60px 56px 48px;
    color: white;
  }
  .cover-tag  { font-size: 10px; font-weight: 800; letter-spacing: 3px; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 20px; }
  .cover-title{ font-size: 36px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 24px; }
  .cover-bar  { width: 48px; height: 4px; border-radius: 2px; margin-bottom: 28px; }
  .cover-meta { display: flex; gap: 32px; font-size: 13px; color: rgba(255,255,255,0.55); font-weight: 600; }
  .cover-meta span strong { color: rgba(255,255,255,0.85); font-weight: 700; }

  .body { padding: 48px 56px; }

  section { margin-bottom: 40px; }
  h2 { font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8; margin-bottom: 16px; }

  .summary-box {
    background: white;
    border-left: 4px solid ${color};
    border-radius: 0 10px 10px 0;
    padding: 20px 24px;
    font-size: 14px;
    line-height: 1.75;
    color: #334155;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .kpi-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
  .kpi-card  { background: white; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
  .kpi-name  { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .kpi-value { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 8px; }
  .kpi-badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 10px; font-weight: 800; }
  .kpi-up    { background: #dcfce7; color: #166534; }
  .kpi-down  { background: #fee2e2; color: #991b1b; }
  .kpi-flat  { background: #f1f5f9; color: #475569; }

  ul { padding-left: 18px; }
  ul li { font-size: 14px; line-height: 1.7; color: #475569; margin-bottom: 6px; }

  .footer { margin-top: 56px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
  .footer-left  { font-size: 12px; font-weight: 700; color: #94a3b8; }
  .footer-right { font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #cbd5e1; }
  @media print { body { background: white; } }
</style>
</head>
<body>
  <div class="cover">
    <div class="cover-tag">FinGenie Intelligence Report</div>
    <h1 class="cover-title">${displayTitle}</h1>
    <div class="cover-bar" style="background:${color}"></div>
    <div class="cover-meta">
      <span><strong>${displayCo}</strong></span>
      <span>Prepared by <strong>${displayAuthor}</strong></span>
      <span>Generated <strong>${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</strong></span>
    </div>
  </div>

  <div class="body">
    ${summary ? `
    <section>
      <h2>Executive Summary</h2>
      <div class="summary-box">${summary}</div>
    </section>` : ''}

    ${kpis.length ? `
    <section>
      <h2>Institutional Metrics</h2>
      <div class="kpi-grid">${kpiHtml}</div>
    </section>` : ''}

    ${risks.length ? `
    <section>
      <h2>Risk Factors</h2>
      <ul>${riskHtml}</ul>
    </section>` : ''}

    ${recs.length ? `
    <section>
      <h2>Recommendations</h2>
      <ul>${recHtml}</ul>
    </section>` : ''}

    <div class="footer">
      <div class="footer-left">${displayCo} · ${displayTitle}</div>
      <div class="footer-right">FinGenie AI · Confidential</div>
    </div>
  </div>
</body>
</html>`;
}

// ── PDF download helper ──────────────────────────────────────────────────────
function printViaIframe(html) {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;visibility:hidden;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 3000);
  }, 500);
}

// ════════════════════════════════════════════════════════════════════════════
export default function ExportSuite({ analysisResult = MOCK_RESULT }) {
  const [company, setCompany] = useState('');
  const [author,  setAuthor]  = useState('');
  const [title,   setTitle]   = useState('');
  const [busy,    setBusy]    = useState(false);
  const [done,    setDone]    = useState(false);

  if (!analysisResult) return null;

  const handleDownload = () => {
    setBusy(true);
    setTimeout(() => {
      const html = buildPDFReport({ analysisResult, company, author, title, color: ACCENT });
      printViaIframe(html);
      setBusy(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    }, 400);
  };

  return (
    <div className="export-suite">
      {/* Config + Action row */}
      <div className="grid-cols-12" style={{ gap: '24px' }}>
        {/* Left: form */}
        <div className="col-span-8">
          <div className="card-light" style={{ padding: '32px' }}>
            <div className="section-heading mb-lg">
              <FileText className="text-accent" size={18} />
              <h3 className="section-heading__label" style={{ fontSize: '14px', marginBottom: 0 }}>
                Report Configuration
              </h3>
            </div>

            <div className="grid-cols-12 mb-md" style={{ gap: '16px' }}>
              <div className="col-span-6 es-form-group">
                <label className="sub-label">Company Name</label>
                <input
                  className="custom-input"
                  placeholder="Organization"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </div>
              <div className="col-span-6 es-form-group">
                <label className="sub-label">Author / Lead</label>
                <input
                  className="custom-input"
                  placeholder="Name"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                />
              </div>
            </div>

            <div className="es-form-group">
              <label className="sub-label">Document Heading</label>
              <input
                className="custom-input"
                placeholder="e.g. FY24 Performance Analysis"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right: download */}
        <div className="col-span-4">
          <div
            className="card-light d-flex flex-column justify-center"
            style={{ padding: '32px', height: '100%', border: '1px solid var(--border-light)' }}
          >
            <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              Board-Ready Export
            </h4>
            <p className="text-secondary mb-xl" style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Generate a high-fidelity PDF report suitable for institutional sharing.
            </p>

            <button
              className="btn-primary w-full"
              onClick={handleDownload}
              disabled={busy}
            >
              {done
                ? <><CheckCircle2 size={18} /><span>PDF Ready</span></>
                : <><Download size={18} /><span>{busy ? 'Generating…' : 'Download PDF'}</span></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}