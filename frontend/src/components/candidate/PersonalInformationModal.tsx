import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Calendar, Globe, Shield, Save } from 'lucide-react';
import { apiRequest } from '../../api';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface PersonalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  initialUserEmail?: string;
  initialFullName?: string;
  onSaved?: (info: PersonalInfo) => void;
}

export const PersonalInformationModal: React.FC<PersonalInformationModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialUserEmail = '',
  initialFullName = '',
  onSaved
}) => {
  const [formData, setFormData] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    email: initialUserEmail,
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load existing personal info from backend API (with localStorage fallback)
  useEffect(() => {
    if (!isOpen) return;

    const fetchBackendProfile = async () => {
      setLoading(true);
      setErrorMsg('');
      const { data, error } = await apiRequest<any>('/auth/profile');
      setLoading(false);

      if (!error && data) {
        const p = data;
        const loaded: PersonalInfo = {
          firstName: p.firstName || extractFirstName(initialFullName),
          lastName: p.lastName || extractLastName(initialFullName),
          gender: p.gender || '',
          dateOfBirth: p.dateOfBirth || '',
          email: p.email || initialUserEmail,
          phone: p.phoneNumber || p.phone || '',
          address: p.address || '',
          city: p.city || '',
          country: p.country || ''
        };
        setFormData(loaded);
        const storageKey = `candidate_personal_info_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(loaded));
      } else {
        const storageKey = `candidate_personal_info_${userId}`;
        const savedJson = localStorage.getItem(storageKey);
        if (savedJson) {
          try {
            setFormData(JSON.parse(savedJson));
          } catch {
            setDefaultFromUser();
          }
        } else {
          setDefaultFromUser();
        }
      }
    };

    fetchBackendProfile();
  }, [isOpen, userId, initialFullName, initialUserEmail]);

  const extractFirstName = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts[0] || '';
  };

  const extractLastName = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    return parts.slice(1).join(' ') || '';
  };

  const setDefaultFromUser = () => {
    setFormData({
      firstName: extractFirstName(initialFullName),
      lastName: extractLastName(initialFullName),
      gender: '',
      dateOfBirth: '',
      email: initialUserEmail,
      phone: '',
      address: '',
      city: '',
      country: ''
    });
  };

  // Keyboard accessibility (ESC key to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      phone: formData.phone,
      phoneNumber: formData.phone,
      address: formData.address,
      city: formData.city,
      country: formData.country
    };

    const { data, error } = await apiRequest<any>('/auth/profile/personal-info', 'PUT', payload);
    setSaving(false);

    if (error) {
      setErrorMsg('Unable to save your personal information. Please try again.');
      return;
    }

    // Backend is source of truth, sync localStorage fallback cache
    const storageKey = `candidate_personal_info_${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));
    
    // Dispatch custom event so Dashboard and NavBar update instantly
    window.dispatchEvent(new CustomEvent('personal-info-updated', { detail: formData }));
    
    setSuccessMsg('Personal information updated successfully!');
    if (onSaved) onSaved(formData);

    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 600);
  };

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="personal-info-title">
      <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h2 id="personal-info-title" style={styles.title}>Personal Information</h2>
            <p style={styles.subtitle}>Keep your personal details up to date.</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {successMsg && (
          <div style={styles.successBanner}>
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 24px', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid #FCA5A5' }}>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* SECTION 1: BASIC INFORMATION */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <User size={16} color="#2563EB" />
              <span style={styles.sectionTitle}>Basic Information</span>
            </div>

            <div style={styles.grid2Col}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Jeeva"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Ashok"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.grid2Col}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                <span style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                  Optional — provide this only if you are comfortable sharing it.
                </span>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  style={styles.input}
                />
                <span style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                  Optional — provide this only if you are comfortable sharing it.
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT INFORMATION */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <Phone size={16} color="#2563EB" />
              <span style={styles.sectionTitle}>Contact Information</span>
            </div>

            <div style={styles.grid2Col}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address (Account Registered)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  style={{ ...styles.input, background: '#F8FAFC', cursor: 'not-allowed', color: '#64748B' }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 9876543210"
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: LOCATION */}
          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <MapPin size={16} color="#2563EB" />
              <span style={styles.sectionTitle}>Location</span>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, apartment, or suite"
                style={styles.input}
              />
              <span style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                Optional — street address is kept strictly private.
              </span>
            </div>

            <div style={styles.grid2Col}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Chennai"
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select Country</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Germany">Germany</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={styles.modalFooter}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={styles.saveBtn} disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalCard: {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: '620px',
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#0F172A',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#64748B',
    margin: '4px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBanner: {
    background: '#DCFCE7',
    color: '#15803D',
    padding: '10px 24px',
    fontSize: '0.85rem',
    fontWeight: 600,
    borderBottom: '1px solid #BBF7D0',
  },
  form: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #F1F5F9',
  },
  sectionTitle: {
    fontSize: '0.92rem',
    fontWeight: 700,
    color: '#1E293B',
  },
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    height: '42px',
    padding: '0 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '0.9rem',
    color: '#0F172A',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
  },
  select: {
    height: '42px',
    padding: '0 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '0.9rem',
    color: '#0F172A',
    outline: 'none',
    background: '#FFFFFF',
    fontFamily: "'Inter', sans-serif",
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #E2E8F0',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#334155',
    fontWeight: 600,
    fontSize: '0.88rem',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 24px',
    height: '42px',
    fontSize: '0.88rem',
  }
};
