import jsPDF from 'jspdf';
import { BulkItem } from '../types/qr';

export interface LabelSheetOptions {
  paperSize: 'a4' | 'letter';
  grid: '2x3' | '3x4' | '4x5' | '5x6';
  showLabel: boolean;
  customSubtitle: string;
  showCutLines: boolean;
}

export async function generateLabelSheetPDF(
  items: BulkItem[],
  options: LabelSheetOptions
): Promise<Blob> {
  // Filter only ready items with valid image dataUrl
  const readyItems = items.filter((i) => i.status === 'ready' && i.dataUrl);
  if (readyItems.length === 0) {
    throw new Error('No hay códigos QR listos para incluir en el PDF.');
  }

  // Paper Dimensions in mm
  const paperDimensions =
    options.paperSize === 'a4'
      ? { width: 210, height: 297 }
      : { width: 215.9, height: 279.4 }; // Letter size

  // Grid Config (cols x rows)
  let cols = 3;
  let rows = 4;
  if (options.grid === '2x3') {
    cols = 2;
    rows = 3;
  } else if (options.grid === '3x4') {
    cols = 3;
    rows = 4;
  } else if (options.grid === '4x5') {
    cols = 4;
    rows = 5;
  } else if (options.grid === '5x6') {
    cols = 5;
    rows = 6;
  }

  const itemsPerPage = cols * rows;

  // Margins & Spacing in mm
  const marginX = 12;
  const marginY = 12;
  const gapX = 4;
  const gapY = 4;

  const printableWidth = paperDimensions.width - marginX * 2;
  const printableHeight = paperDimensions.height - marginY * 2;

  const cellWidth = (printableWidth - (cols - 1) * gapX) / cols;
  const cellHeight = (printableHeight - (rows - 1) * gapY) / rows;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: options.paperSize === 'a4' ? 'a4' : 'letter',
  });

  for (let index = 0; index < readyItems.length; index++) {
    const item = readyItems[index];
    const pageIndex = Math.floor(index / itemsPerPage);
    const itemIndexOnPage = index % itemsPerPage;

    // Add new page if needed
    if (index > 0 && itemIndexOnPage === 0) {
      doc.addPage(options.paperSize === 'a4' ? 'a4' : 'letter', 'portrait');
    }

    const col = itemIndexOnPage % cols;
    const row = Math.floor(itemIndexOnPage / cols);

    const x = marginX + col * (cellWidth + gapX);
    const y = marginY + row * (cellHeight + gapY);

    // Draw Cut Lines / Dashed Border
    if (options.showCutLines) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.rect(x, y, cellWidth, cellHeight);
      doc.setLineDashPattern([], 0); // reset dash
    }

    // Header label text space
    let labelTextHeight = options.showLabel ? 6 : 0;
    let subtitleHeight = options.customSubtitle ? 5 : 0;

    // QR Image dimensions inside cell
    const maxQRHeight = cellHeight - labelTextHeight - subtitleHeight - 8;
    const maxQRWidth = cellWidth - 8;
    const qrSize = Math.min(maxQRWidth, maxQRHeight);

    const qrX = x + (cellWidth - qrSize) / 2;
    let currentY = y + 4;

    // Draw Item Label
    if (options.showLabel) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(Math.min(11, Math.max(8, cellWidth / 4)));
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(item.label, x + cellWidth / 2, currentY + 3, { align: 'center' });
      currentY += labelTextHeight;
    }

    // Add QR Image
    if (item.dataUrl) {
      doc.addImage(item.dataUrl, 'PNG', qrX, currentY, qrSize, qrSize);
      currentY += qrSize + 2;
    }

    // Draw Subtitle / Banner Footer
    if (options.customSubtitle) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(Math.min(8, Math.max(6, cellWidth / 6)));
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(options.customSubtitle, x + cellWidth / 2, currentY + 2, {
        align: 'center',
      });
    }
  }

  return doc.output('blob');
}
