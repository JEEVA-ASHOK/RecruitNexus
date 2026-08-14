import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

interface InterviewItem {
  id: number;
  status: string;
  candidateConfirmation?: string;
  resultStatus?: string;
}

interface StatusTimelineProps {
  currentStatus: string;
  interviews?: InterviewItem[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus, interviews = [] }) => {
  const isResumeReviewed = currentStatus.toLowerCase() !== 'applied';
  const isShortlisted = ['shortlisted', 'interviewing', 'offered'].includes(currentStatus.toLowerCase()) || interviews.length > 0;
  const isInterviewScheduled = interviews.length > 0;
  const isInterviewConfirmed = interviews.some(i => i.candidateConfirmation === 'Confirmed');
  const isInterviewCompleted = interviews.some(i => i.status === 'Completed');
  const isSelected = currentStatus.toLowerCase() === 'offered';
  const isRejected = currentStatus.toLowerCase() === 'rejected';

  const steps = [
    { key: 'Applied', label: 'Applied', isMet: true },
    { key: 'Reviewed', label: 'Resume Reviewed', isMet: isResumeReviewed },
    { key: 'Shortlisted', label: 'Shortlisted', isMet: isShortlisted },
    { key: 'Scheduled', label: 'Interview Scheduled', isMet: isInterviewScheduled },
    { key: 'Confirmed', label: 'Interview Confirmed', isMet: isInterviewConfirmed },
    { key: 'Completed', label: 'Interview Completed', isMet: isInterviewCompleted },
    { key: 'Final', label: isRejected ? 'Rejected' : 'Selected', isMet: isSelected || isRejected }
  ];

  // Find index of the furthest met step
  let activeIndex = 0;
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].isMet) {
      activeIndex = i;
      break;
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.timelineRow}>
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          
          let bubbleStyle = { ...styles.bubble };
          let labelColor = 'var(--text-muted)';
          let icon = <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{idx + 1}</span>;

          if (isActive) {
            if (step.key === 'Final' && isRejected) {
              bubbleStyle = { ...bubbleStyle, ...styles.bubbleRejected };
              labelColor = '#DC2626';
              icon = <X size={12} color="#FFFFFF" />;
            } else {
              bubbleStyle = { ...bubbleStyle, ...styles.bubbleActive };
              labelColor = '#2563EB';
            }
          } else if (isCompleted) {
            bubbleStyle = { ...bubbleStyle, ...styles.bubbleCompleted };
            labelColor = '#16A34A';
            icon = <Check size={12} color="#FFFFFF" />;
          } else {
            bubbleStyle = { ...bubbleStyle, ...styles.bubbleFuture };
          }

          return (
            <React.Fragment key={step.key}>
              {/* Step bubble */}
              <div style={styles.stepWrapper}>
                <div style={bubbleStyle}>{icon}</div>
                <span style={{ ...styles.label, color: labelColor }}>{step.label}</span>
              </div>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div 
                  style={{
                    ...styles.connector,
                    background: isCompleted
                      ? (isRejected && idx >= activeIndex - 1 ? '#DC2626' : '#2563EB')
                      : '#E5E7EB'
                  }} 
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {isRejected && (
        <div style={styles.rejectionNotice}>
          <AlertCircle size={16} color="#DC2626" />
          <span style={{ color: '#DC2626', fontSize: '0.85rem', fontWeight: 600 }}>
            Application Status: Closed / Rejected
          </span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px 16px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    marginTop: '16px',
    marginBottom: '16px',
    width: '100%',
  },
  timelineRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    overflowX: 'auto' as const,
    gap: '8px',
    paddingBottom: '8px',
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    minWidth: '95px',
    textAlign: 'center' as const,
  },
  bubble: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  bubbleCompleted: {
    backgroundColor: '#16A34A',
    color: '#FFFFFF',
  },
  bubbleActive: {
    backgroundColor: '#EFF6FF',
    border: '2px solid #2563EB',
    color: '#2563EB',
  },
  bubbleFuture: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E5E7EB',
    color: '#6B7280',
  },
  bubbleRejected: {
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
  },
  connector: {
    flex: 1,
    height: '2px',
    minWidth: '20px',
    marginTop: '-24px',
    transition: 'all 0.2s ease',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  rejectionNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    padding: '8px 12px',
    background: '#FEF2F2',
    border: '1px solid #FCA5A5',
    borderRadius: '8px',
    justifyContent: 'center',
  }
};
