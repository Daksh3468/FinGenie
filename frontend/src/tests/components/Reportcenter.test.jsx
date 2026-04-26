// ReportCenter.test.jsx
// Stack : Vitest + @testing-library/react v14 + @testing-library/user-event v14 + jsdom
//
// vitest.config.js → test: { environment:'jsdom', globals:true, setupFiles:['./src/setupTests.js'] }
// setupTests.js    → import '@testing-library/jest-dom'

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportCenter from '../../components/ReportCenter';

// ─── Mock ExportSuite (not under test here) ───────────────────────────────────
vi.mock('./ExportSuite', () => ({
  default: () => <div data-testid="export-suite">ExportSuite</div>,
}));

// ─── Mock data — ALL four counts are UNIQUE to prevent getByText collisions ───
//   KPIs=2  Risks=1  Recs=3  Rows=4
const MOCK_ANALYSIS = {
  statement_type: 'Income Statement',
  parsing_mode: 'advanced',
  kpis: [{ label: 'Revenue', value: '1M' }, { label: 'EBITDA', value: '200K' }],
  risks: [{ text: 'Market risk' }],
  recommendations: [{ text: 'Diversify' }, { text: 'Cut costs' }, { text: 'Expand' }],
  raw_data: [['r1'], ['r2'], ['r3'], ['r4']],
  column_headers: ['Period', 'Amount'],
  summary: 'Strong performance',
};

// ─── Fetch mock helpers ───────────────────────────────────────────────────────

function mockFetchSuccess(report = '## Section\n**Bold** and *italic*\n- list item') {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ report_markdown: report, word_count: 42 }),
  });
}

function mockFetchFailure(status = 500) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({}),
  });
}

function mockFetchNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
}

// ─── Global setup / teardown ─────────────────────────────────────────────────

beforeEach(() => {
  global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();            // unmount rendered trees
  vi.restoreAllMocks();
  vi.useRealTimers();   // ← CRITICAL: prevents fake-timer bleed across tests
});

// ─── Shared helper: generate report, wait for toolbar ─────────────────────────
// Precondition: mockFetchSuccess() already called; component already rendered.
async function generateAndWaitForToolbar() {
  await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
  await waitFor(() => screen.getByRole('button', { name: /HTML/i }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1.  NULL GUARD
// ═══════════════════════════════════════════════════════════════════════════════

describe('ReportCenter — null guard', () => {
  it('renders nothing when analysisResult is null', () => {
    const { container } = render(<ReportCenter analysisResult={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when analysisResult is undefined', () => {
    const { container } = render(<ReportCenter analysisResult={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2.  ReportCenterHeader
// ═══════════════════════════════════════════════════════════════════════════════

describe('ReportCenterHeader', () => {
  beforeEach(() => render(<ReportCenter analysisResult={MOCK_ANALYSIS} />));

  // FIX A — "AI Narrative" appears in both <h1> AND the tab button.
  //         Scope to role="heading" to avoid the multi-match error.
  it('renders the page title heading', () => {
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('AI Narrative');
    expect(heading).toHaveTextContent('Generator.');
  });

  it('shows statement type uppercased', () => {
    expect(screen.getByText(/TYPE:.*INCOME STATEMENT/)).toBeInTheDocument();
  });

  it('shows parsing mode uppercased', () => {
    expect(screen.getByText(/LOGIC:.*ADVANCED/)).toBeInTheDocument();
  });

  // FIX B — KPIs=2 and Recs=2 would both match getByText('2').
  //         Now Recs=3 so counts are unique; scope each query to its label sibling.
  it('displays correct KPI count (2)', () => {
    const widget = screen.getByText('KPIs').closest('.text-center') ||
                   screen.getByText('KPIs').parentElement;
    expect(widget).toHaveTextContent('2');
  });

  it('displays correct Risks count (1)', () => {
    const widget = screen.getByText('Risks').closest('.text-center') ||
                   screen.getByText('Risks').parentElement;
    expect(widget).toHaveTextContent('1');
  });

  it('displays correct Recs count (3)', () => {
    const widget = screen.getByText('Recs').closest('.text-center') ||
                   screen.getByText('Recs').parentElement;
    expect(widget).toHaveTextContent('3');
  });

  it('displays correct Rows count (4)', () => {
    const widget = screen.getByText('Rows').closest('.text-center') ||
                   screen.getByText('Rows').parentElement;
    expect(widget).toHaveTextContent('4');
  });

  it('renders all four stat labels', () => {
    ['KPIs', 'Risks', 'Recs', 'Rows'].forEach(label =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it('renders the eyebrow label', () => {
    expect(screen.getByText('Intelligence Report Generation')).toBeInTheDocument();
  });
});

describe('ReportCenterHeader — empty / missing fields', () => {
  it('shows four zeros when arrays are absent', () => {
    render(<ReportCenter analysisResult={{ statement_type: 'BS', parsing_mode: 'std' }} />);
    expect(screen.getAllByText('0')).toHaveLength(4);
  });

  it('falls back to FIN-REP when statement_type is missing', () => {
    render(<ReportCenter analysisResult={{}} />);
    expect(screen.getByText(/TYPE:.*FIN-REP/)).toBeInTheDocument();
  });

  it('falls back to STD when parsing_mode is missing', () => {
    render(<ReportCenter analysisResult={{}} />);
    expect(screen.getByText(/LOGIC:.*STD/)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3.  Tab navigation
// ═══════════════════════════════════════════════════════════════════════════════

describe('Tab navigation', () => {
  it('renders both tabs', () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    expect(screen.getByRole('button', { name: /AI Narrative/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Structured Export/i })).toBeInTheDocument();
  });

  it('defaults to AI Narrative tab (format selector visible)', () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    expect(screen.getByText('Select Intelligence Framework')).toBeInTheDocument();
  });

  it('switches to Structured Export on click', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Structured Export/i }));
    expect(screen.queryByText('Select Intelligence Framework')).not.toBeInTheDocument();
    expect(screen.getByTestId('export-suite')).toBeInTheDocument();
  });

  it('switches back to AI Narrative tab', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Structured Export/i }));
    await userEvent.click(screen.getByRole('button', { name: /AI Narrative/i }));
    expect(screen.getByText('Select Intelligence Framework')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4.  Format card selection
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_FORMATS = [
  { id: 'executive', label: 'Executive Brief' },
  { id: 'investor',  label: 'Investor Memo' },
  { id: 'audit',     label: 'Internal Audit' },
  { id: 'board',     label: 'Board Update' },
  { id: 'startup',   label: 'Pitch Narrative' },
  { id: 'academic',  label: 'Research Paper' },
];

describe('Format card selection', () => {
  beforeEach(() => render(<ReportCenter analysisResult={MOCK_ANALYSIS} />));

  it.each(ALL_FORMATS)('renders "$label" format card', ({ label }) => {
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('defaults to Executive Brief', () => {
    expect(
      screen.getByRole('button', { name: /Compose Executive Brief/i })
    ).toBeInTheDocument();
  });

  it.each(ALL_FORMATS.slice(1))(
    'selecting "$label" updates the compose button',
    async ({ label }) => {
      await userEvent.click(screen.getByText(label));
      expect(
        screen.getByRole('button', { name: new RegExp(`Compose ${label}`, 'i') })
      ).toBeInTheDocument();
    }
  );

  it('shows description text for the executive card', () => {
    expect(screen.getByText('Concise strategic summary for C-suite')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5.  Generate — loading state
// ═══════════════════════════════════════════════════════════════════════════════

describe('Generate — loading state', () => {
  it('disables the button while the request is in-flight', async () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Synthesizing Narrative/i })).toBeDisabled()
    );
  });

  it('changes button label to "Synthesizing Narrative…" during load', async () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() =>
      expect(screen.getByText('Synthesizing Narrative...')).toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6.  Generate — API success
// ═══════════════════════════════════════════════════════════════════════════════

describe('Generate — API success', () => {
  beforeEach(() => mockFetchSuccess());

  it('calls POST /api/report/generate', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain('/api/report/generate');
    expect(opts.method).toBe('POST');
  });

  it('sends format_id: "executive" by default', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(JSON.parse(fetch.mock.calls[0][1].body).format_id).toBe('executive');
  });

  it('sends statement_type from analysisResult', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(JSON.parse(fetch.mock.calls[0][1].body).statement_type).toBe('Income Statement');
  });

  it('sends kpis (2), risks (1), recommendations (3) arrays', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.kpis).toHaveLength(2);
    expect(body.risks).toHaveLength(1);
    expect(body.recommendations).toHaveLength(3);
  });

  it('renders the report toolbar after success', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() =>
      expect(screen.getByText(/DRAFT: Executive Brief/i)).toBeInTheDocument()
    );
  });

  it('renders HTML and PDF export buttons after success', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    expect(screen.getByRole('button', { name: /PDF/i })).toBeInTheDocument();
  });

  it('clears a previous error on new successful generate', async () => {
    mockFetchFailure();
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    const btn = screen.getByRole('button', { name: /Compose Executive Brief/i });
    await userEvent.click(btn);
    await waitFor(() => screen.getByText(/Generation failed/i));

    mockFetchSuccess();
    await userEvent.click(btn);
    await waitFor(() =>
      expect(screen.queryByText(/Generation failed/i)).not.toBeInTheDocument()
    );
  });

  it('clears the previous report while a new request is loading', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    const btn = screen.getByRole('button', { name: /Compose Executive Brief/i });
    await userEvent.click(btn);
    await waitFor(() => screen.getByText(/DRAFT/i));

    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    await userEvent.click(btn);
    await waitFor(() =>
      expect(screen.queryByText(/DRAFT/i)).not.toBeInTheDocument()
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7.  Generate — API failure
// ═══════════════════════════════════════════════════════════════════════════════

describe('Generate — API failure', () => {
  it('shows error message on non-ok HTTP response', async () => {
    mockFetchFailure(500);
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/Generation failed\. Please verify API connection\./i)
      ).toBeInTheDocument()
    );
  });

  it('shows error on network / thrown error', async () => {
    mockFetchNetworkError();
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() =>
      expect(screen.getByText(/Generation failed/i)).toBeInTheDocument()
    );
  });

  it('re-enables the compose button after failure', async () => {
    mockFetchFailure();
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    const btn = screen.getByRole('button', { name: /Compose Executive Brief/i });
    await userEvent.click(btn);
    await waitFor(() => expect(btn).not.toBeDisabled());
  });

  it('does not render the report section on failure', async () => {
    mockFetchFailure();
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() => screen.getByText(/Generation failed/i));
    expect(screen.queryByText(/DRAFT/i)).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8.  Fallback values
// ═══════════════════════════════════════════════════════════════════════════════

describe('Generate — fallback values for absent fields', () => {
  it('sends empty arrays and fallback strings when fields are missing', async () => {
    mockFetchSuccess();
    render(<ReportCenter analysisResult={{ statement_type: 'BS' }} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.raw_data).toEqual([]);
    expect(body.column_headers).toEqual([]);
    expect(body.kpis).toEqual([]);
    expect(body.risks).toEqual([]);
    expect(body.recommendations).toEqual([]);
    expect(body.summary).toBe('');
    expect(body.parsing_mode).toBe('standard');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9.  HTML Download
// ═══════════════════════════════════════════════════════════════════════════════

describe('Download HTML', () => {
  beforeEach(() => mockFetchSuccess());

  it('creates a Blob with text/html type', async () => {
    const blobSpy = vi.spyOn(global, 'Blob');
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));
    expect(blobSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ type: expect.stringContaining('text/html') })
    );
  });

  it('calls URL.createObjectURL', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('calls URL.revokeObjectURL with the blob URL', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('shows "Saved" confirmation after download', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Saved/i })).toBeInTheDocument()
    );
  });

  // FIX C — fake timers + async userEvent = deadlock.
  //   Pattern: complete async setup with REAL timers → switch to fake timers →
  //   use synchronous fireEvent → flush with act(vi.advanceTimersByTime).
  it('reverts "Saved" label back to "HTML" after 3 s', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar(); // real timers, async OK here

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: /HTML/i })); // sync
    expect(screen.getByRole('button', { name: /Saved/i })).toBeInTheDocument();

    await act(async () => { vi.advanceTimersByTime(3001); });

    expect(screen.getByRole('button', { name: /HTML/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Saved/i })).not.toBeInTheDocument();
  });

  it('blob HTML contains the format label and statement type', async () => {
    const blobSpy = vi.spyOn(global, 'Blob');
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));
    const html = blobSpy.mock.calls[0][0][0];
    expect(html).toContain('Executive Brief');
    expect(html).toContain('Income Statement');
    expect(html).toContain('FinGenie');
  });

  it('blob HTML includes DOCTYPE declaration', async () => {
    const blobSpy = vi.spyOn(global, 'Blob');
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));
    expect(blobSpy.mock.calls[0][0][0]).toContain('<!DOCTYPE html>');
  });

  it('blob HTML includes footer attribution', async () => {
    const blobSpy = vi.spyOn(global, 'Blob');
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));
    const html = blobSpy.mock.calls[0][0][0];
    expect(html).toContain('FinGenie Institutional Intelligence');
    expect(html).toContain('Strictly Confidential');
  });

  it('blob HTML includes the current year', async () => {
    const blobSpy = vi.spyOn(global, 'Blob');
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));
    expect(blobSpy.mock.calls[0][0][0]).toContain(String(new Date().getFullYear()));
  });

  // FIX D — calling document.createElement() inside its own spy causes infinite
  //   recursion. Capture the original reference BEFORE installing the spy.
  it('sets anchor download attribute to "fingenie-report.html"', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const anchorClick = vi.fn();
    const mockAnchor = { href: '', download: '', click: anchorClick };

    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor;
      return originalCreateElement(tag); // no infinite recursion
    });

    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    fireEvent.click(screen.getByRole('button', { name: /HTML/i }));

    expect(mockAnchor.download).toBe('fingenie-report.html');
    expect(anchorClick).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. PDF Download (printViaIframe)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Download PDF', () => {
  beforeEach(() => mockFetchSuccess());

  it('shows "Sent" confirmation after PDF click', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();
    fireEvent.click(screen.getByRole('button', { name: /PDF/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Sent/i })).toBeInTheDocument()
    );
  });

  it('reverts "Sent" label back to "PDF" after 3 s', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: /PDF/i }));
    expect(screen.getByRole('button', { name: /Sent/i })).toBeInTheDocument();

    await act(async () => { vi.advanceTimersByTime(3001); });

    expect(screen.getByRole('button', { name: /PDF/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sent/i })).not.toBeInTheDocument();
  });

  it('appends an iframe to document.body', async () => {
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await generateAndWaitForToolbar();

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: /PDF/i }));
    await act(async () => { vi.advanceTimersByTime(600); }); // past 500ms delay

    expect(appendSpy).toHaveBeenCalled();
    const appendedNode = appendSpy.mock.calls.find(
      ([node]) => node?.tagName?.toLowerCase() === 'iframe'
    );
    expect(appendedNode).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. mdToHtml — output tested via dangerouslySetInnerHTML
// ═══════════════════════════════════════════════════════════════════════════════

async function renderReportWith(markdown) {
  mockFetchSuccess(markdown);
  render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
  await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
  await waitFor(() => screen.getByText(/DRAFT/i));
  return document.querySelector('.ai-report-content');
}

describe('mdToHtml — markdown rendering', () => {
  it('converts ## to <h2>', async () => {
    const el = await renderReportWith('## Heading Two');
    expect(el.querySelector('h2')).not.toBeNull();
    expect(el.querySelector('h2').textContent).toBe('Heading Two');
  });

  it('converts ### to <h3>', async () => {
    const el = await renderReportWith('### Heading Three');
    expect(el.querySelector('h3')).not.toBeNull();
    expect(el.querySelector('h3').textContent).toBe('Heading Three');
  });

  it('converts **text** to <strong>', async () => {
    const el = await renderReportWith('**bold text**');
    expect(el.querySelector('strong')).not.toBeNull();
    expect(el.querySelector('strong').textContent).toBe('bold text');
  });

  it('converts *text* to <em>', async () => {
    const el = await renderReportWith('*italic text*');
    expect(el.querySelector('em')).not.toBeNull();
    expect(el.querySelector('em').textContent).toBe('italic text');
  });

  it('converts - list items to <li>', async () => {
    const el = await renderReportWith('- item one\n- item two');
    expect(el.querySelectorAll('li').length).toBeGreaterThanOrEqual(2);
  });

  it('converts • bullet items to <li>', async () => {
    const el = await renderReportWith('• bullet item');
    expect(el.querySelector('li')).not.toBeNull();
  });

  it('converts numbered list items to <li> with .ai-report-num span', async () => {
    const el = await renderReportWith('1. first item');
    expect(el.querySelector('li')).not.toBeNull();
    expect(el.querySelector('.ai-report-num')).not.toBeNull();
  });

  it('wraps plain text in <p>', async () => {
    const el = await renderReportWith('Plain paragraph text here.');
    expect(el.querySelector('p')).not.toBeNull();
    expect(el.querySelector('p').textContent).toContain('Plain paragraph text here.');
  });

it('escapes HTML special chars (&, <, >, ")', async () => {
  const el = await renderReportWith('Price: <100 & "quoted"');
  expect(el.innerHTML).toContain('&lt;100');
  expect(el.innerHTML).toContain('&amp;');
  // jsdom (like all browsers) serializes " as plain " in text nodes, not &quot;
  // Verify the quote is present and safe (not treated as markup)
  expect(el.textContent).toContain('"quoted"');
});
  // FIX E — empty-string report: `{report && ...}` evaluates to false so the
  //   toolbar/DRAFT never renders → waiting for /DRAFT/ would timeout.
  //   Assert the stable observable fact: loading ends with no error and no toolbar.
  it('handles empty report string without crash or error message', async () => {
    mockFetchSuccess('');
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Compose Executive Brief/i })
      ).not.toBeDisabled()
    );
    expect(screen.queryByText(/Generation failed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DRAFT/i)).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. Format switching → correct format_id sent to API
// ═══════════════════════════════════════════════════════════════════════════════

describe('Format switching — format_id sent to API', () => {
  it.each(ALL_FORMATS)('sends "$id" when "$label" is selected', async ({ label, id }) => {
    mockFetchSuccess();
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByText(label));
    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(`Compose ${label}`, 'i') })
    );
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(JSON.parse(fetch.mock.calls[0][1].body).format_id).toBe(id);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. API base URL
// ═══════════════════════════════════════════════════════════════════════════════

describe('API base URL', () => {
  it('defaults to http://localhost:8000 when VITE_API_BASE_URL is not set', async () => {
    mockFetchSuccess();
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    await userEvent.click(screen.getByRole('button', { name: /Compose Executive Brief/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch.mock.calls[0][0]).toContain('localhost:8000');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14. Multiple consecutive generates
// ═══════════════════════════════════════════════════════════════════════════════

describe('Multiple consecutive generates', () => {
  it('second report replaces the first', async () => {
    mockFetchSuccess('## First Report');
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    const btn = screen.getByRole('button', { name: /Compose Executive Brief/i });

    await userEvent.click(btn);
    await waitFor(() => screen.getByText(/DRAFT/i));

    mockFetchSuccess('## Second Report');
    await userEvent.click(btn);
    await waitFor(() => {
      const content = document.querySelector('.ai-report-content');
      expect(content?.querySelector('h2')?.textContent).toBe('Second Report');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 15. Accessibility
// ═══════════════════════════════════════════════════════════════════════════════

describe('Accessibility', () => {
  it('compose button is keyboard-focusable', () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    const btn = screen.getByRole('button', { name: /Compose Executive Brief/i });
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it('format card click updates the compose button label', async () => {
    render(<ReportCenter analysisResult={MOCK_ANALYSIS} />);
    fireEvent.click(screen.getByText('Investor Memo'));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Compose Investor Memo/i })
      ).toBeInTheDocument()
    );
  });
});