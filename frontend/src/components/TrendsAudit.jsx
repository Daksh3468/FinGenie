import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

function formatNumber(val) {
  if (typeof val !== 'number') return val;
  return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function TrendsAudit({ result }) {
  if (!result) return null;

  const { raw_data, column_headers, trends } = result;

  let chartDataConfig = null;
  if (raw_data && raw_data.length > 0 && column_headers) {
    const stringCol = column_headers.find(c => typeof raw_data[0][c] === 'string') || column_headers[0];
    const numericCol = column_headers.find(c => typeof raw_data[0][c] === 'number');

    if (stringCol && numericCol) {
      const labels = raw_data.slice(0, 15).map(r => String(r[stringCol]).substring(0, 10));
      const datasetData = raw_data.slice(0, 15).map(r => r[numericCol] || 0);

      chartDataConfig = {
        labels,
        datasets: [{
          label: numericCol,
          data: datasetData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 3
        }]
      };
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111827', titleFont: { size: 12 }, bodyFont: { size: 11 } } },
    scales: { x: { display: false }, y: { display: false } }
  };

  return (
    <div className="trends-audit fade-in slide-up" style={{ marginBottom: 'var(--space-2xl)', paddingTop: 'var(--space-md)' }}>
      <div className="report-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--border-light)', paddingBottom: '32px'}}>
        <div>
          <div className="sub-label" style={{color: 'var(--accent-emerald)', marginBottom: '8px', fontSize: '13px'}}>Institutional Trend Synthesis</div>
          <h1 className="big-title" style={{fontSize: '48px'}}>Financial Velocity <br/><span style={{color: 'var(--text-secondary)'}}>Audit Report</span></h1>
        </div>
        <div style={{textAlign: 'right', borderLeft: '1px solid var(--border)', paddingLeft: '40px'}}>
          <div className="sub-label" style={{fontSize: '13px'}}>Issued Date</div>
          <div style={{fontSize: '28px', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--bg-navy)', letterSpacing: '-1px'}}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid-cols-12" style={{gap: '60px'}}>
        <div className="col-span-8">
          <div className="card-light mb-12" style={{padding: '48px'}}>
            <div className="d-flex justify-between items-center mb-8">
              <div>
                <h3 style={{fontSize: '24px', fontWeight: 900, marginBottom: '4px'}}>Performance Momentum</h3>
                <div style={{fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500}}>Historical projection vs detected velocity.</div>
              </div>
              <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                {trends && trends.map((t, i) => (
                   <span key={i} style={{padding: '6px 14px', background: t.direction === 'up' ? 'hsl(160, 80%, 96%)' : 'hsl(0, 100%, 98%)', color: t.direction === 'up' ? 'var(--accent-emerald)' : 'var(--accent-rose)', borderRadius: '8px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.05em', whiteSpace: 'nowrap'}}>
                     {t.metric.toUpperCase()} {t.direction === 'up' ? '↑' : '↓'}
                   </span>
                ))}
              </div>
            </div>
            
            <div style={{height: '320px', marginTop: '24px', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)'}}>
              {chartDataConfig ? (
                <Line data={chartDataConfig} options={chartOptions} />
              ) : (
                <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '15px'}}>No trend data.</div>
              )}
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px'}}>
            <div className="card-blue" style={{padding: '32px'}}>
               <div className="sub-label" style={{fontSize: '12px'}}>Observations</div>
               <div className="d-flex items-center gap-8">
                 <div className="metric-big" style={{fontSize: '56px'}}>{trends ? trends.length : 0}</div>
                 <div style={{fontSize: '15px', fontWeight: 700, opacity: 0.8, maxWidth: '140px', lineHeight: 1.3, color: 'var(--bg-navy)'}}>Anomalies flagged for review.</div>
               </div>
            </div>
            <div className="card-dark" style={{padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
               <div className="sub-label" style={{color: 'rgba(255,255,255,0.4)', fontSize: '12px'}}>Volatility Index</div>
               <div className="metric-big" style={{color: 'white', fontSize: '32px', marginTop: '4px'}}>
                 {result.risks && result.risks.some(r => r.severity === 'critical') ? 'High Exposure' : 'Stable Ops'}
               </div>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card-light" style={{height: 'fit-content', padding: '32px'}}>
            <div className="sub-label">Snapshot Audit</div>
            <h3 style={{fontSize: '20px', fontWeight: 900, marginBottom: '24px'}}>Primary Movers</h3>

            {raw_data && column_headers && (
              <div className="custom-scrollbar" style={{display: 'flex', flexDirection: 'column', gap: '0', overflowY: 'auto', overflowX: 'hidden', maxHeight: '560px', paddingRight: '28px', paddingBottom: '12px', width: '100%', boxSizing: 'border-box'}}>
                {raw_data.slice(0, 8).map((row, idx) => {
                   const strCols = column_headers.filter(c => typeof row[c] === 'string');
                   const numCols = column_headers.filter(c => typeof row[c] === 'number');
                   const label = strCols.length > 0 ? row[strCols[0]] : `ID-${idx}`;
                   const val = numCols.length > 0 ? row[numCols[0]] : '-';
                   
                   return (
                    <div key={idx} className="metric-row" style={{padding: '20px 0', borderBottom: '1px solid var(--border-light)', marginRight: '4px', gap: '16px'}}>
                      <div style={{flex: 1, minWidth: 0}}>
                        <div style={{fontSize: '14px', fontWeight: 800, color: 'var(--bg-navy)', lineHeight: 1.4, marginBottom: '2px'}}>{label}</div>
                        <div style={{fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', opacity: 0.6}}>FG-{2000+idx}</div>
                      </div>
                      <div style={{textAlign: 'right', flexShrink: 0, minWidth: '95px'}}>
                        <div style={{fontSize: '19px', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--bg-navy)', lineHeight: 1}}>{typeof val === 'number' ? formatNumber(val) : val}</div>
                        {typeof val === 'number' && (
                           <div style={{fontSize: '11px', fontWeight: 900, color: val > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', letterSpacing: '0.02em', marginTop: '4px'}}>
                             {val > 0 ? '↑' : '↓'} {val > 0 ? 'GAIN' : 'DEFICIT'}
                           </div>
                        )}
                      </div>
                    </div>
                   );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
