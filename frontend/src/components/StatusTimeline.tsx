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
              labelColor = '#f87171';
              icon = <X size={12} color="#0b0d19" />;
            } else {
              bubbleStyle = { ...bubbleStyle, ...styles.bubbleActive };
              labelColor = 'var(--accent-cyan)';
            }
          } else if (isCompleted) {
            bubbleStyle = { ...bubbleStyle, ...styles.bubbleCompleted };
            labelColor = '#a7f3d0';
            icon = <Check size={12} color="#0b0d19" />;
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
                      ? (isRejected && idx >= activeIndex - 1 ? 'rgba(239, 68, 68, 0.4)' : 'var(--accent-cyan)')
                      : 'rgba(255,255,255,0.06)'
                  }} 
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {isRejected && (
        <div style={styles.rejectionNotice}>
          <AlertCircle size={16} color="#f87171" />
          <span style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 600 }}>
            Application Status: Closed / Rejected
          </span>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 16px',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid var(--glass-border)',
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
    transition: 'all 0.3s ease',
  },
  bubbleCompleted: {
    backgroundColor: 'var(--accent-cyan)',
    boxShadow: '0 0 10px rgba(0, 242, 254, 0.3)',
    color: '#0b0d19',
  },
  bubbleActive: {
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    border: '2px solid var(--accent-cyan)',
    boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)',
    color: 'var(--accent-cyan)',
  },
  bubbleFuture: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-muted)',
  },
  bubbleRejected: {
    backgroundColor: '#f87171',
    boxShadow: '0 0 10px rgba(248, 113, 113, 0.3)',
    color: '#0b0d19',
  },
  connector: {
    flex: 1,
    height: '2px',
    minWidth: '20px',
    marginTop: '-24px', // Align with bubbles middle
    transition: 'all 0.3s ease',
  },
  label: {
    fontSize: '0.72rem',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  rejectionNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    padding: '8px 12px',
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    borderRadius: '8px',
    justifyContent: 'center',
  }
};
