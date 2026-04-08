import { useState } from 'react';

const TONES = [
  { id: 'investor',  icon: '📈', name: 'Investor Pitch',   desc: 'Bold, growth-focused, highlights opportunities' },
  { id: 'audit',     icon: '🔍', name: 'Internal Audit',   desc: 'Detailed, conservative, compliance-oriented' },
  { id: 'executive', icon: '🏛️', name: 'Executive Brief',  desc: 'Concise, strategic, decision-ready' },
  { id: 'academic',  icon: '🎓', name: 'Academic Report',  desc: 'Structured, cited, analysis-driven' },
  { id: 'startup',   icon: '🚀', name: 'Startup Deck',     desc: 'Energetic, metric-forward, fundraising-ready' },
  { id: 'board',     icon: '🏢', name: 'Board Update',     desc: 'Formal, balanced, governance-focused' },
];

const SECTIONS = [
  { id: 'summary',     icon: '🤖', label: 'AI Summary' },
  { id: 'kpis',        icon: '📊', label: 'KPI Cards' },
  { id: 'charts',      icon: '📈', label: 'Trend Charts' },
  { id: 'risks',       icon: '⚠️', label: 'Risk Analysis' },
  { id: 'recs',        icon: '💡', label: 'Recommendations' },
  { id: 'rawdata',     icon: '📋', label: 'Raw Data Table' },
  { id: 'glossary',    icon: '📖', label: 'Glossary' },
  { id: 'methodology', icon: '🔬', label: 'Methodology' },
];

const COLORS = [
  '#1e1b4b', '#0f766e', '#1d4ed8', '#b45309',
  '#7c3aed', '#be123c', '#166534', '#374151',
];

const FORMATS = [
  { id: 'pdf',   icon: '📄', name: 'PDF Document',  size: '~2–4 MB · Universal' },
  { id: 'html',  icon: '🌐', name: 'Web Report',    size: '~180 KB · Shareable link' },
  { id: 'print', icon: '🖨️', name: 'Print-Ready',   size: 'A4 optimized · High-res' },
];

const TONE_LABELS = {
  investor: 'Investor Pitch', audit: 'Internal Audit', executive: 'Executive Brief',
  academic: 'Academic Report', startup: 'Startup Deck', board: 'Board Update',
};

// ─── HTML Report Builder ────────────────────────────────────────────────────
function buildHTMLReport({ analysisResult, tone, sections, company, author, title, color }) {
  const displayTitle  = title   || 'Financial Analysis Report';
  const displayAuthor = author  || 'Finance Team';
  const displayCo     = company || 'Your Company';
  const toneLabel     = TONE_LABELS[tone] || 'Financial Report';
  const now           = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const kpis  = analysisResult?.kpis  || [];
  const risks = analysisResult?.risks || [];
  const recs  = analysisResult?.recommendations || [];
  const rawData = analysisResult?.raw_data || [];
  const cols    = analysisResult?.column_headers || [];
  const summary = analysisResult?.summary || '';
  const stmtType = analysisResult?.statement_type || 'Financial Statement';

  const kpiHtml = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-name">${k.name || ''}</div>
      <div class="kpi-value">${k.formatted_value || k.value || ''}</div>
      ${k.trend ? `<span class="kpi-badge kpi-${k.trend}">${k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'} ${k.trend}</span>` : ''}
      ${k.description ? `<div class="kpi-desc">${k.description}</div>` : ''}
    </div>`).join('');

  const riskRows = risks.map(r => {
    const sev = r.severity || 'medium';
    const colors = { critical: '#dc2626', high: '#ea580c', medium: '#d97706', low: '#16a34a' };
    return `<tr>
      <td><span class="badge" style="background:${colors[sev] || colors.medium}20;color:${colors[sev] || colors.medium}">${sev.toUpperCase()}</span></td>
      <td>${r.risk || ''}</td>
      <td>${r.implication || ''}</td>
    </tr>`;
  }).join('');

  const recItems = recs.map((r, i) => `
    <div class="rec-item">
      <div class="rec-num">${i + 1}</div>
      <div>${typeof r === 'string' ? r : JSON.stringify(r)}</div>
    </div>`).join('');

  const dataRowsHtml = rawData.slice(0, 50).map(row => {
    const cells = cols.map(c => `<td>${row[c] !== undefined ? row[c] : ''}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  const dataTableHtml = cols.length ? `
    <table class="data-table">
      <thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
      <tbody>${dataRowsHtml}</tbody>
    </table>` : '<p style="color:#888">No raw data available.</p>';

  const glossaryItems = [
    ['KPI', 'Key Performance Indicator — a measurable value demonstrating effectiveness.'],
    ['EBITDA', 'Earnings Before Interest, Taxes, Depreciation, and Amortization.'],
    ['Gross Margin', 'Revenue minus the cost of goods sold, expressed as a percentage.'],
    ['Current Ratio', 'Current assets divided by current liabilities; measures liquidity.'],
    ['D/E Ratio', 'Debt-to-Equity Ratio — total liabilities divided by shareholder equity.'],
    ['Net Income', 'Total revenue minus total expenses including taxes.'],
  ].map(([term, def]) => `<dt>${term}</dt><dd>${def}</dd>`).join('');

  const methodologyText = `
    <p>This report was generated using FinGenie's AI-powered financial analysis engine. 
    The document was parsed using ${analysisResult?.parsing_mode === 'sec' ? 'official SEC XBRL datasets' : 'AI text extraction'}. 
    KPIs were computed from the extracted numerical data using industry-standard financial formulas. 
    Risks and recommendations were generated by Groq Llama 3.3, a large language model, and should be 
    reviewed by a qualified financial professional before making investment or operational decisions.</p>
    <p><strong>Disclaimer:</strong> This report is generated by AI and is for informational purposes only. 
    It does not constitute financial advice.</p>`;

  const sectionsHtml = [
    sections.has('summary') && summary ? `
      <section>
        <h2>AI Summary</h2>
        <div class="summary-box">${summary}</div>
      </section>` : '',
    sections.has('kpis') && kpis.length ? `
      <section>
        <h2>Key Performance Indicators</h2>
        <div class="kpi-grid">${kpiHtml}</div>
      </section>` : '',
    sections.has('risks') && risks.length ? `
      <section>
        <h2>Risk Analysis</h2>
        <table class="data-table">
          <thead><tr><th>Severity</th><th>Risk</th><th>Implication</th></tr></thead>
          <tbody>${riskRows}</tbody>
        </table>
      </section>` : '',
    sections.has('recs') && recs.length ? `
      <section>
        <h2>Recommendations</h2>
        <div class="recs-list">${recItems}</div>
      </section>` : '',
    sections.has('rawdata') ? `
      <section>
        <h2>Raw Data Table</h2>
        ${dataTableHtml}
      </section>` : '',
    sections.has('glossary') ? `
      <section>
        <h2>Glossary</h2>
        <dl class="glossary">${glossaryItems}</dl>
      </section>` : '',
    sections.has('methodology') ? `
      <section>
        <h2>Methodology &amp; Disclaimer</h2>
        ${methodologyText}
      </section>` : '',
  ].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${displayTitle}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; background: #fff; line-height: 1.6; }

  /* Cover */
  .cover {
    background: linear-gradient(135deg, ${color}, ${color}cc);
    color: white; padding: 60px 56px; min-height: 220px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .cover-meta { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.65; margin-bottom: 16px; }
  .cover-title { font-size: 32px; font-family: Georgia, serif; line-height: 1.2; margin-bottom: 8px; }
  .cover-sub { font-size: 15px; opacity: 0.75; }
  .cover-footer { display: flex; justify-content: space-between; margin-top: 32px; font-size: 13px; opacity: 0.65; }

  /* Sections */
  .container { max-width: 900px; margin: 0 auto; padding: 40px 56px; }
  section { margin-bottom: 40px; }
  section h2 {
    font-family: Georgia, serif; font-size: 20px; font-weight: 400;
    color: ${color}; border-bottom: 2px solid ${color}22;
    padding-bottom: 8px; margin-bottom: 20px;
  }

  /* Summary */
  .summary-box { background: ${color}08; border-left: 3px solid ${color}; padding: 16px 20px; border-radius: 4px; font-size: 14px; line-height: 1.7; }

  /* KPI Grid */
  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
  .kpi-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; }
  .kpi-name { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 4px; }
  .kpi-value { font-size: 22px; font-weight: 600; color: #111827; margin-bottom: 6px; }
  .kpi-desc { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .kpi-badge { font-size: 11px; padding: 2px 8px; border-radius: 20px; display: inline-block; }
  .kpi-up { background: #d1fae5; color: #065f46; }
  .kpi-down { background: #fee2e2; color: #991b1b; }
  .kpi-neutral { background: #f3f4f6; color: #374151; }

  /* Tables */
  .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .data-table th { background: ${color}; color: white; padding: 10px 12px; text-align: left; font-weight: 500; }
  .data-table td { padding: 9px 12px; border-bottom: 1px solid #f3f4f6; }
  .data-table tr:hover td { background: ${color}06; }
  .badge { font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 600; }

  /* Recs */
  .recs-list { display: flex; flex-direction: column; gap: 10px; }
  .rec-item { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; }
  .rec-num { width: 24px; height: 24px; border-radius: 50%; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; margin-top: 1px; }

  /* Glossary */
  .glossary { display: grid; grid-template-columns: 160px 1fr; gap: 8px 16px; font-size: 13px; }
  .glossary dt { font-weight: 600; color: ${color}; }
  .glossary dd { color: #374151; }

  /* Footer */
  .report-footer { text-align: center; padding: 32px; color: #9ca3af; font-size: 11px; border-top: 1px solid #f3f4f6; margin-top: 40px; }

  @media print {
    .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="cover">
    <div>
      <div class="cover-meta">${toneLabel.toUpperCase()} · FINGENIE ANALYSIS · ${stmtType.toUpperCase()}</div>
      <div class="cover-title">${displayTitle}</div>
      <div class="cover-sub">Prepared by ${displayAuthor} · ${displayCo}</div>
    </div>
    <div class="cover-footer">
      <span>${displayCo}</span>
      <span>${now}</span>
    </div>
  </div>

  <div class="container">
    ${sectionsHtml}
  </div>

  <div class="report-footer">
    Generated by FinGenie AI · Powered by Groq Llama 3.3 · ${now}
  </div>
</body>
</html>`;
}

// ─── Download / Print helpers ────────────────────────────────────────────────
function downloadHTML(html, filename) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function openPrint(html) {
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 600);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function BoardroomPDF({ analysisResult }) {
  const [step, setStep]             = useState(1);
  const [tone, setTone]             = useState('investor');
  const [sections, setSections]     = useState(new Set(['summary','kpis','charts','risks','recs']));
  const [company, setCompany]       = useState('');
  const [author, setAuthor]         = useState('');
  const [title, setTitle]           = useState('');
  const [color, setColor]           = useState('#1e1b4b');
  const [format, setFormat]         = useState('pdf');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const toggleSection = (id) => {
    setSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleGenerate = () => {
    setGenerating(true);
    setSuccess(false);

    setTimeout(() => {
      try {
        const html = buildHTMLReport({
          analysisResult, tone, sections,
          company, author, title, color,
        });

        const safeTitle = (title || 'financial-report').toLowerCase().replace(/\s+/g, '-');
        let msg = '';

        if (format === 'html') {
          downloadHTML(html, `${safeTitle}.html`);
          msg = '✅ Web report downloaded as .html — open it in any browser!';
        } else if (format === 'print') {
          openPrint(html);
          msg = '✅ Print dialog opened — choose "Save as PDF" in your browser for a PDF file.';
        } else {
          // pdf → open print dialog (browser native PDF save)
          openPrint(html);
          msg = '✅ Print dialog opened — select "Save as PDF" to download a PDF file.';
        }

        setGenerating(false);
        setSuccess(true);
        setSuccessMsg(msg);
        setTimeout(() => setSuccess(false), 7000);
      } catch (err) {
        setGenerating(false);
        setSuccess(true);
        setSuccessMsg('❌ Error generating report: ' + err.message);
      }
    }, 400);
  };

  const progress = (step / 5) * 100;

  const displayTitle  = title   || 'Q4 Financial Analysis';
  const displayAuthor = author  || 'Finance Team';
  const displayCo     = company || 'Your Company';

  return (
    <div className="layer-panel-inner">
      {/* Wizard Step Nav */}
      <div className="wizard-steps">
        {['Tone','Sections','Brand','Preview','Export'].map((label, i) => {
          const n = i + 1;
          const cls = step === n ? 'active' : step > n ? 'done' : '';
          return (
            <button key={n} className={`ws-step ${cls}`} onClick={() => setStep(n)}>
              <div className="ws-num">{step > n ? '✓' : n}</div>
              <span className="ws-label">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="wizard-progress-bar">
        <div className="wizard-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Step 1: Tone ── */}
      {step === 1 && (
        <div className="wizard-body">
          <div className="section-label">Choose report tone</div>
          <div className="tone-grid">
            {TONES.map(t => (
              <div
                key={t.id}
                className={`tone-card ${tone === t.id ? 'selected' : ''}`}
                onClick={() => setTone(t.id)}
              >
                <span className="tc-icon">{t.icon}</span>
                <div className="tc-name">{t.name}</div>
                <div className="tc-desc">{t.desc}</div>
              </div>
            ))}
          </div>
          <div className="wizard-nav">
            <button className="rc-btn rc-btn-primary" onClick={() => setStep(2)}>Continue →</button>
          </div>
        </div>
      )}

      {/* ── Step 2: Sections ── */}
      {step === 2 && (
        <div className="wizard-body">
          <div className="section-label">Select sections to include</div>
          <div className="section-toggles">
            {SECTIONS.map(s => (
              <div
                key={s.id}
                className={`sec-toggle ${sections.has(s.id) ? 'on' : ''}`}
                onClick={() => toggleSection(s.id)}
              >
                <div className="st-check">
                  {sections.has(s.id) && (
                    <svg viewBox="0 0 10 8" width="10" height="10">
                      <polyline points="1,4 3.5,7 9,1" stroke="white" strokeWidth="2.5" fill="none"/>
                    </svg>
                  )}
                </div>
                <span className="st-icon">{s.icon}</span>
                <span className="st-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="wizard-nav">
            <button className="rc-btn rc-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="rc-btn rc-btn-primary" onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Brand ── */}
      {step === 3 && (
        <div className="wizard-body">
          <div className="section-label">Branding &amp; identity</div>
          <div className="brand-row">
            <div className="field-group">
              <label className="field-label">Company name</label>
              <input className="field-input" type="text" placeholder="Acme Corp"
                value={company} onChange={e => setCompany(e.target.value)} />
            </div>
            <div className="field-group">
              <label className="field-label">Prepared by</label>
              <input className="field-input" type="text" placeholder="Finance Team"
                value={author} onChange={e => setAuthor(e.target.value)} />
            </div>
          </div>
          <div className="field-group" style={{ marginBottom: '1rem' }}>
            <label className="field-label">Report title</label>
            <input className="field-input" type="text" placeholder="Q4 2024 Financial Analysis"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="section-label">Cover accent color</div>
          <div className="color-row">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
          <div className="wizard-nav">
            <button className="rc-btn rc-btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="rc-btn rc-btn-primary" onClick={() => setStep(4)}>Preview →</button>
          </div>
        </div>
      )}

      {/* ── Step 4: Preview ── */}
      {step === 4 && (
        <div className="wizard-body">
          <div className="section-label">Live preview</div>
          <div className="preview-card">
            <div className="preview-cover" style={{
              background: `linear-gradient(135deg, ${color}, ${color}bb)`,
              color: 'white', padding: '20px 24px', minHeight: '100px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '8px 8px 0 0',
            }}>
              <div style={{ fontSize: '9px', letterSpacing: '1.2px', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>
                {TONE_LABELS[tone].toUpperCase()} · FINGENIE ANALYSIS
              </div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', lineHeight: 1.2 }}>{displayTitle}</div>
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: 4 }}>Prepared by {displayAuthor}</div>
            </div>
            <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--rc-surface2)', flexWrap: 'wrap', borderRadius: '0 0 8px 8px' }}>
              {[...sections].map(id => {
                const s = SECTIONS.find(s => s.id === id);
                return s ? (
                  <div key={id} className="ps-chip">{s.icon} {s.label}</div>
                ) : null;
              })}
            </div>
          </div>
          <div className="wizard-nav">
            <button className="rc-btn rc-btn-ghost" onClick={() => setStep(3)}>← Back</button>
            <button className="rc-btn rc-btn-primary" onClick={() => setStep(5)}>Looks Good →</button>
          </div>
        </div>
      )}

      {/* ── Step 5: Export ── */}
      {step === 5 && (
        <div className="wizard-body">
          <div className="section-label">Choose export format</div>
          <div className="export-row">
            {FORMATS.map(f => (
              <div
                key={f.id}
                className={`export-format ${format === f.id ? 'selected' : ''}`}
                onClick={() => setFormat(f.id)}
              >
                <span className="ef-icon">{f.icon}</span>
                <div className="ef-name">{f.name}</div>
                <div className="ef-size">{f.size}</div>
              </div>
            ))}
          </div>

          {format === 'pdf' && (
            <p style={{ fontSize: 12, color: 'var(--rc-ink3)', marginBottom: 8, padding: '8px 12px', background: 'var(--rc-surface2)', borderRadius: 6 }}>
              💡 Tip: The browser will open a print dialog. Choose <strong>"Save as PDF"</strong> to save a PDF file to your computer.
            </p>
          )}

          <div className="generate-block">
            <div className="gb-summary">
              <div className="gb-item"><div className="gb-dot"/><span>Tone: {TONE_LABELS[tone]}</span></div>
              <div className="gb-item"><div className="gb-dot"/><span>{sections.size} sections included</span></div>
              <div className="gb-item"><div className="gb-dot"/><span>Title: {displayTitle}</span></div>
              <div className="gb-item"><div className="gb-dot"/><span>Company: {displayCo}</span></div>
            </div>
            <button
              className="rc-btn rc-btn-export"
              style={{ width: '100%' }}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <><span className="rc-spinner"/>Building Report…</>
              ) : (
                format === 'html' ? 'Download HTML Report ↗' :
                format === 'print' ? 'Open Print / PDF ↗' :
                'Generate Boardroom PDF ↗'
              )}
            </button>
          </div>
          <button className="rc-btn rc-btn-ghost" onClick={() => setStep(4)}>← Back to Preview</button>
          {success && (
            <div className="success-flash">{successMsg}</div>
          )}
        </div>
      )}
    </div>
  );
}
