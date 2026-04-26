import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RiskAssessment from '../../components/RiskAssessment';

// ── Mock Chart.js / react-chartjs-2 ──────────────────────────────────────────
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }) => (
    <div data-testid="bar-chart">
      {data.labels.map((l, i) => (
        <span key={i} data-testid={`chart-label-${i}`}>{l}</span>
      ))}
    </div>
  ),
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  CategoryScale: class {},
  LinearScale: class {},
  BarElement: class {},
  Title: class {},
  Tooltip: class {},
}));

// ── helpers ───────────────────────────────────────────────────────────────────
const makeRisk = (severity, overrides = {}) => ({
  risk: `${severity} risk name`,
  severity,
  description: `${severity} description text`,
  mitigation: `Mitigate the ${severity} risk by doing X.`,
  ...overrides,
});

describe('RiskAssessment', () => {
  // ── null guard ────────────────────────────────────────────────────────────
  it('returns null when result is undefined', () => {
    const { container } = render(<RiskAssessment />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when result is null', () => {
    const { container } = render(<RiskAssessment result={null} />);
    expect(container.firstChild).toBeNull();
  });

  // ── header ────────────────────────────────────────────────────────────────
  it('renders "Risk Exposure Index" eyebrow', () => {
    render(<RiskAssessment result={{ risks: [] }} />);
    expect(screen.getByText('Risk Exposure Index')).toBeInTheDocument();
  });

  it('renders page title', () => {
    render(<RiskAssessment result={{ risks: [] }} />);
    expect(screen.getByText(/Vulnerability &/)).toBeInTheDocument();
    expect(screen.getByText('Risk Assessment.')).toBeInTheDocument();
  });

  it('renders hero subtitle about automated detection', () => {
    render(<RiskAssessment result={{ risks: [] }} />);
    expect(screen.getByText(/Automated detection/i)).toBeInTheDocument();
  });

  // ── total vectors counter ─────────────────────────────────────────────────
  it('shows "Total Vectors" label', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('low')] }} />);
    expect(screen.getByText('Total Vectors')).toBeInTheDocument();
  });

  it('shows correct count when there are 3 risks', () => {
    const risks = [makeRisk('critical'), makeRisk('high'), makeRisk('low')];
    render(<RiskAssessment result={{ risks }} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows 0 when risks array is empty', () => {
    render(<RiskAssessment result={{ risks: [] }} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows 0 when risks is null (safe fallback)', () => {
    render(<RiskAssessment result={{ risks: null }} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  // ── risk cards render ─────────────────────────────────────────────────────
  it('renders risk name for each risk', () => {
    // Risk names appear in BOTH the vulnerability card AND the mitigation panel,
    // so we use getAllByText and verify at least one match exists.
    const risks = [makeRisk('critical'), makeRisk('medium')];
    render(<RiskAssessment result={{ risks }} />);
    expect(screen.getAllByText('critical risk name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('medium risk name').length).toBeGreaterThan(0);
  });

  it('renders risk description for each risk', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('high')] }} />);
    expect(screen.getByText('high description text')).toBeInTheDocument();
  });

  // ── severity badge labels ─────────────────────────────────────────────────
  it('shows CRITICAL label for critical severity', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('critical')] }} />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('shows HIGH label for high severity', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('high')] }} />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('shows MEDIUM label for medium severity', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('medium')] }} />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('shows LOW label for low severity', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('low')] }} />);
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('falls back to LOW config for unknown severity', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('unknown')] }} />);
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  // ── numeric severity scores ───────────────────────────────────────────────
  it('shows score 9.8 for critical risk', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('critical')] }} />);
    expect(screen.getByText('9.8')).toBeInTheDocument();
  });

  it('shows score 7.5 for high risk', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('high')] }} />);
    expect(screen.getByText('7.5')).toBeInTheDocument();
  });

  it('shows score 4.2 for medium risk', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('medium')] }} />);
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  it('shows score 1.5 for low risk', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('low')] }} />);
    expect(screen.getByText('1.5')).toBeInTheDocument();
  });

  // ── empty state message ───────────────────────────────────────────────────
  it('shows "no institutional risks detected" when risks is empty', () => {
    render(<RiskAssessment result={{ risks: [] }} />);
    expect(screen.getByText(/No institutional risks detected/i)).toBeInTheDocument();
  });

  it('shows empty state when risks is null', () => {
    render(<RiskAssessment result={{ risks: null }} />);
    expect(screen.getByText(/No institutional risks detected/i)).toBeInTheDocument();
  });

  // ── mitigation protocols ──────────────────────────────────────────────────
  it('renders "Mitigation Protocols" heading', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('high')] }} />);
    expect(screen.getByText('Mitigation Protocols')).toBeInTheDocument();
  });

  it('renders mitigation text for risks that have it', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('high')] }} />);
    expect(screen.getByText('Mitigate the high risk by doing X.')).toBeInTheDocument();
  });

  it('renders numbered mitigation index starting at "01"', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('critical')] }} />);
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('skips risks without mitigation field', () => {
    const risks = [
      makeRisk('critical', { mitigation: undefined }),
      makeRisk('high'),
    ];
    render(<RiskAssessment result={{ risks }} />);
    // Only high risk has mitigation → only 1 mitigation entry
    expect(screen.getAllByText(/Mitigate the/i)).toHaveLength(1);
  });

  it('shows max 4 mitigations even with more than 4 risks', () => {
    const risks = Array.from({ length: 6 }, (_, i) => makeRisk('low', { risk: `Risk ${i}`, mitigation: `Fix ${i}` }));
    render(<RiskAssessment result={{ risks }} />);
    const mits = screen.getAllByText(/^Fix \d$/);
    expect(mits).toHaveLength(4);
  });

  it('shows fallback text when no mitigations exist', () => {
    const risks = [makeRisk('low', { mitigation: undefined })];
    render(<RiskAssessment result={{ risks }} />);
    expect(screen.getByText(/Standard operational monitoring/i)).toBeInTheDocument();
  });

  // ── bar chart ─────────────────────────────────────────────────────────────
  it('renders the bar chart', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('critical')] }} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('chart labels use V1, V2, V3 format', () => {
    const risks = [makeRisk('critical'), makeRisk('medium'), makeRisk('low')];
    render(<RiskAssessment result={{ risks }} />);
    expect(screen.getByTestId('chart-label-0')).toHaveTextContent('V1');
    expect(screen.getByTestId('chart-label-1')).toHaveTextContent('V2');
    expect(screen.getByTestId('chart-label-2')).toHaveTextContent('V3');
  });

  it('renders "Exposure Distribution" label above chart', () => {
    render(<RiskAssessment result={{ risks: [makeRisk('high')] }} />);
    expect(screen.getByText('Exposure Distribution')).toBeInTheDocument();
  });

  // ── REVISION badge ────────────────────────────────────────────────────────
  it('shows REVISION V4.2 badge', () => {
    render(<RiskAssessment result={{ risks: [] }} />);
    expect(screen.getByText('REVISION V4.2')).toBeInTheDocument();
  });
});
