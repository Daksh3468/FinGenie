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
          bottom: 2rem;
          right: 2rem;
          z-index: 10000;
          pointer-events: none;
        }

        .chat-fab {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          height: 56px;
          padding: 0 1.5rem 0 0.75rem;
          background: var(--gradient-primary);
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-size: 1rem;
          font-weight: 800;
          font-family: var(--sans);
          letter-spacing: 0.5px;
          cursor: pointer;
          box-shadow: var(--shadow-lg);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .chat-fab:hover {
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.4);
          transform: translateY(-4px) scale(1.05);
        }

        .chat-fab:focus-visible {
          outline: 2px solid var(--accent-blue);
          outline-offset: 3px;
        }

        /* icon circle — white bg + blue icon so it pops inside the blue FAB */
        .chat-fab-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          flex-shrink: 0;
          backdrop-filter: blur(4px);
        }

        .chat-fab-icon svg {
          width: 18px;
          height: 18px;
          fill: #ffffff;
          display: block;
        }

        .chat-fab-label {
          font-size: 1rem;
          font-weight: 800;
          white-space: nowrap;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* ── Chat Panel ── */
        .chat-panel {
          position: fixed;
          bottom: 6.5rem;
          right: 2rem;
          width: 400px;
          height: 600px;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          z-index: 9999;
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: bottom right;
          animation: slideUpFade 0.4s ease-out;
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (prefers-color-scheme: dark) {
          .chat-panel { 
            background: var(--bg-navy); 
            border-color: rgba(255,255,255,0.1);
          }
        }

        /* ── Panel Header ── */
        .chat-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          background: var(--gradient-primary);
          color: white;
          flex-shrink: 0;
        }

        .chat-panel-header-title {
          font-family: var(--sans);
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .chat-panel-header-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-family: var(--mono);
          background: rgba(255,255,255,0.2);
          color: #ffffff;
          letter-spacing: 1px;
          font-weight: 900;
          backdrop-filter: blur(4px);
        }

        .chat-close-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .chat-close-btn:hover {
          background: rgba(255,255,255,0.2);
          transform: rotate(90deg);
        }

        /* ── Messages Area ── */
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: #fcfdfe;
        }

        @media (prefers-color-scheme: dark) {
          .chat-messages { background: #0b0f1a; }
        }

        .chat-messages::-webkit-scrollbar { width: 6px; }
        .chat-messages::-webkit-scrollbar-track { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 10px; }

        /* ── Chat Bubbles ── */
        .chat-bubble {
          padding: 1rem 1.25rem;
          border-radius: 18px;
          font-size: 0.9375rem;
          font-family: var(--sans);
          line-height: 1.6;
          max-width: 85%;
          white-space: pre-wrap;
          word-break: break-word;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .chat-user {
          background: var(--gradient-primary);
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .chat-assistant {
          background: white;
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        
        @media (prefers-color-scheme: dark) {
          .chat-assistant {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.1);
            color: white;
          }
        }

        /* ── Suggestion Chips ── */
        .chat-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          padding: 1rem 1.5rem;
          background: #ffffff;
          border-top: 1px solid var(--border-light);
        }
        
        @media (prefers-color-scheme: dark) {
          .chat-suggestions { background: transparent; border-color: rgba(255,255,255,0.1); }
        }

        .chat-suggestion-chip {
          background: var(--bg-blue-light);
          border: 1px solid var(--border-light);
          color: var(--accent-blue);
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chat-suggestion-chip:hover { 
          background: white;
          border-color: var(--accent-blue);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }

        /* ── Input Row ── */
        .chat-input-row {
          display: flex;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid var(--border-light);
          background: #ffffff;
        }
        
        @media (prefers-color-scheme: dark) {
          .chat-input-row { background: transparent; border-color: rgba(255,255,255,0.1); }
        }

        .chat-input {
          flex: 1;
          background: #f8fafc;
          border: 1px solid var(--border-light);
          border-radius: 12px;
          color: var(--text-primary);
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          outline: none;
          transition: all 0.2s;
        }
        
        @media (prefers-color-scheme: dark) {
          .chat-input { background: rgba(255,255,255,0.05); color: white; border-color: rgba(255,255,255,0.1); }
        }

        .chat-input:focus { 
          border-color: var(--accent-blue); 
          background: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); 
        }

        .chat-send-btn {
          background: var(--gradient-primary);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          width: 44px;
          height: 44px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .chat-send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .chat-send-btn:not(:disabled):hover { 
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        /* ── Typing Indicator ── */
        .chat-typing {
          padding: 0.75rem 1rem;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: 14px;
          border-bottom-left-radius: 3px;
          align-self: flex-start;
          display: flex;
          gap: 5px;
          align-items: center;
        }
        
        @media (prefers-color-scheme: dark) {
          .chat-typing { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-blue);
          display: block;
          animation: dotBounce 1.2s infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-7px); }
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
