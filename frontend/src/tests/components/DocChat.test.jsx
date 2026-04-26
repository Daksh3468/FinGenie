import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DocChat from '../../components/DocChat';

vi.mock('react-dom', async (importOriginal) => {
  const mod = await importOriginal();
  return { ...mod, createPortal: (node) => node };
});

vi.mock('../../api/client', () => ({ getApiBase: () => 'http://localhost:8000' }));

const mockResult = {
  statement_type: 'Income Statement',
  session_id: 'sess-123',
  raw_data: [{ Revenue: 1000 }],
  column_headers: ['Revenue'],
  summary: 'Good performance.',
  kpis: [],
  risks: [],
};

describe('DocChat', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // resetAllMocks clears call history AND mock implementations,
    // preventing fetch mock state from leaking between tests.
    vi.resetAllMocks();
  });

  // ── null guard ────────────────────────────────────────────────────────────
  it('returns null when analysisResult is not provided', () => {
    const { container } = render(<DocChat />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when analysisResult is null', () => {
    const { container } = render(<DocChat analysisResult={null} />);
    expect(container.firstChild).toBeNull();
  });

  // ── FAB button ────────────────────────────────────────────────────────────
  it('renders the AI ANALYST FAB button', () => {
    render(<DocChat analysisResult={mockResult} />);
    expect(screen.getByText('AI ANALYST')).toBeInTheDocument();
  });

  it('does not show chat panel by default', () => {
    render(<DocChat analysisResult={mockResult} />);
    expect(screen.queryByText('Intelligence Feed')).toBeNull();
  });

  // ── open / close ──────────────────────────────────────────────────────────
  it('opens chat panel when FAB is clicked', () => {
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    expect(screen.getByText('Intelligence Feed')).toBeInTheDocument();
  });

  it('hides "AI ANALYST" label when panel is open', () => {
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    expect(screen.queryByText('AI ANALYST')).toBeNull();
  });

  it('closes panel via X button in header', () => {
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    expect(screen.getByText('Intelligence Feed')).toBeInTheDocument();
    const header = screen.getByText('Intelligence Feed').closest('.chat-header');
    const closeBtn = header.querySelector('button');
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Intelligence Feed')).toBeNull();
  });

  // ── initial message ───────────────────────────────────────────────────────
  it('shows initial assistant greeting mentioning statement_type', () => {
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    expect(screen.getByText(/Income Statement/)).toBeInTheDocument();
  });

  // ── suggestion chips ──────────────────────────────────────────────────────
  it('shows suggestion chips when only 1 message exists', () => {
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    expect(screen.getByText('What is the overall financial health?')).toBeInTheDocument();
  });

  it('clicking suggestion chip fills input', () => {
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    fireEvent.click(screen.getByText('What is the overall financial health?'));
    expect(screen.getByPlaceholderText('Query institutional data...').value)
      .toBe('What is the overall financial health?');
  });

  // ── sending messages ──────────────────────────────────────────────────────
  function getSendButton() {
    return document.querySelector('.input-wrapper button');
  }

  it('sends message on Send button click', async () => {
    global.fetch.mockResolvedValueOnce({ json: async () => ({ reply: 'Revenue looks good.' }) });
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    fireEvent.change(screen.getByPlaceholderText('Query institutional data...'), {
      target: { value: 'Tell me about revenue' },
    });
    await act(async () => { fireEvent.click(getSendButton()); });
    await waitFor(() => expect(screen.getByText('Revenue looks good.')).toBeInTheDocument());
  });

  it('sends message on Enter key press', async () => {
    global.fetch.mockResolvedValueOnce({ json: async () => ({ reply: 'Costs are stable.' }) });
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    const input = screen.getByPlaceholderText('Query institutional data...');
    fireEvent.change(input, { target: { value: 'What about costs?' } });
    await act(async () => { fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' }); });
    await waitFor(() => expect(screen.getByText('Costs are stable.')).toBeInTheDocument());
  });

  it('does not send when input is empty', () => {
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    fireEvent.keyDown(screen.getByPlaceholderText('Query institutional data...'), { key: 'Enter' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('clears input after sending', async () => {
    global.fetch.mockResolvedValueOnce({ json: async () => ({ reply: 'OK' }) });
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    const input = screen.getByPlaceholderText('Query institutional data...');
    fireEvent.change(input, { target: { value: 'Hello?' } });
    await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
    await waitFor(() => expect(input.value).toBe(''));
  });

  it('shows network error message when fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network down'));
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    const input = screen.getByPlaceholderText('Query institutional data...');
    fireEvent.change(input, { target: { value: 'Test?' } });
    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitFor(
      () => expect(screen.getByText(/Network error/i)).toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('send button is disabled while loading', async () => {
    let resolvePromise;
    global.fetch.mockReturnValueOnce(new Promise(r => { resolvePromise = r; }));
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    const input = screen.getByPlaceholderText('Query institutional data...');
    fireEvent.change(input, { target: { value: 'Loading test' } });
    // Use act so the click-triggered state update (setLoading(true)) is flushed
    act(() => { fireEvent.click(getSendButton()); });
    expect(getSendButton()).toBeDisabled();
    // Resolve so the dangling promise doesn't cause act() warnings after the test
    await act(async () => {
      resolvePromise({ json: async () => ({ reply: 'Done' }) });
    });
  });

  it('passes correct payload to fetch including session_id', async () => {
    global.fetch.mockResolvedValueOnce({ json: async () => ({ reply: 'A' }) });
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    const input = screen.getByPlaceholderText('Query institutional data...');
    fireEvent.change(input, { target: { value: 'First question' } });
    await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
    await waitFor(() => screen.getByText('A'));
    const [, callOpts] = global.fetch.mock.calls[0];
    const body = JSON.parse(callOpts.body);
    expect(body.session_id).toBe('sess-123');
    expect(body.user_message).toBe('First question');
  });

  it('passes conversation_history on second message', async () => {
    global.fetch
      .mockResolvedValueOnce({ json: async () => ({ reply: 'A' }) })
      .mockResolvedValueOnce({ json: async () => ({ reply: 'B' }) });
    render(<DocChat analysisResult={mockResult} />);
    fireEvent.click(screen.getByText('AI ANALYST'));
    const input = screen.getByPlaceholderText('Query institutional data...');

    fireEvent.change(input, { target: { value: 'First' } });
    await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
    await waitFor(() => screen.getByText('A'));

    fireEvent.change(input, { target: { value: 'Second' } });
    await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
    await waitFor(() => screen.getByText('B'));

    const [, secondOpts] = global.fetch.mock.calls[1];
    const body = JSON.parse(secondOpts.body);
    expect(body.conversation_history.length).toBeGreaterThan(0);
  });
});
