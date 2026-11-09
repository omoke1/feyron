import { jsPDF } from 'jspdf';

export interface DocumentPdfData {
  docType: string;
  docTitle: string;
  docRef: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientRole?: string;
  projectName: string;
  dateIssued: string;
  targetDate?: string;
  currency: string;
  totalAmount: string;
  scopeSummary: string;
  milestones?: Array<{
    sprint: string;
    phase: string;
    deliverables: string;
    dependencies?: string;
    timeline: string;
    billing: string;
  }>;
  lineItems?: Array<{
    desc: string;
    qty: string;
    rate: string;
    amount: string;
  }>;
  slaTurnaround?: string;
  warrantyPeriod?: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

export function buildFeyronPdf(data: DocumentPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // Header Dark Banner
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Tri-Color Bar
  doc.setFillColor(254, 180, 123); // Gold
  doc.rect(0, 28, pageWidth * 0.34, 1.8, 'F');
  doc.setFillColor(192, 132, 252); // Purple
  doc.rect(pageWidth * 0.34, 28, pageWidth * 0.33, 1.8, 'F');
  doc.setFillColor(74, 222, 128); // Emerald
  doc.rect(pageWidth * 0.67, 28, pageWidth * 0.33, 1.8, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Feyron', margin, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(170, 170, 170);
  doc.text('AI PRODUCTIVITY & TECHNOLOGY', margin + 24, 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(254, 180, 123);
  doc.text(data.docRef, pageWidth - margin, 17, { align: 'right' });

  // Document Title Section
  y = 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(data.docTitle.toUpperCase(), margin, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text(data.projectName, margin, y);

  // Metadata Box (Client & Document info)
  y += 10;
  doc.setFillColor(243, 243, 243);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'S');

  // Column 1: Client Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text('PREPARED FOR:', margin + 6, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(data.clientName, margin + 6, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const orgLine = [data.clientRole, data.clientCompany].filter(Boolean).join(' · ');
  doc.text(orgLine || data.clientEmail, margin + 6, y + 17);
  doc.text(data.clientEmail, margin + 6, y + 22);

  // Column 2: Document Details
  const col2X = margin + contentWidth * 0.58;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text('DOCUMENT DETAILS:', col2X, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text(`Issue Date: ${data.dateIssued}`, col2X, y + 12);
  if (data.targetDate) {
    doc.text(`Target Delivery: ${data.targetDate}`, col2X, y + 17);
  }
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`Total Value: ${data.currency}${data.totalAmount}`, col2X, y + 22);

  // Executive Scope Summary / Purpose
  y += 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(data.docType === 'agreement' ? '1. PURPOSE & ENGAGEMENT TERMS' : 'EXECUTIVE SCOPE & OVERVIEW', margin, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const splitScope = doc.splitTextToSize(data.scopeSummary, contentWidth);
  doc.text(splitScope, margin, y);
  y += splitScope.length * 4.6 + 6;

  // Specific handling for 'agreement' type
  if (data.docType === 'agreement') {
    const agreementClauses = [
      {
        title: '2. COMMERCIAL TERMS & MILESTONE SETTLEMENT',
        text: `Total contract consideration is ${data.currency}${data.totalAmount}. Fees are settled through verified milestone progress gates. Invoices are payable within 7 business days of issuance via bank wire or approved card rails.`,
      },
      {
        title: '3. INTELLECTUAL PROPERTY RIGHTS',
        text: 'Upon full payment for each respective milestone, all custom source code, schemas, and production assets developed specifically for the Client become the exclusive property of the Client. Feyron retains rights to standard pre-existing libraries.',
      },
      {
        title: '4. MUTUAL CONFIDENTIALITY & DATA SECURITY',
        text: 'Both parties agree to protect all confidential proprietary information, customer datasets, API credentials, and internal operational workflows. Neither party shall disclose proprietary data without written consent.',
      },
      {
        title: '5. WARRANTIES & 30-DAY DEFECT GUARANTEE',
        text: `Feyron warrants that deliverables will perform in material conformity with agreed technical specifications. Feyron provides a ${data.warrantyPeriod || '30 calendar days'} bug fix warranty following production deployment.`,
      },
    ];

    agreementClauses.forEach((cl) => {
      if (y + 16 > pageHeight - 45) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(cl.title, margin, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(70, 70, 70);
      const lines = doc.splitTextToSize(cl.text, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 4.2 + 4;
    });
  }
  // Milestones or Line items Table
  else if (data.milestones && data.milestones.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text(`DELIVERABLES ROADMAP (${data.milestones.length} PHASES)`, margin, y);
    y += 5;

    // Table Header
    doc.setFillColor(30, 30, 30);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('SPRINT & PHASE', margin + 4, y + 4.8);
    doc.text('DELIVERABLES & ENGINEERING OUTPUT', margin + 48, y + 4.8);
    doc.text('TIMELINE', margin + 126, y + 4.8);
    doc.text('BILLING', margin + 152, y + 4.8);
    y += 7;

    data.milestones.forEach((m, idx) => {
      const isAlt = idx % 2 === 1;
      const deliverablesLines = doc.splitTextToSize(m.deliverables, 74);
      const rowHeight = Math.max(12, deliverablesLines.length * 4 + 5);

      if (y + rowHeight > pageHeight - 35) {
        doc.addPage();
        y = 20;
      }

      if (isAlt) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
      }

      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

      // Sprint & Phase
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(m.sprint, margin + 4, y + 4.8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const phaseLines = doc.splitTextToSize(m.phase, 42);
      doc.text(phaseLines, margin + 4, y + 8.8);

      // Deliverables
      doc.text(deliverablesLines, margin + 48, y + 4.8);

      // Timeline & Billing
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(m.timeline, margin + 126, y + 4.8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(21, 128, 61);
      doc.text(m.billing, margin + 152, y + 4.8);

      y += rowHeight;
    });
  } else if (data.lineItems && data.lineItems.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text('COMMERCIAL ITEMS & CHARGES', margin, y);
    y += 5;

    doc.setFillColor(30, 30, 30);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('DESCRIPTION', margin + 4, y + 4.8);
    doc.text('QTY', margin + 115, y + 4.8);
    doc.text('RATE', margin + 135, y + 4.8);
    doc.text('AMOUNT', margin + 155, y + 4.8);
    y += 7;

    data.lineItems.forEach((item, idx) => {
      const isAlt = idx % 2 === 1;
      const descLines = doc.splitTextToSize(item.desc, 105);
      const rowHeight = Math.max(9, descLines.length * 4 + 4);

      if (y + rowHeight > pageHeight - 35) {
        doc.addPage();
        y = 20;
      }

      if (isAlt) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
      }

      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(descLines, margin + 4, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.text(item.qty, margin + 115, y + 5);
      doc.text(`${data.currency}${item.rate}`, margin + 135, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(`${data.currency}${item.amount}`, margin + 155, y + 5);

      y += rowHeight;
    });

    // Total Row
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(`Total Due: ${data.currency}${data.totalAmount}`, margin + contentWidth - 4, y + 4, { align: 'right' });
    y += 10;
  }

  // Warranty & Signatures Box
  if (y > pageHeight - 45) {
    doc.addPage();
    y = 20;
  } else {
    y += 8;
  }

  doc.setFillColor(250, 249, 245);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('DELIVERY WARRANTY & SLA GUARANTEE:', margin + 6, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(`Turnaround: ${data.slaTurnaround || '2 business days SLA for approvals'}`, margin + 6, y + 11);
  doc.text(`Warranty: ${data.warrantyPeriod || '30 days post-go-live bug fix warranty'}`, margin + 6, y + 16);

  // Signatory
  const sigX = margin + contentWidth * 0.58;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('AUTHORIZED SIGNATORY:', sigX, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text(data.signatoryName || 'Feyron Engineering & Operations', sigX, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(data.signatoryTitle || 'Principal Architect & Delivery Lead', sigX, y + 16);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `Feyron Official Client Document · ${data.docRef} · Page ${p} of ${totalPages} · Confidential`,
      margin,
      pageHeight - 8
    );
    doc.text('https://feyron.site · hello@feyron.site', pageWidth - margin, pageHeight - 8, {
      align: 'right',
    });
  }

  return doc;
}

export function generatePdfBase64(data: DocumentPdfData): string {
  const doc = buildFeyronPdf(data);
  const dataUri = doc.output('datauristring');
  // Strip "data:application/pdf;filename=generated.pdf;base64,"
  const commaIdx = dataUri.indexOf(',');
  return commaIdx !== -1 ? dataUri.slice(commaIdx + 1) : dataUri;
}

export function downloadPdfFile(data: DocumentPdfData, filename?: string): void {
  const doc = buildFeyronPdf(data);
  const targetName = filename || `${data.docRef}_${data.docType}.pdf`;
  doc.save(targetName);
}
