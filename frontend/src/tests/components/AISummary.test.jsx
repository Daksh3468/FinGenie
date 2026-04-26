import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AISummary from '../../components/AISummary';

describe('AISummary', () => {
  it('returns null when summary is undefined', () => {
    const { container } = render(<AISummary />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when summary is null', () => {
    const { container } = render(<AISummary summary={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when summary is empty string', () => {
    // empty string is falsy
    const { container } = render(<AISummary summary="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders AI Narrative Synthesis heading when summary is provided', () => {
    render(<AISummary summary="Revenue grew 15% year over year." />);
    expect(screen.getByText('AI Narrative Synthesis')).toBeInTheDocument();
  });

  it('shows Deep Logic v4.2 badge', () => {
    render(<AISummary summary="Some text." />);
    expect(screen.getByText('Deep Logic v4.2')).toBeInTheDocument();
  });

  it('renders a single-paragraph summary wrapped in quotes', () => {
    render(<AISummary summary="Revenue is growing." />);
    expect(screen.getByText('"Revenue is growing."')).toBeInTheDocument();
  });

  it('renders each non-empty paragraph separately', () => {
    const summary = 'First paragraph.\nSecond paragraph.\nThird paragraph.';
    render(<AISummary summary={summary} />);
    expect(screen.getByText('"First paragraph."')).toBeInTheDocument();
    expect(screen.getByText('"Second paragraph."')).toBeInTheDocument();
    expect(screen.getByText('"Third paragraph."')).toBeInTheDocument();
  });

  it('filters out blank lines between paragraphs', () => {
    const summary = 'Para one.\n\n\nPara two.';
    render(<AISummary summary={summary} />);
    const paras = screen.getAllByText(/^"Para /);
    expect(paras).toHaveLength(2);
  });

  it('last paragraph has no bottom margin (marginBottom: 0)', () => {
    const summary = 'First.\nSecond.';
    render(<AISummary summary={summary} />);
    const allParas = screen.getAllByText(/^"/);
    const lastPara = allParas[allParas.length - 1];
    expect(lastPara).toHaveStyle({ marginBottom: '0px' });
  });

  it('non-last paragraphs have 16px bottom margin', () => {
    const summary = 'First.\nSecond.';
    render(<AISummary summary={summary} />);
    const allParas = screen.getAllByText(/^"/);
    expect(allParas[0]).toHaveStyle({ marginBottom: '16px' });
  });
});
