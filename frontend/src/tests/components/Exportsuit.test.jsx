/**
 * ExportSuite.test.jsx
 * Vitest + React Testing Library — full coverage + mutation-resilient
 *
 * Install deps (if not already):
 *   npm i -D vitest @vitest/coverage-v8 @testing-library/react
 *              @testing-library/user-event @testing-library/jest-dom jsdom
 *
 * vite.config.js / vitest.config.js additions:
 *   test: {
 *     environment: 'jsdom',
 *     setupFiles: ['./src/setupTests.js'],  // see bottom of file
 *     coverage: { provider: 'v8', reporter: ['text','html'], all: true }
 *   }
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// ─── Module under test ───────────────────────────────────────────────────────
// Adjust the import path to match your project layout.
import ExportSuite, { buildPDFReport } from '../../components/ExportSuite';

// ─── Re-export helper if not already exported ────────────────────────────────
// If buildPDFReport is NOT exported from your file, add `export` before the
// `function buildPDFReport` declaration, then import it above. Tests below
// cover it directly so you get branch/mutation coverage on the HTML builder.

// ─── Shared mock data ────────────────────────────────────────────────────────
const FULL_RESULT = {
  statement_type: 'Income Statement',
  summary: 'Revenue grew 18% YoY.',
  kpis: [
    { name: 'Total Revenue',    formatted_value: '$12.4B', trend: 'up'   },
    { name: 'Net Income',       formatted_value: '$2.97B', trend: 'down' },
    { name: 'Debt-to-Equity',   formatted_value: '0.38',  trend: 'flat' },
  ],
  risks: ['Macro headwinds may compress spending.'],
  recommendations: ['Maintain capital allocation strategy.'],
};

const EMPTY_RESULT = {
  summary: '',
  kpis: [],
  risks: [],
  recommendations: [],
};

// ─────────────────────────────────────────────────────────────────────────────
//  1.  buildPDFReport — pure-function unit tests (mutation-heavy)
// ─────────────────────────────────────────────────────────────────────────────
describe('buildPDFReport()', () => {
  const baseArgs = {
    analysisResult: FULL_RESULT,
    company: 'Acme Corp',
    author: 'Jane Doe',
    title: 'FY24 Review',
    color: '#ff0000',
  };

  it('returns a string', () => {
    expect(typeof buildPDFReport(baseArgs)).toBe('string');
  });

  it('contains the provided title', () => {
    const html = buildPDFReport(baseArgs);
    expect(html).toContain('FY24 Review');
  });

  it('contains the provided company name', () => {
    const html = buildPDFReport(baseArgs);
    expect(html).toContain('Acme Corp');
  });

  it('contains the provided author', () => {
    const html = buildPDFReport(baseArgs);
    expect(html).toContain('Jane Doe');
  });

  it('injects accent color into CSS', () => {
    const html = buildPDFReport(baseArgs);
    expect(html).toContain('#ff0000');
  });

  it('renders all KPI names', () => {
    const html = buildPDFReport(baseArgs);
    FULL_RESULT.kpis.forEach(k => {
      expect(html).toContain(k.name);
      expect(html).toContain(k.formatted_value);
    });
  });

  it('renders ↑ Up badge for trend=up', () => {
    const html = buildPDFReport(baseArgs);
    expect(html).toContain('↑ Up');
  });

  it('renders ↓ Down badge for trend=down', () => {
    const html = buildPDFReport(baseArgs);
    expect(html).toContain('↓ Down');
  });

  it('renders → Stable badge for trend=flat', () => {
    const html = buildPDFReport(baseArgs);
    expect(html).toContain('→ Stable');
  });

  it('renders risk factor text', () => {
    const html = buildPDFReport(baseArgs);
    expect(html).toContain('Macro headwinds may compress spending.');
  });

  it('renders recommendation text', () => {
    const html = buildPDFReport(baseArgs);
    expect(html).toContain('Maintain capital allocation strategy.');
  });

  it('renders summary text', () => {
    const html = buildPDFReport(baseArgs);
    expect(html).toContain('Revenue grew 18% YoY.');
  });

  it('falls back to default title when title is empty', () => {
    const html = buildPDFReport({ ...baseArgs, title: '' });
    expect(html).toContain('Financial Intelligence Review');
  });

  it('falls back to default author when author is empty', () => {
    const html = buildPDFReport({ ...baseArgs, author: '' });
    expect(html).toContain('FinGenie Analyst');
  });

  it('falls back to default company when company is empty', () => {
    const html = buildPDFReport({ ...baseArgs, company: '' });
    expect(html).toContain('Private Institutional Access');
  });

  it('omits Executive Summary section when summary is empty', () => {
    const html = buildPDFReport({ ...baseArgs, analysisResult: EMPTY_RESULT });
    expect(html).not.toContain('Executive Summary');
  });

  it('omits Institutional Metrics section when kpis is empty', () => {
    const html = buildPDFReport({ ...baseArgs, analysisResult: EMPTY_RESULT });
    expect(html).not.toContain('Institutional Metrics');
  });

  it('omits Risk Factors section when risks is empty', () => {
    const html = buildPDFReport({ ...baseArgs, analysisResult: EMPTY_RESULT });
    expect(html).not.toContain('Risk Factors');
  });

  it('omits Recommendations section when recommendations is empty', () => {
    const html = buildPDFReport({ ...baseArgs, analysisResult: EMPTY_RESULT });
    expect(html).not.toContain('Recommendations');
  });

  it('handles missing analysisResult fields gracefully', () => {
    expect(() =>
      buildPDFReport({ ...baseArgs, analysisResult: {} })
    ).not.toThrow();
  });

  it('uses kpi.value when formatted_value is absent', () => {
    const result = {
      ...FULL_RESULT,
      kpis: [{ name: 'Rev', value: '99', trend: 'up' }],
    };
    const html = buildPDFReport({ ...baseArgs, analysisResult: result });
    expect(html).toContain('99');
  });

  // Covers line 42 branch: '' fallback when BOTH formatted_value and value
  // are absent — the expression `k.formatted_value || k.value || ''` resolves
  // to the empty-string literal, which V8 counts as a separate branch.
  it('renders empty kpi-value div when both formatted_value and value are absent', () => {
    const result = {
      ...FULL_RESULT,
      kpis: [{ name: 'Ghost Metric', trend: 'flat' }],
    };
    const html = buildPDFReport({ ...baseArgs, analysisResult: result });
    expect(html).toContain('Ghost Metric');
    // kpi-value div must exist but carry no value text
    expect(html).toMatch(/<div class="kpi-value">\s*<\/div>/);
  });

  it('outputs valid HTML doctype', () => {
    const html = buildPDFReport(baseArgs);
    expect(html.trim()).toMatch(/^<!DOCTYPE html>/i);
  });

  it('includes today\'s date in the output', () => {
    const today = new Date().getFullYear().toString();
    const html = buildPDFReport(baseArgs);
    expect(html).toContain(today);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  2.  ExportSuite component — render & structure
// ─────────────────────────────────────────────────────────────────────────────
describe('ExportSuite — rendering', () => {
  it('renders without crashing with default mock data', () => {
    render(<ExportSuite />);
    expect(screen.getByText(/Report Configuration/i)).toBeInTheDocument();
  });

  it('renders without crashing when analysisResult is provided', () => {
    render(<ExportSuite analysisResult={FULL_RESULT} />);
    expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
  });

  it('returns null when analysisResult is explicitly null', () => {
    const { container } = render(<ExportSuite analysisResult={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Company Name input', () => {
    render(<ExportSuite />);
    expect(screen.getByPlaceholderText('Organization')).toBeInTheDocument();
  });

  it('renders Author input', () => {
    render(<ExportSuite />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
  });

  it('renders Document Heading input', () => {
    render(<ExportSuite />);
    expect(
      screen.getByPlaceholderText('e.g. FY24 Performance Analysis')
    ).toBeInTheDocument();
  });

  it('renders the download button', () => {
    render(<ExportSuite />);
    expect(
      screen.getByRole('button', { name: /download pdf/i })
    ).toBeInTheDocument();
  });

  it('renders "Board-Ready Export" heading', () => {
    render(<ExportSuite />);
    expect(screen.getByText('Board-Ready Export')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  3.  Controlled inputs — two-way binding
// ─────────────────────────────────────────────────────────────────────────────
describe('ExportSuite — controlled inputs', () => {
  it('updates company field on user input', async () => {
    const user = userEvent.setup();
    render(<ExportSuite />);
    const input = screen.getByPlaceholderText('Organization');
    await user.type(input, 'Skyper Inc');
    expect(input).toHaveValue('Skyper Inc');
  });

  it('updates author field on user input', async () => {
    const user = userEvent.setup();
    render(<ExportSuite />);
    const input = screen.getByPlaceholderText('Name');
    await user.type(input, 'Alice Smith');
    expect(input).toHaveValue('Alice Smith');
  });

  it('updates title field on user input', async () => {
    const user = userEvent.setup();
    render(<ExportSuite />);
    const input = screen.getByPlaceholderText('e.g. FY24 Performance Analysis');
    await user.type(input, 'Q3 2024');
    expect(input).toHaveValue('Q3 2024');
  });

  it('clears company input when value set to empty string', async () => {
    const user = userEvent.setup();
    render(<ExportSuite />);
    const input = screen.getByPlaceholderText('Organization');
    await user.type(input, 'Acme');
    await user.clear(input);
    expect(input).toHaveValue('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  4.  Download button — states & side-effects
//
//  KEY FIX: vi.useFakeTimers() must be called AFTER render() — if called in
//  beforeEach it replaces document.createElement before React mounts, which
//  breaks @testing-library/react's createRoot ("Target container is not a DOM
//  element"). Pattern: render → fake timers → spy on createElement → click.
// ─────────────────────────────────────────────────────────────────────────────
describe('ExportSuite — download button states', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** Build a mock iframe and wire up document.createElement to return it. */
  function setupIframeMock() {
    const iframeWriteSpy = vi.fn();
    const iframePrintSpy = vi.fn();

    const mockIframe = {
      style: { cssText: '' },
      contentDocument: {
        open:  vi.fn(),
        write: iframeWriteSpy,
        close: vi.fn(),
      },
      contentWindow: {
        focus:  vi.fn(),
        print:  iframePrintSpy,
        document: {
          open:  vi.fn(),
          write: iframeWriteSpy,
          close: vi.fn(),
        },
      },
    };

    // Intercept only 'iframe' tag; let React's own div/etc. creation go through
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, ...rest) =>
      tag === 'iframe' ? mockIframe : realCreate(tag, ...rest)
    );

    const appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node) => (node === mockIframe ? mockIframe : node));

    vi.spyOn(document.body, 'contains').mockReturnValue(true);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    return { mockIframe, iframeWriteSpy, iframePrintSpy, appendChildSpy };
  }

  it('button is enabled initially', () => {
    render(<ExportSuite />);
    expect(
      screen.getByRole('button', { name: /download pdf/i })
    ).not.toBeDisabled();
  });

  it('shows "Generating…" and is disabled immediately after click', () => {
    render(<ExportSuite />);
    setupIframeMock();
    vi.useFakeTimers();

    const btn = screen.getByRole('button', { name: /download pdf/i });
    fireEvent.click(btn);

    expect(btn).toBeDisabled();
    expect(screen.getByText('Generating…')).toBeInTheDocument();
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  //
  // When vi.useFakeTimers() is active, waitFor() hangs forever because it uses
  // real setTimeout internally for its polling interval. With fake timers,
  // that timer never fires, so waitFor never retries → 5 s timeout.
  //
  // Solution: replace every waitFor with a plain synchronous act() that
  // advances fake time and then asserts directly. act() flushes React's state
  // queue before returning, so assertions are always stable.
  // ───────────────────────────────────────────────────────────────────────────

  it('shows "PDF Ready" after 400 ms generation delay', () => {
    render(<ExportSuite />);
    setupIframeMock();
    vi.useFakeTimers();

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));

    // Advance past the 400 ms delay; act() flushes React state synchronously
    act(() => vi.advanceTimersByTime(400));

    expect(screen.getByText('PDF Ready')).toBeInTheDocument();
  });

  it('resets back to "Download PDF" after 3 s', () => {
    render(<ExportSuite />);
    setupIframeMock();
    vi.useFakeTimers();

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    act(() => vi.advanceTimersByTime(400));    // done=true
    act(() => vi.advanceTimersByTime(3000));   // done=false (reset)

    expect(
      screen.getByRole('button', { name: /download pdf/i })
    ).toBeInTheDocument();
  });

  it('appends an iframe to document.body on click', () => {
    render(<ExportSuite />);
    const { appendChildSpy } = setupIframeMock();
    vi.useFakeTimers();

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    act(() => vi.advanceTimersByTime(400));

    expect(appendChildSpy).toHaveBeenCalled();
  });

  it('writes a valid HTML document to the iframe', () => {
    render(<ExportSuite />);
    const { iframeWriteSpy } = setupIframeMock();
    vi.useFakeTimers();

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    act(() => vi.advanceTimersByTime(400));   // generation timeout
    act(() => vi.advanceTimersByTime(500));   // inner iframe print timeout

    expect(iframeWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining('<!DOCTYPE html>')
    );
  });

  it('calls print() on the iframe contentWindow', () => {
    render(<ExportSuite />);
    const { iframePrintSpy } = setupIframeMock();
    vi.useFakeTimers();

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    act(() => vi.advanceTimersByTime(400));
    act(() => vi.advanceTimersByTime(500));

    expect(iframePrintSpy).toHaveBeenCalled();
  });

  // Covers line 157 right-hand branch: when contentDocument is null/undefined
  // the code falls through to iframe.contentWindow.document.
  it('uses contentWindow.document when contentDocument is null', () => {
    render(<ExportSuite />);

    const iframeWriteSpy = vi.fn();
    const iframePrintSpy = vi.fn();
    const mockIframe = {
      style: { cssText: '' },
      contentDocument: null,           // ← force the || right-hand side
      contentWindow: {
        focus: vi.fn(),
        print: iframePrintSpy,
        document: { open: vi.fn(), write: iframeWriteSpy, close: vi.fn() },
      },
    };

    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, ...rest) =>
      tag === 'iframe' ? mockIframe : realCreate(tag, ...rest)
    );
    vi.spyOn(document.body, 'appendChild').mockReturnValue(mockIframe);
    vi.spyOn(document.body, 'contains').mockReturnValue(true);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    act(() => vi.advanceTimersByTime(400));
    act(() => vi.advanceTimersByTime(500));

    // write was called via contentWindow.document (not contentDocument)
    expect(iframeWriteSpy).toHaveBeenCalledWith(
      expect.stringContaining('<!DOCTYPE html>')
    );
  });

  // Covers line 162 false-branch: when document.body.contains(iframe) returns
  // false the removeChild call is skipped entirely.
  it('skips removeChild when iframe is no longer in the DOM', () => {
    render(<ExportSuite />);

    const mockIframe = {
      style: { cssText: '' },
      contentDocument: { open: vi.fn(), write: vi.fn(), close: vi.fn() },
      contentWindow: { focus: vi.fn(), print: vi.fn() },
    };

    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, ...rest) =>
      tag === 'iframe' ? mockIframe : realCreate(tag, ...rest)
    );
    vi.spyOn(document.body, 'appendChild').mockReturnValue(mockIframe);
    // contains → false so removeChild branch is skipped
    vi.spyOn(document.body, 'contains').mockReturnValue(false);
    const removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => {});

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    act(() => vi.advanceTimersByTime(400));
    act(() => vi.advanceTimersByTime(500));
    act(() => vi.advanceTimersByTime(3000)); // inner cleanup timeout

    expect(removeChildSpy).not.toHaveBeenCalled();
  });

  it('passes company / author / title state into the generated HTML', async () => {
    // userEvent.type() needs real timers (it uses microtask scheduling).
    // We switch to fake timers only AFTER typing is complete.
    const user = userEvent.setup({ delay: null });
    render(<ExportSuite />);

    await user.type(screen.getByPlaceholderText('Organization'), 'Skyper');
    await user.type(screen.getByPlaceholderText('Name'), 'Bob');
    await user.type(
      screen.getByPlaceholderText('e.g. FY24 Performance Analysis'),
      'Annual Review'
    );

    // Now it is safe to go fake — typing is done
    const { iframeWriteSpy } = setupIframeMock();
    vi.useFakeTimers();

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }));
    act(() => vi.advanceTimersByTime(400));
    act(() => vi.advanceTimersByTime(500));

    const writtenHtml = iframeWriteSpy.mock.calls[0][0];
    expect(writtenHtml).toContain('Skyper');
    expect(writtenHtml).toContain('Bob');
    expect(writtenHtml).toContain('Annual Review');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  5.  Edge-case / boundary inputs
// ─────────────────────────────────────────────────────────────────────────────
describe('ExportSuite — edge cases', () => {
  it('renders with EMPTY_RESULT without crashing', () => {
    render(<ExportSuite analysisResult={EMPTY_RESULT} />);
    expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
  });

  it('renders with analysisResult missing optional fields', () => {
    render(<ExportSuite analysisResult={{ summary: 'Only summary.' }} />);
    expect(screen.getByText(/Download PDF/i)).toBeInTheDocument();
  });

  it('handles XSS-like characters in inputs without crashing', async () => {
    const user = userEvent.setup();
    render(<ExportSuite />);
    const input = screen.getByPlaceholderText('Organization');
    await user.type(input, '<script>alert(1)</script>');
    expect(input).toHaveValue('<script>alert(1)</script>');
  });

  it('does not render when analysisResult is undefined and no default', () => {
    // When null is passed directly (no MOCK fallback)
    const { container } = render(<ExportSuite analysisResult={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  6.  Accessibility smoke tests
// ─────────────────────────────────────────────────────────────────────────────
describe('ExportSuite — accessibility', () => {
  it('all inputs have associated labels', () => {
    render(<ExportSuite />);
    expect(screen.getByText('Company Name')).toBeInTheDocument();
    expect(screen.getByText('Author / Lead')).toBeInTheDocument();
    expect(screen.getByText('Document Heading')).toBeInTheDocument();
  });

  it('download button is focusable', () => {
    render(<ExportSuite />);
    const btn = screen.getByRole('button', { name: /download pdf/i });
    btn.focus();
    expect(btn).toHaveFocus();
  });

  it('disabled button cannot be focused via click while busy', () => {
    vi.useFakeTimers();
    render(<ExportSuite />);
    const btn = screen.getByRole('button', { name: /download pdf/i });
    fireEvent.click(btn);
    expect(btn).toBeDisabled();
    vi.useRealTimers();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setupTests.js  (create this file at the path you set in vitest.config.js)
// ─────────────────────────────────────────────────────────────────────────────
// import '@testing-library/jest-dom';