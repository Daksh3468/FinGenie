import React from 'react';
import KPICards from './KPICards';
import TrendChart from './TrendChart';
import AISummary from './AISummary';
import RiskCards from './RiskCards';
import Recommendations from './Recommendations';
import DataPreview from './DataPreview';

export default function Analyzer({ result }) {
  if (!result) return null;

  const { summary, kpis, raw_data, column_headers, recommendations, risks, trends, statement_type, parsing_mode } = result;

  return (
    <div className="analyzer-result fade-in slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', paddingTop: 'var(--space-md)' }}>
      {/* 1. Section Title */}
      <div className="report-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '40px' }}>
        <div className="sub-label" style={{ color: 'var(--accent-blue)', marginBottom: '8px', fontSize: '13px' }}>PERFORMANCE INDEX / Q1 2024</div>
        <h1 className="big-title" style={{ fontSize: '48px' }}>Financial Performance <br /><span className="green-text">Intelligence Overview.</span></h1>
        
        <div className="meta-bar" style={{ marginTop: '32px' }}>
          <span className="report-id" style={{ fontSize: '14px' }}>REPORT ID: {statement_type?.toUpperCase() || 'FG-24'}</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', fontWeight: 600 }}>
             <div style={{ width: '8px', height: '8px', background: 'var(--accent-emerald)', borderRadius: '50%' }}></div>
             <span>Parsing Mode: {parsing_mode || 'STANDARD'}</span>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Row */}
      <KPICards kpis={kpis} />

      {/* 3. Charts Section */}
      <TrendChart rawData={raw_data} columns={column_headers} trends={trends} />

      {/* 4. AI Summary */}
      <AISummary summary={summary} />

      {/* 5. Risks & Recommendations Grid */}
      <div className="grid-2x2 gap-6" style={{ marginTop: 'var(--space-md)' }}>
         <RiskCards risks={risks} />
         <Recommendations recommendations={recommendations} />
      </div>

      {/* 6. Data Preview */}
      <DataPreview data={raw_data} columns={column_headers} statementType={statement_type} />
      
    </div>
  );
}
