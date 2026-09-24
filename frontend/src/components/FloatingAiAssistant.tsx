import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Camera, X } from 'lucide-react';
import { AiChatbot } from './AiChatbot';
import { GoogleLensTranslator } from './GoogleLensTranslator';
import { SmileBotIcon } from './SmileBotIcon';

export const FloatingAiAssistant: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isLensOpen, setIsLensOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenChatbot = () => {
    setMenuOpen(false);
    setIsChatbotOpen(true);
  };

  const handleOpenLens = () => {
    setMenuOpen(false);
    setIsLensOpen(true);
  };

  return (
    <div ref={containerRef} style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      
      {/* COMPACT ACTION MENU CARD */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          bottom: '68px',
          right: '0',
          width: '250px',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.15s ease-out'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: '#F8FAFC',
            borderBottom: '1px solid #F1F5F9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SmileBotIcon size={20} color="#2563EB" bgFill="#DBEAFE" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827' }}>AI Assistant</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px', display: 'flex' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Menu Options */}
          <div style={{ padding: '6px' }}>
            {/* Option 1: AI Chatbot Assistant */}
            <button
              onClick={handleOpenChatbot}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 12px',
                background: 'none',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <div style={{ background: '#DBEAFE', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                <MessageSquare size={16} color="#2563EB" />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                💬 AI Chatbot Assistant
              </span>
            </button>

            {/* Option 2: Lens Translator */}
            <button
              onClick={handleOpenLens}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 12px',
                background: 'none',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s ease',
                marginTop: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <div style={{ background: '#DBEAFE', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                <Camera size={16} color="#2563EB" />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                📷 Lens Translator
              </span>
            </button>
          </div>
        </div>
      )}

      {/* SINGLE FLOATING AI ASSISTANT TRIGGER BUTTON (BOTTOM-RIGHT) */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        title="AI Assistant"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 25px -4px rgba(37, 99, 235, 0.45)',
          border: '2px solid #FFFFFF',
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          transition: 'transform 0.2s ease, boxShadow 0.2s ease'
        }}
      >
        <SmileBotIcon size={28} color="#FFFFFF" bgFill="transparent" />
      </button>

      {/* MODAL COMPONENTS (TRIGGER BUTTONS HIDDEN) */}
      <AiChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        showTrigger={false}
      />
      <GoogleLensTranslator
        isOpen={isLensOpen}
        onClose={() => setIsLensOpen(false)}
        showTrigger={false}
      />
    </div>
  );
};
