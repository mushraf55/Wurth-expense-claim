import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { getDefaultCostType } from '../../../constants/costTypeCategories';

import API_BASE from '../../../config';

const SECTION_MAP = {
  'A': 'Travel',
  'B': 'Office',
  'C': 'Meals & Entertainment',
  'D': 'Telecommunication',
  'E': 'Marketing',
  'F': 'Logistics',
};

const BulkImportModal = ({ isOpen, onClose, onSubmit }) => {
  const [parsedClaims, setParsedClaims] = useState([]);
  const [fileName, setFileName] = useState('');
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [receiptNos, setReceiptNos] = useState([]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const parseExcelFile = async (file) => {
    setReceiptNos([]);
    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      const claims = [];
      let currentSection = null;

      worksheet.eachRow((row, rowNumber) => {
        const col1 = String(row.getCell(1).value || '').trim();

        // Detect section headers (e.g., "SECTION A: TRAVEL EXPENSES")
        const sectionMatch = col1.match(/SECTION\s+([A-F]):/i);
        if (sectionMatch) {
          currentSection = SECTION_MAP[sectionMatch[1].toUpperCase()] || null;
          return;
        }

        // Skip header rows, blank rows, and rows that start with known headers
        if (
          rowNumber <= 3 ||
          !col1 ||
          col1.startsWith('Event') ||
          col1.startsWith('Sub Total') ||
          col1.startsWith('GRAND TOTAL') ||
          col1.startsWith('SECTION')
        ) {
          return;
        }

        const purpose = col1;
        const costTypeFull = String(row.getCell(2).value || '').trim();
        const pillar = String(row.getCell(4).value || '').trim();
        const date = String(row.getCell(5).value || '').trim();
        const description = String(row.getCell(6).value || '').trim();
        const country = String(row.getCell(7).value || '').trim();
        const receiptNo = String(row.getCell(8).value || '').trim();
        const originalAmount = parseFloat(row.getCell(9).value) || 0;
        const aedAmount = parseFloat(row.getCell(10).value) || 0;

        if (!purpose || originalAmount <= 0) return;

        // Determine currency and totalAed from the data
        // If aedAmount is directly provided, use it; otherwise calculate from originalAmount
        const currency = 'AED';
        const totalAed = aedAmount > 0 ? String(aedAmount.toFixed(2)) : String(originalAmount.toFixed(2));

        // Map cost type
        let costType = '6540 - Food and Beverage (F&B)';
        if (costTypeFull) {
          costType = costTypeFull;
        } else if (currentSection) {
          const defaultCt = getDefaultCostType(currentSection);
          if (defaultCt) {
            costType = `${defaultCt.nr} - ${defaultCt.name}`;
          }
        }

        // Map category from section
        let category = currentSection || 'Meals & Entertainment';

        claims.push({
          purpose,
          costType,
          pillar: pillar || 'Manufacturing AD',
          date: date || new Date().toISOString().split('T')[0],
          description,
          country: country || 'United Arab Emirates',
          receiptNo,
          currency,
          amount: String(originalAmount.toFixed(2)),
          totalAed,
          category,
        });
      });

      if (claims.length === 0) {
        showNotification('No valid claims found in the file. Check the format.', 'error');
        return;
      }

      setParsedClaims(claims);
      setFileName(file.name);
      showNotification(`Parsed ${claims.length} claims from file.`);

      // Fetch bulk receipt numbers
      try {
        const res = await fetch(`${API_BASE}/api/receipts/bulk-numbers?count=${claims.length}`);
        if (res.ok) {
          const data = await res.json();
          setReceiptNos(data.numbers || []);
        } else {
          // Generate local receipt numbers
          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, '0');
          const d = String(now.getDate()).padStart(2, '0');
          const localNos = claims.map((_, i) => `RCP-${y}${m}${d}-${String(i + 1).padStart(4, '0')}`);
          setReceiptNos(localNos);
        }
      } catch (err) {
        console.warn('Failed to fetch receipt numbers:', err);
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const localNos = claims.map((_, i) => `RCP-${y}${m}${d}-${String(i + 1).padStart(4, '0')}`);
        setReceiptNos(localNos);
      }
    } catch (err) {
      console.error('Excel parse error:', err);
      showNotification('Error parsing file. Make sure it is a valid Excel (.xlsx) file.', 'error');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    parseExcelFile(file);
  };

  const handleSubmitAll = async () => {
    if (parsedClaims.length === 0) {
      showNotification('No claims to submit.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Assign receipt numbers to claims
      const claimsWithReceipts = parsedClaims.map((claim, idx) => ({
        ...claim,
        receiptNo: receiptNos[idx] || claim.receiptNo,
      }));

      const refNums = await onSubmit(claimsWithReceipts);

      showNotification(`Successfully submitted ${refNums.length} claims!`, 'success');
      setParsedClaims([]);
      setReceiptNos([]);
      setFileName('');
      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 1500);
    } catch (err) {
      showNotification(`Error: ${err.message}`, 'error');
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setParsedClaims([]);
    setReceiptNos([]);
    setFileName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-[1000px] w-full overflow-hidden my-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright flex items-center justify-between sticky top-0 z-10">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Bulk Import Claims</h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-secondary">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-outline-variant rounded-lg p-8 text-center hover:bg-surface-container-low transition-colors">
            {parsedClaims.length === 0 ? (
              <>
                <span className="material-symbols-outlined text-5xl text-secondary mb-3">upload_file</span>
                <p className="font-body-md text-body-md text-secondary font-semibold mb-2">
                  Upload an Excel file (.xlsx) with your claims
                </p>
                <p className="font-body-sm text-body-sm text-secondary mb-4">
                  The file should have columns: Purpose, Cost Type, Pillar, Date, Description, Country, Receipt No, Original Amount, AED Amount
                </p>
                <label className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-md cursor-pointer">
                  <span>Choose Excel File</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-3xl">description</span>
                  <div className="text-left">
                    <p className="font-body-md text-body-md font-bold text-on-surface">{fileName}</p>
                    <p className="font-label-sm text-label-sm text-secondary">{parsedClaims.length} claims parsed</p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-secondary text-secondary font-bold rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Preview Table */}
          {parsedClaims.length > 0 && (
            <div className="border border-outline-variant rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-surface-bright border-b border-outline-variant flex items-center justify-between">
                <span className="font-label-md text-label-md font-bold text-secondary uppercase">Preview ({parsedClaims.length} claims)</span>
                <span className="font-label-sm text-label-sm text-secondary">
                  Total: {parsedClaims.reduce((s, c) => s + parseFloat(c.totalAed), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} AED
                </span>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant sticky top-0">
                      <th className="px-3 py-2 font-label-sm text-label-sm text-secondary uppercase font-bold">#</th>
                      <th className="px-3 py-2 font-label-sm text-label-sm text-secondary uppercase font-bold">Purpose</th>
                      <th className="px-3 py-2 font-label-sm text-label-sm text-secondary uppercase font-bold">Date</th>
                      <th className="px-3 py-2 font-label-sm text-label-sm text-secondary uppercase font-bold">Amount (AED)</th>
                      <th className="px-3 py-2 font-label-sm text-label-sm text-secondary uppercase font-bold">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {parsedClaims.slice(0, 50).map((claim, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-3 py-2 font-body-sm text-body-sm text-secondary">{idx + 1}</td>
                        <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface max-w-[200px] truncate" title={claim.purpose}>{claim.purpose}</td>
                        <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface">{claim.date}</td>
                        <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface font-semibold">{parseFloat(claim.totalAed).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 font-body-sm text-body-sm text-secondary">{claim.category}</td>
                      </tr>
                    ))}
                    {parsedClaims.length > 50 && (
                      <tr>
                        <td colSpan="5" className="px-3 py-2 text-center text-secondary font-body-sm">
                          ... and {parsedClaims.length - 50} more claims
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notification */}
          {notification && (
            <div className={`px-4 py-3 rounded-lg border flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <span className="material-symbols-outlined text-sm">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
              <span className="font-label-md text-label-md font-bold">{notification.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {parsedClaims.length > 0 && (
          <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-8 py-2 border border-secondary text-secondary font-bold hover:bg-surface-container-high transition-colors rounded-sm cursor-pointer"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAll}
              disabled={submitting}
              className={`px-8 py-2 bg-primary text-on-primary font-bold hover:opacity-90 transition-all shadow-md active:scale-95 rounded-sm cursor-pointer flex items-center gap-2 ${
                submitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting {parsedClaims.length} claims...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">upload</span>
                  <span>Submit All {parsedClaims.length} Claims</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImportModal;
