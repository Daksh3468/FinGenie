import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, Send, X, Bot, User, CornerDownLeft } from 'lucide-react';
import { getApiBase } from '../api/client';

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
      const res = await fetch(`${getApiBase()}/chat/message`, {
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
          conversation_history: messages.slice(1).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `❌ Network error — check backend is running.` }]);
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
        .chat-fab-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 10000;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }

        .chat-fab {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 56px;
          padding: 0 24px 0 10px;
          background: var(--bg-navy);
          color: white;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 28px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(15, 23, 42, 0.3);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .chat-fab:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 48px rgba(37, 99, 235, 0.5), 
                      0 0 0 4px rgba(37, 99, 235, 0.1);
          background: var(--gradient-premium);
          border-color: rgba(255,255,255,0.2);
        }

        .chat-fab:hover .chat-fab-icon {
          transform: scale(1.1) rotate(-5deg);
          background: var(--bg-navy);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .chat-fab-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-premium);
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          transition: var(--transition);
        }

        .chat-panel {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 35%;
          height: 80%;
          background: white;
          border: 1px solid var(--border-light);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          z-index: 9999;
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 500px) {
          .chat-panel {
            width: calc(100vw - 32px);
            right: 16px;
            bottom: 88px;
            height: 70vh;
          }
        }

        .chat-header {
          padding: 16px 24px;
          background: var(--bg-navy);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .chat-header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #f8fafc;
        }

        .bubble {
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          max-width: 85%;
          line-height: 1.5;
        }

        .bubble-assistant {
          background: white;
          border: 1px solid var(--border-subtle);
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }

        .bubble-user {
          background: var(--accent-blue);
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .chat-input-area {
          padding: 20px 24px;
          border-top: 1px solid var(--border-subtle);
          background: white;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-blue-subtle);
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid var(--border-strong);
        }

        .chat-input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          font-family: inherit;
          font-size: 14px;
          padding: 4px;
        }

        .chip-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .chip {
          font-size: 12px;
          padding: 6px 12px;
          background: var(--bg-blue-light);
          color: var(--accent-blue);
          border-radius: 20px;
          border: 1px solid rgba(37, 99, 235, 0.1);
          cursor: pointer;
          font-weight: 600;
        }

        .chip:hover {
          background: var(--accent-blue);
          color: white;
        }

        .dot-pulse {
          display: flex;
          gap: 6px;
          padding: 8px 12px;
          background: white;
          border-radius: 12px;
          width: fit-content;
          border: 1px solid var(--border-subtle);
          margin-bottom: 8px;
        }

        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent-blue);
          animation: wave 1.2s infinite ease-in-out;
        }
        
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes wave {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div className="chat-fab-wrapper">
        <button className="chat-fab" onClick={() => setIsOpen(!isOpen)}>
          <div className="chat-fab-icon">
            {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
          </div>
          {!isOpen && <span>AI ANALYST</span>}
        </button>
      </div>

      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="d-flex items-center gap-3">
               <Bot size={20} className="text-accent" />
               <h3 style={{ fontSize: '16px', margin: 0 }}>Intelligence Feed</h3>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} onClick={() => setIsOpen(false)}>
               <X size={18} />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`bubble bubble-${msg.role} d-flex flex-column gap-2`}>
                <div className="d-flex items-center gap-2 mb-1" style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.5, fontWeight: 800 }}>
                   {msg.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
                   <span>{msg.role === 'assistant' ? 'FinGenie AI' : 'Internal User'}</span>
                </div>
                <div>{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="dot-pulse">
                <div className="dot" />
                <div className="dot" style={{ animationDelay: '0.2s' }} />
                <div className="dot" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-area">
            {messages.length === 1 && (
              <div className="chip-container">
                {suggestions.map(s => (
                  <button key={s} className="chip" onClick={() => setInput(s)}>{s}</button>
                ))}
              </div>
            )}
            <div className="input-wrapper">
              <input 
                className="chat-input" 
                placeholder="Query institutional data..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button 
                className="btn-primary" 
                style={{ padding: '8px', borderRadius: '8px' }} 
                onClick={sendMessage} 
                disabled={loading || !input.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  , document.body);
}