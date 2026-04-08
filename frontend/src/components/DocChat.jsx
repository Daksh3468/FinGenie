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
     <style>
      {`/* ── Floating Action Button ── */
.chat-fab-wrapper {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 10000;
  pointer-events: none;
}

.chat-fab {
  position: relative;
  pointer-events: auto;

  display: flex;
  align-items: center;
  gap: 0.5rem;

  min-width: 48px;
  height: 48px;
  padding: 0.75rem 1.25rem;

  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 9999px;

  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;

  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
  transition: transform 0.2s ease;

  outline: none;
}

.chat-fab:hover {
  transform: scale(1.06);
}

.chat-fab:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;
}

.chat-fab-label {
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
}

/* ── Chat Panel (resizable) ── */
.chat-panel {
  position: fixed;
  bottom: 5.5rem;
  right: 1.5rem;
  left: auto;
  top: auto;

  width: 40vw;
  min-width: 280px;
  max-width: 80vw;

  height: 60vh;
  min-height: 300px;
  max-height: 80vh;

  background: #1a1a2e;
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;

  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  overflow: hidden;

  resize: both;
  overflow: auto;
}

/* ── Panel Header ── */
.chat-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.2rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.chat-close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  opacity: 0.85;
  transition: opacity 0.15s;
}

.chat-close-btn:hover {
  opacity: 1;
}

/* ── Messages Area ── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ── Chat Bubbles ── */
.chat-bubble {
  padding: 0.7rem 1rem;
  border-radius: 16px;
  font-size: 0.875rem;
  line-height: 1.55;
  max-width: 88%;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-user {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}

.chat-assistant {
  background: rgba(255, 255, 255, 0.07);
  color: #e2e8f0;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

/* ── Typing Indicator ── */
.chat-typing {
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.07);
  color: #e2e8f0;
  border-radius: 16px;
  align-self: flex-start;
  display: flex;
  gap: 5px;
  align-items: center;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #6366f1;
  display: block;
  animation: dotBounce 1.2s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-8px);
  }
}

/* ── Suggestion Chips ── */
.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 0.5rem 1rem 0.75rem;
  flex-shrink: 0;
}

.chat-suggestion-chip {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
}

.chat-suggestion-chip:hover {
  background: rgba(99, 102, 241, 0.3);
}

/* ── Input Row ── */
.chat-input-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  color: #e2e8f0;
  padding: 0.6rem 0.9rem;
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
}

.chat-input:focus {
  border-color: #6366f1;
}

.chat-input::placeholder {
  color: rgba(226, 232, 240, 0.4);
}

.chat-input:disabled {
  opacity: 0.6;
}

.chat-send-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.chat-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chat-send-btn:not(:disabled):hover {
  opacity: 0.9;
}

/* ── Resizable corners (optional visual hint) ── */
.chat-panel::after {
  content: "";
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background: transparent;
  border-bottom: 2px solid rgba(255,255,255,0.4);
  border-right: 2px solid rgba(255,255,255,0.4);
  pointer-events: none;
  z-index: 2;
}`}</style>


      {/* Floating Action Button */}
      <div className="chat-fab-wrapper">
        <button
          className="chat-fab"
          onClick={() => setIsOpen((o) => !o)}
          title="Chat with your document"
          id="chat-fab-btn"
        >
          {isOpen ? '✕' : '💬'}
          {!isOpen && <span className="chat-fab-label">Ask AI</span>}
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel" id="chat-panel">
          <div className="chat-panel-header">
            <span>🤖 Ask about your document</span>
            <button
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chat-messages" id="chat-messages">
            {messages.slice(1).map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble chat-${msg.role}`}
              >
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