import { useState } from 'react';

export default function DataPreview({ data, columns, statementType }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data || data.length === 0) return null;

  const displayData = isExpanded ? data : data.slice(0, 8);

  return (
    <div className="card-light fade-in hover-lift" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-xl)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>📊</span>
          <h2 className="sub-label" style={{ margin: 0, color: 'var(--bg-navy)' }}>Raw Data Ledger</h2>
          {statementType && (
            <span style={{ padding: '4px 10px', background: 'var(--bg-blue-light)', color: 'var(--accent-blue)', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
              {statementType}
            </span>
          )}
        </div>
        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          {isExpanded ? '▲ Collapse' : '▼ Show All'} ({data.length} rows)
        </button>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
        <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={{ padding: '12px 16px', fontSize: '10px', textAlign: i > 0 ? 'right' : 'left' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx} style={{ padding: '12px 16px', fontSize: '13px', textAlign: colIdx > 0 ? 'right' : 'left', fontWeight: colIdx > 0 ? 700 : 400, borderTop: '1px solid var(--border-light)' }}>
                    {formatCell(row[col], colIdx > 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCell(value, isNumeric) {
  if (value === null || value === undefined || value === '') return '—';
  if (isNumeric && typeof value === 'number') {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
  return String(value);
}
