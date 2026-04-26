import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KPICards from '../../components/KPICards';

const makeKPI = (overrides) => ({
  name: 'Revenue',
  value: '1000000',
  formatted_value: '$1,000,000',
  description: 'Total revenue generated.',
  trend: 'up',
  ...overrides,
});

describe('KPICards', () => {
  // ── null / empty guards ────────────────────────────────────────────────────
  it('returns null when kpis is undefined', () => {
    const { container } = render(<KPICards />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when kpis is null', () => {
    const { container } = render(<KPICards kpis={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when kpis is empty array', () => {
    const { container } = render(<KPICards kpis={[]} />);
    expect(container.firstChild).toBeNull();
  });

  // ── header ────────────────────────────────────────────────────────────────
  it('shows section heading', () => {
    render(<KPICards kpis={[makeKPI()]} />);
    expect(screen.getByText('Institutional Performance KPIs')).toBeInTheDocument();
  });

  // ── kpi name, value, description ──────────────────────────────────────────
  it('renders kpi name', () => {
    render(<KPICards kpis={[makeKPI({ name: 'Gross Profit' })]} />);
    expect(screen.getByText('Gross Profit')).toBeInTheDocument();
  });

  it('renders formatted_value when available', () => {
    render(<KPICards kpis={[makeKPI({ formatted_value: '$1,000,000', value: '1000000' })]} />);
    expect(screen.getByText('$1,000,000')).toBeInTheDocument();
  });

  it('falls back to value when formatted_value is absent', () => {
    render(<KPICards kpis={[makeKPI({ formatted_value: undefined, value: '999' })]} />);
    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<KPICards kpis={[makeKPI({ description: 'Core performance metric' })]} />);
    expect(screen.getByText('Core performance metric')).toBeInTheDocument();
  });

  // ── trend classes ─────────────────────────────────────────────────────────
  it('applies text-emerald class for trend="up"', () => {
    render(<KPICards kpis={[makeKPI({ trend: 'up' })]} />);
    const trendEl = document.querySelector('.text-emerald');
    expect(trendEl).toBeInTheDocument();
  });

  it('applies text-rose class for trend="down"', () => {
    render(<KPICards kpis={[makeKPI({ trend: 'down' })]} />);
    const trendEl = document.querySelector('.text-rose');
    expect(trendEl).toBeInTheDocument();
  });

  it('applies text-muted class for neutral/unknown trend', () => {
    render(<KPICards kpis={[makeKPI({ trend: 'neutral' })]} />);
    const trendEl = document.querySelector('.text-muted');
    expect(trendEl).toBeInTheDocument();
  });

  it('applies animation-delay proportional to index', () => {
    render(<KPICards kpis={[makeKPI(), makeKPI({ name: 'Cost' }), makeKPI({ name: 'Profit' })]} />);
    const cards = document.querySelectorAll('.card-light');
    expect(cards[0]).toHaveStyle({ animationDelay: '0s' });
    expect(cards[1]).toHaveStyle({ animationDelay: '0.1s' });
    expect(cards[2]).toHaveStyle({ animationDelay: '0.2s' });
  });

  // ── multiple kpis ─────────────────────────────────────────────────────────
  it('renders multiple KPI cards', () => {
    const kpis = [
      makeKPI({ name: 'Revenue', trend: 'up' }),
      makeKPI({ name: 'EBITDA', trend: 'down' }),
      makeKPI({ name: 'Cash', trend: 'stable' }),
    ];
    render(<KPICards kpis={kpis} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('EBITDA')).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
  });
});
