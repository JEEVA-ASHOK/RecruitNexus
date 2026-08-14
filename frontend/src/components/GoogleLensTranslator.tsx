import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { createWorker } from 'tesseract.js';
import { translateText } from '../api';
import { 
  Camera, X, Copy, Download, RefreshCw, AlertCircle, FileText, Check, Globe 
} from 'lucide-react';

interface GoogleLensTranslatorProps {
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

export const GoogleLensTranslator: React.FC<GoogleLensTranslatorProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  showTrigger = false
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');
  
  const [ocrText, setOcrText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('Tamil');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedOcr, setCopiedOcr] = useState(false);
  const [copiedTrans, setCopiedTrans] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const languages = [
    'Tamil', 'English', 'Hindi', 'Spanish', 'French', 'German', 'Telugu', 'Malayalam', 'Kannada'
  ];

  // Reset states
  const handleClose = () => {
    setInternalIsOpen(false);
    if (externalOnClose) externalOnClose();
    setImgSrc('');
    setOcrText('');
    setTranslatedText('');
    setCroppedImageUrl('');
    setCompletedCrop(null);
    setError(null);
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop({
        unit: '%',
        x: 10,
        y: 10,
        width: 80,
        height: 80
      });
      setCompletedCrop(null);
      setCroppedImageUrl('');
      setOcrText('');
      setTranslatedText('');
      setError(null);
      
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Generate cropped preview & perform OCR/Translation
  const handleProcessSelection = async () => {
    if (!imgRef.current || !completedCrop || !canvasRef.current) {
      setError('Please select/crop an area of the image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setOcrText('');
    setTranslatedText('');

    try {
      const image = imgRef.current;
      const canvas = canvasRef.current;
      const cropVal = completedCrop;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context available');
      }

      // Set canvas dimensions to the cropped selection scale
      canvas.width = cropVal.width * scaleX;
      canvas.height = cropVal.height * scaleY;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the cropped section onto the canvas
      ctx.drawImage(
        image,
        cropVal.x * scaleX,
        cropVal.y * scaleY,
        cropVal.width * scaleX,
        cropVal.height * scaleY,
        0,
        0,
        cropVal.width * scaleX,
        cropVal.height * scaleY
      );

      // Convert canvas to Data URL for visualization and OCR input
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCroppedImageUrl(dataUrl);

      // Initialize Tesseract Worker
      const worker = await createWorker('eng');
      
      const ret = await worker.recognize(dataUrl);
      const text = ret.data.text.trim();
      await worker.terminate();

      if (!text) {
        throw new Error('No text detected in the selected area. Please try a different selection.');
      }

      setOcrText(text);

      // Translate the extracted text using existing API
      const translation = await translateText(text, targetLang);
      setTranslatedText(translation);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'OCR processing failed. Please check the image resolution and crop boundaries.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, type: 'ocr' | 'trans') => {
    navigator.clipboard.writeText(text);
    if (type === 'ocr') {
      setCopiedOcr(true);
      setTimeout(() => setCopiedOcr(false), 2000);
    } else {
      setCopiedTrans(true);
      setTimeout(() => setCopiedTrans(false), 2000);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `--- GOOGLE LENS TRANSLATION REPORT ---\n\n`,
      `[EXTRACTED ORIGINAL TEXT]:\n${ocrText}\n\n`,
      `[TRANSLATED TEXT (${targetLang})]:\n${translatedText}\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `lens_translation_${targetLang.toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <>
      {/* Floating Action Trigger Button (Bottom-Left) */}
      {showTrigger && (
        <button 
          onClick={() => setInternalIsOpen(true)}
          style={styles.floatingTrigger}
          title="Google Lens Translator"
          className="btn-primary"
        >
          <Camera size={15} style={{ filter: 'drop-shadow(0 0 1.5px #fff)' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 'bold' }}>Lens Translator</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard} className="glass-panel">
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="#2563EB" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>Google Lens Translator</h2>
              </div>
              <button onClick={handleClose} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Split Screen */}
            <div style={styles.modalBody}>
              
              {/* Left Column: Image Selector & Crop Panel */}
              <div style={styles.leftColumn}>
                {!imgSrc ? (
                  <div style={styles.uploadDropZone}>
                    <Camera size={36} color="#6B7280" style={{ marginBottom: '12px' }} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={onSelectFile} 
                      style={styles.fileInput}
                      id="lens-image-picker"
                    />
                    <label htmlFor="lens-image-picker" style={styles.uploadLabel}>
                      Select Image to Scan
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '6px' }}>Supports JPG, PNG, WEBP</span>
                  </div>
                ) : (
                  <div style={styles.cropContainer}>
                    <div style={styles.cropWrapper}>
                      <ReactCrop
                        crop={crop}
                        onChange={setCrop}
                        onComplete={setCompletedCrop}
                      >
                        <img 
                          ref={imgRef}
                          src={imgSrc} 
                          alt="Source" 
                          style={{ maxWidth: '100%', maxHeight: '420px', display: 'block' }}
                        />
                      </ReactCrop>
                    </div>

                    <div style={styles.cropActions}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                        <Globe size={16} color="#6B7280" />
                        <select
                          value={targetLang}
                          onChange={(e) => setTargetLang(e.target.value)}
                          className="glass-input"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', width: '130px' }}
                        >
                          {languages.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>

                      <button 
                        onClick={handleProcessSelection} 
                        className="btn-primary" 
                        disabled={loading}
                        style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                      >
                        {loading ? <RefreshCw size={14} className="spin-animation" /> : 'Translate Crop'}
                      </button>
                      
                      <button 
                        onClick={() => setImgSrc('')} 
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: OCR & Translation Results */}
              <div style={styles.rightColumn}>
                
                {error && (
                  <div style={styles.errorAlert}>
                    <AlertCircle size={16} color="#ef4444" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Cropped Selection Preview */}
                <div style={styles.previewBox}>
                  <span style={styles.sectionLabel}>Selected Crop:</span>
                  <div style={styles.canvasContainer}>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {croppedImageUrl ? (
                      <img src={croppedImageUrl} alt="Cropped Preview" style={styles.croppedImage} />
                    ) : (
                      <div style={styles.placeholderBox}>
                        <FileText size={24} color="#334155" />
                        <span style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px' }}>Crop area to display preview</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Extracted Original Text */}
                <div style={styles.textBox}>
                  <div style={styles.textBoxHeader}>
                    <span style={styles.sectionLabel}>Extracted Text:</span>
                    {ocrText && (
                      <button onClick={() => handleCopy(ocrText, 'ocr')} style={styles.iconActionBtn}>
                        {copiedOcr ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                  <textarea
                    readOnly
                    value={ocrText}
                    placeholder="Extracted OCR text will display here..."
                    style={styles.textOutput}
                    rows={4}
                  />
                </div>

                {/* Translated Text */}
                <div style={styles.textBox}>
                  <div style={styles.textBoxHeader}>
                    <span style={styles.sectionLabel}>Translated Text ({targetLang}):</span>
                    {translatedText && (
                      <button onClick={() => handleCopy(translatedText, 'trans')} style={styles.iconActionBtn}>
                        {copiedTrans ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                  <textarea
                    readOnly
                    value={translatedText}
                    placeholder="Translated text will display here..."
                    style={styles.textOutput}
                    rows={4}
                  />
                </div>

                {/* Output Actions */}
                {translatedText && (
                  <div style={styles.outputActionsRow}>
                    <button onClick={handleDownload} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem' }}>
                      <Download size={15} /> Download Report
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  floatingTrigger: {
    position: 'fixed' as const,
    bottom: '24px',
    left: '24px',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '50px',
    boxShadow: '0 4px 20px rgba(0, 242, 254, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(5, 8, 16, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  modalCard: {
    width: '1000px',
    maxWidth: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px',
    overflowY: 'auto' as const,
    background: 'var(--glass-bg, rgba(10, 15, 29, 0.85))',
    border: '1px solid var(--glass-border)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--glass-border)',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  uploadDropZone: {
    border: '2px dashed var(--glass-border)',
    borderRadius: '12px',
    padding: '60px 20px',
    textAlign: 'center' as const,
    background: 'rgba(255, 255, 255, 0.01)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInput: {
    display: 'none',
  },
  uploadLabel: {
    background: 'var(--glass-bg-override, rgba(255, 255, 255, 0.05))',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    color: '#fff',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginTop: '8px',
  },
  cropContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  cropWrapper: {
    background: '#040711',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cropActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.01)',
    padding: '12px',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f87171',
    fontSize: '0.8rem',
  },
  previewBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  canvasContainer: {
    background: '#040711',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    height: '110px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '8px',
  },
  croppedImage: {
    maxHeight: '100%',
    maxWidth: '100%',
    objectFit: 'contain' as const,
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  placeholderBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase' as const,
  },
  textBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  textBoxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconActionBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '2px',
  },
  textOutput: {
    width: '100%',
    background: 'var(--glass-bg-override, rgba(10, 15, 29, 0.5))',
    border: '1px solid var(--glass-border)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#6B7280',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    outline: 'none',
    resize: 'none' as const,
  },
  outputActionsRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px',
  }
};
