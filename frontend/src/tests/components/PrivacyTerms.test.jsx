// ── Privacy ───────────────────────────────────────────────────────────────────
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Privacy from '../../components/Privacy';
import Terms from '../../components/Terms';

describe('Privacy', () => {
  it('renders without crashing', () => {
    render(<Privacy />);
  });

  it('shows "Data Sovereignty" sub-label', () => {
    render(<Privacy />);
    expect(screen.getByText('Data Sovereignty')).toBeInTheDocument();
  });

  it('renders hero title', () => {
    render(<Privacy />);
    expect(screen.getByText(/Privacy/i)).toBeInTheDocument();
    expect(screen.getByText('Policy Protocol.')).toBeInTheDocument();
  });

  it('renders Encryption Standard section', () => {
    render(<Privacy />);
    expect(screen.getByText('Encryption Standard')).toBeInTheDocument();
    expect(screen.getByText(/TLS 1\.3/i)).toBeInTheDocument();
  });

  it('renders Zero Retention section', () => {
    render(<Privacy />);
    expect(screen.getByText('Zero Retention')).toBeInTheDocument();
    expect(screen.getByText(/does not maintain a database/i)).toBeInTheDocument();
  });

  it('renders No Tracking section', () => {
    render(<Privacy />);
    expect(screen.getByText('No Tracking')).toBeInTheDocument();
    expect(screen.getByText(/tracking cookies/i)).toBeInTheDocument();
  });
});

// ── Terms ─────────────────────────────────────────────────────────────────────
describe('Terms', () => {
  it('renders without crashing', () => {
    render(<Terms />);
  });

  it('shows "Legal Framework" sub-label', () => {
    render(<Terms />);
    expect(screen.getByText('Legal Framework')).toBeInTheDocument();
  });

  it('renders hero title', () => {
    render(<Terms />);
    expect(screen.getByText(/Terms of/i)).toBeInTheDocument();
    expect(screen.getByText('Operation.')).toBeInTheDocument();
  });

  it('shows Institutional Usage section', () => {
    render(<Terms />);
    expect(screen.getByText('Institutional Usage')).toBeInTheDocument();
    expect(screen.getByText(/informational purposes/i)).toBeInTheDocument();
  });

  it('shows No Financial Advice section', () => {
    render(<Terms />);
    expect(screen.getByText('No Financial Advice')).toBeInTheDocument();
    expect(screen.getByText(/does not constitute financial/i)).toBeInTheDocument();
  });

  it('shows FINGENIE FINANCIAL UTILITIES disclaimer', () => {
    render(<Terms />);
    expect(screen.getByText(/FINGENIE FINANCIAL UTILITIES/)).toBeInTheDocument();
  });
});
