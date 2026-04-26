import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Home from '../../components/Home';

// Mock FileUpload to avoid react-dropzone complexity
vi.mock('../../components/FileUpload.jsx', () => ({
  default: ({ onFileSelect, isLoading, error }) => (
    <div data-testid="file-upload">
      {isLoading && <span>loading</span>}
      {error && <span data-testid="upload-error">{error}</span>}
      <button onClick={() => onFileSelect(new File(['x'], 'test.pdf'))}>drop</button>
    </div>
  ),
}));

describe('Home', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    // Simulate scrollIntoView for refs
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  // ── hero section ──────────────────────────────────────────────────────────
  it('renders without crashing', () => {
    render(<Home onFileSelect={vi.fn()} />);
  });

  it('shows hero badge text', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('Institutional-Grade Financial Intelligence')).toBeInTheDocument();
  });

  it('renders hero title with "Decode" and "Sovereign"', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText(/Decode/i)).toBeInTheDocument();
    expect(screen.getByText('Sovereign')).toBeInTheDocument();
  });

  it('renders hero subtitle about uploading', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText(/balance sheets/i)).toBeInTheDocument();
  });

  it('shows "Analyze Statement" CTA button', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('Analyze Statement')).toBeInTheDocument();
  });

  it('shows "Technical Specs" button', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('Technical Specs')).toBeInTheDocument();
  });

  // ── trust signals ─────────────────────────────────────────────────────────
  it('shows all three trust signals', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('No signup required')).toBeInTheDocument();
    expect(screen.getByText('AES-256 encrypted')).toBeInTheDocument();
    expect(screen.getByText('Zero data retention')).toBeInTheDocument();
  });

  // ── scroll behaviours ─────────────────────────────────────────────────────
  it('"Analyze Statement" button calls window.scrollTo to top', () => {
    render(<Home onFileSelect={vi.fn()} />);
    fireEvent.click(screen.getByText('Analyze Statement'));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  test('Technical Specs button calls scrollIntoView', () => {
  render(<Home onFileSelect={vi.fn()} />);

  const specsSection = screen.getByText('Technical Specifications.').closest('section');

  const scrollMock = vi.fn();
  specsSection.scrollIntoView = scrollMock;

  fireEvent.click(
    screen.getByRole('button', { name: /technical specs/i })
  );

  expect(scrollMock).toHaveBeenCalledWith({ behavior: 'smooth' });
});

  it('"Upload Financials Now" CTA also scrolls to top', () => {
    render(<Home onFileSelect={vi.fn()} />);
    fireEvent.click(screen.getByText('Upload Financials Now'));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  // ── Capabilities section ──────────────────────────────────────────────────
  it('shows "Built for Performance." section', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('Built for Performance.')).toBeInTheDocument();
  });

  it('renders all four capability cards', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('No Manual Entry')).toBeInTheDocument();
    expect(screen.getByText('Automated Anomalies')).toBeInTheDocument();
    expect(screen.getByText('Clean Dashboards')).toBeInTheDocument();
    expect(screen.getByText('Institutional Intelligence')).toBeInTheDocument();
  });

  // ── Pipeline section ───────────────────────────────────────────────────────
  it('renders "Three Steps to Insight." heading', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('Three Steps to Insight.')).toBeInTheDocument();
  });

  it('shows all three pipeline steps', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('01 Ingestion')).toBeInTheDocument();
    expect(screen.getByText('02 Semantic Parsing')).toBeInTheDocument();
    expect(screen.getByText('03 Intelligence')).toBeInTheDocument();
  });

  // ── Security section ──────────────────────────────────────────────────────
  it('shows security section title "Your data stays yours."', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('Your data stays yours.')).toBeInTheDocument();
  });

  it('shows AES-256 and ZERO stats', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('AES-256')).toBeInTheDocument();
    expect(screen.getByText('ZERO')).toBeInTheDocument();
  });

  it('shows "Isolated Sandbox" and "Private Inference" in security card', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('Isolated Sandbox')).toBeInTheDocument();
    expect(screen.getByText('Private Inference')).toBeInTheDocument();
  });

  // ── Technical Specs ───────────────────────────────────────────────────────
  it('renders "Technical Specifications." section', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('Technical Specifications.')).toBeInTheDocument();
  });

  it('shows all four spec cards', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('Intelligence Layer')).toBeInTheDocument();
    expect(screen.getByText('Core Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Security & Sovereignty')).toBeInTheDocument();
    expect(screen.getByText('System Fidelity')).toBeInTheDocument();
  });

  // ── FAQ section ───────────────────────────────────────────────────────────
  it('renders FAQ section heading', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText('Common Questions.')).toBeInTheDocument();
  });

  it('shows all three FAQ questions', () => {
    render(<Home onFileSelect={vi.fn()} />);
    expect(screen.getByText(/How is this different from manual Excel/i)).toBeInTheDocument();
    expect(screen.getByText(/Can I trust the AI-generated KPIs/i)).toBeInTheDocument();
    expect(screen.getByText(/Is my financial data stored/i)).toBeInTheDocument();
  });

  // ── FileUpload integration ────────────────────────────────────────────────
  it('passes onFileSelect prop to FileUpload', () => {
    const onFileSelect = vi.fn();
    render(<Home onFileSelect={onFileSelect} />);
    fireEvent.click(screen.getByText('drop'));
    expect(onFileSelect).toHaveBeenCalled();
  });

  it('passes isLoading to FileUpload', () => {
    render(<Home onFileSelect={vi.fn()} isLoading={true} />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('passes error to FileUpload', () => {
    render(<Home onFileSelect={vi.fn()} error="File too large" />);
    expect(screen.getByTestId('upload-error')).toHaveTextContent('File too large');
  });
});
