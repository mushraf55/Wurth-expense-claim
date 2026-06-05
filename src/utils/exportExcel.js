import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportExpenseClaimExcel = async (claimantData, lineItems) => {
  // Create workbook and configure views
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expense Claim Form', {
    views: [{ showGridLines: true }]
  });

  // --- BRANDING COLORS & TYPOGRAPHY ---
  const WURTH_RED = 'DA291C';
  const CHARCOAL_GRAY = '1F2937';
  const LIGHT_GRAY_BG = 'F3F4F6';
  const WHITE = 'FFFFFF';

  // --- 1. METADATA BLOCK (TOP OF THE SHEET) ---
  // Corporate Header Banner
  worksheet.mergeCells('A1:J1');
  const companyTitleCell = worksheet.getCell('A1');
  companyTitleCell.value = 'WÜRTH PROFESSIONAL SOLUTIONS';
  companyTitleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: WHITE } };
  companyTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CHARCOAL_GRAY } };
  companyTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 40;

  // Form Title Banner
  worksheet.mergeCells('A2:J2');
  const docTitleCell = worksheet.getCell('A2');
  docTitleCell.value = 'EXPENSE CLAIM FORM';
  docTitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: WHITE } };
  docTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WURTH_RED } };
  docTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 25;

  worksheet.addRow([]); // Blank row spacer

  // Info Block Rows
  const metadataRows = [
    { label: 'Claimant Name:', value: `${claimantData.lastName || ''}, ${claimantData.firstName || ''}` },
    { label: 'Account No:', value: claimantData.accountNo || '' },
    { label: 'Submission Date:', value: claimantData.submissionDate || new Date().toISOString().split('T')[0] },
    { label: 'Reference Code:', value: claimantData.referenceCode || '' }
  ];

  metadataRows.forEach(meta => {
    const row = worksheet.addRow([meta.label, meta.value]);
    row.getCell(1).font = { bold: true, name: 'Arial', size: 10 };
    row.getCell(2).font = { name: 'Arial', size: 10 };
  });

  worksheet.addRow([]); // Blank row spacer

  // --- 2. TABLE COLUMN HEADERS CONFIGURATION ---
  const tableHeaders = [
    'Event Name / Purpose',
    'PL Cost types Nr',
    'PL Cost types Name',
    'Pillar Name',
    'Date',
    'Description',
    'Country',
    'Receipt No.',
    'Original Currency Amount',
    'AED Amount'
  ];

  // Set explicit column widths to guarantee no text truncation
  worksheet.columns = [
    { width: 30 }, // Purpose
    { width: 16 }, // PL Code
    { width: 25 }, // PL Name
    { width: 16 }, // Pillar
    { width: 14 }, // Date
    { width: 32 }, // Description
    { width: 20 }, // Country
    { width: 15 }, // Receipt No
    { width: 24 }, // Original Amount
    { width: 18 }  // AED Amount
  ];

  // --- 3. SECTIONS DATA INJECTION LOGIC (SECTIONS A - E) ---
  const sections = [
    { code: 'A', name: 'Travel Expenses' },
    { code: 'B', name: 'Office Supplies' },
    { code: 'C', name: 'Meals & Entertainment - Clients' },
    { code: 'D', name: 'Telecommunication' },
    { code: 'E', name: 'Marketing' },
    { code: 'F', name: 'Logistics' }
  ];    // Track computed subtotals for the grand total
  const subtotalValues = [];

  sections.forEach(section => {
    // Filter out item elements belonging explicitly to this category block
    const sectionItems = lineItems.filter(item => item.category === section.code);

    // Render Section Header Row
    worksheet.addRow([]); // Breathing space spacer
    const sectionHeaderRow = worksheet.addRow([`SECTION ${section.code}: ${section.name.toUpperCase()}`]);
    worksheet.mergeCells(`A${sectionHeaderRow.number}:J${sectionHeaderRow.number}`);
    sectionHeaderRow.getCell(1).font = { bold: true, size: 11, color: { argb: 'FFFFFF' } };
    sectionHeaderRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4B5563' } };

    // Append Column Headers inside this specific section block
    const headersRow = worksheet.addRow(tableHeaders);
    headersRow.height = 24;
    headersRow.eachCell(cell => {
      cell.font = { bold: true, name: 'Arial', size: 9 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY_BG } };
      cell.border = { bottom: { style: 'medium' }, top: { style: 'thin' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // Append Individual Line Items rows
    if (sectionItems.length === 0) {
      // If empty, append a clean blank dummy placeholder row so spreadsheet architecture stands valid
      const emptyRow = worksheet.addRow(['', '', '', '', '', '', '', '', 0, 0]);
      emptyRow.getCell(9).numFmt = '#,##0.00';
      emptyRow.getCell(10).numFmt = '#,##0.00';
    } else {
      sectionItems.forEach(item => {
        const origAmt = Number(item.originalAmount) || 0;
        const aedAmt = Number(item.aedAmount) || 0;
        const itemRow = worksheet.addRow([
          item.purpose || '',
          item.plCostTypeNr || '',
          item.plCostTypeName || '',
          item.pillarName || '',
          item.date || '',
          item.description || '',
          item.country || '',
          item.receiptNo || '',
          origAmt,
          aedAmt
        ]);

        // Formats numerical currencies values cleanly
        itemRow.getCell(9).numFmt = '#,##0.00';
        itemRow.getCell(10).numFmt = '#,##0.00';
        itemRow.eachCell(cell => { cell.font = { name: 'Arial', size: 9 }; });
      });
    }

    // Calculate the actual subtotal for this section
    const origSubtotal = sectionItems.reduce((sum, item) => sum + (Number(item.originalAmount) || 0), 0);
    const aedSubtotal = sectionItems.reduce((sum, item) => sum + (Number(item.aedAmount) || 0), 0);
    subtotalValues.push(aedSubtotal);

    // Append Section Subtotal Row with pre-computed values (no formulas to avoid #VALUE! in Excel)
    const subtotalRow = worksheet.addRow([]);
    subtotalRow.getCell(1).value = `Sub Total Section ${section.code}`;
    subtotalRow.getCell(1).font = { bold: true, italic: true, name: 'Arial', size: 9 };

    // Original Currency subtotal
    subtotalRow.getCell(9).value = origSubtotal;
    subtotalRow.getCell(9).font = { bold: true, name: 'Arial', size: 9 };
    subtotalRow.getCell(9).numFmt = '#,##0.00';

    // AED subtotal
    subtotalRow.getCell(10).value = aedSubtotal;
    subtotalRow.getCell(10).font = { bold: true, name: 'Arial', size: 9 };
    subtotalRow.getCell(10).numFmt = '#,##0.00';

    // Visual double accounting underline border layout for subtotals
    subtotalRow.getCell(9).border = { top: { style: 'thin' }, bottom: { style: 'double' } };
    subtotalRow.getCell(10).border = { top: { style: 'thin' }, bottom: { style: 'double' } };
  });

  // --- 4. GRAND TOTAL ACCOUNTING BLOCK (BOTTOM) ---
  worksheet.addRow([]); // Spacer
  worksheet.addRow([]); // Spacer
  const grandTotalRow = worksheet.addRow([]);
  grandTotalRow.getCell(1).value = 'GRAND TOTAL CLAIMS (AED)';
  grandTotalRow.getCell(1).font = { bold: true, name: 'Arial', size: 11 };
  
  // Compute the grand total (plain value, no formula to avoid #VALUE!)
  const grandTotalValue = subtotalValues.reduce((sum, val) => sum + val, 0);
  grandTotalRow.getCell(10).value = grandTotalValue;
  grandTotalRow.getCell(10).font = { bold: true, name: 'Arial', size: 11, color: { argb: 'FFFFFF' } };
  grandTotalRow.getCell(10).numFmt = "#,##0.00" + ' "AED"';
  grandTotalRow.getCell(10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: WURTH_RED } };
  grandTotalRow.getCell(10).border = {
    top: { style: 'thin', color: { argb: CHARCOAL_GRAY } },
    bottom: { style: 'medium', color: { argb: CHARCOAL_GRAY } }
  };

  // Generate buffer array payload and download the spreadsheet file via client browser
  const buffer = await workbook.xlsx.writeBuffer();
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const blob = new Blob([buffer], { type: fileType });
  saveAs(blob, `WPS_Expense_Claim_${claimantData.referenceCode || 'Draft'}.xlsx`);
};
