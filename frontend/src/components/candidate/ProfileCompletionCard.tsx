import React, { useState } from 'react';
import { Award, AlertTriangle, CheckCircle, ChevronRight, UserCheck, Layers, FileText, ArrowRight } from 'lucide-react';
import { ProfileSectionProgress, getProfileStatusMessage } from '../../utils/profileCompletion';

interface ProfileCompletionCardProps {
  percentage: number;
  missingFields: string[];
  statusMessage?: string;
  sections?: ProfileSectionProgress[];
  onOpenPersonalModal: () => void;
  onOpenProfessionalProfile?: () => void;
  onOpenResumeTab?: () => void;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  percentage,
  missingFields,
  statusMessage,
  sections = [],
  onOpenPersonalModal,
  onOpenProfessionalProfile,
  onOpenResumeTab
}) => {
  const [showSectionBreakdown, setShowSectionBreakdown] = useState(false);

  const getStatusColor = () => {
    if (percentage >= 100) return '#16A34A'; // Green
    if (percentage >= 85) return '#16A34A'; // Green
    if (percentage >= 60) return '#2563EB'; // Royal Blue
    if (percentage >= 40) return '#D97706'; // Orange
    return '#DC2626'; // Red
  };

  const statusColor = getStatusColor();
  const displayStatusMsg = statusMessage || getProfileStatusMessage(percentage);

  const getMissingItemAction = (item: string) => {
    const personalFields = ['First Name', 'Last Name', 'Gender', 'Date of Birth', 'Phone Number', 'Street Address', 'City', 'Country'];
    if (personalFields.includes(item)) {
      return {
        label: 'Complete Personal Info',
        action: onOpenPersonalModal
      };
    }
    if (item === 'Resume Upload') {
      return {
        label: 'Upload Resume',
        action: onOpenResumeTab || onOpenProfessionalProfile || onOpenPersonalModal
      };
    }
    return {
      label: 'Complete Profile',
      action: onOpenProfessionalProfile || onOpenPersonalModal
    };
  };

  return (
    <div style={styles.cardContainer}>
      {/* Top Header Row */}
      <div style={styles.cardHeader}>
        <div style={styles.headerLeft}>
          <div style={{ ...styles.iconBox, background: `${statusColor}15` }}>
            <Award size={20} color={statusColor} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={styles.cardTitle}>Profile Completion</h3>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: '12px' }}>
                {displayStatusMsg}
              </span>
            </div>
            <span style={styles.cardSub}>Complete details to increase AI match alignment & employer visibility</span>
          </div>
        </div>

        <div style={styles.scoreBadge}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: statusColor }}>{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressTrack}>
        <div 
          style={{ 
            ...styles.progressBar, 
            width: `${percentage}%`, 
            background: statusColor 
          }} 
        />
      </div>

      {/* Toggle Section Breakdown Button */}
      {sections.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
          <button
            type="button"
            onClick={() => setShowSectionBreakdown(!showSectionBreakdown)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#2563EB' }}
          >
            <Layers size={14} />
            <span>{showSectionBreakdown ? 'Hide Section Breakdown' : 'View Section Breakdown'}</span>
          </button>
        </div>
      )}

      {/* SECTION BREAKDOWN PROGRESS BARS */}
      {showSectionBreakdown && sections.length > 0 && (
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '2px' }}>
            Section Progress Breakdown
          </div>
          {sections.map((sec, idx) => {
            const secColor = sec.percentage === 100 ? '#16A34A' : sec.percentage >= 60 ? '#2563EB' : '#D97706';
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                  <span>{sec.name}</span>
                  <span style={{ color: secColor, fontWeight: 700 }}>{sec.percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${sec.percentage}%`, height: '100%', background: secColor, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 100% COMPLETE BANNER VS GUIDED MISSING ITEMS */}
      {missingFields.length === 0 ? (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CheckCircle size={22} color="#16A34A" />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#15803D' }}>🎉 Profile Complete (100%)</div>
            <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '2px', lineHeight: 1.4 }}>
              Your RecruitNexus profile is 100% complete and fully visible to top hiring managers and recruiters.
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.warningCard}>
          <div style={styles.warningHeader}>
            <AlertTriangle size={16} color="#D97706" />
            <span style={styles.warningTitle}>
              {missingFields.length} {missingFields.length === 1 ? 'thing' : 'things'} left to complete
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            {missingFields.slice(0, 4).map((field, idx) => {
              const act = getMissingItemAction(field);
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FFFFFF', border: '1px solid #FDE68A', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.83rem', fontWeight: 600, color: '#78350F' }}>
                    • Add {field}
                  </span>
                  <button
                    type="button"
                    onClick={act.action}
                    style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Complete now</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              );
            })}
            {missingFields.length > 4 && (
              <span style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 600, marginTop: '2px' }}>
                +{missingFields.length - 4} more items remaining
              </span>
            )}
          </div>
        </div>
      )}

      {/* Card Primary Action Buttons */}
      <div style={styles.actionRow}>
        <button 
          onClick={onOpenPersonalModal} 
          className="btn-primary" 
          style={{ ...styles.actionBtn, background: '#2563EB', borderColor: '#2563EB' }}
        >
          <UserCheck size={16} />
          <span>Edit Personal Info</span>
        </button>

        {onOpenProfessionalProfile && (
          <button 
            onClick={onOpenProfessionalProfile} 
            className="btn-secondary" 
            style={styles.secondaryActionBtn}
          >
            <span>Professional Profile</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  cardContainer: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: 0,
  },
  cardSub: {
    fontSize: '0.8rem',
    color: '#64748B',
  },
  scoreBadge: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '6px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    width: '100%',
    height: '10px',
    background: '#F1F5F9',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.4s ease-in-out',
  },
  warningCard: {
    background: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  warningHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  warningTitle: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#92400E',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionBtn: {
    height: '42px',
    padding: '0 20px',
    fontSize: '0.88rem',
    fontWeight: 600,
  },
  secondaryActionBtn: {
    height: '42px',
    padding: '0 16px',
    fontSize: '0.88rem',
    fontWeight: 600,
  }
};
