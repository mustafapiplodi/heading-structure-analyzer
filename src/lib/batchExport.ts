import type { BatchJob, BatchStats } from '../types';

/**
 * Export batch results as CSV
 */
export function exportBatchToCSV(jobs: BatchJob[], stats: BatchStats): void {
  const rows: string[][] = [];

  // Header row
  rows.push([
    'URL',
    'Status',
    'Total Headings',
    'H1 Count',
    'H2 Count',
    'H3 Count',
    'H4 Count',
    'H5 Count',
    'H6 Count',
    'Max Depth',
    'Total Errors',
    'Total Warnings',
    'Error Messages',
    'Warning Messages',
  ]);

  // Data rows
  jobs.forEach((job) => {
    if (job.status === 'completed' && job.result) {
      const { metrics, validation } = job.result;

      const errorMessages = validation.errors.map((e) => e.message).join('; ');
      const warningMessages = validation.warnings.map((w) => w.message).join('; ');

      rows.push([
        job.url,
        'Completed',
        metrics.totalHeadings.toString(),
        metrics.h1Count.toString(),
        metrics.h2Count.toString(),
        metrics.h3Count.toString(),
        metrics.h4Count.toString(),
        metrics.h5Count.toString(),
        metrics.h6Count.toString(),
        metrics.maxDepth.toString(),
        validation.errors.length.toString(),
        validation.warnings.length.toString(),
        errorMessages,
        warningMessages,
      ]);
    } else if (job.status === 'failed') {
      rows.push([
        job.url,
        'Failed',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        job.error || 'Unknown error',
        '',
      ]);
    }
  });

  // Add summary row
  rows.push([]);
  rows.push(['SUMMARY']);
  rows.push(['Total Pages', stats.totalPages.toString()]);
  rows.push(['Completed Pages', stats.completedPages.toString()]);
  rows.push(['Failed Pages', stats.failedPages.toString()]);
  rows.push(['Total Headings', stats.totalHeadings.toString()]);
  rows.push(['Total Errors', stats.totalErrors.toString()]);
  rows.push(['Total Warnings', stats.totalWarnings.toString()]);
  rows.push(['Avg Headings per Page', stats.avgHeadingsPerPage.toFixed(2)]);
  rows.push(['Pages with Issues', stats.pagesWithIssues.toString()]);
  rows.push(['Pages without H1', stats.pagesWithoutH1.toString()]);
  rows.push(['Pages with Multiple H1s', stats.pagesWithMultipleH1.toString()]);

  // Convert to CSV
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          const escaped = cell.replace(/"/g, '""');
          return /[,"\n]/.test(cell) ? `"${escaped}"` : escaped;
        })
        .join(',')
    )
    .join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `batch-analysis-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export batch results as JSON
 */
export function exportBatchToJSON(jobs: BatchJob[], stats: BatchStats): void {
  const data = {
    exportedAt: new Date().toISOString(),
    summary: stats,
    results: jobs.map((job) => ({
      url: job.url,
      status: job.status,
      result: job.result
        ? {
            metrics: job.result.metrics,
            validation: {
              errors: job.result.validation.errors,
              warnings: job.result.validation.warnings,
            },
            headings: job.result.headings.map((h) => ({
              level: h.level,
              text: h.text,
              position: h.position,
            })),
          }
        : null,
      error: job.error,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    })),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `batch-analysis-${Date.now()}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
