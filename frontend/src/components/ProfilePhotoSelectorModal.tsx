import React, { useState } from 'react';
import { X, Upload, Check, Image as ImageIcon } from 'lucide-react';
import { t } from '../i18n';
import { useLanguage } from '../context/LanguageContext';

interface ProfilePhotoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto: string | null;
  onSelectPhoto: (photoUrl: string) => void;
}

const PRESET_AVATARS = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
  '/avatars/avatar5.png',
  '/avatars/avatar6.png',
];

export const ProfilePhotoSelectorModal: React.FC<ProfilePhotoSelectorModalProps> = ({
  isOpen,
  onClose,
  currentPhoto,
  onSelectPhoto
}) => {
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string>(currentPhoto || PRESET_AVATARS[0]);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg(t('validation.file_size'));
        return;
      }
      setCustomFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelected(url);
    }
  };

  const handleSave = () => {
    onSelectPhoto(selected);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '16px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('modals.choose_avatar')}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {t('modals.professional_avatars')}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {PRESET_AVATARS.map((avatar, idx) => (
              <div
                key={idx}
                onClick={() => { setSelected(avatar); setPreviewUrl(null); }}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: selected === avatar ? '2px solid #3b82f6' : '1px solid var(--glass-border)',
                  padding: '8px',
                  background: selected === avatar ? 'rgba(59,130,246,0.1)' : 'var(--glass-bg)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <img src={avatar} alt={`Avatar ${idx + 1}`} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                {selected === avatar && (
                  <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#3b82f6', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="#fff" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {t('modals.upload_photo')}
          </h4>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px',
            borderRadius: '10px',
            border: '2px dashed var(--glass-border)',
            cursor: 'pointer',
            background: 'var(--glass-bg)',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem'
          }}>
            <Upload size={18} />
            <span>{t('modals.browse_files')}</span>
            <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
            {t('modals.max_size')}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} className="btn-secondary">
            {t('common.cancel')}
          </button>
          <button onClick={handleSave} className="btn-primary">
            {t('modals.save_avatar')}
          </button>
        </div>
      </div>
    </div>
  );
};
