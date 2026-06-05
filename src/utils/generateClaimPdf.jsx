import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import API_BASE from '../config';

const WURTH_RED = '#DA291C';
const CHARCOAL_GRAY = '#1F2937';
const LIGHT_GRAY = '#F3F4F6';
const BORDER = '#D1D5DB';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  // --- Header ---
  headerBanner: {
    backgroundColor: CHARCOAL_GRAY,
    padding: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subHeaderBanner: {
    backgroundColor: WURTH_RED,
    padding: 8,
    alignItems: 'center',
    marginBottom: 18,
  },
  subHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // --- Info block ---
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    padding: 10,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 2,
  },
  infoItem: {
    width: '50%',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 7,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: CHARCOAL_GRAY,
    marginTop: 1,
  },
  // --- Table ---
  table: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: LIGHT_GRAY,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 7,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 7,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 8,
    color: '#1F2937',
  },
  // Column widths
  colPurpose: { width: '22%' },
  colCostType: { width: '14%' },
  colPillar: { width: '12%' },
  colDate: { width: '10%' },
  colCountry: { width: '10%' },
  colCurrency: { width: '10%' },
  colAmount: { width: '11%', textAlign: 'right' },
  colTotalAed: { width: '11%', textAlign: 'right' },
  // --- Totals ---
  totalsSection: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  totalLine: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 8,
    width: 240,
  },
  totalLabelText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 9,
    color: '#374151',
    marginRight: 10,
  },
  totalValueText: {
    width: 90,
    textAlign: 'right',
    fontSize: 9,
    fontWeight: 'bold',
  },
  totalValueNa: {
    width: 90,
    textAlign: 'right',
    fontSize: 8,
    color: '#9CA3AF',
  },
  grandTotalRow: {
    flexDirection: 'row',
    backgroundColor: WURTH_RED,
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: 240,
    marginTop: 4,
    borderRadius: 2,
  },
  grandTotalLabel: {
    flex: 1,
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 10,
  },
  grandTotalValue: {
    width: 90,
    textAlign: 'right',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // --- Bank Details ---
  bankSection: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#F9FAFB',
    borderRadius: 2,
  },
  bankTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: CHARCOAL_GRAY,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bankDetailRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bankLabel: {
    width: 100,
    fontSize: 8,
    color: '#6B7280',
  },
  bankValue: {
    flex: 1,
    fontSize: 8,
    fontWeight: 'bold',
    color: CHARCOAL_GRAY,
  },
  // --- Attachments ---
  attachmentsSection: {
    marginTop: 20,
  },
  attachmentTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: CHARCOAL_GRAY,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attachmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  receiptImageWrapper: {
    width: 130,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  receiptImage: {
    width: 130,
    height: 170,
    objectFit: 'cover',
  },
  receiptLabel: {
    padding: 4,
    fontSize: 6,
    color: '#6B7280',
    textAlign: 'center',
  },
  receiptPlaceholder: {
    width: 130,
    height: 170,
    backgroundColor: LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptPlaceholderText: {
    fontSize: 7,
    color: '#6B7280',
  },
  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    textAlign: 'center',
    fontSize: 7,
    color: '#9CA3AF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
});

const tableColumns = [
  { key: 'purpose', label: 'Purpose', style: styles.colPurpose },
  { key: 'costType', label: 'Cost Type', style: styles.colCostType },
  { key: 'pillar', label: 'Pillar', style: styles.colPillar },
  { key: 'date', label: 'Date', style: styles.colDate },
  { key: 'country', label: 'Country', style: styles.colCountry },
  { key: 'currency', label: 'Currency', style: styles.colCurrency },
  { key: 'amount', label: 'Amount', style: styles.colAmount },
  { key: 'totalAed', label: 'AED Total', style: styles.colTotalAed },
];

const ClaimPdfDocument = ({ claim }) => {
  const attachments = claim.attachments || [];
  const imageAttachments = attachments.filter(a => a.type === 'image');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBanner}>
          <Text style={styles.headerTitle}>WÜRTH PROFESSIONAL SOLUTIONS</Text>
        </View>
        <View style={styles.subHeaderBanner}>
          <Text style={styles.subHeaderText}>EXPENSE CLAIM FORM</Text>
        </View>

        {/* Info Block */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Reference</Text>
            <Text style={styles.infoValue}>{claim.ref}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: claim.status === 'APPROVED' ? '#059669' : claim.status === 'REJECTED' ? '#DC2626' : '#D97706' }]}>{claim.status}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Employee</Text>
            <Text style={styles.infoValue}>{claim.employeeName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date of Expense</Text>
            <Text style={styles.infoValue}>{claim.date}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{claim.category}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Receipt No.</Text>
            <Text style={styles.infoValue}>{claim.receiptNo || '—'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>IBAN / Routing</Text>
            <Text style={styles.infoValue}>{claim.iban}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Country of Purchase</Text>
            <Text style={styles.infoValue}>{claim.country}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableHeaderRow}>
            {tableColumns.map(col => (
              <Text key={col.key} style={[styles.tableHeaderCell, col.style]}>
                {col.label}
              </Text>
            ))}
          </View>

          {/* Data Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colPurpose]}>{claim.purpose}</Text>
            <Text style={[styles.tableCell, styles.colCostType]}>{claim.costType}</Text>
            <Text style={[styles.tableCell, styles.colPillar]}>{claim.pillar}</Text>
            <Text style={[styles.tableCell, styles.colDate]}>{claim.date}</Text>
            <Text style={[styles.tableCell, styles.colCountry]}>{claim.country}</Text>
            <Text style={[styles.tableCell, styles.colCurrency]}>{claim.currency}</Text>
            <Text style={[styles.tableCell, styles.colAmount]}>{(parseFloat(claim.amount) || 0).toFixed(2)}</Text>
            <Text style={[styles.tableCell, styles.colTotalAed]}>{(parseFloat(claim.totalAed) || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabelText}>Original Amount ({claim.currency})</Text>
            <Text style={styles.totalValueText}>{(parseFloat(claim.amount) || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabelText}>FX Rate Applied</Text>
            <Text style={styles.totalValueText}>{claim.currency === 'AED' ? '1.0000' : ((parseFloat(claim.amount) || 0) > 0 ? (parseFloat(claim.totalAed) / parseFloat(claim.amount)).toFixed(4) : '—')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL (AED)</Text>
            <Text style={styles.grandTotalValue}>{((parseFloat(claim.totalAed) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</Text>
          </View>
        </View>

        {/* Bank Details */}
        <View style={styles.bankSection}>
          <Text style={styles.bankTitle}>Bank Details for Reimbursement</Text>
          <View style={styles.bankDetailRow}>
            <Text style={styles.bankLabel}>Account Holder:</Text>
            <Text style={styles.bankValue}>{claim.employeeName}</Text>
          </View>
          <View style={styles.bankDetailRow}>
            <Text style={styles.bankLabel}>IBAN:</Text>
            <Text style={styles.bankValue}>{claim.iban}</Text>
          </View>
          <View style={styles.bankDetailRow}>
            <Text style={styles.bankLabel}>Bank:</Text>
            <Text style={styles.bankValue}>Deutsche Bank AG</Text>
          </View>
          <View style={styles.bankDetailRow}>
            <Text style={styles.bankLabel}>Currency:</Text>
            <Text style={styles.bankValue}>AED</Text>
          </View>
        </View>

        {/* Description */}
        {claim.description && (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.bankTitle}>Description</Text>
            <Text style={{ fontSize: 8, color: '#374151' }}>{claim.description}</Text>
          </View>
        )}

        {/* Attached Receipts */}
        {imageAttachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text style={styles.attachmentTitle}>Attached Receipts ({imageAttachments.length})</Text>
            <View style={styles.attachmentsRow}>
              {imageAttachments.map((att, idx) => (
                <View key={att.id || idx} style={styles.receiptImageWrapper}>
                  {att.src ? (
                    <Image style={styles.receiptImage} src={att.src} />
                  ) : (
                    <View style={styles.receiptPlaceholder}>
                      <Text style={styles.receiptPlaceholderText}>Receipt</Text>
                    </View>
                  )}
                  <Text style={styles.receiptLabel}>{att.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          WÜRTH PROFESSIONAL SOLUTIONS — Expense Management System — Generated on {new Date().toLocaleDateString('en-GB')}
        </Text>
      </Page>
    </Document>
  );
};

/**
 * Fetch an attachment from MinIO (via backend) and return it as a data URL.
 * If the attachment already has a direct src, returns it as-is.
 */
const resolveAttachmentSrc = async (att, baseUrl) => {
  if (att.src && att.src.startsWith('data:')) return att.src;
  if (att.objectName) {
    try {
      const res = await fetch(`${baseUrl || API_BASE}/api/files/download?path=${encodeURIComponent(att.objectName)}`);
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
  return att.src || null;
};

/**
 * Generate and download a Finance-ready PDF for a single claim.
 */
export const generateClaimPdf = async (claim, baseUrl) => {
  try {
    const resolvedAttachments = [];
    for (const att of (claim.attachments || [])) {
      const resolvedSrc = await resolveAttachmentSrc(att, baseUrl);
      resolvedAttachments.push({ ...att, src: resolvedSrc });
    }
    const resolvedClaim = { ...claim, attachments: resolvedAttachments };

    const blob = await pdf(<ClaimPdfDocument claim={resolvedClaim} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WPS_Claim_${claim.ref || 'Draft'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch (err) {
    console.error('PDF generation failed:', err);
    return false;
  }
};

/**
 * Generate and download a consolidated PDF with multiple claim items in one table.
 */
export const generateBulkClaimPdf = async (claims, baseUrl) => {
  try {
    // Resolve attachments from the first claim that has them
    let resolvedAttachments = [];
    if (claims.length > 0) {
      for (const att of (claims[0].attachments || [])) {
        const resolvedSrc = await resolveAttachmentSrc(att, baseUrl);
        resolvedAttachments.push({ ...att, src: resolvedSrc });
      }
    }

    const BulkPdfDocument = ({ items }) => (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.headerBanner}>
            <Text style={styles.headerTitle}>WÜRTH PROFESSIONAL SOLUTIONS</Text>
          </View>
          <View style={styles.subHeaderBanner}>
            <Text style={styles.subHeaderText}>CONSOLIDATED EXPENSE CLAIMS</Text>
          </View>

          {/* Summary */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total Claims</Text>
              <Text style={styles.infoValue}>{items.length}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: '#D97706' }]}>PENDING</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Submission Date</Text>
              <Text style={styles.infoValue}>{new Date().toLocaleDateString('en-GB')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>References</Text>
              <Text style={styles.infoValue}>{items[0]?.ref} ... {items[items.length - 1]?.ref}</Text>
            </View>
          </View>

          {/* Table */}
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              {tableColumns.map(col => (
                <Text key={col.key} style={[styles.tableHeaderCell, col.style]}>{col.label}</Text>
              ))}
            </View>

            {items.map((claim, idx) => (
              <View key={idx} style={idx === items.length - 1 ? styles.tableRowLast : styles.tableRow}>
                <Text style={[styles.tableCell, styles.colPurpose]}>{claim.purpose}</Text>
                <Text style={[styles.tableCell, styles.colCostType]}>{claim.costType}</Text>
                <Text style={[styles.tableCell, styles.colPillar]}>{claim.pillar}</Text>
                <Text style={[styles.tableCell, styles.colDate]}>{claim.date}</Text>
                <Text style={[styles.tableCell, styles.colCountry]}>{claim.country}</Text>
                <Text style={[styles.tableCell, styles.colCurrency]}>{claim.currency}</Text>
                <Text style={[styles.tableCell, styles.colAmount]}>{(parseFloat(claim.amount) || 0).toFixed(2)}</Text>
                <Text style={[styles.tableCell, styles.colTotalAed]}>{(parseFloat(claim.totalAed) || 0).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsSection}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabelText}>Total Items</Text>
              <Text style={styles.totalValueText}>{items.length}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL (AED)</Text>
              <Text style={styles.grandTotalValue}>
                {items.reduce((s, c) => s + (parseFloat(c.totalAed) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
              </Text>
            </View>
          </View>

          {/* Bank Details */}
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>Bank Details for Reimbursement</Text>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankLabel}>Account Holder:</Text>
              <Text style={styles.bankValue}>{claims[0]?.employeeName || '—'}</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankLabel}>IBAN:</Text>
              <Text style={styles.bankValue}>{claims[0]?.iban || 'AE****0123'}</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankLabel}>Bank:</Text>
              <Text style={styles.bankValue}>Deutsche Bank AG</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankLabel}>Currency:</Text>
              <Text style={styles.bankValue}>AED</Text>
            </View>
          </View>

          {/* Attachments */}
          {resolvedAttachments.filter(a => a.type === 'image').length > 0 && (
            <View style={styles.attachmentsSection}>
              <Text style={styles.attachmentTitle}>Attached Receipts ({resolvedAttachments.filter(a => a.type === 'image').length})</Text>
              <View style={styles.attachmentsRow}>
                {resolvedAttachments.filter(a => a.type === 'image').map((att, idx) => (
                  <View key={att.id || idx} style={styles.receiptImageWrapper}>
                    {att.src ? (
                      <Image style={styles.receiptImage} src={att.src} />
                    ) : (
                      <View style={styles.receiptPlaceholder}>
                        <Text style={styles.receiptPlaceholderText}>Receipt</Text>
                      </View>
                    )}
                    <Text style={styles.receiptLabel}>{att.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Footer */}
          <Text style={styles.footer}>
            WÜRTH PROFESSIONAL SOLUTIONS — Expense Management System — Generated on {new Date().toLocaleDateString('en-GB')}
          </Text>
        </Page>
      </Document>
    );

    const blob = await pdf(<BulkPdfDocument items={claims} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WPS_Bulk_Claims_${claims[0]?.ref || 'Bulk'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return true;
  } catch (err) {
    console.error('Bulk PDF generation failed:', err);
    return false;
  }
};

export default generateClaimPdf;
