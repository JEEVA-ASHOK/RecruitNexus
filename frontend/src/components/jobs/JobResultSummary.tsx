import React from 'react';
import { X, Briefcase, Filter } from 'lucide-react';

interface ActiveFilterTag {
  id: string;
  label: string;
  onRemove: () => void;
}

interface JobResultSummaryProps {
  totalResults: number;
  totalJobsCount: number;
  searchWhat: string;
  setSearchWhat: (val: string) => void;
  searchWhere: string;
  setSearchWhere: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  selectedExperience: string;
  setSelectedExperience: (val: string) => void;
  selectedSalaryLimit: string;
  setSelectedSalaryLimit: (val: string) => void;
  selectedDateLimit: string;
  setSelectedDateLimit: (val: string) => void;
  selectedDepartments: string[];
  setSelectedDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  selectedLocations: string[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<string[]>>;
  selectedWorkModes: string[];
  setSelectedWorkModes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTopCompanies: string[];
  setSelectedTopCompanies: React.Dispatch<React.SetStateAction<string[]>>;
  onClearAll: () => void;
}

export const JobResultSummary: React.FC<JobResultSummaryProps> = ({
  totalResults,
  totalJobsCount,
  searchWhat,
  setSearchWhat,
  searchWhere,
  setSearchWhere,
  selectedType,
  setSelectedType,
  selectedExperience,
  setSelectedExperience,
  selectedSalaryLimit,
  setSelectedSalaryLimit,
  selectedDateLimit,
  setSelectedDateLimit,
  selectedDepartments,
  setSelectedDepartments,
  selectedLocations,
  setSelectedLocations,
  selectedWorkModes,
  setSelectedWorkModes,
  selectedTopCompanies,
  setSelectedTopCompanies,
  onClearAll
}) => {
  const activeTags: ActiveFilterTag[] = [];

  if (searchWhat) {
    activeTags.push({
      id: 'searchWhat',
      label: `Keyword: "${searchWhat}"`,
      onRemove: () => setSearchWhat('')
    });
  }

  if (searchWhere) {
    activeTags.push({
      id: 'searchWhere',
      label: `Location: "${searchWhere}"`,
      onRemove: () => setSearchWhere('')
    });
  }

  if (selectedType !== 'All') {
    activeTags.push({
      id: 'selectedType',
      label: `Type: ${selectedType}`,
      onRemove: () => setSelectedType('All')
    });
  }

  if (selectedExperience !== 'All') {
    activeTags.push({
      id: 'selectedExperience',
      label: `Exp: ${selectedExperience} Yrs`,
      onRemove: () => setSelectedExperience('All')
    });
  }

  if (selectedSalaryLimit !== 'All') {
    const valLakhs = parseInt(selectedSalaryLimit, 10) / 100000;
    activeTags.push({
      id: 'selectedSalaryLimit',
      label: `Salary: ₹${valLakhs}L+`,
      onRemove: () => setSelectedSalaryLimit('All')
    });
  }

  if (selectedDateLimit !== 'All') {
    activeTags.push({
      id: 'selectedDateLimit',
      label: `Posted: ${selectedDateLimit}d ago`,
      onRemove: () => setSelectedDateLimit('All')
    });
  }

  selectedDepartments.forEach(dept => {
    activeTags.push({
      id: `dept_${dept}`,
      label: `Dept: ${dept}`,
      onRemove: () => setSelectedDepartments(prev => prev.filter(d => d !== dept))
    });
  });

  selectedLocations.forEach(loc => {
    activeTags.push({
      id: `loc_${loc}`,
      label: `Loc: ${loc}`,
      onRemove: () => setSelectedLocations(prev => prev.filter(l => l !== loc))
    });
  });

  selectedWorkModes.forEach(mode => {
    activeTags.push({
      id: `mode_${mode}`,
      label: `Mode: ${mode}`,
      onRemove: () => setSelectedWorkModes(prev => prev.filter(m => m !== mode))
    });
  });

  selectedTopCompanies.forEach(comp => {
    activeTags.push({
      id: `comp_${comp}`,
      label: `Company: ${comp}`,
      onRemove: () => setSelectedTopCompanies(prev => prev.filter(c => c !== comp))
    });
  });

  return (
    <div 
      className="glass-panel"
      style={{
        padding: '14px 18px',
        borderRadius: '14px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {/* Result Count Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={18} color="#2563EB" />
          <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>
            Showing {totalResults} {totalResults === 1 ? 'Job' : 'Jobs'}
          </span>
          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
            (out of {totalJobsCount} total open positions)
          </span>
        </div>

        {activeTags.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            style={{
              background: '#FEE2E2',
              color: '#991B1B',
              border: '1px solid #FCA5A5',
              padding: '4px 10px',
              borderRadius: '14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Clear All ({activeTags.length})
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12} />
            <span>Active Filters:</span>
          </span>
          {activeTags.map(tag => (
            <span
              key={tag.id}
              style={{
                background: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                padding: '3px 10px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{tag.label}</span>
              <button
                type="button"
                onClick={tag.onRemove}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#1D4ED8' }}
                aria-label={`Remove filter ${tag.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
