import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Compliance from '../../components/Compliance';

describe('Compliance', () => {
  it('renders without crashing', () => {
    render(<Compliance />);
  });

  it('shows "Institutional Trust" sub-label', () => {
    render(<Compliance />);
    expect(screen.getByText('Institutional Trust')).toBeInTheDocument();
  });

  it('renders main heading', () => {
    render(<Compliance />);
    expect(screen.getByText(/Compliance &/i)).toBeInTheDocument();
    expect(screen.getByText(/Security Standards/i)).toBeInTheDocument();
  });

  it('renders Trust Matrix label', () => {
    render(<Compliance />);
    expect(screen.getByText('Trust Matrix')).toBeInTheDocument();
  });

  it('shows SOC2 TYPE II certification', () => {
    render(<Compliance />);
    expect(screen.getByText('SOC2 TYPE II')).toBeInTheDocument();
  });

  it('shows AES-256 E2EE', () => {
    render(<Compliance />);
    expect(screen.getByText('AES-256 E2EE')).toBeInTheDocument();
  });

  it('shows ISO 27001 ALIGN', () => {
    render(<Compliance />);
    expect(screen.getByText('ISO 27001 ALIGN')).toBeInTheDocument();
  });

  it('renders Security Architecture heading', () => {
    render(<Compliance />);
    expect(screen.getByText('Security Architecture')).toBeInTheDocument();
  });

  it('shows Cloud Layer section', () => {
    render(<Compliance />);
    expect(screen.getByText('Cloud Layer')).toBeInTheDocument();
    expect(screen.getByText(/TLS 1.3/i)).toBeInTheDocument();
  });

  it('shows Encryption at Rest section', () => {
    render(<Compliance />);
    expect(screen.getByText(/Encryption at Rest/i)).toBeInTheDocument();
  });

  it('shows Compliance Purge section with NIST reference', () => {
    render(<Compliance />);
    expect(screen.getByText('Compliance Purge')).toBeInTheDocument();
    expect(screen.getByText(/NIST SP 800-88/i)).toBeInTheDocument();
  });
});
