import React, { useState, useEffect } from 'react';
import API_BASE from '../../../config';

/**
 * Resolve an attachment to a displayable data URL.
 * If attachment has a direct data URL src, use it.
 * If attachment has an objectName, fetch from MinIO via backend.
 */
const resolveSrc = async (attachment) => {
  if (!attachment) return null;
  if (attachment.src && attachment.src.startsWith('data:')) return attachment.src;
  if (attachment.objectName) {
    try {
      const res = await fetch(`${API_BASE}/api/files/download?path=${encodeURIComponent(attachment.objectName)}`);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }
  return attachment.src || null;
};

const ReceiptPreviewModal = ({ previewImg, onClose }) => {
  const [resolvedSrc, setResolvedSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (previewImg) {
      setLoading(true);
      resolveSrc(previewImg).then((src) => {
        setResolvedSrc(src);
        setLoading(false);
      });
    } else {
      setResolvedSrc(null);
    }
  }, [previewImg]);

  if (!previewImg) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
        {loading ? (
          <div className="flex items-center justify-center w-64 h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resolvedSrc ? (
          <img src={resolvedSrc} alt="Receipt preview" className="max-w-full max-h-[85vh] object-contain" />
        ) : (
          <div className="flex items-center justify-center w-64 h-64 text-secondary font-body-md">
            Unable to load receipt
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptPreviewModal;
