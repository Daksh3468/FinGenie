// ── Recommendations ──────────────────────────────────────────────────────────
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Recommendations from '../../components/Recommendations';
import RiskCards from '../../components/RiskCards';

describe('Recommendations', () => {
  it('returns null when recommendations is undefined', () => {
    const { container } = render(<Recommendations />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when recommendations is null', () => {
    const { container } = render(<Recommendations recommendations={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when recommendations is empty array', () => {
    const { container } = render(<Recommendations recommendations={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders section heading', () => {
    render(<Recommendations recommendations={['Cut costs']} />);
    expect(screen.getByText('Actionable Recommendations')).toBeInTheDocument();
  });

  it('renders each recommendation text', () => {
    const recs = ['Reduce overhead by 10%', 'Improve gross margin', 'Diversify revenue'];
    render(<Recommendations recommendations={recs} />);
    recs.forEach(r => expect(screen.getByText(r)).toBeInTheDocument());
  });

  it('renders sequential numbered indexes starting from 1', () => {
    render(<Recommendations recommendations={['A', 'B', 'C']} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('applies animation delay proportional to index', () => {
    render(<Recommendations recommendations={['R1', 'R2', 'R3']} />);
    const items = document.querySelectorAll('.hover-lift');
    expect(items[0]).toHaveStyle({ animationDelay: '0s' });
    expect(items[1]).toHaveStyle({ animationDelay: '0.1s' });
    expect(items[2]).toHaveStyle({ animationDelay: '0.2s' });
  });
});

// ── RiskCards ────────────────────────────────────────────────────────────────
const makeRisk = (severity, overrides = {}) => ({
  risk: `${severity} risk`,
  severity,
  description: `This is a ${severity} level risk.`,
  ...overrides,
});

describe('RiskCards', () => {
  it('returns null when risks is undefined', () => {
    const { container } = render(<RiskCards />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when risks is null', () => {
    const { container } = render(<RiskCards risks={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when risks is empty array', () => {
    const { container } = render(<RiskCards risks={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders section heading', () => {
    render(<RiskCards risks={[makeRisk('low')]} />);
    expect(screen.getByText('Vulnerability Analysis')).toBeInTheDocument();
  });

  it('renders risk name and description', () => {
    render(<RiskCards risks={[makeRisk('high')]} />);
    expect(screen.getByText('high risk')).toBeInTheDocument();
    expect(screen.getByText('This is a high level risk.')).toBeInTheDocument();
  });

  it('renders CRITICAL badge for critical severity', () => {
    render(<RiskCards risks={[makeRisk('critical')]} />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('renders HIGH badge for high severity', () => {
    render(<RiskCards risks={[makeRisk('high')]} />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('renders MEDIUM badge for medium severity', () => {
    render(<RiskCards risks={[makeRisk('medium')]} />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('renders LOW badge for low severity', () => {
    render(<RiskCards risks={[makeRisk('low')]} />);
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('falls back to LOW config for unknown severity', () => {
    render(<RiskCards risks={[makeRisk('unknown')]} />);
    // falls back to SEVERITY_CONFIG.low → badge shows 'LOW'
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('renders multiple risk cards', () => {
    const risks = [makeRisk('critical'), makeRisk('medium'), makeRisk('low')];
    render(<RiskCards risks={risks} />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('each card has left border color from config', () => {
    render(<RiskCards risks={[makeRisk('critical')]} />);
    const cards = document.querySelectorAll('.card-light');
    // critical → accent-rose border
    const criticalCard = [...cards].find(c =>
      c.style.borderLeft?.includes('var(--accent-rose)')
    );
    expect(criticalCard).toBeTruthy();
  });
});
