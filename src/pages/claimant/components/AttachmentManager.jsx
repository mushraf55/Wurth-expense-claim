import React, { useRef, useState } from 'react';
import heic2any from 'heic2any';
import ProcessingOverlay from './ProcessingOverlay';
import AttachmentConfirmModal from './AttachmentConfirmModal';

const AttachmentManager = ({ attachments, onAttachmentsChange, onNotify }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [pendingQueue, setPendingQueue] = useState([]);
  const [pendingIndex, setPendingIndex] = useState(0);
  const currentPending = pendingQueue[pendingIndex] || null;

  const isHeicFile = (file) => { const n = file.name.toLowerCase(); return n.endsWith('.heic') || n.endsWith('.heif'); };

  const convertHeicToJpeg = async (file) => {
    const r = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
    return Array.isArray(r) ? r[0] : r;
  };

  const compressImage = (dataUrl, maxDim = 2000, quality = 0.8) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = (height / width) * maxDim; width = maxDim; }
        else { width = (width / height) * maxDim; height = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;
    const validFiles = [];
    const maxSize = 10 * 1024 * 1024;
    for (const file of files) {
      const isImage = file.type.startsWith('image/') || isHeicFile(file);
      const isPdf = file.type === 'application/pdf';
      if (file.size > maxSize) { onNotify(`"${file.name}" exceeds the 10 MB limit.`, 'error'); continue; }
      if (!isImage && !isPdf) { onNotify(`"${file.name}" is not a supported file type.`, 'error'); continue; }
      validFiles.push(file);
    }
    if (validFiles.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: validFiles.length });
    const processedFiles = [];
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const isImage = file.type.startsWith('image/') || isHeicFile(file);
      const isHeic = isHeicFile(file);
      setProcessingProgress({ current: i + 1, total: validFiles.length });
      let finalSrc, displayName = file.name;

      if (isHeic) {
        try {
          const jpegBlob = await convertHeicToJpeg(file);
          const dataUrl = await new Promise((resolve) => { const r = new FileReader(); r.onload = (e) => resolve(e.target.result); r.readAsDataURL(jpegBlob); });
          finalSrc = await compressImage(dataUrl);
          displayName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
        } catch (err) { console.error('HEIC conversion failed:', err); onNotify(`Could not convert "${file.name}". Try a JPEG version instead.`, 'error'); continue; }
      } else if (isImage) {
        const dataUrl = await new Promise((resolve) => { const r = new FileReader(); r.onload = (e) => resolve(e.target.result); r.readAsDataURL(file); });
        finalSrc = await compressImage(dataUrl);
      } else {
        const dataUrl = await new Promise((resolve) => { const r = new FileReader(); r.onload = (e) => resolve(e.target.result); r.readAsDataURL(file); });
        finalSrc = dataUrl;
      }
      processedFiles.push({ id: `attach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: displayName, size: `${(file.size / 1024).toFixed(0)} KB`, time: 'Uploaded just now', src: finalSrc, type: file.type === 'application/pdf' ? 'pdf' : 'image' });
    }
    setIsProcessing(false);
    if (processedFiles.length > 0) { setPendingQueue(processedFiles); setPendingIndex(0); }
  };

  const confirmPending = () => { const c = pendingQueue[pendingIndex]; if (c) onAttachmentsChange(prev => [...prev, c]); advanceQueue(); };
  const discardPending = () => advanceQueue();
  const advanceQueue = () => { const n = pendingIndex + 1; if (n < pendingQueue.length) { setPendingIndex(n); } else { setPendingQueue([]); setPendingIndex(0); } };

  const handleFileUpload = async (e) => { await processFiles(e.target.files); e.target.value = ''; };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); };
  const handleDrop = async (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); const f = e.dataTransfer?.files; if (f && f.length > 0) await processFiles(f); };
  const removeAttachment = (id) => onAttachmentsChange(prev => prev.filter(a => a.id !== id));

  return (
    <div className="col-span-12 space-y-2">
      <label className="block font-label-md text-label-md text-on-surface-variant font-semibold">Attachments</label>
      <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif,application/pdf"  multiple onChange={handleFileUpload} className="hidden" />
      <div className={`border-2 border-dashed p-6 flex flex-col sm:flex-row items-center gap-6 rounded-lg transition-all bg-surface-bright ${isDragging ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]' : 'border-outline-variant'}`}
        onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        {attachments.length > 0 ? attachments.map((file) => (
          <React.Fragment key={file.id}>
            <div className="w-24 h-24 relative group overflow-hidden rounded border border-outline-variant shrink-0">
              {file.type === 'pdf' ? (
                <div className="w-full h-full bg-error-container flex items-center justify-center"><span className="material-symbols-outlined text-3xl text-error">picture_as_pdf</span></div>
              ) : (
                <><img alt={file.name} className="w-full h-full object-cover" src={file.src} /><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-white">visibility</span></div></>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="font-body-md font-bold text-on-surface mb-1">{file.name}</div>
              <div className="font-label-sm text-label-sm text-secondary">{file.size} • {file.time}</div>
              <div className="mt-sm flex justify-center sm:justify-start gap-4">
                <button type="button" onClick={() => removeAttachment(file.id)} className="text-primary font-label-md text-label-md hover:underline font-semibold cursor-pointer">Remove</button>
              </div>
            </div>
          </React.Fragment>
        )) : (
          <div className="flex-1 text-center py-4 text-secondary">
            <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
            <p className="text-body-md font-semibold">No receipt attached.</p>
            <p className="text-xs">Attach file to satisfy compliance directive.</p>
          </div>
        )}
        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center px-6 py-4 border border-outline-variant border-dashed rounded-lg text-secondary hover:bg-surface-container-high transition-colors cursor-pointer w-full sm:w-auto">
          <span className="material-symbols-outlined mb-1">add_a_photo</span>
          <span className="font-label-sm text-label-sm font-semibold">{attachments.length > 0 ? 'Add More' : 'Upload Receipt'}</span>
        </button>
      </div>
      <ProcessingOverlay isProcessing={isProcessing} progress={processingProgress} />
      <AttachmentConfirmModal attachment={currentPending} queueLength={pendingQueue.length} currentIndex={pendingIndex} onConfirm={confirmPending} onDiscard={discardPending} />
    </div>
  );
};

export default AttachmentManager;
