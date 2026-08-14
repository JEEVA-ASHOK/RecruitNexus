import React, { useEffect, useState } from 'react';
import { translateText } from '../api';

interface TranslateProps {
  text: string;
  style?: React.CSSProperties;
}

export const Translate: React.FC<TranslateProps> = ({ text, style }) => {
  const [translatedText, setTranslatedText] = useState(text);
  const [loading, setLoading] = useState(false);
  const targetLang = localStorage.getItem('portalLang') || 'English';

  useEffect(() => {
    let active = true;

    const performTranslation = async () => {
      if (targetLang === 'English' || !text) {
        setTranslatedText(text);
        return;
      }

      setLoading(true);
      const result = await translateText(text, targetLang);
      if (active) {
        setTranslatedText(result);
        setLoading(false);
      }
    };

    performTranslation();

    return () => {
      active = false;
    };
  }, [text, targetLang]);

  if (loading) {
    return (
      <span style={{ color: '#6B7280', fontSize: '0.85rem', fontStyle: 'italic', ...style }}>
        Translating to {targetLang}...
      </span>
    );
  }

  return (
    <span style={{ whiteSpace: 'pre-wrap', ...style }}>
      {translatedText}
    </span>
  );
};
export default Translate;
