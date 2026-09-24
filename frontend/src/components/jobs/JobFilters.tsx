import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

interface JobFiltersProps {
  selectedType: string;
  setSelectedType: (val: string) => void;
  selectedDateLimit: string;
  setSelectedDateLimit: (val: string) => void;
  selectedSalaryLimit: string;
  setSelectedSalaryLimit: (val: string) => void;
  selectedExperience: string;
  setSelectedExperience: (val: string) => void;
  selectedDepartments: string[];
  setSelectedDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  selectedLocations: string[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<string[]>>;
  selectedWorkModes: string[];
  setSelectedWorkModes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTopCompanies: string[];
  setSelectedTopCompanies: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIndustries: string[];
  setSelectedIndustries: React.Dispatch<React.SetStateAction<string[]>>;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  selectedType,
  setSelectedType,
  selectedDateLimit,
  setSelectedDateLimit,
  selectedSalaryLimit,
  setSelectedSalaryLimit,
  selectedExperience,
  setSelectedExperience,
  selectedDepartments,
  setSelectedDepartments,
  selectedLocations,
  setSelectedLocations,
  selectedWorkModes,
  setSelectedWorkModes,
  selectedTopCompanies,
  setSelectedTopCompanies,
  selectedIndustries,
  setSelectedIndustries,
  onClearAll,
  hasActiveFilters
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const toggleItemInArray = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  return (
    <div 
      className="glass-panel" 
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#2563EB" />
          <span>Filter Opportunities</span>
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={14} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* 1. Job Type */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div 
          onClick={() => toggleSection('type')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>Employment Type</span>
          {collapsedSections['type'] ? <ChevronDown size={16} color="#64748B" /> : <ChevronUp size={16} color="#64748B" />}
        </div>
        {!collapsedSections['type'] && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'All Employment Types', value: 'All' },
              { label: 'Full Time', value: 'FullTime' },
              { label: 'Part Time', value: 'PartTime' },
              { label: 'Remote', value: 'Remote' },
              { label: 'Contract', value: 'Contract' }
            ].map(item => (
              <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="jobTypeRadio"
                  checked={selectedType === item.value}
                  onChange={() => setSelectedType(item.value)}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: '#F1F5F9' }} />

      {/* 2. Department / Category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div 
          onClick={() => toggleSection('dept')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>Department & Role</span>
          {collapsedSections['dept'] ? <ChevronDown size={16} color="#64748B" /> : <ChevronUp size={16} color="#64748B" />}
        </div>
        {!collapsedSections['dept'] && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              'Engineering - Software & QA',
              'Data Science & Analytics',
              'IT & Information Security',
              'Sales & Business Development'
            ].map(dept => {
              const checked = selectedDepartments.includes(dept);
              return (
                <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItemInArray(selectedDepartments, setSelectedDepartments, dept)}
                    style={{ accentColor: '#2563EB' }}
                  />
                  <span>{dept}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: '#F1F5F9' }} />

      {/* 3. Location */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div 
          onClick={() => toggleSection('location')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>Location Hubs</span>
          {collapsedSections['location'] ? <ChevronDown size={16} color="#64748B" /> : <ChevronUp size={16} color="#64748B" />}
        </div>
        {!collapsedSections['location'] && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Mumbai'].map(loc => {
              const checked = selectedLocations.includes(loc);
              return (
                <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItemInArray(selectedLocations, setSelectedLocations, loc)}
                    style={{ accentColor: '#2563EB' }}
                  />
                  <span>{loc}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: '#F1F5F9' }} />

      {/* 4. Work Mode */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div 
          onClick={() => toggleSection('mode')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>Work Mode</span>
          {collapsedSections['mode'] ? <ChevronDown size={16} color="#64748B" /> : <ChevronUp size={16} color="#64748B" />}
        </div>
        {!collapsedSections['mode'] && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Work from office', 'Hybrid', 'Remote'].map(mode => {
              const checked = selectedWorkModes.includes(mode);
              return (
                <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItemInArray(selectedWorkModes, setSelectedWorkModes, mode)}
                    style={{ accentColor: '#2563EB' }}
                  />
                  <span>{mode}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: '#F1F5F9' }} />

      {/* 5. Date Posted */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div 
          onClick={() => toggleSection('date')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>Date Posted</span>
          {collapsedSections['date'] ? <ChevronDown size={16} color="#64748B" /> : <ChevronUp size={16} color="#64748B" />}
        </div>
        {!collapsedSections['date'] && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Anytime', value: 'All' },
              { label: 'Last 24 Hours', value: '1' },
              { label: 'Last 3 Days', value: '3' },
              { label: 'Last 7 Days', value: '7' }
            ].map(item => (
              <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="dateLimitRadio"
                  checked={selectedDateLimit === item.value}
                  onChange={() => setSelectedDateLimit(item.value)}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: '#F1F5F9' }} />

      {/* 6. Salary Threshold */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div 
          onClick={() => toggleSection('salary')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
        >
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>Minimum Salary</span>
          {collapsedSections['salary'] ? <ChevronDown size={16} color="#64748B" /> : <ChevronUp size={16} color="#64748B" />}
        </div>
        {!collapsedSections['salary'] && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Any Salary', value: 'All' },
              { label: '₹3,00,000+ / yr', value: '300000' },
              { label: '₹5,00,000+ / yr', value: '500000' },
              { label: '₹10,00,000+ / yr', value: '1000000' },
              { label: '₹20,00,000+ / yr', value: '2000000' }
            ].map(item => (
              <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="salaryLimitRadio"
                  checked={selectedSalaryLimit === item.value}
                  onChange={() => setSelectedSalaryLimit(item.value)}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
