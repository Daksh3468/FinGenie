import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler
} from 'chart.js';
import { TrendingUp, Database, Calendar, BarChart2, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export function formatNumber(val) {
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
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0f172a', titleFont: { size: 12 }, bodyFont: { size: 11 } } },
    scales: { x: { display: false }, y: { display: false } }
  };

  return (
    <div className="trends-audit fade-in slide-up" style={{ paddingBottom: 'var(--space-2xl)' }}>
      <div className="d-flex justify-between items-start mb-xl pb-lg" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <header className="page-header">
          <div className="d-flex items-center gap-2 mb-xs">
            <TrendingUp className="text-accent" size={16} />
            <span className="page-header__eyebrow">Trend Evolution Matrix</span>
          </div>
          <h1 className="page-header__title">
            Historical <span className="page-header__accent">Trends Audit.</span>
          </h1>
          <p className="hero-subtitle">
            Longitudinal analysis of financial metrics over time detecting growth vectors and momentum shifts.
          </p>
        </header>
        
        <div className="text-right" style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '40px' }}>
          <div className="sub-label d-flex items-center gap-2 justify-end">
            <Calendar size={12} />
            <span>Issued Date</span>
          </div>
          <div className="metric-big" style={{ fontSize: '28px' }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid-cols-12" style={{ gap: 'var(--space-xl)' }}>
        <div className="col-span-8">
          <div className="card-light mb-xl" style={{ padding: '40px' }}>
            <div className="d-flex justify-between items-start mb-lg">
              <div>
                <h3 className="section-heading__label" style={{ fontSize: '20px', textTransform: 'none', letterSpacing: 'normal', color: 'var(--text-primary)' }}>
                  Performance Momentum
                </h3>
                <p className="text-secondary" style={{ fontSize: '13px' }}>Historical projection vs detected velocity.</p>
              </div>
              <div className="d-flex gap-2 flex-wrap justify-end">
                {trends && trends.slice(0, 3).map((t, i) => (
                   <span key={i} className={`hero-badge ${t.direction === 'up' ? 'text-emerald' : 'text-rose'}`} style={{ background: t.direction === 'up' ? 'rgba(5, 150, 105, 0.05)' : 'rgba(225, 29, 72, 0.05)' }}>
                     {t.metric} {t.direction === 'up' ? '↑' : '↓'}
                   </span>
                ))}
              </div>
            </div>
            
            <div style={{ height: '320px', padding: '24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-blue-light)', border: '1px solid var(--border-light)' }}>
              {chartDataConfig ? (
                <Line data={chartDataConfig} options={chartOptions} />
              ) : (
                <div className="d-flex items-center justify-center h-full text-muted">No trend data available.</div>
              )}
            </div>
          </div>

          <div className="grid-2x2">
            <div className="card-light" style={{ background: 'var(--bg-blue-light)', border: 'none' }}>
               <div className="sub-label">Observations</div>
               <div className="d-flex items-center gap-4">
                 <div className="metric-big" style={{ fontSize: '48px' }}>{trends ? trends.length : 0}</div>
                 <p className="text-secondary" style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>Detected performance anomalies</p>
               </div>
            </div>
            <div className="card-light" style={{ background: 'var(--bg-navy)', border: 'none', color: 'white' }}>
               <div className="sub-label" style={{ color: 'rgba(255,255,255,0.4)' }}>Exposure Profile</div>
               <div className="metric-big" style={{ color: 'white', fontSize: '28px', marginTop: '4px' }}>
                 {result.risks && result.risks.some(r => r.severity === 'critical') ? 'High Volatility' : 'Stable Ops'}
               </div>
               <div className="d-flex items-center gap-2 mt-sm" style={{ color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 700 }}>
                 <Activity size={14} />
                 <span>Real-time Risk Monitoring</span>
               </div>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="card-light" style={{ height: '100%' }}>
            <div className="section-heading mb-md">
              <Database className="text-secondary" size={18} />
              <h3 className="section-heading__label" style={{ fontSize: '16px' }}>Snapshot Audit</h3>
            </div>
            
            <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column' }}>
              {raw_data && raw_data.slice(0, 10).map((row, idx) => {
                 const strCols = column_headers.filter(c => typeof row[c] === 'string');
                 const numCols = column_headers.filter(c => typeof row[c] === 'number');
                 const label = strCols.length > 0 ? row[strCols[0]] : `Entry-${idx}`;
                 const val = numCols.length > 0 ? row[numCols[0]] : '-';
                 const isPositive = typeof val === 'number' && val >= 0;
                 
                 return (
                  <div key={idx} className="d-flex justify-between items-center py-sm" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="text-primary font-bold truncate" style={{ fontSize: '14px' }}>{label}</div>
                      <div className="text-muted" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>FG-{2000+idx}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-bold" style={{ fontSize: '16px' }}>{typeof val === 'number' ? formatNumber(val) : val}</div>
                      {typeof val === 'number' && (
                        <div className={`d-flex items-center gap-1 justify-end ${isPositive ? 'text-emerald' : 'text-rose'}`} style={{ fontSize: '10px', fontWeight: 800 }}>
                          {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          <span>{isPositive ? 'GAIN' : 'DEFICIT'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                 );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
