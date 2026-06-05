import React, { useState, useEffect } from 'react';
import { FX_RATES, getRateText } from '../../../constants/fxRates';
import { CATEGORIES, CATEGORY_COST_TYPES, getCostTypeName, getDefaultCostType } from '../../../constants/costTypeCategories';
import { generateClaimPdf } from '../../../utils/generateClaimPdf';
import MathCard from './MathCard';
import AttachmentManager from './AttachmentManager';

const ExpenseFormModal = ({ isOpen, onClose, onSubmit, currentUser }) => {
  const [category, setCategory] = useState('Meals & Entertainment');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [costTypeNr, setCostTypeNr] = useState('6540');
  const [costTypeName, setCostTypeName] = useState('Food and Beverage (F&B)');
  const [pillar, setPillar] = useState('Manufacturing AD');
  const [country, setCountry] = useState('United Arab Emirates');
  const [description, setDescription] = useState('');

  // Fetch a sequential receipt number from the backend (persisted in MongoDB)
  const [receiptNo, setReceiptNo] = useState('Loading...');
  useEffect(() => {
    if (!isOpen) return;
    setReceiptNo('Loading...');
    fetch('http://localhost:3000/api/receipts/next-number')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setReceiptNo(data.number))
      .catch(() => {
        // Fallback: generate a local timestamp-based number if backend is unavailable
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const seq = String(Date.now()).slice(-4);
        setReceiptNo(`RCP-${y}${m}${d}-${seq}`);
      });
  }, [isOpen]);
  const [currency, setCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [convertedTotal, setConvertedTotal] = useState('0.00');
  const [fxRateText, setFxRateText] = useState('1 EUR = 4.01 AED');
  const [attachments, setAttachments] = useState([]);
  const [notification, setNotification] = useState(null);

  // When category changes, reset to the default cost type for that category.
  // Also syncs costTypeName whenever costTypeNr changes (within same category).
  useEffect(() => {
    const name = getCostTypeName(category, costTypeNr);
    if (name) {
      setCostTypeName(name);
    } else {
      // Current nr is invalid for this category — reset to default
      const defaultCt = getDefaultCostType(category);
      if (defaultCt) {
        setCostTypeNr(defaultCt.nr);
        setCostTypeName(defaultCt.name);
      }
    }
  }, [category, costTypeNr]);
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const rate = FX_RATES[currency] || 1;
    setConvertedTotal((numAmount * rate).toFixed(2));
    setFxRateText(getRateText(currency));
  }, [amount, currency]);

  const resetForm = () => {
    setPurpose(''); setAmount(''); setDescription('');
    setDate(new Date().toISOString().split('T')[0]); setCurrency('EUR');
    setCategory('Meals & Entertainment');
    setPillar('Manufacturing AD'); setCountry('United Arab Emirates');
    setAttachments([]);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Upload an attachment to the backend (which stores it in MinIO)
  const uploadAttachment = async (att) => {
    try {
      // Convert data URL to blob
      const resp = await fetch(att.src);
      const blob = await resp.blob();
      const formData = new FormData();
      formData.append('file', blob, att.name);
      const uploadRes = await fetch('http://localhost:3000/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const result = await uploadRes.json();
      return { name: att.name, size: att.size, objectName: result.objectName, type: att.type };
    } catch (err) {
      console.warn('File upload failed, falling back to inline data:', err.message);
      // Fallback: store the data URL inline if MinIO is unavailable
      return { name: att.name, size: att.size, src: att.src, type: att.type };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) { showNotification('Error: Please enter the Event Name / Purpose.', 'error'); return; }
    if (!amount || parseFloat(amount) <= 0) { showNotification('Error: Please enter a valid amount.', 'error'); return; }

    // Upload attachments to MinIO via backend, then build the claim payload
    let attachmentData;
    if (attachments.length > 0) {
      showNotification('Uploading attachments...', 'success');
      const uploaded = await Promise.all(attachments.map(uploadAttachment));
      attachmentData = uploaded;
    } else {
      attachmentData = [];
    }

    const claimPayload = { purpose, date, costType: `${costTypeNr} - ${costTypeName}`, pillar, country, currency, amount, totalAed: convertedTotal, category, receiptNo, description, attachments: attachmentData };
    const refNum = await onSubmit(claimPayload);
    const pdfClaim = { ...claimPayload, ref: refNum, employeeName: currentUser?.name || 'John Doe', iban: 'AE****0123', status: 'PENDING' };
    const pdfOk = await generateClaimPdf(pdfClaim, 'http://localhost:3000');
    resetForm();
    showNotification(pdfOk ? `Claim ${refNum} submitted successfully! Receipt #${receiptNo} — PDF downloaded.` : `Claim ${refNum} submitted. Receipt #${receiptNo} — PDF download failed.`, pdfOk ? 'success' : 'error');
    setTimeout(() => onClose(), 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-[900px] w-full overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright flex items-center justify-between sticky top-0 z-10">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">New Expense Claim</h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-secondary">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            <div className="col-span-12 md:col-span-4">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">Event Name / Purpose</label>
              <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="form-input font-body-md" placeholder="e.g., Annual Client Dinner - Al Futtaim Group" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input font-body-md cursor-pointer">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">Date of Expense</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input font-body-md" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">PL Cost Type Nr</label>
              <select value={costTypeNr} onChange={(e) => setCostTypeNr(e.target.value)} className="form-input font-body-md cursor-pointer">
                {(CATEGORY_COST_TYPES[category] || []).map(ct => (
                  <option key={ct.nr} value={ct.nr}>{ct.nr} - {ct.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 opacity-50 font-semibold">PL Cost Type Name</label>
              <input type="text" disabled value={costTypeName} className="form-input font-body-md bg-surface-container-low text-secondary cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">Pillar Name</label>
              <select value={pillar} onChange={(e) => setPillar(e.target.value)} className="form-input font-body-md cursor-pointer">
                <option value="Manufacturing AD">Manufacturing AD</option><option value="Manufacturing DXB and NE">Manufacturing DXB and NE</option><option value="Construction">Construction</option><option value="Infrastructure">Infrastructure</option><option value="Operations">Operations</option><option value="WPS">WPS</option>
              </select>
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">Country of Purchase</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="form-input font-body-md cursor-pointer">
                <option value="United Arab Emirates">United Arab Emirates</option><option value="Germany">Germany</option><option value="USA">USA</option>
              </select>
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 opacity-50 font-semibold">Receipt/Invoice No.</label>
              <input type="text" disabled value={receiptNo} className="form-input font-body-md bg-surface-container-low text-secondary cursor-not-allowed" />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 font-semibold">Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="form-input font-body-md" placeholder="Dinner with Logistics Director" />
            </div>
            <MathCard currency={currency} onCurrencyChange={setCurrency} amount={amount} onAmountChange={setAmount} fxRateText={fxRateText} convertedTotal={convertedTotal} />
            <AttachmentManager attachments={attachments} onAttachmentsChange={setAttachments} onNotify={showNotification} />
          </div>
          {notification && (
            <div className={`px-4 py-3 rounded-lg border flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <span className="material-symbols-outlined text-sm">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
              <span className="font-label-md text-label-md font-bold">{notification.message}</span>
            </div>
          )}
          <div className="pt-4 border-t border-outline-variant flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-8 py-2 border border-secondary text-secondary font-bold hover:bg-surface-container-high transition-colors rounded-sm cursor-pointer">Cancel</button>
            <button type="submit" className="px-8 py-2 bg-primary text-on-primary font-bold hover:opacity-90 transition-all shadow-md active:scale-95 rounded-sm cursor-pointer">Submit Claim</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
