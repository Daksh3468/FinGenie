import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Analyzer from '../../components/Analyzer';

// ── Mock child components ─────────────────────────────────────────────────────
vi.mock('../../components/KPICards',        () => ({ default: ({ kpis })           => <div data-testid="kpi-cards">{kpis?.length}</div> }));
vi.mock('../../components/TrendChart',      () => ({ default: ({ rawData })         => <div data-testid="trend-chart">{rawData?.length}</div> }));
vi.mock('../../components/AISummary',       () => ({ default: ({ summary })         => <div data-testid="ai-summary">{summary}</div> }));
vi.mock('../../components/RiskCards',       () => ({ default: ({ risks })           => <div data-testid="risk-cards">{risks?.length}</div> }));
vi.mock('../../components/Recommendations', () => ({ default: ({ recommendations }) => <div data-testid="recommendations">{recommendations?.length}</div> }));
vi.mock('../../components/DataPreview',     () => ({ default: ({ data })            => <div data-testid="data-preview">{data?.length}</div> }));

const baseResult = {
  summary: 'Test summary',
  kpis: [{ name: 'Revenue', value: '$1M', trend: 'up' }],
  raw_data: [{ Item: 'Revenue', Q1: 1000 }],
  column_headers: ['Item', 'Q1'],
  recommendations: ['Reduce costs'],
  risks: [{ risk: 'Liquidity', severity: 'high', description: 'Low cash' }],
  trends: [{ metric: 'Revenue', direction: 'up' }],
  statement_type: 'income_statement',
  parsing_mode: 'advanced',
};

describe('Analyzer', () => {

  // ───── NULL CASES ─────
  it('returns null when result is not provided', () => {
    const { container } = render(<Analyzer />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when result is null', () => {
    const { container } = render(<Analyzer result={null} />);
    expect(container.firstChild).toBeNull();
  });

  // ───── HEADER ─────
  it('renders the page header eyebrow', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByText(/PERFORMANCE INDEX/i)).toBeInTheDocument();
  });

  it('renders the page header title', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByText(/Financial Performance/i)).toBeInTheDocument();
  });

  it('renders accent text in title', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByText(/Intelligence Overview/i)).toBeInTheDocument();
  });

  // ───── META INFO ─────
  it('displays statement_type in uppercase in ID label', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByText(/ID: INCOME_STATEMENT/i)).toBeInTheDocument();
  });

  it('falls back to "FG-PRO-24" when statement_type is missing', () => {
    render(<Analyzer result={{ ...baseResult, statement_type: undefined }} />);
    expect(screen.getByText(/ID: FG-PRO-24/i)).toBeInTheDocument();
  });

  it('displays parsing_mode in ENGINE label', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByText(/ENGINE: ADVANCED/i)).toBeInTheDocument();
  });

  it('falls back to "STANDARD" when parsing_mode is missing', () => {
    render(<Analyzer result={{ ...baseResult, parsing_mode: undefined }} />);
    expect(screen.getByText(/ENGINE: STANDARD/i)).toBeInTheDocument();
  });

  // ───── CHILD COMPONENTS ─────
  it('renders KPICards with correct count', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByTestId('kpi-cards')).toHaveTextContent('1');
  });

  it('renders TrendChart with raw data', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByTestId('trend-chart')).toHaveTextContent('1');
  });

  it('renders AISummary with summary text', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByTestId('ai-summary')).toHaveTextContent('Test summary');
  });

  it('renders DataPreview', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByTestId('data-preview')).toBeInTheDocument();
  });

  // ───── CONDITIONAL RENDERING ─────
  it('renders RiskCards when risks exist', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByTestId('risk-cards')).toBeInTheDocument();
  });

  it('does NOT render RiskCards when risks array is empty', () => {
    render(<Analyzer result={{ ...baseResult, risks: [] }} />);
    expect(screen.queryByTestId('risk-cards')).toBeNull();
  });

  it('does NOT render RiskCards when risks is null', () => {
    render(<Analyzer result={{ ...baseResult, risks: null }} />);
    expect(screen.queryByTestId('risk-cards')).toBeNull();
  });

  it('renders Recommendations when present', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByTestId('recommendations')).toBeInTheDocument();
  });

  it('does NOT render Recommendations when empty', () => {
    render(<Analyzer result={{ ...baseResult, recommendations: [] }} />);
    expect(screen.queryByTestId('recommendations')).toBeNull();
  });

  it('does NOT render Recommendations when null', () => {
    render(<Analyzer result={{ ...baseResult, recommendations: null }} />);
    expect(screen.queryByTestId('recommendations')).toBeNull();
  });

  // ───── STRUCTURE & UI ─────
  it('renders main container with correct class', () => {
    const { container } = render(<Analyzer result={baseResult} />);
    expect(container.firstChild).toHaveClass('analyzer-result');
  });

  it('applies paddingTop style', () => {
    const { container } = render(<Analyzer result={baseResult} />);
    expect(container.firstChild).toHaveStyle('padding-top: var(--space-md)');
  });

  it('renders SVG icons (layout, hash, cpu)', () => {
    const { container } = render(<Analyzer result={baseResult} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(3);
  });

  it('renders heading hierarchy correctly', () => {
    render(<Analyzer result={baseResult} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  // ───── SNAPSHOT ─────
  it('matches snapshot', () => {
    const { asFragment } = render(<Analyzer result={baseResult} />);
    expect(asFragment()).toMatchSnapshot();
  });

});