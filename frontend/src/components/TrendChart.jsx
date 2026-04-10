import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function TrendChart({ rawData, columns, trends }) {
  const [activeTab, setActiveTab] = useState('bar');

  if (!rawData || rawData.length === 0) return null;

  // Prepare chart data from raw financial data
  const numericCols = columns.filter((col, idx) => idx > 0);
  const labelCol = columns[0];

  // For bar/line chart: show first 10 rows with numeric data
  const chartData = rawData
    .slice(0, 15)
    .filter(row => numericCols.some(col => typeof row[col] === 'number'))
    .map(row => {
      const item = { name: String(row[labelCol] || '').substring(0, 25) };
      numericCols.forEach(col => {
        if (typeof row[col] === 'number') {
          item[col] = row[col];
        }
      });
      return item;
    })
    .filter(item => Object.keys(item).length > 1);

  // For pie chart: pick the last numeric column's values
  const pieCol = numericCols[numericCols.length - 1];
  const pieData = chartData
    .filter(d => d[pieCol] && d[pieCol] > 0)
    .slice(0, 8)
    .map(d => ({ name: d.name, value: Math.abs(d[pieCol]) }));

  const tabs = [
    { key: 'bar', label: '📊 Comparison', icon: '' },
    { key: 'line', label: '📈 Trends', icon: '' },
    { key: 'pie', label: '🥧 Composition', icon: '' },
  ];

  return (
    <div className="card-light fade-in hover-lift" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-md)' }}>
        <span style={{ fontSize: '28px' }}>📉</span>
        <h2 className="sub-label" style={{ margin: 0, color: 'var(--bg-navy)' }}>Visual Analytics</h2>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`btn-secondary ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            style={{ padding: '8px 16px', fontSize: '13px', background: activeTab === tab.key ? 'var(--bg-navy)' : 'transparent', color: activeTab === tab.key ? 'white' : 'var(--text-secondary)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="chart-container">
        {activeTab === 'bar' && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatTick} />
              <Tooltip
                contentStyle={{ background: '#1e1e3a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#e2e8f0' }}
                formatter={(value) => [formatNumber(value), '']}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              {numericCols.slice(0, 4).map((col, idx) => (
                <Bar key={col} dataKey={col} fill={COLORS[idx % COLORS.length]} radius={[6, 6, 0, 0]} opacity={0.85} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'line' && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <defs>
                {numericCols.slice(0, 4).map((col, idx) => (
                  <linearGradient key={col} id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatTick} />
              <Tooltip
                contentStyle={{ background: '#1e1e3a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#e2e8f0' }}
                formatter={(value) => [formatNumber(value), '']}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              {numericCols.slice(0, 4).map((col, idx) => (
                <Area
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[idx % COLORS.length]}
                  fill={`url(#gradient-${idx})`}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS[idx % COLORS.length] }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'pie' && pieData.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: '#64748b' }}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e1e3a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#e2e8f0' }}
                formatter={(value) => [formatNumber(value), '']}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        {chartData.length === 0 && (
          <div className="chart-empty">
            <p>Not enough numeric data to generate charts.</p>
          </div>
        )}
      </div>

      {/* Trend Summary Cards */}
      {trends && trends.length > 0 && (
        <div className="trend-summary">
          <h3>Detected Trends</h3>
          <div className="trend-chips">
            {trends.map((trend, idx) => (
              <div key={idx} className={`trend-chip trend-${trend.direction}`}>
                <span className="trend-arrow">
                  {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
                </span>
                <span className="trend-label">{trend.metric}</span>
                <span className="trend-mag">{trend.magnitude}%</span>
                <span className="trend-period">{trend.period}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTick(val) {
  if (Math.abs(val) >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
  if (Math.abs(val) >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
  if (Math.abs(val) >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
  return val.toFixed(0);
}

function formatNumber(val) {
  if (typeof val !== 'number') return val;
  return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
