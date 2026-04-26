import { render, screen } from '@testing-library/react';
import RiskCards from '../../components/RiskCards';

const mockRisks = [
  { risk: 'Liquidity Shortfall', severity: 'critical', description: 'Cash reserves may not cover short-term obligations.' },
  { risk: 'Revenue Concentration', severity: 'high', description: 'Over 80% of revenue from a single client.' },
  { risk: 'FX Exposure', severity: 'medium', description: 'Unhedged foreign currency positions.' },
  { risk: 'Minor Compliance Gap', severity: 'low', description: 'Minor regulatory filing delays observed.' },
];

describe('RiskCards', () => {
  it('returns null when risks is undefined', () => {
    const { container } = render(<RiskCards risks={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when risks is empty array', () => {
    const { container } = render(<RiskCards risks={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders section heading when risks are provided', () => {
    render(<RiskCards risks={mockRisks} />);
    expect(screen.getByText('Vulnerability Analysis')).toBeInTheDocument();
  });

  it('renders all risk names', () => {
    render(<RiskCards risks={mockRisks} />);
    expect(screen.getByText('Liquidity Shortfall')).toBeInTheDocument();
    expect(screen.getByText('Revenue Concentration')).toBeInTheDocument();
    expect(screen.getByText('FX Exposure')).toBeInTheDocument();
    expect(screen.getByText('Minor Compliance Gap')).toBeInTheDocument();
  });

  it('renders all risk descriptions', () => {
    render(<RiskCards risks={mockRisks} />);
    expect(screen.getByText('Cash reserves may not cover short-term obligations.')).toBeInTheDocument();
    expect(screen.getByText('Over 80% of revenue from a single client.')).toBeInTheDocument();
  });

  it('renders CRITICAL badge for critical severity', () => {
    render(<RiskCards risks={[mockRisks[0]]} />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('renders HIGH badge for high severity', () => {
    render(<RiskCards risks={[mockRisks[1]]} />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('renders MEDIUM badge for medium severity', () => {
    render(<RiskCards risks={[mockRisks[2]]} />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('renders LOW badge for low severity', () => {
    render(<RiskCards risks={[mockRisks[3]]} />);
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('falls back to LOW config for unknown severity', () => {
    const unknownRisk = [{ risk: 'Unknown', severity: 'undefined_level', description: 'Some desc' }];
    render(<RiskCards risks={unknownRisk} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('renders all four severity badges when all present', () => {
    render(<RiskCards risks={mockRisks} />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('renders correct number of risk cards', () => {
    render(<RiskCards risks={mockRisks} />);
    expect(screen.getAllByText(/CRITICAL|HIGH|MEDIUM|LOW/).length).toBe(mockRisks.length);
  });

  it('renders a single risk card correctly', () => {
    const single = [{ risk: 'Single Risk', severity: 'high', description: 'Single description.' }];
    render(<RiskCards risks={single} />);
    expect(screen.getByText('Single Risk')).toBeInTheDocument();
    expect(screen.getByText('Single description.')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});
