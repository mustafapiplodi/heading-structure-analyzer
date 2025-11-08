import type { AnalysisResult } from '../types';
import jsPDF from 'jspdf';

/**
 * Export analysis results to JSON
 */
export function exportToJson(result: AnalysisResult): void {
  const dataStr = JSON.stringify(result, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `heading-analysis-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export analysis results to CSV
 */
export function exportToCsv(result: AnalysisResult): void {
  const headers = ['Level', 'Text', 'Issues', 'Severity'];
  const rows: string[][] = [];

  function traverseHierarchy(node: any, depth = 0) {
    if (node.level > 0) {
      const issues = node.issues.map((i: any) => i.message).join('; ') || 'None';
      const severity = node.issues.length > 0
        ? node.issues.map((i: any) => i.severity).join(', ')
        : 'OK';

      rows.push([
        `H${node.level}`,
        node.text.replace(/"/g, '""'), // Escape quotes
        issues.replace(/"/g, '""'),
        severity,
      ]);
    }

    if (node.items) {
      node.items.forEach((child: any) => traverseHierarchy(child, depth + 1));
    }
  }

  traverseHierarchy(result.hierarchy);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `heading-analysis-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export analysis results to PDF
 */
export function exportToPdf(result: AnalysisResult): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Heading Structure Analysis Report', pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 15;

  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 15;

  // Summary Section
  doc.setFontSize(14);
  doc.text('Summary', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const summaryLines = [
    `Total Headings: ${result.metrics.totalHeadings}`,
    `H1: ${result.metrics.h1Count} | H2: ${result.metrics.h2Count} | H3: ${result.metrics.h3Count}`,
    `H4: ${result.metrics.h4Count} | H5: ${result.metrics.h5Count} | H6: ${result.metrics.h6Count}`,
    `Maximum Depth: ${result.metrics.maxDepth}`,
    `Critical Errors: ${result.validation.errors.length}`,
    `Warnings: ${result.validation.warnings.length}`,
  ];

  summaryLines.forEach((line) => {
    doc.text(line, 15, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Issues Section
  if (result.validation.errors.length > 0) {
    doc.setFontSize(14);
    doc.text('Critical Errors', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    result.validation.errors.forEach((error, idx) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. ${error.message}`, 15, yPosition);
      yPosition += 6;

      if (error.recommendation) {
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(`Fix: ${error.recommendation}`, pageWidth - 30);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 4;
      }
    });

    yPosition += 10;
  }

  if (result.validation.warnings.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text('Warnings', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    result.validation.warnings.forEach((warning, idx) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. ${warning.message}`, 15, yPosition);
      yPosition += 6;

      if (warning.recommendation) {
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(`Fix: ${warning.recommendation}`, pageWidth - 30);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 4;
      }
    });
  }

  // Save PDF
  doc.save(`heading-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
}
