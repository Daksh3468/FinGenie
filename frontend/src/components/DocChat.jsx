import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function DocChat({ analysisResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I've analyzed your **${analysisResult?.statement_type}**. Ask me anything about it — KPIs, risks, what the numbers mean, or what to do next.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: analysisResult?.session_id || 'default',
          user_message: text,
          raw_data: analysisResult?.raw_data || [],
          column_headers: analysisResult?.column_headers || [],
          statement_type: analysisResult?.statement_type || '',
          summary: analysisResult?.summary || '',
          kpis: analysisResult?.kpis || [],
          risks: analysisResult?.risks || [],
          conversation_history: messages.slice(1),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    'What is the overall financial health?',
    'Which risks should I address first?',
    'Explain the gross profit margin.',
    'What does the revenue trend tell us?',
  ];

  if (!analysisResult) return null;

  return createPortal(
    <>
      <style>{`
        /* ── page-blue palette (hardcoded to match FinGenie blue theme) ── */
        /* primary blue: #2563eb  |  light fill: #eff6ff  |  border: #bfdbfe  |  shadow: rgba(37,99,235,…) */

        .chat-fab-wrapper {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 10000;
          pointer-events: none;
        }

        .chat-fab {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          height: 46px;
          padding: 0 1.1rem 0 0.55rem;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: var(--sans);
          letter-spacing: 0.18px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45), 0 1px 3px rgba(0,0,0,0.12);
          transition: box-shadow 0.2s ease, transform 0.15s ease;
          outline: none;
        }

        .chat-fab:hover {
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.55), 0 2px 6px rgba(0,0,0,0.14);
          transform: translateY(-1px);
        }

        .chat-fab:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 3px;
        }

        /* icon circle — white bg + blue icon so it pops inside the blue FAB */
        .chat-fab-icon {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.22);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .chat-fab-icon svg {
          width: 14px;
          height: 14px;
          fill: #ffffff;
          display: block;
        }

        .chat-fab-label {
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          color: #ffffff;
        }

        /* ── Chat Panel ── */
        .chat-panel {
          position: fixed;
          bottom: 5.5rem;
          right: 1.5rem;
          width: 40vw;
          min-width: 280px;
          max-width: 80vw;
          height: 60vh;
          min-height: 300px;
          max-height: 80vh;
          background: #ffffff;
          border: 1.5px solid #bfdbfe;
          border-top: 3px solid #2563eb;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          z-index: 9999;
          box-shadow: 0 8px 32px rgba(37, 99, 235, 0.13), 0 2px 8px rgba(0,0,0,0.08);
          overflow: hidden;
          resize: both;
          overflow: auto;
        }

        @media (prefers-color-scheme: dark) {
          .chat-fab        { background: #1d4ed8; box-shadow: 0 4px 14px rgba(29,78,216,0.5); }
          .chat-panel      { background: #0f172a; border-color: #1e3a5f; border-top-color: #3b82f6; box-shadow: 0 8px 32px rgba(59,130,246,0.15), 0 2px 8px rgba(0,0,0,0.4); }
          .chat-panel-header { background: #0f172a; border-color: #1e3a5f; }
          .chat-panel-header-title { color: #f1f5f9; }
          .chat-panel-header-badge { background: #1e40af; }
          .chat-messages-bg  { background: #0f172a; }
          .chat-assistant    { background: #1e293b; border-color: #334155; color: #cbd5e1; }
          .chat-user         { background: #1e3a5f; border-color: #2563eb; color: #e0f2fe; }
          .chat-input-row    { background: #0f172a; border-color: #1e3a5f; }
          .chat-input        { background: #1e293b; border-color: #334155; color: #f1f5f9; }
          .chat-suggestions  { border-color: #1e3a5f; }
          .chat-suggestion-chip { background: #1e3a5f; border-color: #2563eb; color: #93c5fd; }
        }

        /* ── Panel Header ── */
        .chat-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.1rem;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
          flex-shrink: 0;
        }

        .chat-panel-header-title {
          font-family: var(--sans);
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
          letter-spacing: 0.18px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chat-panel-header-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 0.68rem;
          font-family: var(--mono);
          background: #2563eb;
          color: #ffffff;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .chat-close-btn {
          background: none;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-family: var(--sans);
          line-height: 1.4;
          transition: border-color 0.15s, color 0.15s;
        }

        .chat-close-btn:hover {
          border-color: #2563eb;
          color: #2563eb;
        }

        /* ── Messages Area ── */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: #f8fafc;
        }

        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: #bfdbfe; border-radius: 4px; }

        /* ── Chat Bubbles ── */
        .chat-bubble {
          padding: 0.6rem 0.9rem;
          border-radius: 14px;
          font-size: 0.875rem;
          font-family: var(--sans);
          line-height: 145%;
          letter-spacing: 0.18px;
          max-width: 88%;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .chat-user {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e3a5f;
          align-self: flex-end;
          border-bottom-right-radius: 3px;
        }

        .chat-assistant {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #334155;
          align-self: flex-start;
          border-bottom-left-radius: 3px;
        }

        /* ── Typing Indicator ── */
        .chat-typing {
          padding: 0.75rem 1rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          border-bottom-left-radius: 3px;
          align-self: flex-start;
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2563eb;
          display: block;
          animation: dotBounce 1.2s infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-7px); }
        }

        /* ── Suggestion Chips ── */
        .chat-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          padding: 0.5rem 1rem 0.65rem;
          flex-shrink: 0;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
        }

        .chat-suggestion-chip {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #2563eb;
          padding: 0.28rem 0.65rem;
          border-radius: 20px;
          font-size: 0.73rem;
          font-family: var(--sans);
          cursor: pointer;
          white-space: nowrap;
          letter-spacing: 0.18px;
          transition: background 0.15s;
        }

        .chat-suggestion-chip:hover { background: #dbeafe; }

        /* ── Input Row ── */
        .chat-input-row {
          display: flex;
          gap: 0.5rem;
          padding: 0.65rem 0.9rem;
          border-top: 1px solid #e2e8f0;
          flex-shrink: 0;
          background: #ffffff;
        }

        .chat-input {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #0f172a;
          padding: 0.5rem 0.8rem;
          font-size: 0.875rem;
          font-family: var(--sans);
          letter-spacing: 0.18px;
          outline: none;
          transition: border-color 0.2s;
        }

        .chat-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .chat-input::placeholder { color: #94a3b8; }
        .chat-input:disabled { opacity: 0.45; cursor: not-allowed; }

        .chat-send-btn {
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 0.9rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-family: var(--sans);
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .chat-send-btn:not(:disabled):hover { background: #1d4ed8; }

        /* ── Resize corner ── */
        .chat-panel::after {
          content: "";
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 9px;
          height: 9px;
          border-bottom: 1.5px solid #bfdbfe;
          border-right: 1.5px solid #bfdbfe;
          pointer-events: none;
          z-index: 2;
        }
      `}</style>

      {/* Floating Action Button */}
      <div className="chat-fab-wrapper">
        <button
          className="chat-fab"
          onClick={() => setIsOpen((o) => !o)}
          title="Chat with your document"
          id="chat-fab-btn"
        >
          <span className="chat-fab-icon">
            {isOpen
              ? <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l12 12M13 1L1 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
              : <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M1 1h12a1 1 0 011 1v7a1 1 0 01-1 1H4l-3 3V2a1 1 0 011-1z" fill="#fff"/></svg>
            }
          </span>
          {!isOpen && <span className="chat-fab-label">Ask AI</span>}
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel" id="chat-panel">
          <div className="chat-panel-header">
            <span className="chat-panel-header-title">
              Ask about your document
              <span className="chat-panel-header-badge">AI</span>
            </span>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-messages" id="chat-messages">
            {messages.slice(1).map((msg, idx) => (
              <div key={idx} className={`chat-bubble chat-${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-assistant chat-typing">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="chat-suggestions">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="chat-suggestion-chip"
                  onClick={() => setInput(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-row">
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything about your document..."
              disabled={loading}
              id="chat-input"
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              id="chat-send-btn"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
