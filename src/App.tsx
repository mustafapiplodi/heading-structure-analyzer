import { useState } from 'react';
import { useHeadingAnalysis } from './hooks/useHeadingAnalysis';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import UrlInput from './components/UrlInput';
import MetricsSummary from './components/MetricsSummary';
import HeadingTree from './components/HeadingTree';
import HeadingTable from './components/HeadingTable';
import IssueCard from './components/IssueCard';
import ExportButtons from './components/ExportButtons';
import SearchFilter from './components/SearchFilter';
import ComparisonMode from './components/ComparisonMode';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import ThemeToggle from './components/ThemeToggle';
import type { AnalysisResult } from './types';

type ViewMode = 'tree' | 'table' | 'comparison';

function App() {
  const {
    result,
    error,
    isAnalyzing,
    analyzeFromHtml,
    analyzeFromUrl,
    analyzeFromFile,
    reset,
  } = useHeadingAnalysis();

  // View and filter states
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Comparison mode states
  const [comparisonResults, setComparisonResults] = useState<
    [AnalysisResult | null, AnalysisResult | null]
  >([null, null]);

  // Keyboard shortcuts
  const shortcuts = [
    {
      key: 't',
      ctrlKey: true,
      description: 'Toggle tree view',
      action: () => setViewMode('tree'),
    },
    {
      key: 'b',
      ctrlKey: true,
      description: 'Toggle table view',
      action: () => setViewMode('table'),
    },
    {
      key: 'c',
      ctrlKey: true,
      description: 'Toggle comparison mode',
      action: () => setViewMode('comparison'),
    },
    {
      key: 'f',
      ctrlKey: true,
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      },
    },
    {
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcuts(true),
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Reset analysis',
      action: () => {
        reset();
        setComparisonResults([null, null]);
        setSearchQuery('');
        setLevelFilter([]);
        setSeverityFilter([]);
      },
    },
  ];

  useKeyboardShortcuts(shortcuts, !showShortcuts);

  const handleComparisonAnalyze = (index: 0 | 1, html: string) => {
    // Create a temporary analysis
    const tempAnalysis = {
      analyzeFromHtml: async (html: string) => {
        // This is a workaround - ideally we'd have a separate hook
        const { extractHeadings } = await import('./lib/extractHeadings');
        const { buildHeadingHierarchy, countHeadingsByLevel, calculateMaxDepth } = await import(
          './lib/buildHierarchy'
        );
        const { validateHeadingStructure } = await import('./lib/validateStructure');

        const headings = extractHeadings('body', html);
        const hierarchy = buildHeadingHierarchy(headings);
        const validation = validateHeadingStructure(headings);
        const counts = countHeadingsByLevel(headings);
        const maxDepth = calculateMaxDepth(hierarchy);

        return {
          headings,
          hierarchy,
          validation,
          metrics: {
            totalHeadings: headings.length,
            h1Count: counts.h1,
            h2Count: counts.h2,
            h3Count: counts.h3,
            h4Count: counts.h4,
            h5Count: counts.h5,
            h6Count: counts.h6,
            maxDepth,
          },
        };
      },
    };

    tempAnalysis.analyzeFromHtml(html).then((result) => {
      const newResults: [AnalysisResult | null, AnalysisResult | null] = [...comparisonResults];
      newResults[index] = result;
      setComparisonResults(newResults);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Theme Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShortcuts(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
              title="Keyboard shortcuts (Shift + ?)"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Shortcuts
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Input Section */}
        <UrlInput
          onAnalyzeHtml={analyzeFromHtml}
          onAnalyzeUrl={analyzeFromUrl}
          onAnalyzeFile={analyzeFromFile}
          isAnalyzing={isAnalyzing}
        />

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <span className="text-red-500 text-xl mr-3">✗</span>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
                  <p className="text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        {(result || viewMode === 'comparison') && (
          <div className="max-w-6xl mx-auto mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {/* View Tabs */}
              <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    viewMode === 'tree'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Tree view (Ctrl+T)"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                    Tree
                  </span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Table view (Ctrl+B)"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Table
                  </span>
                </button>
                <button
                  onClick={() => setViewMode('comparison')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    viewMode === 'comparison'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Comparison mode (Ctrl+C)"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Compare
                  </span>
                </button>
              </div>

              {/* Reset Button */}
              {result && viewMode !== 'comparison' && (
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="Reset (Ctrl+R)"
                >
                  Analyze Another
                </button>
              )}
            </div>
          </div>
        )}

        {/* Comparison Mode */}
        {viewMode === 'comparison' && (
          <div className="max-w-7xl mx-auto">
            <ComparisonMode results={comparisonResults} onAnalyze={handleComparisonAnalyze} />
          </div>
        )}

        {/* Results Section */}
        {result && viewMode !== 'comparison' && (
          <div className="max-w-6xl mx-auto">
            {/* Metrics Summary */}
            <MetricsSummary result={result} />

            {/* Export Buttons */}
            <ExportButtons result={result} />

            {/* Search and Filter (for table view) */}
            {(viewMode === 'table' || searchQuery || levelFilter.length > 0 || severityFilter.length > 0) && (
              <SearchFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                levelFilter={levelFilter}
                onLevelFilterChange={setLevelFilter}
                severityFilter={severityFilter}
                onSeverityFilterChange={setSeverityFilter}
              />
            )}

            {/* Issues List */}
            {(result.validation.errors.length > 0 || result.validation.warnings.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Issues Detected
                </h2>

                {result.validation.errors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
                      Critical Errors ({result.validation.errors.length})
                    </h3>
                    <div className="space-y-3">
                      {result.validation.errors.map((error, idx) => (
                        <IssueCard key={idx} issue={error} />
                      ))}
                    </div>
                  </div>
                )}

                {result.validation.warnings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3">
                      Warnings ({result.validation.warnings.length})
                    </h3>
                    <div className="space-y-3">
                      {result.validation.warnings.map((warning, idx) => (
                        <IssueCard key={idx} issue={warning} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Heading Visualization */}
            {viewMode === 'tree' ? (
              <HeadingTree hierarchy={result.hierarchy} />
            ) : (
              <HeadingTable
                result={result}
                searchQuery={searchQuery}
                levelFilter={levelFilter}
                severityFilter={severityFilter}
              />
            )}

            {/* Footer Actions */}
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                Found {result.metrics.totalHeadings} heading
                {result.metrics.totalHeadings !== 1 ? 's' : ''} across {result.metrics.maxDepth}{' '}
                level{result.metrics.maxDepth !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !error && !isAnalyzing && viewMode !== 'comparison' && (
          <div className="max-w-4xl mx-auto mt-12 text-center text-gray-500 dark:text-gray-400">
            <svg
              className="mx-auto h-16 w-16 mb-4 text-gray-400 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ready to analyze
            </h3>
            <p className="text-sm">Enter HTML, a URL, or upload a file to get started</p>
            <p className="text-xs mt-2">Press Shift + ? to see keyboard shortcuts</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Heading Structure Analyzer - SEO & Accessibility Compliance Tool</p>
          <p className="mt-1 text-xs">
            Analyze heading hierarchies for better content structure and WCAG compliance
          </p>
        </div>
      </footer>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsHelp
        shortcuts={shortcuts}
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

export default App;
