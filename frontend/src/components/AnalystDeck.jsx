import { useState, useEffect } from 'react';

const DEFAULT_SLIDES = [
  { id: 'cover',    num: 1, name: 'Cover Slide',      on: true  },
  { id: 'kpi',      num: 2, name: 'KPI Snapshot',     on: true  },
  { id: 'trend',    num: 3, name: 'Revenue Trend',    on: true  },
  { id: 'risk',     num: 4, name: 'Risk Matrix',      on: true  },
  { id: 'recs',     num: 5, name: 'Recommendations',  on: true  },
  { id: 'appendix', num: 6, name: 'Data Appendix',    on: false },
];

const THEMES = [
  { id: 'dark',   label: 'Dark Pro',      bg: '#1e1b4b', fg: '#ffffff', accent: '#a78bfa' },
  { id: 'light',  label: 'Clean Light',   bg: '#ffffff', fg: '#1e1b4b', accent: '#6c3de8' },
  { id: 'color',  label: 'Branded Color', bg: '#6c3de8', fg: '#ffffff', accent: '#fbbf24' },
  { id: 'mono',   label: 'Monochrome',    bg: '#1a1a1a', fg: '#f5f5f5', accent: '#888888' },
];

// ─── pptxgenjs loader ────────────────────────────────────────────────────────
let pptxgenPromise = null;
function loadPptxGen() {
  if (pptxgenPromise) return pptxgenPromise;
  pptxgenPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
    script.onload  = () => resolve(window.PptxGenJS);
    script.onerror = () => reject(new Error('Failed to load pptxgenjs'));
    document.head.appendChild(script);
  });
  return pptxgenPromise;
}

// ─── hex → RGB helper ────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num   = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >>  8) & 255,
    b:  num        & 255,
  };
}

// ─── Build PPTX ──────────────────────────────────────────────────────────────
async function generatePptx({ analysisResult, slides, theme }) {
  const PptxGenJS = await loadPptxGen();
  const pptx      = new PptxGenJS();

  const t = THEMES.find(t => t.id === theme) || THEMES[0];
  const bgClean  = t.bg.replace('#', '');
  const fgClean  = t.fg.replace('#', '');
  const accClean = t.accent.replace('#', '');

  pptx.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"

  const kpis  = analysisResult?.kpis  || [];
  const risks = analysisResult?.risks || [];
  const recs  = analysisResult?.recommendations || [];
  const rawData = analysisResult?.raw_data || [];
  const cols    = analysisResult?.column_headers || [];
  const stmtType = analysisResult?.statement_type || 'Financial Statement';
  const summary  = analysisResult?.summary || '';
  const now = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const activeSlides = slides.filter(s => s.on);

  for (const slide of activeSlides) {
    const sl = pptx.addSlide();

    // Background
    sl.background = { color: bgClean };

    // Helper: add a header bar with title
    const addHeader = (text) => {
      sl.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 1.0,
        fill: { color: accClean },
      });
      sl.addText(text, {
        x: 0.4, y: 0.05, w: 12, h: 0.9,
        fontSize: 22, bold: true, color: t.id === 'color' ? fgClean : '000000',
        fontFace: 'Calibri',
      });
      // Branding pill
      sl.addText('FinGenie', {
        x: 11.8, y: 0.15, w: 1.3, h: 0.6,
        fontSize: 10, color: fgClean,
        align: 'right', fontFace: 'Calibri',
      });
    };

    if (slide.id === 'cover') {
      // Full cover
      sl.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { color: bgClean },
      });
      sl.addShape(pptx.ShapeType.rect, {
        x: 0, y: 5.5, w: '100%', h: 2.0,
        fill: { color: accClean, transparency: 80 },
      });
      sl.addText('FINGENIE AI · ' + stmtType.toUpperCase(), {
        x: 0.7, y: 1.8, w: 12, h: 0.5,
        fontSize: 11, color: fgClean, transparency: 40,
        fontFace: 'Calibri', charSpacing: 3,
      });
      sl.addText(analysisResult?.summary?.split('.')[0] || 'Financial Analysis Report', {
        x: 0.7, y: 2.4, w: 11, h: 1.8,
        fontSize: 32, bold: true, color: fgClean,
        fontFace: 'Calibri', lineSpacingMultiple: 1.2,
      });
      sl.addText(`Prepared with FinGenie AI · ${now}`, {
        x: 0.7, y: 6.2, w: 12, h: 0.6,
        fontSize: 12, color: fgClean, transparency: 40, fontFace: 'Calibri',
      });
    }

    else if (slide.id === 'kpi') {
      addHeader('Key Performance Indicators');
      const items = kpis.slice(0, 6);
      const cols4 = Math.min(items.length, 3);
      items.forEach((k, i) => {
        const col = i % cols4;
        const row = Math.floor(i / cols4);
        const x = 0.4 + col * 4.3;
        const y = 1.2 + row * 2.8;
        sl.addShape(pptx.ShapeType.rect, {
          x, y, w: 4.0, h: 2.4,
          fill: { color: t.id === 'dark' ? '2d2a5e' : t.id === 'light' ? 'f8f7ff' : accClean, transparency: t.id === 'color' ? 85 : 0 },
          line: { color: accClean, width: 1 },
        });
        sl.addText((k.name || '').substring(0, 20), { x: x + 0.15, y: y + 0.15, w: 3.7, h: 0.35, fontSize: 10, color: fgClean, transparency: 35, fontFace: 'Calibri' });
        sl.addText(String(k.formatted_value || k.value || '—'), { x: x + 0.15, y: y + 0.55, w: 3.7, h: 0.8, fontSize: 24, bold: true, color: fgClean, fontFace: 'Calibri' });
        const trendColor = k.trend === 'up' ? '22c55e' : k.trend === 'down' ? 'ef4444' : 'a0a0a0';
        const trendText  = k.trend === 'up' ? '↑ Up' : k.trend === 'down' ? '↓ Down' : '→ Stable';
        sl.addText(trendText, { x: x + 0.15, y: y + 1.4, w: 2, h: 0.35, fontSize: 11, color: trendColor, fontFace: 'Calibri' });
        if (k.description) sl.addText(k.description.substring(0, 55), { x: x + 0.15, y: y + 1.85, w: 3.7, h: 0.4, fontSize: 9, color: fgClean, transparency: 45, fontFace: 'Calibri', wrap: true });
      });
      if (items.length === 0) {
        sl.addText('No KPI data available.', { x: 0.5, y: 2, w: 12, h: 1, fontSize: 16, color: fgClean, transparency: 40 });
      }
    }

    else if (slide.id === 'trend') {
      addHeader('Revenue Trend');
      // Simple text-based trend from raw data
      const rows = rawData.slice(0, 8);
      if (rows.length > 0 && cols.length > 0) {
        const tableData = [cols.map(c => ({ text: c, options: { bold: true, color: fgClean, fill: accClean } }))];
        rows.forEach(row => {
          tableData.push(cols.map(c => ({ text: String(row[c] ?? ''), options: { color: fgClean } })));
        });
        sl.addTable(tableData, {
          x: 0.4, y: 1.1, w: 12.5,
          fontSize: 10, fontFace: 'Calibri',
          rowH: 0.4,
          border: { type: 'solid', color: accClean, pt: 0.5 },
        });
      } else {
        sl.addText('No trend data available.', { x: 0.5, y: 2, w: 12, h: 1, fontSize: 16, color: fgClean, transparency: 40 });
      }
      if (summary) {
        sl.addText('AI Insight: ' + summary.split('.').slice(0, 2).join('.') + '.', {
          x: 0.4, y: 6.4, w: 12.5, h: 0.8,
          fontSize: 10, italic: true, color: fgClean, transparency: 35, fontFace: 'Calibri', wrap: true,
        });
      }
    }

    else if (slide.id === 'risk') {
      addHeader('Risk Assessment Matrix');
      const sevColors = { critical: 'dc2626', high: 'ea580c', medium: 'd97706', low: '16a34a' };
      risks.slice(0, 6).forEach((r, i) => {
        const sev = r.severity || 'medium';
        const color = sevColors[sev] || sevColors.medium;
        const y = 1.2 + i * 1.0;
        sl.addShape(pptx.ShapeType.rect, { x: 0.4, y, w: 1.2, h: 0.7, fill: { color }, line: { color, width: 0 } });
        sl.addText(sev.toUpperCase(), { x: 0.4, y: y + 0.1, w: 1.2, h: 0.5, fontSize: 10, bold: true, color: 'ffffff', align: 'center', fontFace: 'Calibri' });
        sl.addText(r.risk || '', { x: 1.8, y, w: 6.5, h: 0.7, fontSize: 12, color: fgClean, fontFace: 'Calibri', valign: 'middle', wrap: true });
        if (r.implication) sl.addText(r.implication, { x: 8.5, y, w: 4.8, h: 0.7, fontSize: 10, color: fgClean, transparency: 35, fontFace: 'Calibri', valign: 'middle', wrap: true });
      });
      if (risks.length === 0) {
        sl.addText('No risks identified.', { x: 0.5, y: 2, w: 12, h: 1, fontSize: 16, color: fgClean, transparency: 40 });
      }
    }

    else if (slide.id === 'recs') {
      addHeader('Strategic Recommendations');
      recs.slice(0, 5).forEach((r, i) => {
        const y = 1.2 + i * 1.1;
        sl.addShape(pptx.ShapeType.ellipse, { x: 0.4, y, w: 0.55, h: 0.55, fill: { color: accClean } });
        sl.addText(String(i + 1), { x: 0.4, y: y + 0.05, w: 0.55, h: 0.45, fontSize: 14, bold: true, color: fgClean, align: 'center', fontFace: 'Calibri' });
        const text = typeof r === 'string' ? r : JSON.stringify(r);
        sl.addText(text, { x: 1.2, y, w: 11.7, h: 0.9, fontSize: 13, color: fgClean, fontFace: 'Calibri', valign: 'middle', wrap: true });
      });
      if (recs.length === 0) {
        sl.addText('No recommendations available.', { x: 0.5, y: 2, w: 12, h: 1, fontSize: 16, color: fgClean, transparency: 40 });
      }
    }

    else if (slide.id === 'appendix') {
      addHeader('Data Appendix');
      sl.addText('Source data extracted from: ' + (stmtType), {
        x: 0.4, y: 1.1, w: 12.5, h: 0.5, fontSize: 13, color: fgClean, fontFace: 'Calibri',
      });
      const rows = rawData.slice(0, 10);
      if (rows.length > 0 && cols.length > 0) {
        const tableData = [cols.map(c => ({ text: c, options: { bold: true, color: fgClean, fill: accClean } }))];
        rows.forEach(row => {
          tableData.push(cols.map(c => ({ text: String(row[c] ?? ''), options: { color: fgClean } })));
        });
        sl.addTable(tableData, {
          x: 0.4, y: 1.7, w: 12.5,
          fontSize: 9, fontFace: 'Calibri', rowH: 0.36,
          border: { type: 'solid', color: accClean, pt: 0.5 },
        });
      }
      sl.addText('Generated by FinGenie AI · Powered by Groq Llama 3.3', {
        x: 0.4, y: 6.9, w: 12.5, h: 0.4, fontSize: 9, color: fgClean, transparency: 50, fontFace: 'Calibri',
      });
    }
  }

  return pptx;
}

// ─── Build HTML Slideshow ────────────────────────────────────────────────────
function buildSlideshowHTML({ analysisResult, slides, theme }) {
  const t = THEMES.find(th => th.id === theme) || THEMES[0];
  const stmtType = analysisResult?.statement_type || 'Financial Statement';
  const summary  = analysisResult?.summary || '';
  const kpis     = analysisResult?.kpis || [];
  const risks    = analysisResult?.risks || [];
  const recs     = analysisResult?.recommendations || [];
  const rawData  = analysisResult?.raw_data || [];
  const cols     = analysisResult?.column_headers || [];
  const now = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const activeSlides = slides.filter(s => s.on);

  const slideContents = activeSlides.map((slide, idx) => {
    let content = '';

    if (slide.id === 'cover') {
      content = `
        <div class="slide-inner cover-slide">
          <div class="cover-eyebrow">FINGENIE AI · ${stmtType.toUpperCase()}</div>
          <h1 class="cover-title">${summary.split('.')[0] || 'Financial Analysis Report'}</h1>
          <div class="cover-foot">Prepared with FinGenie AI · ${now}</div>
        </div>`;
    } else if (slide.id === 'kpi') {
      const cards = kpis.slice(0, 6).map(k => `
        <div class="kpi-box">
          <div class="kpi-nm">${k.name || ''}</div>
          <div class="kpi-vl">${k.formatted_value || k.value || '—'}</div>
          <span class="kpi-tr ${k.trend}">${k.trend === 'up' ? '↑' : k.trend === 'down' ? '↓' : '→'} ${k.trend || 'stable'}</span>
        </div>`).join('');
      content = `<div class="slide-inner"><h2>${slide.name}</h2><div class="kpi-row">${cards || '<p>No KPI data.</p>'}</div></div>`;
    } else if (slide.id === 'trend') {
      const rows = rawData.slice(0, 10);
      const thead = cols.map(c => `<th>${c}</th>`).join('');
      const tbody = rows.map(r => `<tr>${cols.map(c => `<td>${r[c] ?? ''}</td>`).join('')}</tr>`).join('');
      content = `<div class="slide-inner"><h2>${slide.name}</h2><div class="tbl-wrap"><table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div></div>`;
    } else if (slide.id === 'risk') {
      const items = risks.slice(0, 6).map(r => {
        const sev = r.severity || 'medium';
        return `<div class="risk-row risk-${sev}"><span class="sev-badge">${sev.toUpperCase()}</span><span>${r.risk || ''}</span></div>`;
      }).join('');
      content = `<div class="slide-inner"><h2>${slide.name}</h2><div class="risks-list">${items || '<p>No risks identified.</p>'}</div></div>`;
    } else if (slide.id === 'recs') {
      const items = recs.slice(0, 5).map((r, i) => `<div class="rec-row"><div class="rec-n">${i+1}</div><div>${typeof r === 'string' ? r : JSON.stringify(r)}</div></div>`).join('');
      content = `<div class="slide-inner"><h2>${slide.name}</h2><div class="recs-list">${items || '<p>No recommendations.</p>'}</div></div>`;
    } else {
      const rows = rawData.slice(0, 15);
      const thead = cols.map(c => `<th>${c}</th>`).join('');
      const tbody = rows.map(r => `<tr>${cols.map(c => `<td>${r[c] ?? ''}</td>`).join('')}</tr>`).join('');
      content = `<div class="slide-inner"><h2>${slide.name}</h2><div class="tbl-wrap"><table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div></div>`;
    }

    return `<div class="slide" id="slide-${idx}">${content}</div>`;
  }).join('');

  const navDots = activeSlides.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" onclick="goTo(${i})"></div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>FinGenie Analyst Deck</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0a0a1a; color: white; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
  .slides-container { flex: 1; position: relative; overflow: hidden; }
  .slide { position: absolute; inset: 0; background: ${t.bg}; color: ${t.fg}; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.4s; pointer-events: none; }
  .slide.active { opacity: 1; pointer-events: auto; }
  .slide-inner { width: 90%; max-width: 960px; }
  .cover-slide { text-align: center; }
  .cover-eyebrow { font-size: 12px; letter-spacing: 3px; opacity: 0.5; margin-bottom: 20px; }
  .cover-title { font-size: 42px; font-family: Georgia, serif; line-height: 1.2; margin-bottom: 30px; }
  .cover-foot { font-size: 13px; opacity: 0.45; }
  h2 { font-size: 28px; font-family: Georgia, serif; font-weight: 400; border-bottom: 2px solid ${t.accent}; padding-bottom: 12px; margin-bottom: 24px; color: ${t.accent}; }
  .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .kpi-box { border: 1px solid ${t.accent}44; border-radius: 10px; padding: 18px; }
  .kpi-nm { font-size: 11px; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi-vl { font-size: 28px; font-weight: 600; margin: 6px 0; }
  .kpi-tr { font-size: 12px; padding: 2px 10px; border-radius: 20px; }
  .kpi-tr.up { background: #d1fae520; color: #34d399; }
  .kpi-tr.down { background: #fee2e220; color: #f87171; }
  .kpi-tr.neutral, .kpi-tr.stable { background: #f3f4f620; color: #aaa; }
  .tbl-wrap { overflow: auto; max-height: 55vh; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: ${t.accent}; color: white; padding: 10px; text-align: left; position: sticky; top: 0; }
  td { padding: 8px 10px; border-bottom: 1px solid ${t.accent}22; }
  .risks-list { display: flex; flex-direction: column; gap: 10px; }
  .risk-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; font-size: 14px; }
  .risk-critical, .risk-high { background: #fee2e218; border-left: 3px solid #ef4444; }
  .risk-medium { background: #fef3c718; border-left: 3px solid #f59e0b; }
  .risk-low { background: #d1fae518; border-left: 3px solid #22c55e; }
  .sev-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; background: rgba(255,255,255,0.1); }
  .recs-list { display: flex; flex-direction: column; gap: 14px; }
  .rec-row { display: flex; align-items: flex-start; gap: 14px; font-size: 14px; line-height: 1.5; }
  .rec-n { width: 28px; height: 28px; border-radius: 50%; background: ${t.accent}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
  .navbar { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px; background: rgba(0,0,0,0.3); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.25); cursor: pointer; transition: background 0.2s; }
  .dot.active { background: ${t.accent}; }
  .nav-btn { background: none; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
  .nav-btn:hover { background: rgba(255,255,255,0.1); }
  .slide-counter { font-size: 12px; opacity: 0.5; min-width: 60px; text-align: center; }
</style>
</head>
<body>
<div class="slides-container" id="slides">${slideContents}</div>
<div class="navbar">
  <button class="nav-btn" onclick="prev()">← Prev</button>
  ${navDots}
  <button class="nav-btn" onclick="next()">Next →</button>
  <span class="slide-counter" id="counter">1 / ${activeSlides.length}</span>
</div>
<script>
  let cur = 0;
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.dot');
  const counter = document.getElementById('counter');
  function goTo(n) {
    slides[cur].classList.remove('active');
    dots[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dots[cur].classList.add('active');
    counter.textContent = (cur + 1) + ' / ' + slides.length;
  }
  function next() { goTo(cur + 1); }
  function prev() { goTo(cur - 1); }
  document.addEventListener('keydown', e => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });
  goTo(0);
<\/script>
</body>
</html>`;
}

// ─── Slide Previews (unchanged) ──────────────────────────────────────────────
function CoverSlidePreview() {
  return (
    <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 8, padding: 20, color: 'white', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 140 }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.5, marginBottom: 8 }}>Confidential · FinGenie Analysis</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.25, color: 'white' }}>Financial Analysis Report</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 }}>
        <div style={{ fontSize: 10, opacity: 0.5 }}>Your Company</div>
        <div style={{ fontSize: 10, opacity: 0.5 }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
  );
}
function KPISlidePreview() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--rc-ink)', paddingBottom: 6, borderBottom: '0.5px solid var(--rc-border)' }}>Key Performance Indicators</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1 }}>
        {[['Revenue','$4.2M','+12.4%',true],['Gross Margin','38.5%','+2.1%',true],['Net Income','$620K','−4.2%',false],['Current Ratio','2.1x','Healthy',true]].map(([l,v,b,pos]) => (
          <div key={l} style={{ background: 'var(--rc-surface)', borderRadius: 6, padding: '10px 12px', border: '0.5px solid var(--rc-border)' }}>
            <div style={{ fontSize: 9, color: 'var(--rc-ink3)', textTransform: 'uppercase' }}>{l}</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--rc-ink)', margin: '2px 0' }}>{v}</div>
            <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 10, background: pos ? '#d1fae5' : '#fee2e2', color: pos ? '#065f46' : '#991b1b' }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function GenericPreview({ name }) {
  return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rc-ink3)', fontSize: 13 }}>{name}</div>;
}
const SLIDE_PREVIEWS = {
  cover: CoverSlidePreview,
  kpi: KPISlidePreview,
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function AnalystDeck({ analysisResult }) {
  const [slides, setSlides]       = useState(DEFAULT_SLIDES);
  const [activeSlide, setActive]  = useState('cover');
  const [theme, setTheme]         = useState('dark');
  const [generating, setGen]      = useState(false);
  const [status, setStatus]       = useState({ type: null, msg: '' });

  const toggleSlide = (id, e) => {
    e.stopPropagation();
    setSlides(prev => prev.map(s => s.id === id ? { ...s, on: !s.on } : s));
  };

  const handleExport = async (formatId) => {
    setGen(true);
    setStatus({ type: null, msg: '' });
    try {
      if (formatId === 'pptx') {
        const pptx = await generatePptx({ analysisResult, slides, theme });
        await pptx.writeFile({ fileName: 'fingenie-analyst-deck.pptx' });
        setStatus({ type: 'ok', msg: '✅ PPTX downloaded! Open it in PowerPoint or Google Slides.' });
      } else if (formatId === 'pdf-slides') {
        // Web slideshow → open print dialog → save as PDF
        const html = buildSlideshowHTML({ analysisResult, slides, theme });
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        setStatus({ type: 'ok', msg: '✅ Slideshow opened in new tab. Use Ctrl+P → Save as PDF to export.' });
      } else if (formatId === 'web-slides') {
        const html = buildSlideshowHTML({ analysisResult, slides, theme });
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'fingenie-slides.html';
        a.click();
        URL.revokeObjectURL(url);
        setStatus({ type: 'ok', msg: '✅ Web slideshow downloaded! Open the .html file in any browser. Use arrow keys to navigate.' });
      }
    } catch (err) {
      setStatus({ type: 'err', msg: '❌ Export failed: ' + err.message });
    } finally {
      setGen(false);
      setTimeout(() => setStatus({ type: null, msg: '' }), 7000);
    }
  };

  const PreviewComponent = SLIDE_PREVIEWS[activeSlide] || (() => <GenericPreview name={slides.find(s => s.id === activeSlide)?.name || activeSlide} />);
  const activeSlideData  = slides.find(s => s.id === activeSlide);

  return (
    <div className="layer-panel-inner">
      {/* Theme selector */}
      <div className="slide-theme-row">
        <span className="st-label-sm">Theme:</span>
        {THEMES.map(t => (
          <button key={t.id} className={`theme-pill ${theme === t.id ? 'selected' : ''}`} onClick={() => setTheme(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Deck config */}
      <div className="deck-config">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>Slide order &amp; visibility</div>
          <div className="deck-slides-list">
            {slides.map(slide => (
              <div key={slide.id} className={`slide-row ${activeSlide === slide.id ? 'active-slide' : ''}`} onClick={() => setActive(slide.id)}>
                <span className="sr-drag">⠿</span>
                <span className="sr-num">{slide.num}</span>
                <span className="sr-name">{slide.name}</span>
                <div className={`sr-toggle ${slide.on ? 'on' : ''}`} onClick={(e) => toggleSlide(slide.id, e)} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>Preview</div>
          <div className="slide-preview-panel">
            <div className="sp-topbar">
              <div className="sp-dot" style={{ background: '#f87171' }} />
              <div className="sp-dot" style={{ background: '#fbbf24' }} />
              <div className="sp-dot" style={{ background: '#34d399' }} />
              <div className="sp-title">Slide {activeSlideData?.num} — {activeSlideData?.name}</div>
            </div>
            <div className="slide-canvas">
              <PreviewComponent />
            </div>
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="deck-actions">
        <button className="rc-btn rc-btn-export" onClick={() => handleExport('pptx')} disabled={generating}>
          {generating ? <><span className="rc-spinner"/>Generating…</> : '📊 Export as PPTX ↗'}
        </button>
        <button className="rc-btn rc-btn-ghost" onClick={() => handleExport('pdf-slides')} disabled={generating}>
          📄 PDF via Print
        </button>
        <button className="rc-btn rc-btn-ghost" onClick={() => handleExport('web-slides')} disabled={generating}>
          🌐 Web Slideshow
        </button>
      </div>

      {status.msg && (
        <div className={`success-flash ${status.type === 'err' ? 'error-flash' : ''}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
