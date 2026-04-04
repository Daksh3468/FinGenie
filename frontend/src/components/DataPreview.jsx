import { useState } from 'react';

export default function DataPreview({ data, columns, statementType }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data || data.length === 0) return null;

  const displayData = isExpanded ? data : data.slice(0, 8);

  return (
    <section className="card data-preview-card fade-in" id="data-preview-section">
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
        <div className="card-header-left">
          <span className="card-icon">📊</span>
          <h2>Extracted Data</h2>
          <span className="badge badge-info">{statementType}</span>
        </div>
        <button className="expand-btn" id="toggle-preview-btn">
          {isExpanded ? '▲ Collapse' : '▼ Show All'} ({data.length} rows)
        </button>
      </div>
      <div className="table-wrapper">
        <table className="data-table" id="data-preview-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={colIdx > 0 ? 'numeric' : 'label'}>
                    {formatCell(row[col], colIdx > 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
