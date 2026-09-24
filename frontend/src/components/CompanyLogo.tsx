import React, { useState } from 'react';
import { Building } from 'lucide-react';

interface CompanyLogoProps {
  name?: string;
  logoUrl?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  fallbackColor?: string;
}

const DOMAIN_MAP: Record<string, string> = {
  google: 'google.com',
  'google india': 'google.com',
  microsoft: 'microsoft.com',
  'microsoft india': 'microsoft.com',
  amazon: 'amazon.com',
  'amazon india': 'amazon.com',
  zoho: 'zoho.com',
  'zoho corporation': 'zoho.com',
  flipkart: 'flipkart.com',
  tcs: 'tcs.com',
  'tata consultancy services': 'tcs.com',
  wipro: 'wipro.com',
  infosys: 'infosys.com',
  cognizant: 'cognizant.com',
  'cognizant technologies': 'cognizant.com',
  hcltech: 'hcltech.com',
  hcl: 'hcltech.com',
  apple: 'apple.com',
  meta: 'meta.com',
  netflix: 'netflix.com',
  adobe: 'adobe.com',
  salesforce: 'salesforce.com',
  oracle: 'oracle.com',
  ibm: 'ibm.com'
};

const COLOR_MAP: Record<string, string> = {
  google: '#4285F4',
  microsoft: '#F25022',
  amazon: '#FF9900',
  zoho: '#00A859',
  flipkart: '#2874F0',
  tcs: '#1B365D',
  wipro: '#8B5CF6',
  infosys: '#007CC3',
  cognizant: '#0033A0',
  hcltech: '#005FA9'
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  name = '',
  logoUrl,
  size = 40,
  className = '',
  style = {},
  fallbackColor
}) => {
  const [imageError, setImageError] = useState(false);
  const normalizedName = name.trim().toLowerCase();

  // Find domain if available
  let domain = '';
  for (const [key, val] of Object.entries(DOMAIN_MAP)) {
    if (normalizedName.includes(key)) {
      domain = val;
      break;
    }
  }

  const primaryLogoSrc = logoUrl && logoUrl.trim().length > 0 
    ? logoUrl 
    : (domain ? `https://logo.clearbit.com/${domain}` : '');

  const secondaryLogoSrc = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';

  const [useSecondary, setUseSecondary] = useState(false);

  const handlePrimaryError = () => {
    if (secondaryLogoSrc && !useSecondary) {
      setUseSecondary(true);
    } else {
      setImageError(true);
    }
  };

  const currentImgSrc = useSecondary ? secondaryLogoSrc : primaryLogoSrc;
  const brandColor = fallbackColor || COLOR_MAP[normalizedName] || '#2563EB';

  // Render high-res SVG vectors for top tier brands if images fail or offline
  const renderFallbackSvg = () => {
    if (normalizedName.includes('google')) {
      return (
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
      );
    }
    if (normalizedName.includes('microsoft')) {
      return (
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 23 23">
          <path fill="#F35325" d="M1 1h10v10H1z"/>
          <path fill="#81BC06" d="M12 1h10v10H12z"/>
          <path fill="#05A6F0" d="M1 12h10v10H1z"/>
          <path fill="#FFBA08" d="M12 12h10v10H12z"/>
        </svg>
      );
    }
    if (normalizedName.includes('zoho')) {
      return (
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 100 100">
          <rect x="5" y="15" width="40" height="40" rx="8" fill="#E42528"/>
          <rect x="55" y="15" width="40" height="40" rx="8" fill="#249646"/>
          <rect x="5" y="55" width="40" height="40" rx="8" fill="#1B75BC"/>
          <rect x="55" y="55" width="40" height="40" rx="8" fill="#F4A21D"/>
          <text x="25" y="44" fill="#FFF" fontSize="26" fontWeight="bold" textAnchor="middle">Z</text>
          <text x="75" y="44" fill="#FFF" fontSize="26" fontWeight="bold" textAnchor="middle">O</text>
          <text x="25" y="84" fill="#FFF" fontSize="26" fontWeight="bold" textAnchor="middle">H</text>
          <text x="75" y="84" fill="#FFF" fontSize="26" fontWeight="bold" textAnchor="middle">O</text>
        </svg>
      );
    }
    if (normalizedName.includes('flipkart')) {
      return (
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 100 100">
          <rect width="100" height="100" rx="20" fill="#2874F0"/>
          <path d="M30 25h40v50H30z" fill="#FFE11B" opacity="0.9"/>
          <text x="50" y="65" fill="#2874F0" fontSize="45" fontWeight="900" textAnchor="middle">f</text>
        </svg>
      );
    }

    const initial = name ? name.charAt(0).toUpperCase() : 'C';
    return (
      <span style={{ fontSize: `${Math.max(12, size * 0.45)}px`, fontWeight: 800, color: brandColor }}>
        {initial}
      </span>
    );
  };

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: size > 48 ? '14px' : '10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    padding: '4px',
    ...style
  };

  if (currentImgSrc && !imageError) {
    return (
      <div style={containerStyle} className={`company-logo-badge ${className}`}>
        <img
          src={currentImgSrc}
          alt={`${name} logo`}
          onError={handlePrimaryError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '4px'
          }}
        />
      </div>
    );
  }

  return (
    <div 
      style={{
        ...containerStyle,
        backgroundColor: `${brandColor}0D`,
        borderColor: `${brandColor}30`
      }} 
      className={`company-logo-badge ${className}`}
    >
      {renderFallbackSvg()}
    </div>
  );
};
