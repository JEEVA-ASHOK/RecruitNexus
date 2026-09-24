import React from 'react';
import { Search, MapPin, Briefcase, X } from 'lucide-react';
import { CompanyLogo } from '../CompanyLogo';

interface JobSearchBarProps {
  searchWhat: string;
  setSearchWhat: (val: string) => void;
  searchWhere: string;
  setSearchWhere: (val: string) => void;
  selectedExperience: string;
  setSelectedExperience: (val: string) => void;
  onSearch: () => void;
  onClear: () => void;
  quickCategories?: { label: string; action: () => void }[];
  featuredBrands?: { name: string; rating: number; logoColor: string }[];
  onSelectBrand?: (brandName: string) => void;
}

export const JobSearchBar: React.FC<JobSearchBarProps> = ({
  searchWhat,
  setSearchWhat,
  searchWhere,
  setSearchWhere,
  selectedExperience,
  setSelectedExperience,
  onSearch,
  onClear,
  quickCategories = [],
  featuredBrands = [],
  onSelectBrand
}) => {
  const hasInput = searchWhat || searchWhere || selectedExperience !== 'All';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Main Search Input Bar */}
      <div 
        className="glass-panel"
        style={{
          padding: '12px 16px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          background: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Field 1: Title / Skills / Company */}
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Job Title, Skills, or Company
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <Search size={18} color="#2563EB" />
            <input
              type="text"
              placeholder="e.g. React, Developer, Google"
              value={searchWhat}
              onChange={(e) => setSearchWhat(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.92rem',
                fontWeight: 500,
                color: '#0F172A'
              }}
              aria-label="Search job title or skills"
            />
            {searchWhat && (
              <button 
                onClick={() => setSearchWhat('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex' }}
                aria-label="Clear job title search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '40px', background: '#E2E8F0', display: 'none' }} className="search-divider" />

        {/* Field 2: Location */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Location
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <MapPin size={18} color="#2563EB" />
            <input
              type="text"
              placeholder="City, region, or Remote"
              value={searchWhere}
              onChange={(e) => setSearchWhere(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.92rem',
                fontWeight: 500,
                color: '#0F172A'
              }}
              aria-label="Search location"
            />
            {searchWhere && (
              <button 
                onClick={() => setSearchWhere('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex' }}
                aria-label="Clear location search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Field 3: Experience */}
        <div style={{ flex: '0 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Experience Level
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <Briefcase size={18} color="#2563EB" />
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#0F172A',
                cursor: 'pointer'
              }}
              aria-label="Select experience level"
            >
              <option value="All">Any Experience</option>
              <option value="0">Fresher (0 yrs)</option>
              <option value="1">1 year</option>
              <option value="2">2 years</option>
              <option value="3">3 years</option>
              <option value="5">5+ years</option>
              <option value="8">8+ years</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginTop: '16px' }}>
          <button
            type="button"
            onClick={onSearch}
            className="btn-primary"
            style={{
              padding: '10px 24px',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '10px',
              height: '42px'
            }}
          >
            <Search size={16} />
            <span>Search</span>
          </button>

          {hasInput && (
            <button
              type="button"
              onClick={onClear}
              className="btn-secondary"
              style={{
                padding: '10px 16px',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '10px',
                height: '42px'
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Quick Category Chips */}
      {quickCategories.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Popular Searches:
          </span>
          {quickCategories.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={cat.action}
              style={{
                background: '#EFF6FF',
                color: '#2563EB',
                border: '1px solid #BFDBFE',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Featured Partner Brands */}
      {featuredBrands.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>Top Employers:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {featuredBrands.map((brand, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectBrand && onSelectBrand(brand.name)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#0F172A',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>
                  <CompanyLogo name={brand.name} size={20} style={{ padding: '2px' }} />
                </span>
                <span>{brand.name}</span>
                <span style={{ color: '#EAB308', fontSize: '0.75rem', fontWeight: 700 }}>★ {brand.rating}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
