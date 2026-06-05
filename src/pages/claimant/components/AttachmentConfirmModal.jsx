import React from 'react';

const AttachmentConfirmModal = ({ attachment, queueLength, currentIndex, onConfirm, onDiscard }) => {
  if (!attachment) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={onDiscard}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-bright">
          <div className="flex items-center gap-2">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Confirm Attachment</h3>
            {queueLength > 1 && (
              <span className="font-label-sm text-label-sm px-2 py-0.5 bg-surface-container-high text-secondary rounded-full font-semibold">{currentIndex + 1} of {queueLength}</span>
            )}
          </div>
          <button type="button" onClick={onDiscard} className="p-1 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-secondary">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-surface-container-low rounded-lg overflow-hidden flex items-center justify-center max-h-64">
            {attachment.type === 'pdf' ? (
              <div className="py-12 flex flex-col items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-6xl text-error">picture_as_pdf</span>
                <span className="font-label-md text-label-md">PDF document preview</span>
              </div>
            ) : (
              <img src={attachment.src} alt={attachment.name} className="max-w-full max-h-64 object-contain" />
            )}
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">{attachment.type === 'pdf' ? 'description' : 'photo_camera'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body-md text-body-md font-semibold text-on-surface truncate">{attachment.name}</p>
              <p className="font-label-sm text-label-sm text-secondary">{attachment.size}</p>
            </div>
            <span className="font-label-sm text-label-sm px-2 py-1 bg-surface-container-high text-secondary rounded font-bold uppercase">{attachment.type === 'pdf' ? 'PDF' : 'Image'}</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onDiscard} className="flex-1 px-4 py-3 border border-outline-variant text-secondary font-bold hover:bg-surface-container-high transition-colors rounded-lg cursor-pointer">
              {queueLength > 1 ? 'Skip' : 'Discard'}
            </button>
            <button type="button" onClick={onConfirm} className="flex-1 px-4 py-3 bg-primary text-white font-bold hover:opacity-90 transition-all rounded-lg shadow-sm cursor-pointer flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              <span>{queueLength > 1 ? 'Confirm & Next' : 'Confirm & Attach'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentConfirmModal;
