import React, { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../api';
import { Send, X, Sparkles, LogIn, Loader2 } from 'lucide-react';
import { SmileBotIcon } from './SmileBotIcon';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface AiChatbotProps {
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

export const AiChatbot: React.FC<AiChatbotProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  showTrigger = true
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setInternalIsOpen(false);
    if (externalOnClose) externalOnClose();
  };

  const isLoggedIn = !!localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const userRole = user ? user.role : 'Candidate';

  // Quick Action Suggestions
  const candidatePills = [
    'What jobs do I match best?',
    'Give me resume improvement tips',
    'What key skills should I learn?',
  ];

  const recruiterPills = [
    'Draft DevOps Engineer job post',
    'Generate technical interview questions',
    'Summarize my active candidates',
  ];

  const pills = userRole === 'Recruiter' || userRole === 'Admin' ? recruiterPills : candidatePills;

  useEffect(() => {
    if (isLoggedIn && user && messages.length === 0) {
      setMessages([
        {
          sender: 'ai',
          text: `Hello ${user.fullName || 'there'}! I'm your RecruitNexus AI Copilot, configured for your **${user.role}** account.\n\nHow can I help you accelerate your hiring or job search today?`,
        },
      ]);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Helper to safely render formatted markdown bold text (**text**)
  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null;
    
    // Split text by lines
    const lines = rawText.split('\n');
    
    return lines.map((line, lineIdx) => {
      // Process **bold** formatting within each line
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ fontWeight: 700, color: 'inherit' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <span key={lineIdx} style={{ display: 'block', marginBottom: lineIdx < lines.length - 1 ? '4px' : '0' }}>
          {renderedParts}
        </span>
      );
    });
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: textToSend } as ChatMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const history = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const { data, error } = await apiRequest('/ai/chat', 'POST', {
        message: textToSend,
        history: history,
      });

      setLoading(false);

      if (error) {
        setMessages((prev) => [
          ...prev,
          { 
            sender: 'ai', 
            text: `I'm having a brief connection hitch: ${error}. Here is a quick tip: check out your Dashboard for real-time recommendations!` 
          },
        ]);
      } else if (data && data.reply) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Thank you for reaching out! You can explore open positions or view your applications directly from the top navigation menu.' },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {showTrigger && (
        <button
          onClick={() => (externalIsOpen !== undefined ? handleClose() : setInternalIsOpen(!internalIsOpen))}
          style={{
            ...styles.floatingBtn,
            boxShadow: isOpen ? '0 0 25px rgba(37, 99, 235, 0.4)' : '0 8px 25px rgba(37, 99, 235, 0.35)',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            border: '2px solid #FFFFFF',
          }}
          title="RecruitNexus AI Assistant"
        >
          {isOpen ? (
            <X size={24} color="#FFFFFF" />
          ) : (
            <SmileBotIcon size={28} color="#FFFFFF" bgFill="transparent" />
          )}
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header */}
          <div style={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#DBEAFE', padding: '6px', borderRadius: '10px', display: 'flex' }}>
                <SmileBotIcon size={22} color="#2563EB" bgFill="#FFFFFF" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={styles.title}>NexusAI</h3>
                  <span style={styles.badge}>COPILOT</span>
                </div>
                <span style={styles.subtitle}>AI-Powered Recruitment Partner</span>
              </div>
            </div>
            <button style={styles.closeBtn} onClick={handleClose}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div style={styles.body}>
            {!isLoggedIn ? (
              <div style={styles.anonymousBox}>
                <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
                  <LogIn size={28} color="#2563EB" />
                </div>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Sign In Required</p>
                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.5', marginBottom: '20px' }}>
                  Please log in to your Candidate or Recruiter account to access live job recommendations and AI copilot support.
                </p>
                <a href="/login" style={styles.signInLink} onClick={handleClose}>
                  Sign In to Account
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
                          <SmileBotIcon size={16} color="#2563EB" bgFill="#FFFFFF" />
                        </div>
                      )}
                      <div
                        style={{
                          ...styles.bubble,
                          background: m.sender === 'user' ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : '#FFFFFF',
                          color: m.sender === 'user' ? '#FFFFFF' : '#0F172A',
                          borderColor: m.sender === 'user' ? '#1D4ED8' : '#E2E8F0',
                          boxShadow: m.sender === 'user' ? '0 3px 10px rgba(37, 99, 235, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                          borderBottomRightRadius: m.sender === 'user' ? '3px' : '16px',
                          borderBottomLeftRadius: m.sender === 'ai' ? '3px' : '16px',
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', lineHeight: '1.5', color: m.sender === 'user' ? '#FFFFFF' : '#0F172A' }}>
                          {renderFormattedText(m.text)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div style={styles.messageBubbleContainer}>
                      <div style={styles.aiAvatar}>
                        <SmileBotIcon size={16} color="#2563EB" bgFill="#FFFFFF" />
                      </div>
                      <div style={styles.loaderBubble}>
                        <Loader2 className="animate-spin" size={16} color="#2563EB" />
                        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#475569' }}>Analyzing request...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions Pills */}
                {messages.length <= 2 && !loading && (
                  <div style={styles.pillsContainer}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Suggested Actions:
                    </span>
                    {pills.map((pill, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(pill)}
                        style={styles.pill}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#DBEAFE';
                          e.currentTarget.style.borderColor = '#93C5FD';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#EFF6FF';
                          e.currentTarget.style.borderColor = '#BFDBFE';
                        }}
                      >
                        ✨ {pill}
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
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                style={styles.inputField}
              />
              <button
                onClick={() => handleSend(input)}
                style={{
                  ...styles.sendBtn,
                  background: input.trim() ? '#2563EB' : '#94A3B8',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                }}
                disabled={loading || !input.trim()}
              >
                <Send size={15} color="#FFFFFF" />
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
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  chatWindow: {
    position: 'fixed',
    bottom: '92px',
    right: '24px',
    width: '390px',
    height: '540px',
    zIndex: 9998,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.22), 0 8px 16px -8px rgba(0, 0, 0, 0.08)',
    animation: 'slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #F1F5F9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#FFFFFF',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: '#2563EB',
    background: '#EFF6FF',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #BFDBFE',
  },
  subtitle: {
    fontSize: '0.725rem',
    color: '#64748B',
    display: 'block',
    marginTop: '1px',
  },
  closeBtn: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    color: '#64748B',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    transition: 'all 0.15s ease',
  },
  body: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'hidden',
    justifyContent: 'space-between',
    background: '#F8FAFC',
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
  signInLink: {
    background: '#2563EB',
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '0.875rem',
    padding: '10px 20px',
    borderRadius: '10px',
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
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
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '82%',
    padding: '12px 16px',
    borderRadius: '16px',
    border: '1px solid',
  },
  loaderBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#FFFFFF',
    padding: '10px 14px',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  pillsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '12px',
  },
  pill: {
    background: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '10px',
    color: '#1E40AF',
    fontWeight: 600,
    padding: '9px 14px',
    textAlign: 'left',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  footer: {
    padding: '14px 16px',
    borderTop: '1px solid #E2E8F0',
    background: '#FFFFFF',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputField: {
    flex: 1,
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '10px 42px 10px 14px',
    fontSize: '0.875rem',
    color: '#0F172A',
    outline: 'none',
  },
  sendBtn: {
    position: 'absolute',
    right: '22px',
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease',
  },
};
