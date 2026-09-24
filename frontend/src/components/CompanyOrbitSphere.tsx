import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

interface Brand {
  name: string;
  rating: number;
  jobs: string;
  logoColor: string;
}

interface CompanyOrbitSphereProps {
  brands: Brand[];
}

export const CompanyOrbitSphere: React.FC<CompanyOrbitSphereProps> = ({ brands }) => {
  const [hoveredBrand, setHoveredBrand] = useState<Brand | null>(null);

  // Duplicate list for seamless infinite endless marquee
  const carouselItems = [...brands, ...brands, ...brands];

  return (
    <div style={styles.outerWrapper}>
      {/* TRANSPARENT FULL-WIDTH CONTINUOUS 360 ROTATION TRACK */}
      <div style={styles.carouselViewport}>
        {/* Soft Fade Edges Matching Home Page Default Light Background */}
        <div style={styles.fadeLeft} />
        <div style={styles.fadeRight} />

        <div className="infinite-earth-marquee-track" style={styles.track}>
          {carouselItems.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="earth-logo-card"
              style={styles.logoCard}
              onMouseEnter={() => setHoveredBrand(brand)}
              onMouseLeave={() => setHoveredBrand(null)}
            >
              <div style={styles.cardHeaderRow}>
                <CompanyLogo name={brand.name} size={42} fallbackColor={brand.logoColor} />
                <div>
                  <h4 style={styles.brandName}>{brand.name}</h4>
                  <div style={styles.ratingRow}>
                    <Star size={12} color="#FBBF24" fill="#FBBF24" />
                    <span style={styles.ratingText}>{brand.rating}</span>
                  </div>
                </div>
              </div>

              <div style={styles.cardJobsText}>{brand.jobs}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTINUOUS 360 EARTH ROTATION KEYFRAMES */}
      <style>{`
        @keyframes earthRotation360 {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .infinite-earth-marquee-track {
          animation: earthRotation360 28s linear infinite;
        }

        .infinite-earth-marquee-track:hover {
          animation-play-state: paused !important;
        }

        .earth-logo-card {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
        }

        .earth-logo-card:hover {
          transform: translateY(-8px) scale(1.05) !important;
          border-color: #2563EB !important;
          box-shadow: 0 12px 28px rgba(37, 99, 235, 0.16) !important;
          background: #FFFFFF !important;
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  outerWrapper: {
    margin: '10px 0 36px 0',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'transparent'
  },
  carouselViewport: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    padding: '16px 0',
    background: 'transparent'
  },
  fadeLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '120px',
    height: '100%',
    background: 'linear-gradient(to right, var(--bg-primary, #F8FAFC) 0%, transparent 100%)',
    zIndex: 10,
    pointerEvents: 'none'
  },
  fadeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '120px',
    height: '100%',
    background: 'linear-gradient(to left, var(--bg-primary, #F8FAFC) 0%, transparent 100%)',
    zIndex: 10,
    pointerEvents: 'none'
  },
  track: {
    display: 'flex',
    gap: '24px',
    width: 'max-content',
    willChange: 'transform'
  },
  logoCard: {
    width: '230px',
    padding: '18px 20px',
    borderRadius: '16px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexShrink: 0
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  brandName: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 800,
    color: '#0F172A'
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px'
  },
  ratingText: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#D97706'
  },
  cardJobsText: {
    fontSize: '0.82rem',
    color: '#2563EB',
    fontWeight: 700
  }
};
