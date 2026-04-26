import { render, screen } from '@testing-library/react';
import Terms from '../../components/Terms';

import { vi } from 'vitest';

vi.mock('lucide-react', () => ({
  Scale: () => <div data-testid="scale-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
}));

describe('Terms', () => {
  it('renders without crashing', () => {
    render(<Terms />);
  });

  it('renders Legal Framework label', () => {
    render(<Terms />);
    expect(screen.getByText('Legal Framework')).toBeInTheDocument();
  });

  it('renders main heading', () => {
    render(<Terms />);
    expect(screen.getByText(/Terms of/)).toBeInTheDocument();
    expect(screen.getByText('Operation.')).toBeInTheDocument();
  });

  it('renders Institutional Usage section heading', () => {
    render(<Terms />);
    expect(screen.getByText('Institutional Usage')).toBeInTheDocument();
  });

  it('renders institutional usage description', () => {
    render(<Terms />);
    expect(screen.getByText(/financial utility for informational purposes/)).toBeInTheDocument();
  });

  it('renders verified by certified professionals text', () => {
    render(<Terms />);
    expect(screen.getByText(/verified by certified professionals/)).toBeInTheDocument();
  });

  it('renders No Financial Advice section heading', () => {
    render(<Terms />);
    expect(screen.getByText('No Financial Advice')).toBeInTheDocument();
  });

  it('renders no financial advice description', () => {
    render(<Terms />);
    expect(screen.getByText(/does not constitute financial/)).toBeInTheDocument();
  });

  it('renders liability disclaimer', () => {
    render(<Terms />);
    expect(screen.getByText(/assumes no liability/)).toBeInTheDocument();
  });

  it('renders FINGENIE FINANCIAL UTILITIES name', () => {
    render(<Terms />);
    expect(screen.getByText(/FINGENIE FINANCIAL UTILITIES/)).toBeInTheDocument();
  });

  it('renders both sections', () => {
    render(<Terms />);
    expect(screen.getByText('Institutional Usage')).toBeInTheDocument();
    expect(screen.getByText('No Financial Advice')).toBeInTheDocument();
  });

  it('renders Scale icon', () => {
  render(<Terms />);
  expect(screen.getByTestId('scale-icon')).toBeInTheDocument();
});

it('renders AlertTriangle icon', () => {
  render(<Terms />);
  expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
});
});


