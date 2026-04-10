import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const SEVERITY_CONFIG = {
  critical: { color: 'var(--accent-rose)', icon: '⚠️', label: 'CRITICAL', bg: 'hsl(0, 100%, 98%)' },
  high:     { color: '#f97316', icon: '🟠', label: 'HIGH', bg: 'hsl(25, 100%, 98%)' },
  medium:   { color: '#f59e0b', icon: '🟡', label: 'MEDIUM', bg: 'hsl(45, 100%, 98%)' },
  low:      { color: 'var(--accent-emerald)', icon: '🟢', label: 'LOW', bg: 'hsl(160, 80%, 98%)' },
};

export default function RiskAssessment({ result }) {
  if (!result) return null;

  const { risks } = result;
  const safeRisks = risks || [];

  const chartData = {
    labels: safeRisks.map((_, i) => `R${i+1}`),
    datasets: [{
      label: 'Severity Level',
      data: safeRisks.map(r => r.severity === 'critical' ? 4 : r.severity === 'high' ? 3 : r.severity === 'medium' ? 2 : 1),
      backgroundColor: (ctx) => {
        const val = ctx.raw;
        return val === 4 ? 'var(--accent-rose)' : val === 3 ? '#f97316' : val === 2 ? '#f59e0b' : 'var(--accent-emerald)';
      },
      borderRadius: 4,
      barThickness: 16
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false, max: 5 } }
  };

  const mitigations = safeRisks.filter(r => r.mitigation).map(r => ({
    name: r.risk,
    text: r.mitigation
  }));

  return (
    <div className="risk-assessment fade-in slide-up" style={{ marginBottom: 'var(--space-2xl)', paddingTop: 'var(--space-md)' }}>
      <div className="report-header" style={{marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--border-light)', paddingBottom: '32px'}}>
        <div className="sub-label" style={{color: 'var(--accent-rose)', marginBottom: '8px', fontSize: '13px'}}>Vector Vulnerability Audit</div>
        <h1 className="big-title" style={{fontSize: '48px'}}>Financial Risk <br/><span style={{color: 'var(--text-secondary)'}}>Ledger.</span></h1>
        
        <div style={{marginTop: '32px'}}>
          <div className="card-light" style={{padding: '24px 48px', display: 'flex', gap: '48px', alignItems: 'center', width: 'fit-content'}}>
            <div>
              <div className="sub-label" style={{marginBottom: '4px', fontSize: '12px'}}>Total Vectors</div>
              <div style={{fontSize: '40px', fontWeight: 900, color: 'var(--bg-navy)', fontFamily: 'Outfit', lineHeight: 1}}>{safeRisks.length}</div>
            </div>
            <div style={{height: '60px', width: '1px', background: 'var(--border)'}} />
            <div style={{fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 600, maxWidth: '300px', lineHeight: 1.5}}>
               Institutional-grade vectors cross-referenced against global treasury standards.
            </div>
          </div>
        </div>
      </div>

      <div className="grid-cols-12" style={{gap: '40px'}}>
        <div className="col-span-8">
          <div className="card-light" style={{padding: '0', overflow: 'hidden'}}>
            <div style={{padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <h3 style={{fontSize: '16px', fontWeight: 900}}>Risk Identification</h3>
               <div style={{fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)'}}>REVISION V4.2</div>
            </div>
            
            <div style={{padding: '12px'}}>
              {safeRisks.length > 0 ? (
                safeRisks.map((risk, idx) => {
                  const config = SEVERITY_CONFIG[risk.severity] || SEVERITY_CONFIG.low;
                  return (
                    <div key={idx} style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px', 
                      marginBottom: '8px', 
                      background: config.bg, 
                      padding: '16px', 
                      borderRadius: '8px',
                      border: '1px solid transparent'
                    }}>
                      <div style={{fontSize: '20px'}}>{config.icon}</div>
                      <div style={{flex: 1}}>
                        <div style={{fontSize: '9px', fontWeight: 800, color: config.color, letterSpacing: '0.05em', marginBottom: '2px'}}>{config.label}</div>
                        <div style={{fontSize: '15px', fontWeight: 900, color: 'var(--bg-navy)', marginBottom: '2px'}}>{risk.risk}</div>
                        <div style={{fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4}}>{risk.description}</div>
                      </div>
                      <div style={{textAlign: 'right'}}>
                         <div style={{fontSize: '18px', fontWeight: 900, color: config.color, fontFamily: 'Outfit'}}>{risk.severity === 'critical' ? '9.8' : risk.severity === 'high' ? '7.5' : risk.severity === 'medium' ? '4.2' : '1.5'}</div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px'}}>
                   No risks detected.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-4" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          <div className="card-dark" style={{padding: '24px'}}>
            <h3 className="sub-label" style={{color: 'rgba(255,255,255,0.4)', marginBottom: '20px'}}>Mitigation Protocols</h3>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              {mitigations.length > 0 ? (
                mitigations.slice(0, 3).map((mit, idx) => (
                  <div key={idx} style={{display: 'flex', gap: '16px', alignItems: 'flex-start'}}>
                    <div style={{fontSize: '20px', fontWeight: 900, color: 'rgba(255,255,255,0.08)', fontFamily: 'Outfit'}}>0{idx + 1}</div>
                    <div>
                      <div style={{fontSize: '13px', fontWeight: 800, color: 'white', marginBottom: '4px'}}>{mit.name}</div>
                      <div style={{fontSize: '12px', color: '#9ca3af', lineHeight: 1.5}}>{mit.text}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{fontSize: '12px', color: '#9ca3af', opacity: 0.6}}>Standard liquidity monitoring applies.</div>
              )}
            </div>
          </div>

          <div className="card-light" style={{padding: '20px'}}>
            <div className="sub-label">Exposure Distribution</div>
            <div style={{height: '120px', marginTop: '12px'}}>
               <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
