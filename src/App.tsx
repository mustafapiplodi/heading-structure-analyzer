import { useState } from 'react';
import { useHeadingAnalysis } from './hooks/useHeadingAnalysis';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useBatchAnalysis } from './hooks/useBatchAnalysis';
import UrlInput from './components/UrlInput';
import MetricsSummary from './components/MetricsSummary';
import HeadingTree from './components/HeadingTree';
import HeadingTable from './components/HeadingTable';
import IssueCard from './components/IssueCard';
import ExportButtons from './components/ExportButtons';
import SearchFilter from './components/SearchFilter';
import ComparisonMode from './components/ComparisonMode';
import BatchInput from './components/BatchInput';
import BatchProgress from './components/BatchProgress';
import BatchResults from './components/BatchResults';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import ThemeToggle from './components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Toaster } from '@/components/ui/sonner';
import { Keyboard, List, Table as TableIcon, GitCompare, AlertCircle, FileText, ListTodo } from 'lucide-react';
import { exportBatchToCSV, exportBatchToJSON } from './lib/batchExport';
import type { AnalysisResult } from './types';

type ViewMode = 'tree' | 'table' | 'comparison' | 'batch';

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

  // Batch analysis hook
  const {
    state: batchState,
    startBatch,
    pause: pauseBatch,
    resume: resumeBatch,
    cancel: cancelBatch,
    reset: resetBatch,
    getStats,
  } = useBatchAnalysis();

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
      key: 'm',
      ctrlKey: true,
      description: 'Toggle batch mode',
      action: () => setViewMode('batch'),
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
    <div className="min-h-screen bg-background transition-colors">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Theme Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowShortcuts(true)}
              variant="ghost"
              size="sm"
              title="Keyboard shortcuts (Shift + ?)"
            >
              <Keyboard className="mr-2 h-4 w-4" />
              Shortcuts
            </Button>
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
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* View Mode Toggle */}
        {(result || viewMode === 'comparison' || viewMode === 'batch') && (
          <div className="max-w-6xl mx-auto mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {/* View Tabs */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="tree" title="Tree view (Ctrl+T)">
                    <List className="mr-2 h-4 w-4" />
                    Tree
                  </TabsTrigger>
                  <TabsTrigger value="table" title="Table view (Ctrl+B)">
                    <TableIcon className="mr-2 h-4 w-4" />
                    Table
                  </TabsTrigger>
                  <TabsTrigger value="comparison" title="Comparison mode (Ctrl+C)">
                    <GitCompare className="mr-2 h-4 w-4" />
                    Compare
                  </TabsTrigger>
                  <TabsTrigger value="batch" title="Batch mode (Ctrl+M)">
                    <ListTodo className="mr-2 h-4 w-4" />
                    Batch
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Reset Button */}
              {result && viewMode !== 'comparison' && viewMode !== 'batch' && (
                <Button
                  onClick={reset}
                  variant="outline"
                  title="Reset (Ctrl+R)"
                >
                  Analyze Another
                </Button>
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

        {/* Batch Analysis Mode */}
        {viewMode === 'batch' && (
          <div className="space-y-6">
            {batchState.totalJobs === 0 ? (
              <BatchInput
                onStartBatch={startBatch}
                isProcessing={batchState.isRunning}
              />
            ) : (
              <>
                <BatchProgress
                  state={batchState}
                  onPause={pauseBatch}
                  onResume={resumeBatch}
                  onCancel={cancelBatch}
                />
                {(batchState.completedJobs > 0 || batchState.failedJobs > 0) && (
                  <BatchResults
                    jobs={batchState.jobs}
                    stats={getStats()}
                    onExportCSV={() => exportBatchToCSV(batchState.jobs, getStats())}
                    onExportJSON={() => exportBatchToJSON(batchState.jobs, getStats())}
                  />
                )}
                {!batchState.isRunning && !batchState.isPaused && (
                  <div className="flex justify-center">
                    <Button onClick={resetBatch} variant="outline">
                      Start New Batch Analysis
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Results Section */}
        {result && viewMode !== 'comparison' && viewMode !== 'batch' && (
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
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Issues Detected
                  </h2>

                  {result.validation.errors.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-destructive mb-3">
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
                      <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-500 mb-3">
                        Warnings ({result.validation.warnings.length})
                      </h3>
                      <div className="space-y-3">
                        {result.validation.warnings.map((warning, idx) => (
                          <IssueCard key={idx} issue={warning} />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
        {!result && !error && !isAnalyzing && viewMode !== 'comparison' && viewMode !== 'batch' && (
          <div className="max-w-4xl mx-auto mt-12">
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <FileText className="mx-auto h-16 w-16 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Ready to analyze
                </h3>
                <p className="text-sm text-muted-foreground">Enter HTML, a URL, or upload a file to get started</p>
                <p className="text-xs text-muted-foreground mt-2">Press Shift + ? to see keyboard shortcuts</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
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

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

export default App;
