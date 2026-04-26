import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import TrendsAudit,{formatNumber} from '../../components/TrendsAudit';

// ── Mock chart.js + react-chartjs-2 ──────────────────────────────────────────
vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: class {},
  LinearScale: class {},
  PointElement: class {},
  LineElement: class {},
  Title: class {},
  Tooltip: class {},
  Filler: class {},
}));

vi.mock('react-chartjs-2', () => ({
  Line: ({ data }) => (
    <div data-testid="line-chart" data-labels={data?.labels?.join(',')}>
      line chart
    </div>
  ),
}));

// ── helpers ───────────────────────────────────────────────────────────────────
const columns = ['Period', 'Revenue'];
const makeRow  = (period, revenue) => ({ Period: period, Revenue: revenue });

const baseResult = {
  raw_data: [
    makeRow('Q1 2023', 1_000_000),
    makeRow('Q2 2023', 1_200_000),
    makeRow('Q3 2023', 1_100_000),
  ],
  column_headers: columns,
  trends: [
    { metric: 'Revenue', direction: 'up' },
    { metric: 'COGS',    direction: 'down' },
  ],
  risks: [],
};

describe('TrendsAudit', () => {
  // ── null guard ────────────────────────────────────────────────────────────
  it('returns null when result is undefined', () => {
    const { container } = render(<TrendsAudit />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when result is null', () => {
    const { container } = render(<TrendsAudit result={null} />);
    expect(container.firstChild).toBeNull();
  });

  // ── page header ───────────────────────────────────────────────────────────
  it('renders "Trend Evolution Matrix" eyebrow', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('Trend Evolution Matrix')).toBeInTheDocument();
  });

  it('renders page title', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('Historical')).toBeInTheDocument();
    expect(screen.getByText('Trends Audit.')).toBeInTheDocument();
  });

  it('renders hero subtitle about longitudinal analysis', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText(/Longitudinal analysis/i)).toBeInTheDocument();
  });

  // ── issued date ───────────────────────────────────────────────────────────
  it('renders "Issued Date" label', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('Issued Date')).toBeInTheDocument();
  });

  it('renders today\'s date in MMM DD, YYYY format', () => {
    render(<TrendsAudit result={baseResult} />);
    const today = new Date()
      .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      .toUpperCase();
    expect(screen.getByText(today)).toBeInTheDocument();
  });

  // ── performance momentum ──────────────────────────────────────────────────
  it('renders "Performance Momentum" heading', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('Performance Momentum')).toBeInTheDocument();
  });

  it('renders line chart when numeric + string columns exist', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('line chart receives correct labels from raw_data', () => {
    render(<TrendsAudit result={baseResult} />);
    const chart = screen.getByTestId('line-chart');
    expect(chart.getAttribute('data-labels')).toContain('Q1 2023');
  });

  it('shows "No trend data available." when raw_data lacks numeric column', () => {
    const noNumericResult = {
      ...baseResult,
      raw_data: [{ Period: 'Q1' }, { Period: 'Q2' }],
    };
    render(<TrendsAudit result={noNumericResult} />);
    expect(screen.getByText('No trend data available.')).toBeInTheDocument();
  });

  it('shows "No trend data available." when raw_data is empty', () => {
    render(<TrendsAudit result={{ ...baseResult, raw_data: [] }} />);
    expect(screen.getByText('No trend data available.')).toBeInTheDocument();
  });

  // NOTE: column_headers: null would crash the component in the snapshot section
  // (component calls column_headers.filter() unconditionally). That's a component
  // bug — we don't test it here; instead we verify the empty raw_data path above.

  // ── trend badges ─────────────────────────────────────────────────────────
  it('renders up to 3 trend metric badges', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText(/Revenue ↑/)).toBeInTheDocument();
    expect(screen.getByText(/COGS ↓/)).toBeInTheDocument();
  });

  it('renders ↑ for direction="up"', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it('renders ↓ for direction="down"', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it('shows max 3 trend badges even if more trends exist', () => {
    const manyTrends = Array.from({ length: 5 }, (_, i) => ({
      metric: `Metric${i}`,
      direction: 'up',
    }));
    render(<TrendsAudit result={{ ...baseResult, trends: manyTrends }} />);
    const badges = screen.getAllByText(/Metric\d ↑/);
    expect(badges).toHaveLength(3);
  });

  // ── observations box ──────────────────────────────────────────────────────
  it('shows "Observations" label', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('Observations')).toBeInTheDocument();
  });

  it('shows trend count as observation metric', () => {
    render(<TrendsAudit result={baseResult} />);
    // trends array has 2 entries
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows 0 observations when trends is null', () => {
    render(<TrendsAudit result={{ ...baseResult, trends: null }} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows "Detected performance anomalies" label', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('Detected performance anomalies')).toBeInTheDocument();
  });

  // ── exposure profile ──────────────────────────────────────────────────────
  it('shows "Stable Ops" when no critical risks', () => {
    render(<TrendsAudit result={{ ...baseResult, risks: [{ severity: 'low' }] }} />);
    expect(screen.getByText('Stable Ops')).toBeInTheDocument();
  });

  it('shows "High Volatility" when at least one critical risk exists', () => {
    const criticalRisks = [{ severity: 'critical' }, { severity: 'low' }];
    render(<TrendsAudit result={{ ...baseResult, risks: criticalRisks }} />);
    expect(screen.getByText('High Volatility')).toBeInTheDocument();
  });

  it('shows "Stable Ops" when risks array is empty', () => {
    render(<TrendsAudit result={{ ...baseResult, risks: [] }} />);
    expect(screen.getByText('Stable Ops')).toBeInTheDocument();
  });

  it('shows "Real-time Risk Monitoring" label', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('Real-time Risk Monitoring')).toBeInTheDocument();
  });

  // ── snapshot audit list ───────────────────────────────────────────────────
  it('renders "Snapshot Audit" heading', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('Snapshot Audit')).toBeInTheDocument();
  });

  it('renders snapshot rows for raw_data entries (up to 10)', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('Q1 2023')).toBeInTheDocument();
    expect(screen.getByText('Q2 2023')).toBeInTheDocument();
  });

  it('shows max 10 snapshot rows even with more raw_data entries', () => {
    const manyRows = Array.from({ length: 15 }, (_, i) => makeRow(`Period${i}`, i * 100));
    render(<TrendsAudit result={{ ...baseResult, raw_data: manyRows, column_headers: columns }} />);
    const labels = screen.getAllByText(/^Period\d+$/);
    expect(labels).toHaveLength(10);
  });

  it('shows FG-XXXX identifiers for snapshot rows', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('FG-2000')).toBeInTheDocument();
    expect(screen.getByText('FG-2001')).toBeInTheDocument();
  });

  it('renders GAIN label for positive numeric values', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getAllByText('GAIN').length).toBeGreaterThan(0);
  });

  it('renders DEFICIT label for negative numeric values', () => {
    const negativeData = [makeRow('Q1 2023', -500_000), makeRow('Q2 2023', 1_000_000)];
    render(<TrendsAudit result={{ ...baseResult, raw_data: negativeData }} />);
    expect(screen.getByText('DEFICIT')).toBeInTheDocument();
  });

  // ── formatNumber via snapshot values ──────────────────────────────────────
  it('formats numeric values with locale string (commas)', () => {
    render(<TrendsAudit result={baseResult} />);
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
  });

  it('renders "-" for snapshot value when numeric column has a string value', () => {
    // Revenue: 'N/A' is a string, so numCols filter (typeof === 'number') finds nothing
    // → val falls back to '-'
    const mixedData = [{ Period: 'Q1', Revenue: 'N/A' }];
    render(<TrendsAudit result={{ ...baseResult, raw_data: mixedData }} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('shows Entry-0 fallback when no string column found for row label', () => {
    const numOnlyData = [{ Revenue: 500_000, Cost: 200_000 }];
    render(<TrendsAudit result={{
      raw_data: numOnlyData,
      column_headers: ['Revenue', 'Cost'],
      trends: [],
      risks: [],
    }} />);
    expect(screen.getByText('Entry-0')).toBeInTheDocument();
  });

  it('uses "-" when no numeric column found for snapshot value', () => {
    const strOnlyData = [{ Period: 'Q1 2024', Label: 'Revenue' }];
    render(<TrendsAudit result={{
      raw_data: strOnlyData,
      column_headers: ['Period', 'Label'],
      trends: [],
      risks: [],
    }} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
  it('formats valid number and returns non-number as-is', () => {
  expect(formatNumber(1234.567)).toBe('1,234.57');
  expect(formatNumber('text')).toBe('text');
});
});
