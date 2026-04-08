import React from 'react';

function formatNumber(val) {
  if (typeof val !== 'number') return val;
  return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function Analyzer({ result }) {
  if (!result) return null;

  const { summary, kpis, raw_data, column_headers, recommendations } = result;

  const mainKpis = kpis ? kpis.slice(0, 2) : [];
  const otherKpis = kpis ? kpis.slice(2, 6) : [];

  return (
    <div className="analyzer-result fade-in slide-up">
      <div className="report-header" style={{borderBottom: '1px solid var(--border-light)', paddingBottom: '40px', marginBottom: '64px'}}>
        <div className="sub-label" style={{color: 'var(--accent-blue)', marginBottom: '8px', fontSize: '13px'}}>PERFORMANCE INDEX / Q1 2024</div>
        <h1 className="big-title" style={{fontSize: '48px'}}>Financial Performance <br/><span className="green-text">Intelligence Overview.</span></h1>
        
        <div className="meta-bar" style={{marginTop: '32px'}}>
          <span className="report-id" style={{fontSize: '14px'}}>REPORT ID: {result.statement_type?.toUpperCase() || 'FG-24'}</span>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', fontWeight: 600}}>
             <div style={{width: '8px', height: '8px', background: 'var(--accent-emerald)', borderRadius: '50%'}}></div>
             <span>Parsing Mode: {result.parsing_mode}</span>
          </div>
        </div>
      </div>

      <div className="grid-cols-12" style={{gap: '40px'}}>
        {/* Synthesis Section */}
        <div className="col-span-8">
          <div className="mb-12">
             <div className="sub-label">AI NARRATIVE SYNTHESIS</div>
             <div className="card-light" style={{background: 'var(--bg-blue-light)', padding: '40px', border: '1px solid hsl(var(--p-h), 100%, 94%)'}}>
                <div style={{fontSize: '20px', color: 'var(--text-primary)', lineHeight: 1.8, fontStyle: 'italic', fontWeight: 500}}>
                  "{summary || "Analyzing fiscal narrative datasets..."}"
                </div>
             </div>
          </div>

          <div className="card-dark" style={{padding: '48px'}}>
            <h3 className="sub-label" style={{color: 'rgba(255,255,255,0.4)', marginBottom: '32px', fontSize: '13px'}}>Strategic Directives</h3>
            <div className="d-flex flex-column" style={{gap: '24px'}}>
              {recommendations && recommendations.length > 0 ? (
                recommendations.slice(0, 4).map((rec, idx) => (
                  <div key={idx} style={{display: 'flex', gap: '24px', alignItems: 'flex-start'}}>
                    <div style={{fontSize: '28px', fontWeight: 900, color: 'rgba(255,255,255,0.1)', fontFamily: 'Outfit'}}>0{idx+1}</div>
                    <div style={{fontSize: '16px', color: '#f3f4f6', lineHeight: 1.7}}>{rec}</div>
                  </div>
                ))
              ) : (
                <div style={{color: 'rgba(255,255,255,0.4)', fontSize: '14px'}}>No specific directives.</div>
              )}
            </div>
          </div>
        </div>

        {/* Core Metrics Sidebar */}
        <div className="col-span-4" style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
          {mainKpis.map((kpi, idx) => (
            <div key={idx} className="card-blue" style={{position: 'relative', overflow: 'hidden', padding: '32px'}}>
               <div style={{position: 'absolute', top: '-15px', right: '-15px', fontSize: '64px', opacity: 0.05}}>📊</div>
               <div className="sub-label" style={{marginBottom: '8px', fontSize: '12px'}}>{kpi.name}</div>
               <div className="metric-big" style={{fontSize: '48px', marginBottom: '8px'}}>{kpi.value}</div>
               <div style={{fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4}}>{kpi.description}</div>
            </div>
          ))}

          <div className="card-light" style={{padding: '32px'}}>
            <h3 className="sub-label" style={{marginBottom: '24px', fontSize: '13px'}}>Liquidity & Health</h3>
            <div>
              {otherKpis.map((kpi, idx) => (
                <div key={idx} className="metric-row" style={{padding: '16px 0', borderBottom: idx === otherKpis.length - 1 ? 'none' : '1px solid var(--border-light)'}}>
                  <div style={{fontSize: '15px', fontWeight: 600}}>{kpi.name}</div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '20px', fontWeight: 800}}>{kpi.value}</div>
                    <div style={{fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: kpi.trend === 'up' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}}>
                      {kpi.trend === 'up' ? '↑ POSITIVE' : '↓ NEGATIVE'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      {raw_data && raw_data.length > 0 && (
        <div style={{marginTop: '80px'}}>
           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px'}}>
              <div>
                 <div className="sub-label">Raw Data Ledger</div>
                 <h2 className="big-title" style={{fontSize: '28px', margin: 0}}>Ledger Breakdown.</h2>
              </div>
              <div style={{fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)'}}>
                {raw_data.length} ENTRIES
              </div>
           </div>
           
           <div className="card-light" style={{padding: 0, overflow: 'hidden'}}>
              <table className="custom-table" style={{width: '100%'}}>
                <thead>
                  <tr>
                    {column_headers?.slice(0, 5).map(header => (
                      <th key={header} style={{padding: '12px 16px', fontSize: '10px'}}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {raw_data.slice(0, 15).map((row, idx) => (
                    <tr key={idx}>
                      {column_headers?.slice(0, 5).map(col => {
                        const val = row[col];
                        return (
                          <td key={col} style={{padding: '12px 16px', fontSize: '13px', fontWeight: typeof val === 'number' ? 700 : 400}}>
                            {typeof val === 'number' ? formatNumber(val) : val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
}
