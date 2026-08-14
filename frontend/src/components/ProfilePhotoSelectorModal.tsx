import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, RotateCw, ZoomIn, ZoomOut, RefreshCw, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { t } from '../i18n';
import { apiRequest } from '../api';

interface ProfilePhotoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto: string | null;
  onSelectPhoto: (photoUrl: string) => void;
}

interface FilterOption {
  id: string;
  name: string;
  cssFilter: string;
}

const FILTERS: FilterOption[] = [
  { id: 'original', name: 'Original', cssFilter: 'none' },
  { id: 'grayscale', name: 'Grayscale', cssFilter: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', cssFilter: 'sepia(80%)' },
  { id: 'bright', name: 'Bright', cssFilter: 'brightness(125%)' },
  { id: 'contrast', name: 'Contrast', cssFilter: 'contrast(140%)' },
  { id: 'warm', name: 'Warm', cssFilter: 'sepia(30%) saturate(140%) brightness(105%)' },
  { id: 'cool', name: 'Cool', cssFilter: 'hue-rotate(180deg) saturate(120%)' },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(50%) contrast(120%) brightness(90%)' },
  { id: 'sharpen', name: 'Sharpen', cssFilter: 'contrast(150%) brightness(105%)' },
  { id: 'soft', name: 'Soft', cssFilter: 'brightness(110%) blur(1px)' },
];

export const ProfilePhotoSelectorModal: React.FC<ProfilePhotoSelectorModalProps> = ({
  isOpen,
  onClose,
  currentPhoto,
  onSelectPhoto
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(currentPhoto || null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedFilter, setSelectedFilter] = useState<string>('original');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (!validTypes.includes(file.type.toLowerCase())) {
        setErrorMsg('Invalid file type. Only JPG, JPEG, PNG, and WEBP formats are allowed.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be 5 MB or less.');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      handleReset();
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
    setSelectedFilter('original');
    setErrorMsg(null);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Render Processed 1:1 Canvas Image
  const generateProcessedBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!imageSrc) {
        reject('No image source');
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const outputSize = 400; // 1:1 High Quality Avatar Resolution
        canvas.width = outputSize;
        canvas.height = outputSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Canvas context unavailable');
          return;
        }

        // Apply CSS Filter
        const filterObj = FILTERS.find((f) => f.id === selectedFilter);
        if (filterObj && filterObj.cssFilter !== 'none') {
          ctx.filter = filterObj.cssFilter;
        }

        ctx.save();
        // Move to center for rotation and scaling
        ctx.translate(outputSize / 2, outputSize / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Calculate aspect ratio fit
        const scale = Math.max(outputSize / img.width, outputSize / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;

        ctx.drawImage(
          img,
          -drawW / 2 + panOffset.x / zoom,
          -drawH / 2 + panOffset.y / zoom,
          drawW,
          drawH
        );

        ctx.restore();

        const base64Data = canvas.toDataURL('image/jpeg', 0.92);
        resolve(base64Data);
      };

      img.onerror = () => reject('Failed to load image');
      img.src = imageSrc;
    });
  };

  const handleSave = async () => {
    if (!imageSrc) {
      setErrorMsg('Please choose an image to upload.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const userId = user?.id || user?.userId;

    if (!userId) {
      setErrorMsg('Authentication error. Please log in again.');
      setIsSaving(false);
      return;
    }

    try {
      // 1. Process 1:1 Canvas Output
      const processedBase64 = await generateProcessedBase64();

      // 2. Validate via Backend API if file selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const { error } = await apiRequest('/auth/profile/photo', 'POST', formData, true);
        if (error) {
          setErrorMsg(error || 'Image size must be 5 MB or less.');
          setIsSaving(false);
          return;
        }
      }

      // 3. Store per-user isolated base64 photo
      const storageKey = `profilePhoto_${userId}`;
      localStorage.removeItem('candidatePhoto');
      localStorage.removeItem('profilePhoto');
      localStorage.removeItem('avatar');
      localStorage.setItem(storageKey, processedBase64);

      // 4. Notify components
      window.dispatchEvent(new Event('profile-photo-updated'));
      onSelectPhoto(processedBase64);

      setSuccessMsg('Profile photo updated successfully!');
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 600);

    } catch (err: any) {
      setErrorMsg(typeof err === 'string' ? err : 'Failed to process and save profile photo.');
      setIsSaving(false);
    }
  };

  const activeFilter = FILTERS.find((f) => f.id === selectedFilter)?.cssFilter || 'none';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px',
        borderRadius: '20px',
        position: 'relative',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)'
      }}>
        
        {/* MODAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
              Edit Profile Photo
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
              Crop, adjust, apply filters, and preview your professional avatar (Max 5 MB)
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* MESSAGES */}
        {errorMsg && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1:1 SQUARE CROP VIEWPORT WITH DRAG / ZOOM / ROTATION */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          {imageSrc ? (
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                width: '260px',
                height: '260px',
                borderRadius: '50%', // Circular guide preview
                overflow: 'hidden',
                position: 'relative',
                background: '#F3F4F6',
                border: '3px solid #2563EB',
                cursor: isDragging ? 'grabbing' : 'grab',
                boxShadow: '0 8px 16px -2px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={imageSrc}
                alt="Crop Viewport"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  filter: activeFilter,
                  transition: isDragging ? 'none' : 'transform 0.1s ease',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              />
            </div>
          ) : (
            <div style={{
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: '#F8FAFC',
              border: '2px dashed #CBD5E1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: '#94A3B8'
            }}>
              <ImageIcon size={48} color="#94A3B8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No Image Selected</span>
            </div>
          )}

          {/* FILE BROWSER */}
          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#2563EB',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}>
            <Upload size={16} />
            <span>{imageSrc ? 'Choose Different Image' : 'Browse Image (Max 5 MB)'}</span>
            <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </div>

        {/* CROP & EDIT CONTROLS */}
        {imageSrc && (
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E5E7EB', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
              Adjustments & Controls
            </div>

            {/* ZOOM SLIDER & BUTTONS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <ZoomOut size={16} color="#6B7280" />
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: '#2563EB' }}
              />
              <ZoomIn size={16} color="#6B7280" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', width: '40px' }}>
                {zoom.toFixed(1)}x
              </span>
            </div>

            {/* ROTATE & RESET BUTTONS */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleRotate}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCw size={14} />
                <span>Rotate 90° ({rotation}°)</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} />
                <span>Reset All</span>
              </button>
            </div>
          </div>
        )}

        {/* 10 PHOTO FILTERS SELECTION THUMBNAILS */}
        {imageSrc && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
              Photo Filters (10 Options)
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px'
            }}>
              {FILTERS.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '10px',
                    padding: '4px',
                    background: selectedFilter === f.id ? '#EFF6FF' : '#FFFFFF',
                    border: selectedFilter === f.id ? '2px solid #2563EB' : '1px solid #E5E7EB',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '4px',
                    background: '#F3F4F6'
                  }}>
                    <img
                      src={imageSrc}
                      alt={f.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: f.cssFilter
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: selectedFilter === f.id ? 800 : 600, color: selectedFilter === f.id ? '#2563EB' : '#4B5563', display: 'block' }}>
                    {f.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL ACTION FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={!imageSrc || isSaving}
            style={{
              padding: '8px 24px',
              fontSize: '0.88rem',
              opacity: (!imageSrc || isSaving) ? 0.6 : 1,
              cursor: (!imageSrc || isSaving) ? 'not-allowed' : 'pointer'
            }}
          >
            {isSaving ? 'Processing & Saving...' : 'Save Photo'}
          </button>
        </div>

      </div>
    </div>
  );
};
