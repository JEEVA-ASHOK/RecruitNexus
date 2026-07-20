import React, { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../api';
import { MessageSquare, Send, X, Bot, Sparkles, LogIn, Loader2 } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export const AiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = user ? user.role : 'Candidate';

  // Quick Action Suggestions
  const candidatePills = [
    'What jobs do I match?',
    'Give me resume feedback',
    'What skills should I learn?',
  ];

  const recruiterPills = [
    'Write a DevOps job post',
    'Draft interview questions',
    'Evaluate my applications',
  ];

  const pills = userRole === 'Recruiter' || userRole === 'Admin' ? recruiterPills : candidatePills;

  useEffect(() => {
    if (isLoggedIn && user && messages.length === 0) {
      setMessages([
        {
          sender: 'ai',
          text: `Hello ${user.fullName}! I'm your TalentSphere AI Assistant, configured as a **${user.role}** assistant. How can I help you navigate your portal today?`,
        },
      ]);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message to state
    const newMessages = [...messages, { sender: 'user', text: textToSend } as ChatMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Map history to backend format: DTO expects Sender: "user" | "ai"
    const history = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    const { data, error } = await apiRequest('/ai/chat', 'POST', {
      message: textToSend,
      history: history,
    });

    setLoading(false);

    if (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `Sorry, I encountered an error: ${error}` },
      ]);
    } else if (data && data.reply) {
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...styles.floatingBtn,
          boxShadow: isOpen ? '0 0 25px rgba(0, 242, 254, 0.4)' : '0 0 20px rgba(139, 92, 246, 0.25)',
          background: isOpen ? 'var(--accent-gradient)' : 'rgba(18, 20, 32, 0.75)',
          borderColor: isOpen ? '#00f2fe' : 'rgba(255,255,255,0.08)',
        }}
        title="AI Chatbot Assistant"
      >
        {isOpen ? <X size={22} color="#000" /> : <Bot size={22} color="#00f2fe" style={{ filter: 'drop-shadow(0 0 4px #00f2fe)' }} />}
      </button>

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div style={styles.chatWindow} className="glass-panel">
          {/* Header */}
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#00f2fe" style={{ filter: 'drop-shadow(0 0 4px #00f2fe)' }} />
              <div>
                <h3 style={styles.title} className="text-gradient">NexusAI</h3>
                <span style={styles.subtitle}>Recruit Copilot</span>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={styles.body}>
            {!isLoggedIn ? (
              <div style={styles.anonymousBox}>
                <LogIn size={32} color="#64748b" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '0.95rem', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Login Required</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4', marginBottom: '16px' }}>
                  Please sign in to your Candidate or Recruiter account to access your personalized AI assistant.
                </p>
                <a href="/login" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setIsOpen(false)}>
                  Sign In
                </a>
              </div>
            ) : (
              <>
                <div style={styles.messageScroll}>
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        ...styles.messageBubbleContainer,
                        justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {m.sender === 'ai' && (
                        <div style={styles.aiAvatar}>
                          <Bot size={14} color="#00f2fe" />
                        </div>
                      )}
                      <div
                        style={{
                          ...styles.bubble,
                          background: m.sender === 'user' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          borderColor: m.sender === 'user' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          borderBottomRightRadius: m.sender === 'user' ? '2px' : '12px',
                          borderBottomLeftRadius: m.sender === 'ai' ? '2px' : '12px',
                        }}
                      >
                        <p style={styles.messageText}>{m.text}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div style={styles.messageBubbleContainer}>
                      <div style={styles.aiAvatar}>
                        <Bot size={14} color="#00f2fe" />
                      </div>
                      <div style={styles.loaderBubble}>
                        <Loader2 className="animate-spin" size={16} color="#00f2fe" />
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions Pills */}
                {messages.length <= 2 && !loading && (
                  <div style={styles.pillsContainer}>
                    {pills.map((pill, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(pill)}
                        style={styles.pill}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Chat Footer Input */}
          {isLoggedIn && (
            <div style={styles.footer}>
              <input
                type="text"
                className="glass-input"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                style={{ paddingRight: '40px', fontSize: '0.85rem', padding: '10px 14px' }}
              />
              <button
                onClick={() => handleSend(input)}
                style={styles.sendBtn}
                disabled={loading || !input.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  floatingBtn: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: '1px solid',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
  },
  chatWindow: {
    position: 'fixed',
    bottom: '90px',
    right: '24px',
    width: '380px',
    height: '520px',
    zIndex: 9998,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
    animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(20,24,33,0.3)',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: '0.7rem',
    color: '#64748b',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '2px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
  },
  body: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'hidden',
    justifyContent: 'space-between',
  },
  anonymousBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100%',
    padding: '24px',
  },
  messageScroll: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingRight: '4px',
  },
  messageBubbleContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    width: '100%',
  },
  aiAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(0,242,254,0.1)',
    border: '1px solid rgba(0,242,254,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '4px',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '0.85rem',
    lineHeight: '1.4',
  },
  messageText: {
    color: '#f8fafc',
    whiteSpace: 'pre-line',
  },
  loaderBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.02)',
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  pillsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  pill: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    color: '#94a3b8',
    padding: '8px 12px',
    textAlign: 'left',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Inter', sans-serif",
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  sendBtn: {
    position: 'absolute',
    right: '26px',
    background: 'none',
    border: 'none',
    color: '#00f2fe',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
