import React, { useState, useEffect } from 'react';
import { FX_RATES } from '../../../constants/fxRates';
import { CATEGORIES, CATEGORY_COST_TYPES, getCostTypeName, getDefaultCostType } from '../../../constants/costTypeCategories';
import { generateBulkClaimPdf } from '../../../utils/generateClaimPdf';
import { exportExpenseClaimExcel } from '../../../utils/exportExcel';
import AttachmentManager from './AttachmentManager';
import API_BASE from '../../../config';

let _keyCounter = Date.now();
const genKey = () => `item_${++_keyCounter}`;

const emptyItem = () => ({
  purpose: '',
  date: new Date().toISOString().split('T')[0],
  costTypeNr: '6540',
  costTypeName: 'Food and Beverage (F&B)',
  pillar: 'Manufacturing AD',
  country: 'United Arab Emirates',
  currency: 'AED',
  amount: '',
  totalAed: '0.00',
  description: '',
  _key: genKey(),
});

const ExpenseFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [category, setCategory] = useState('Meals & Entertainment');
  const [items, setItems] = useState([emptyItem()]);
  const [attachments, setAttachments] = useState([]);
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [receiptNos, setReceiptNos] = useState([]);

  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    const fetchReceipts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/receipts/bulk-numbers?count=${items.length}`);
        if (res.ok) {
          const data = await res.json();
          setReceiptNos(data.numbers || []);
        } else {
          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, '0');
          const d = String(now.getDate()).padStart(2, '0');
          setReceiptNos(items.map((_, i) => `RCP-${y}${m}${d}-${String(i + 1).padStart(4, '0')}`));
        }
      } catch {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        setReceiptNos(items.map((_, i) => `RCP-${y}${m}${d}-${String(i + 1).padStart(4, '0')}`));
      }
    };
    fetchReceipts();
  }, [isOpen, items.length]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const addItem = () => {
    const newItem = emptyItem();
    const defaultCt = getDefaultCostType(category);
    if (defaultCt) {
      newItem.costTypeNr = defaultCt.nr;
      newItem.costTypeName = defaultCt.name;
    }
    newItem._key = genKey();
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (key) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i._key !== key));
  };

  const updateItem = (key, field, value) => {
    setItems(prev => prev.map(item => {
      if (item._key !== key) return item;
      const updated = { ...item, [field]: value };
      if (field === 'costTypeNr') {
        const name = getCostTypeName(category, value);
        if (name) updated.costTypeName = name;
      }
      if (field === 'amount' || field === 'currency') {
        const numAmount = parseFloat(updated.amount) || 0;
        const rate = FX_RATES[updated.currency] || 1;
        updated.totalAed = (numAmount * rate).toFixed(2);
      }
      return updated;
    }));
  };

  const resetForm = () => {
    setItems([emptyItem()]);
    setAttachments([]);
    setCategory('Meals & Entertainment');
    setReceiptNos([]);
    setNotification(null);
    setSubmitting(false);
  };

  const uploadAttachment = async (att) => {
    const resp = await fetch(att.src);
    const blob = await resp.blob();
    const formData = new FormData();
    formData.append('file', blob, att.name);
    const uploadRes = await fetch(`${API_BASE}/api/files/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}));
      throw new Error(errData.error || 'Upload failed');
    }
    const result = await uploadRes.json();
    return { name: att.name, size: att.size, objectName: result.objectName, type: att.type };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = items.filter(it => it.purpose.trim() && parseFloat(it.amount) > 0);
    if (validItems.length === 0) {
      showNotification('Add at least one expense line with a purpose and amount.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      let attachmentData = [];
      if (attachments.length > 0) {
        showNotification('Uploading attachments...', 'success');
        attachmentData = await Promise.all(attachments.map(uploadAttachment));
      }
      const claimsData = validItems.map((item, idx) => ({
        purpose: item.purpose,
        date: item.date,
        costType: `${item.costTypeNr} - ${item.costTypeName}`,
        pillar: item.pillar,
        country: item.country,
        currency: item.currency,
        amount: item.amount,
        totalAed: item.totalAed,
        category,
        receiptNo: receiptNos[idx] || '',
        description: item.description,
        attachments: attachmentData,
      }));
      const refNums = await onSubmit(claimsData);
      const lineItems = validItems.map((item, idx) => ({
        purpose: item.purpose,
        plCostTypeNr: item.costTypeNr,
        plCostTypeName: item.costTypeName,
        pillarName: item.pillar,
        date: item.date,
        description: item.description,
        country: item.country,
        receiptNo: receiptNos[idx] || '',
        originalAmount: parseFloat(item.amount) || 0,
        aedAmount: parseFloat(item.totalAed) || 0,
        category: (() => {
          const sectionMap = { Travel: 'A', Office: 'B', 'Meals & Entertainment': 'C', Telecommunication: 'D', Marketing: 'E', Logistics: 'F' };
          return sectionMap[category] || 'C';
        })(),
      }));
      await exportExpenseClaimExcel(
        { lastName: 'Bulk Entry', firstName: '', accountNo: 'AE****0123', submissionDate: new Date().toISOString().split('T')[0], referenceCode: refNums[0] || 'BULK' },
        lineItems
      );
      const pdfClaims = validItems.map((item, idx) => ({
        ref: refNums[idx] || '',
        employeeName: 'Bulk Entry',
        date: item.date,
        purpose: item.purpose,
        costType: `${item.costTypeNr} - ${item.costTypeName}`,
        pillar: item.pillar,
        country: item.country,
        currency: item.currency,
        amount: item.amount,
        totalAed: item.totalAed,
        category,
        receiptNo: receiptNos[idx] || '',
        description: item.description,
        status: 'PENDING',
        iban: 'AE****0123',
        attachments: attachmentData,
      }));
      await generateBulkClaimPdf(pdfClaims, API_BASE);
      resetForm();
      showNotification(`Successfully submitted ${refNums.length} claims! Excel & PDF downloaded.`, 'success');
      setTimeout(() => { setSubmitting(false); onClose(); }, 800);
    } catch (err) {
      showNotification(`Error: ${err.message}`, 'error');
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const grandTotalAed = items.reduce((s, it) => s + (parseFloat(it.totalAed) || 0), 0);
  const validCount = items.filter(it => it.purpose.trim() && parseFloat(it.amount) > 0).length;

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-start justify-center p-0 sm:p-4 pt-0 sm:pt-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-none sm:rounded-xl shadow-2xl max-w-[1200px] w-full min-h-[100dvh] sm:min-h-0 my-0 sm:my-auto overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-outline-variant bg-surface-bright flex items-center justify-between sticky top-0 z-10">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate pr-2">
            New Expense Claim
          </h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer shrink-0">
            <span className="material-symbols-outlined text-secondary">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-3 sm:space-y-4">
          {/* Shared Settings Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pb-3 border-b border-outline-variant">
            <div className="flex items-center gap-1 sm:gap-2">
              <label className="font-label-md text-label-md text-secondary font-semibold whitespace-nowrap text-[11px] sm:text-[12px]">Category:</label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  const defaultCt = getDefaultCostType(newCat);
                  if (defaultCt) {
                    setItems(prev => prev.map(it => ({ ...it, costTypeNr: defaultCt.nr, costTypeName: defaultCt.name })));
                  }
                }}
                className="form-input font-body-md cursor-pointer w-auto text-[12px] h-8 sm:h-10"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <span className="font-label-sm text-label-sm text-secondary text-[11px]">
              {items.length} item{items.length !== 1 ? 's' : ''} · Total: <strong>{grandTotalAed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</strong>
            </span>
          </div>

          {/* ===== MOBILE: Card layout for each item ===== */}
          <div className="block sm:hidden space-y-2">
            {items.map((item, idx) => (
              <div key={item._key} className="border border-outline-variant rounded-lg p-3 space-y-2 bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-secondary uppercase">Item #{idx + 1}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item._key)}
                      className="text-secondary hover:text-primary transition-colors cursor-pointer p-0.5">
                      <span className="material-symbols-outlined text-[18px]">remove_circle</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                  <div className="col-span-2">
                    <label className="text-[10px] text-secondary font-semibold uppercase">Purpose</label>
                    <input type="text" value={item.purpose} onChange={e => updateItem(item._key, 'purpose', e.target.value)}
                      className="w-full border border-outline-variant rounded px-2 py-1.5 text-[13px] focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Event / purpose" />
                  </div>
                  <div>
                    <label className="text-[10px] text-secondary font-semibold uppercase">Date</label>
                    <input type="date" value={item.date} onChange={e => updateItem(item._key, 'date', e.target.value)}
                      className="w-full border border-outline-variant rounded px-2 py-1.5 text-[13px] focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-secondary font-semibold uppercase">Cost Type</label>
                    <select value={item.costTypeNr} onChange={e => updateItem(item._key, 'costTypeNr', e.target.value)}
                      className="w-full border border-outline-variant rounded px-2 py-1.5 text-[13px] focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                      {(CATEGORY_COST_TYPES[category] || []).map(ct => (
                        <option key={ct.nr} value={ct.nr}>{ct.nr} - {ct.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-secondary font-semibold uppercase">Pillar</label>
                    <select value={item.pillar} onChange={e => updateItem(item._key, 'pillar', e.target.value)}
                      className="w-full border border-outline-variant rounded px-2 py-1.5 text-[13px] focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                      <option value="Manufacturing AD">Mfg AD</option>
                      <option value="Manufacturing DXB and NE">Mfg DXB</option>
                      <option value="Construction">Construction</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Operations">Operations</option>
                      <option value="WPS">WPS</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-secondary font-semibold uppercase">Country</label>
                    <select value={item.country} onChange={e => updateItem(item._key, 'country', e.target.value)}
                      className="w-full border border-outline-variant rounded px-2 py-1.5 text-[13px] focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                      <option value="United Arab Emirates">UAE</option>
                      <option value="Germany">Germany</option>
                      <option value="USA">USA</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-secondary font-semibold uppercase">Currency</label>
                    <select value={item.currency} onChange={e => updateItem(item._key, 'currency', e.target.value)}
                      className="w-full border border-outline-variant rounded px-2 py-1.5 text-[13px] focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                      <option value="AED">AED</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="TL">TL</option>
                      <option value="CNY">CNY</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-secondary font-semibold uppercase">Amount</label>
                    <input type="number" step="0.01" value={item.amount} onChange={e => updateItem(item._key, 'amount', e.target.value)}
                      className="w-full border border-outline-variant rounded px-2 py-1.5 text-[13px] focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-[10px] text-secondary font-semibold uppercase">AED Total</label>
                    <div className="w-full border border-transparent rounded px-2 py-1.5 text-[13px] font-bold text-primary">
                      {parseFloat(item.totalAed).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-secondary font-semibold uppercase">Description</label>
                    <input type="text" value={item.description} onChange={e => updateItem(item._key, 'description', e.target.value)}
                      className="w-full border border-outline-variant rounded px-2 py-1.5 text-[13px] focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Optional" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== DESKTOP: Table layout ===== */}
          <div className="hidden sm:block border border-outline-variant rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] sticky top-0 z-10">
                    <th className="px-2 py-2 text-secondary uppercase font-bold w-8">#</th>
                    <th className="px-2 py-2 text-secondary uppercase font-bold min-w-[160px]">Purpose</th>
                    <th className="px-2 py-2 text-secondary uppercase font-bold w-[110px]">Date</th>
                    <th className="px-2 py-2 text-secondary uppercase font-bold min-w-[130px]">Cost Type</th>
                    <th className="px-2 py-2 text-secondary uppercase font-bold min-w-[120px]">Pillar</th>
                    <th className="px-2 py-2 text-secondary uppercase font-bold w-[110px]">Country</th>
                    <th className="px-2 py-2 text-secondary uppercase font-bold w-[70px]">Ccy</th>
                    <th className="px-2 py-2 text-secondary uppercase font-bold w-[100px]">Amount</th>
                    <th className="px-2 py-2 text-secondary uppercase font-bold w-[100px]">AED</th>
                    <th className="px-2 py-2 text-secondary uppercase font-bold min-w-[120px]">Description</th>
                    <th className="px-2 py-2 text-secondary uppercase font-bold w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {items.map((item, idx) => (
                    <tr key={item._key} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-2 py-1.5 text-center text-secondary font-bold text-[11px]">{idx + 1}</td>
                      <td className="px-2 py-1.5">
                        <input type="text" value={item.purpose} onChange={e => updateItem(item._key, 'purpose', e.target.value)}
                          className="w-full border border-outline-variant rounded px-2 py-1 text-[12px] focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                          placeholder="Event / purpose" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="date" value={item.date} onChange={e => updateItem(item._key, 'date', e.target.value)}
                          className="w-full border border-outline-variant rounded px-2 py-1 text-[12px] focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={item.costTypeNr} onChange={e => updateItem(item._key, 'costTypeNr', e.target.value)}
                          className="w-full border border-outline-variant rounded px-2 py-1 text-[12px] focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                          {(CATEGORY_COST_TYPES[category] || []).map(ct => (
                            <option key={ct.nr} value={ct.nr} title={ct.name}>{ct.nr} - {ct.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={item.pillar} onChange={e => updateItem(item._key, 'pillar', e.target.value)}
                          className="w-full border border-outline-variant rounded px-2 py-1 text-[12px] focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                          <option value="Manufacturing AD">Manufacturing AD</option>
                          <option value="Manufacturing DXB and NE">Manufacturing DXB and NE</option>
                          <option value="Construction">Construction</option>
                          <option value="Infrastructure">Infrastructure</option>
                          <option value="Operations">Operations</option>
                          <option value="WPS">WPS</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={item.country} onChange={e => updateItem(item._key, 'country', e.target.value)}
                          className="w-full border border-outline-variant rounded px-2 py-1 text-[12px] focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                          <option value="United Arab Emirates">UAE</option>
                          <option value="Germany">Germany</option>
                          <option value="USA">USA</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={item.currency} onChange={e => updateItem(item._key, 'currency', e.target.value)}
                          className="w-full border border-outline-variant rounded px-2 py-1 text-[12px] focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                          <option value="AED">AED</option>
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                          <option value="TL">TL</option>
                          <option value="CNY">CNY</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" step="0.01" value={item.amount} onChange={e => updateItem(item._key, 'amount', e.target.value)}
                          className="w-full border border-outline-variant rounded px-2 py-1 text-[12px] focus:border-primary focus:ring-1 focus:ring-primary outline-none text-right"
                          placeholder="0.00" />
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="text-[12px] font-semibold text-primary block text-right">
                          {parseFloat(item.totalAed).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="text" value={item.description} onChange={e => updateItem(item._key, 'description', e.target.value)}
                          className="w-full border border-outline-variant rounded px-2 py-1 text-[12px] focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                          placeholder="Optional" />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(item._key)}
                            className="text-secondary hover:text-primary transition-colors cursor-pointer p-1">
                            <span className="material-symbols-outlined text-[16px]">remove_circle</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Item Button */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <button type="button" onClick={addItem}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-2 border-dashed border-outline-variant text-secondary font-bold rounded-lg hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer text-[12px]">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Item</span>
            </button>
            <span className="text-[11px] text-secondary">
              {validCount} of {items.length} item{items.length !== 1 ? 's' : ''} ready
            </span>
          </div>

          {/* Attachments */}
          <AttachmentManager attachments={attachments} onAttachmentsChange={setAttachments} onNotify={showNotification} />

          {/* Notification */}
          {notification && (
            <div className={`px-3 sm:px-4 py-3 rounded-lg border flex items-center gap-2 text-[12px] sm:text-[14px] ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <span className="material-symbols-outlined text-sm shrink-0">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
              <span className="font-bold">{notification.message}</span>
            </div>
          )}

          {/* Footer - responsive: stacked on mobile, side-by-side on desktop */}
          <div className="pt-4 border-t border-outline-variant flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="font-headline-sm text-headline-sm font-bold text-on-surface text-center sm:text-left">
              Total: {grandTotalAed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button type="button" onClick={onClose}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-2 border border-secondary text-secondary font-bold hover:bg-surface-container-high transition-colors rounded-sm cursor-pointer text-[13px] sm:text-[14px]"
                disabled={submitting}>
                Cancel
              </button>
              <button type="submit" disabled={submitting || validCount === 0}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-2 bg-primary text-on-primary font-bold hover:opacity-90 transition-all shadow-md active:scale-95 rounded-sm cursor-pointer flex items-center justify-center gap-2 text-[13px] sm:text-[14px] ${submitting || validCount === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" /><span>Submitting {validCount}...</span></>
                ) : (
                  <><span className="material-symbols-outlined">check</span><span>Submit {validCount} Claim{validCount !== 1 ? 's' : ''}</span></>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
