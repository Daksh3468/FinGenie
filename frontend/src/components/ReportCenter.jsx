// ReportCenter.jsx — FinGenie Report Center
import { useState } from 'react';
import { 
  FileText, TrendingUp, Search, Building2, Rocket, GraduationCap, 
  Download, Printer, Sparkles, Box, FileOutput, Hash, Cpu, CheckCircle2 
} from 'lucide-react';
import ExportSuite from './ExportSuite';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const AI_REPORT_FORMATS = [
  { id: 'executive', Icon: FileText,      label: 'Executive Brief',  desc: 'Concise strategic summary for C-suite' },
  { id: 'investor',  Icon: TrendingUp,    label: 'Investor Memo',     desc: 'Growth narrative & opportunity framing' },
  { id: 'audit',     Icon: Search,        label: 'Internal Audit',    desc: 'Detailed compliance & risk analysis' },
  { id: 'board',     Icon: Building2,     label: 'Board Update',      desc: 'Governance-focused balanced overview' },
  { id: 'startup',   Icon: Rocket,        label: 'Pitch Narrative',   desc: 'Fundraising-ready energetic framing' },
  { id: 'academic',  Icon: GraduationCap, label: 'Research Paper',    desc: 'Structured, methodology-driven analysis' },
];

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function mdToHtml(md) {
  if (!md) return '';
  let escaped = escapeHtml(md);
  escaped = escaped
    .replace(/&lt;strong&gt;(.+?)&lt;\/strong&gt;/g, '<strong>$1</strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3 class="ai-report-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="ai-report-h2">$1</h2>')
    .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li><span class="ai-report-num">$1</span> $2</li>')
    .replace(/(<li>[\s\S]+?<\/li>)(?=\n<li>|\n\n|$)/g, '<ul>$&</ul>')
    .replace(/<\/ul>\n<ul>/g, '')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
    .replace(/<p>\s*<\/p>/g, '');
  return escaped;
}

function buildReportHTML({ selectedFmt, stmtType, now, report }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>FinGenie — ${selectedFmt?.label}</title>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; max-width: 800px;
         margin: 60px auto; padding: 0 40px; color: #0f172a; line-height: 1.7; }
  .cover { border-bottom: 3px solid #2563eb; padding-bottom: 32px; margin-bottom: 40px; }
  .cover-eyebrow { font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
                   color: #2563eb; margin-bottom: 8px; font-weight: 700; }
  .cover-title { font-size: 36px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.02em; }
  .cover-meta  { font-size: 13px; color: #64748b; }
  h2 { font-size: 18px; font-weight: 700; color: #1e293b;
       border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-top: 40px; }
  h3 { font-size: 14px; font-weight: 700; color: #475569; margin-top: 24px;
       text-transform: uppercase; letter-spacing: .05em; }
  p  { margin: 16px 0; color: #334155; }
  ul { padding-left: 20px; } li { margin: 8px 0; color: #334155; }
  .footer { margin-top: 80px; padding-top: 24px; border-top: 1px solid #f1f5f9;
            font-size: 11px; color: #94a3b8; font-weight: 500; }
</style>
</head>
<body>
<div class="cover">
  <div class="cover-eyebrow">FinGenie AI / Intelligence Dept.</div>
  <div class="cover-title">${selectedFmt?.label}</div>
  <div class="cover-meta">Document Focus: ${stmtType} · Generated on ${now}</div>
</div>
${mdToHtml(report)}
<div class="footer">
  FinGenie Institutional Intelligence · AI Attribution: Groq Llama 3.3 · Strictly Confidential
</div>
</body>
</html>`;
}

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

function ReportCenterHeader({ analysisResult }) {
  const { kpis = [], risks = [], recommendations: recs = [], raw_data: rawData = [], statement_type: stmtType, parsing_mode: parsingMode } = analysisResult;
  
  return (
    <header className="page-header mb-xl pb-lg" style={{ borderBottom: '1px solid var(--border-light)' }}>
      <div className="d-flex items-center gap-2 mb-xs">
        <Sparkles className="text-accent" size={16} />
        <span className="page-header__eyebrow">Intelligence Report Generation</span>
      </div>
      <div className="d-flex justify-between items-end">
        <div>
          <h1 className="page-header__title">
            AI Narrative <span className="page-header__accent">Generator.</span>
          </h1>
          <div className="d-flex items-center gap-4 mt-md">
            <div className="d-flex items-center gap-2 text-secondary" style={{ fontSize: '13px', fontWeight: 600 }}>
              <Hash size={14} className="text-muted" />
              <span>TYPE: {stmtType?.toUpperCase() || 'FIN-REP'}</span>
            </div>
            <div className="d-flex items-center gap-2 text-secondary" style={{ fontSize: '13px', fontWeight: 600 }}>
              <Cpu size={14} className="text-muted" />
              <span>LOGIC: {parsingMode?.toUpperCase() || 'STD'}</span>
            </div>
          </div>
        </div>
        
        <div className="card-light d-flex gap-6" style={{ padding: '16px 24px', background: 'var(--bg-blue-light)', border: 'none' }}>
          {[
            { label: 'KPIs', val: kpis.length },
            { label: 'Risks', val: risks.length },
            { label: 'Recs', val: recs.length },
            { label: 'Rows', val: rawData.length },
          ].map(({ label, val }) => (
            <div key={label} className="text-center">
              <div className="metric-big" style={{ fontSize: '20px', marginBottom: '2px' }}>{val}</div>
              <div className="sub-label" style={{ fontSize: '9px', marginBottom: 0 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function AIReportGenerator({ analysisResult }) {
  const [format, setFormat] = useState('executive');
  const [report, setReport] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const [pdfSaved, setPdfSaved] = useState(false);

  const selectedFmt = AI_REPORT_FORMATS.find(f => f.id === format);

  const generate = async () => {
    setLoading(true); setError(''); setReport(''); setWordCount(0);
    try {
      const res = await fetch(`${API_BASE}/api/report/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format_id: format,
          raw_data: analysisResult?.raw_data || [],
          column_headers: analysisResult?.column_headers || [],
          statement_type: analysisResult?.statement_type || 'Financial Statement',
          summary: analysisResult?.summary || '',
          kpis: analysisResult?.kpis || [],
          risks: analysisResult?.risks || [],
          recommendations: analysisResult?.recommendations || [],
          parsing_mode: analysisResult?.parsing_mode || 'standard',
        }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setReport(data.report_markdown);
      setWordCount(data.word_count);
    } catch (err) {
      setError('Generation failed. Please verify API connection.');
    } finally {
      setLoading(false);
    }
  };

  const getHtmlPayload = () => {
    const stmtType = analysisResult?.statement_type || 'report';
    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return buildReportHTML({ selectedFmt, stmtType, now, report });
  };

  const downloadHTML = () => {
    const html = getHtmlPayload();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fingenie-report.html`;
    a.click(); URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const downloadPDF = () => {
    printViaIframe(getHtmlPayload());
    setPdfSaved(true);
    setTimeout(() => setPdfSaved(false), 3000);
  };

  return (
    <div className="ai-report-generator">
      <div className="mb-md">
        <h3 className="sub-label mb-sm">Select Intelligence Framework</h3>
        <div className="grid-cols-12" style={{ gap: '12px' }}>
          {AI_REPORT_FORMATS.map(f => (
            <div
              key={f.id}
              className={`card-light hover-lift col-span-4 ${format === f.id ? 'active-border' : ''}`}
              onClick={() => setFormat(f.id)}
              style={{ 
                cursor: 'pointer', 
                padding: '16px', 
                border: format === f.id ? '2px solid var(--accent-blue)' : '1px solid var(--border-light)',
                background: format === f.id ? 'var(--bg-blue-light)' : 'white'
              }}
            >
              <div className="d-flex items-center gap-3 mb-xs">
                <f.Icon size={18} className={format === f.id ? 'text-accent' : 'text-secondary'} />
                <span className="font-bold text-primary" style={{ fontSize: '14px' }}>{f.label}</span>
              </div>
              <p className="text-secondary" style={{ fontSize: '11px', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        className={`btn-primary w-full mt-md d-flex items-center justify-center gap-3 ${loading ? 'loading' : ''}`}
        onClick={generate}
        disabled={loading}
        style={{ padding: '16px' }}
      >
        {loading ? <Sparkles className="animate-spin" size={18} /> : <selectedFmt.Icon size={18} />}
        <span>{loading ? 'Synthesizing Narrative...' : `Compose ${selectedFmt.label}`}</span>
      </button>

      {error && <div className="error-badge mt-md text-rose font-bold text-center">{error}</div>}

      {report && (
        <div className="ai-report-output fade-in mt-xl">
          <div className="ai-report-toolbar d-flex justify-between items-center mb-md p-sm" style={{ background: 'var(--bg-navy)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', color: 'white' }}>
            <div className="d-flex items-center gap-3">
              <selectedFmt.Icon size={16} className="text-accent" />
              <span className="font-bold" style={{ fontSize: '14px' }}>DRAFT: {selectedFmt.label}</span>
            </div>
            <div className="d-flex gap-2">
              <button className="nav-item active d-flex items-center gap-2" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={downloadHTML}>
                {downloaded ? <CheckCircle2 size={12} /> : <Download size={12} />}
                <span>{downloaded ? 'Saved' : 'HTML'}</span>
              </button>
              <button className="btn-primary d-flex items-center gap-2" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={downloadPDF}>
                {pdfSaved ? <CheckCircle2 size={12} /> : <Printer size={12} />}
                <span>{pdfSaved ? 'Sent' : 'PDF'}</span>
              </button>
            </div>
          </div>
          <div className="ai-report-content card-light" style={{ borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '40px', borderTop: 'none' }}>
            <div dangerouslySetInnerHTML={{ __html: mdToHtml(report) }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportCenter({ analysisResult }) {
  const [activeLayer, setActiveLayer] = useState('ai');
  if (!analysisResult) return null;

  return (
    <section className="report-center-section fade-in">
      <ReportCenterHeader analysisResult={analysisResult} />

      <div className="mb-xl">
        <h3 className="section-heading__label mb-md" style={{ color: 'var(--text-muted)' }}>Output Orchestration</h3>
        <div className="nav-links" style={{ width: 'fit-content', background: 'var(--bg-blue-subtle)', padding: '4px', borderRadius: '12px' }}>
          <button className={`nav-item ${activeLayer === 'ai' ? 'active' : ''}`} onClick={() => setActiveLayer('ai')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} />
            <span>AI Narrative</span>
          </button>
          <button className={`nav-item ${activeLayer === 'export' ? 'active' : ''}`} onClick={() => setActiveLayer('export')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={14} />
            <span>Structured Export</span>
          </button>
        </div>
      </div>

      <div className="layer-panels">
        {activeLayer === 'ai' 
          ? <AIReportGenerator analysisResult={analysisResult} /> 
          : <div data-testid="export-suite"><ExportSuite analysisResult={analysisResult} /></div>
        }
      </div>
    </section>
  );
}
