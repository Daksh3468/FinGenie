import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from '../../components/About';

describe('About', () => {
  it('renders without crashing', () => {
    render(<About />);
  });

  it('shows "The Mission" sub-label', () => {
    render(<About />);
    expect(screen.getByText('The Mission')).toBeInTheDocument();
  });

  it('renders hero title with "Democratizing"', () => {
    render(<About />);
    expect(screen.getByText(/Democratizing/i)).toBeInTheDocument();
  });

  it('renders accent text "Institutional Intel."', () => {
    render(<About />);
    expect(screen.getByText('Institutional Intel.')).toBeInTheDocument();
  });

  it('renders hero title with accent span', () => {
    render(<About />);
    const accentText = screen.getByText('Institutional Intel.');
    expect(accentText.tagName).toBe('SPAN');
  });

  it('shows Mathematical Foundation heading', () => {
    render(<About />);
    expect(screen.getByText('Mathematical Foundation')).toBeInTheDocument();
  });

  it('does not duplicate Mathematical Foundation heading', () => {
    render(<About />);
    const headings = screen.getAllByText('Mathematical Foundation');
    expect(headings.length).toBe(1);
  });

  it('renders FinGenie GAAP + Bayesian description', () => {
    render(<About />);
    expect(screen.getByText(/GAAP accounting principles/i)).toBeInTheDocument();
  });

  it('matches Bayesian keyword case-insensitive', () => {
    render(<About />);
    expect(screen.getByText(/bayesian inference models/i)).toBeInTheDocument();
  });

  it('renders sovereign engine description', () => {
    render(<About />);
    expect(screen.getByText(/sovereign engine/i)).toBeInTheDocument();
  });

  it('renders at least two descriptive paragraphs', () => {
    render(<About />);
    const paragraphs = screen.getAllByText((_, element) => {
      return element.tagName.toLowerCase() === 'p';
    });
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });

  it('shows Security & Privacy Ethics section heading', () => {
    render(<About />);
    expect(screen.getByText('Security & Privacy Ethics')).toBeInTheDocument();
  });

  it('renders exactly two security items', () => {
    render(<About />);
    const items = screen.getAllByText(/Edge Encryption|Zero-Knowledge/);
    expect(items.length).toBe(2);
  });

  it('shows Edge Encryption item with AES-256', () => {
    render(<About />);
    expect(screen.getByText('Edge Encryption')).toBeInTheDocument();
    expect(screen.getByText(/AES-256/i)).toBeInTheDocument();
  });

  it('shows Zero-Knowledge item with purge text', () => {
    render(<About />);
    expect(screen.getByText('Zero-Knowledge')).toBeInTheDocument();
    expect(screen.getByText(/purged continuously/i)).toBeInTheDocument();
  });

  it('renders SVG icons for security features', () => {
    const { container } = render(<About />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders main container with correct class', () => {
    const { container } = render(<About />);
    expect(container.firstChild).toHaveClass('fade-in');
  });

  it('applies maxWidth style to container', () => {
    const { container } = render(<About />);
    expect(container.firstChild).toHaveStyle('max-width: 1000px');
  });

  it('renders correct heading hierarchy', () => {
    render(<About />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThanOrEqual(2);
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<About />);
    expect(asFragment()).toMatchSnapshot();
  });
});