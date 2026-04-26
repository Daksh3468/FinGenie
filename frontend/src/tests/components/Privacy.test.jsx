import { render, screen } from '@testing-library/react';
import Privacy from '../../components/Privacy';

describe('Privacy', () => {
  it('renders without crashing', () => {
    render(<Privacy />);
  });

  it('renders Data Sovereignty label', () => {
    render(<Privacy />);
    expect(screen.getByText('Data Sovereignty')).toBeInTheDocument();
  });

  it('renders main heading', () => {
    render(<Privacy />);
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Policy Protocol.')).toBeInTheDocument();
  });

  it('renders Encryption Standard section', () => {
    render(<Privacy />);
    expect(screen.getByText('Encryption Standard')).toBeInTheDocument();
  });

  it('renders TLS 1.3 in encryption description', () => {
    render(<Privacy />);
    expect(screen.getByText(/TLS 1\.3/)).toBeInTheDocument();
  });

  it('renders non-persistent memory stacks text', () => {
    render(<Privacy />);
    expect(screen.getByText(/non-persistent memory stacks/)).toBeInTheDocument();
  });

  it('renders Zero Retention section', () => {
    render(<Privacy />);
    expect(screen.getByText('Zero Retention')).toBeInTheDocument();
  });

  it('renders zero retention description', () => {
    render(<Privacy />);
    expect(screen.getByText(/does not maintain a database/)).toBeInTheDocument();
  });

  it('renders No Tracking section', () => {
    render(<Privacy />);
    expect(screen.getByText('No Tracking')).toBeInTheDocument();
  });

  it('renders no tracking description', () => {
    render(<Privacy />);
    expect(screen.getByText(/tracking cookies/)).toBeInTheDocument();
  });

  it('renders all three policy sections', () => {
    render(<Privacy />);
    expect(screen.getByText('Encryption Standard')).toBeInTheDocument();
    expect(screen.getByText('Zero Retention')).toBeInTheDocument();
    expect(screen.getByText('No Tracking')).toBeInTheDocument();
  });

  it('renders purge description in zero retention section', () => {
    render(<Privacy />);
    expect(screen.getByText(/all trace data is purged/)).toBeInTheDocument();
  });

  it('renders advertising mention in no tracking section', () => {
    render(<Privacy />);
    expect(screen.getByText(/advertising purposes/)).toBeInTheDocument();
  });
});
