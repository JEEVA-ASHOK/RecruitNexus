import React, { useState, useEffect, useRef } from 'react';
import { Bell, Briefcase, Calendar, CheckCircle2, MessageSquare, Info, X } from 'lucide-react';
import { apiRequest } from '../api';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  timestamp: Date;
  type: 'apply' | 'status' | 'interview' | 'chat';
  unread: boolean;
  interviewId?: number;
  confirmation?: string;
}

interface NotificationCenterProps {
  applications: any[];
  interviews: any[];
  isRecruiter: boolean;
  onActionComplete?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  applications = [],
  interviews = [],
  isRecruiter = false,
  onActionComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate notifications dynamically from existing data
  useEffect(() => {
    const list: NotificationItem[] = [];

    if (isRecruiter) {
      // Recruiter Notifications
      applications.forEach((app) => {
        list.push({
          id: `app-rec-${app.id}`,
          title: 'New Application Received',
          desc: `${app.candidateName || 'A candidate'} applied for your job posting: "${app.jobTitle || 'Job vacancy'}"`,
          timestamp: new Date(app.appliedAt),
          type: 'apply',
          unread: false // Seeded or fetched items read by default, can be toggled
        });

        if (app.status !== 'Applied') {
          list.push({
            id: `status-rec-${app.id}`,
            title: 'Application Status Updated',
            desc: `You updated ${app.candidateName || 'candidate'}'s application to: "${app.status}"`,
            timestamp: new Date(app.appliedAt), // Fallback, normally needs updated time
            type: 'status',
            unread: false
          });
        }
      });

      interviews.forEach((i) => {
        list.push({
          id: `int-rec-${i.id}`,
          title: 'Interview Scheduled',
          desc: `Upcoming interview with ${i.candidateName || 'candidate'} scheduled for: ${new Date(i.interviewDate).toLocaleString()}`,
          timestamp: new Date(i.interviewDate),
          type: 'interview',
          unread: false
        });
      });
    } else {
      // Candidate Notifications
      applications.forEach((app) => {
        list.push({
          id: `app-can-${app.id}`,
          title: 'Job Application Sent',
          desc: `You applied for: "${app.jobTitle || 'Job vacancy'}" at ${app.jobCompany || 'Company'}`,
          timestamp: new Date(app.appliedAt),
          type: 'apply',
          unread: false
        });

        if (app.status !== 'Applied') {
          list.push({
            id: `status-can-${app.id}`,
            title: 'Application Status Changed',
            desc: `Your application status for "${app.jobTitle}" was updated to: "${app.status}"`,
            timestamp: new Date(app.appliedAt), // Fallback
            type: 'status',
            unread: true // Unread by default for candidate visibility
          });
        }
      });

      interviews.forEach((i) => {
        list.push({
          id: `int-can-${i.id}`,
          title: 'Interview Scheduled',
          desc: `Interview scheduled for "${i.jobTitle || 'Job'}" on ${new Date(i.interviewDate).toLocaleString()} (HR: ${i.hrName || 'N/A'}, Format: ${i.format})`,
          timestamp: new Date(i.interviewDate),
          type: 'interview',
          unread: i.candidateConfirmation === 'Pending',
          interviewId: i.id,
          confirmation: i.candidateConfirmation
        });

        // Generate automatic reminders based on time remaining!
        const intTime = new Date(i.interviewDate).getTime();
        const nowTime = new Date().getTime();
        const diffHours = (intTime - nowTime) / (1000 * 60 * 60);
        const diffDays = diffHours / 24;

        if (i.status === 'Scheduled') {
          if (diffDays <= 5 && diffDays > 0) {
            list.push({
              id: `int-rem5-${i.id}`,
              title: '⏳ Interview Reminder (5 Days Before)',
              desc: `Your interview for "${i.jobTitle}" is in less than 5 days. Please confirm your attendance!`,
              timestamp: new Date(intTime - 5 * 24 * 60 * 60 * 1000), // 5 days before
              type: 'interview',
              unread: i.candidateConfirmation === 'Pending',
              interviewId: i.id,
              confirmation: i.candidateConfirmation
            });
          }
          if (diffDays <= 3 && diffDays > 0) {
            list.push({
              id: `int-rem3-${i.id}`,
              title: '⏳ Interview Reminder (3 Days Before)',
              desc: `Your interview for "${i.jobTitle}" is in less than 3 days. HR Contact: ${i.hrName || 'N/A'}.`,
              timestamp: new Date(intTime - 3 * 24 * 60 * 60 * 1000),
              type: 'interview',
              unread: i.candidateConfirmation === 'Pending',
              interviewId: i.id,
              confirmation: i.candidateConfirmation
            });
          }
          if (diffDays <= 1 && diffDays > 0) {
            list.push({
              id: `int-rem1-${i.id}`,
              title: '⏳ Interview Reminder (1 Day Before)',
              desc: `Your interview for "${i.jobTitle}" is tomorrow! Format: ${i.format}. Venue/Link: ${i.format === 'Online' ? i.meetingLink : i.venue || 'Office'}.`,
              timestamp: new Date(intTime - 1 * 24 * 60 * 60 * 1000),
              type: 'interview',
              unread: i.candidateConfirmation === 'Pending',
              interviewId: i.id,
              confirmation: i.candidateConfirmation
            });
          }
          if (diffHours <= 2 && diffHours > 0) {
            list.push({
              id: `int-rem2h-${i.id}`,
              title: '🚨 Urgent Interview Reminder (2 Hours Before)',
              desc: `Your interview for "${i.jobTitle}" starts in less than 2 hours! Prepare your documents and join or report on time.`,
              timestamp: new Date(intTime - 2 * 60 * 60 * 1000),
              type: 'interview',
              unread: true,
              interviewId: i.id,
              confirmation: i.candidateConfirmation
            });
          }
        }
      });
    }

    // Sort chronologically (latest first)
    list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Limit to latest 10 notifications
    setNotifications(list.slice(0, 10));
  }, [applications, interviews, isRecruiter]);

  // Click outside close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'apply':
        return <Briefcase size={16} color="var(--accent-cyan)" />;
      case 'status':
        return <CheckCircle2 size={16} color="#34d399" />;
      case 'interview':
        return <Calendar size={16} color="#8b5cf6" />;
      default:
        return <Info size={16} color="var(--text-secondary)" />;
    }
  };

  const handleConfirm = async (interviewId: number, status: string) => {
    const { error } = await apiRequest(`/interviews/${interviewId}/confirm`, 'PUT', { confirmation: status });
    if (!error) {
      if (onActionComplete) {
        onActionComplete();
      }
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Bell Trigger Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={styles.bellBtn}
        className="glass-panel"
      >
        <Bell size={18} color="var(--text-primary)" />
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={styles.dropdown} className="glass-panel">
          <div style={styles.header}>
            <span style={styles.headerTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={styles.markReadBtn}>
                Mark all read
              </button>
            )}
          </div>

          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  style={{
                    ...styles.item,
                    backgroundColor: n.unread ? 'rgba(0, 242, 254, 0.03)' : 'transparent',
                    borderLeft: n.unread ? '3px solid var(--accent-cyan)' : '3px solid transparent'
                  }}
                >
                  <div style={styles.itemHeader}>
                    <div style={styles.itemTitleGroup}>
                      {getIcon(n.type)}
                      <span style={{ ...styles.itemTitle, fontWeight: n.unread ? 700 : 500 }}>
                        {n.title}
                      </span>
                    </div>
                    <span style={styles.time}>
                      {n.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p style={styles.desc}>{n.desc}</p>
                  {n.type === 'interview' && n.confirmation === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', marginLeft: '24px' }}>
                      <button 
                        onClick={() => handleConfirm(n.interviewId!, 'Confirmed')} 
                        style={styles.actionBtnConfirm}
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleConfirm(n.interviewId!, 'CannotAttend')} 
                        style={styles.actionBtnDecline}
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => handleConfirm(n.interviewId!, 'RescheduleRequested')} 
                        style={styles.actionBtnReschedule}
                      >
                        Reschedule
                      </button>
                    </div>
                  )}
                  {n.type === 'interview' && n.confirmation && n.confirmation !== 'Pending' && (
                    <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '6px', marginLeft: '24px' }}>
                      ✓ Response: <strong>{n.confirmation}</strong>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  bellBtn: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    padding: '8px',
    cursor: 'pointer',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  badge: {
    position: 'absolute' as const,
    top: '-4px',
    right: '-4px',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontSize: '0.62rem',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '15px',
    height: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute' as const,
    top: '46px',
    right: '0',
    width: '320px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
    zIndex: 9999,
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #E5E7EB',
  },
  headerTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#111827',
  },
  markReadBtn: {
    background: 'transparent',
    border: 'none',
    color: '#2563EB',
    fontSize: '0.72rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  empty: {
    padding: '24px',
    textAlign: 'center' as const,
    color: '#6B7280',
    fontSize: '0.8rem',
  },
  item: {
    padding: '12px 16px',
    borderBottom: '1px solid #F1F5F9',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    transition: 'background-color 0.2s ease',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  itemTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  itemTitle: {
    fontSize: '0.78rem',
    color: '#111827',
    fontWeight: 600,
  },
  time: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  },
  desc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    margin: '0',
    paddingLeft: '24px',
  },
  actionBtnConfirm: {
    padding: '4px 10px',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  actionBtnDecline: {
    padding: '4px 10px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  actionBtnReschedule: {
    padding: '4px 10px',
    backgroundColor: '#8b5cf6',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
};
