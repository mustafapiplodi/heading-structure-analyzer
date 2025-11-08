import { useState } from 'react';
import { useHeadingAnalysis } from './hooks/useHeadingAnalysis';
import { useBatchAnalysis } from './hooks/useBatchAnalysis';
import Header from './components/Header';
import Breadcrumbs from './components/Breadcrumbs';
import UrlInput from './components/UrlInput';
import MetricsSummary from './components/MetricsSummary';
import MetricsCharts from './components/MetricsCharts';
import HeadingTree from './components/HeadingTree';
import HeadingTable from './components/HeadingTable';
import IssueManager from './components/IssueManager';
import ExportButtons from './components/ExportButtons';
import SearchFilter from './components/SearchFilter';
import ComparisonMode from './components/ComparisonMode';
import BatchInput from './components/BatchInput';
import BatchProgress from './components/BatchProgress';
import BatchResults from './components/BatchResults';
import AnalysisSkeleton from './components/AnalysisSkeleton';
import AboutSection from './components/AboutSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Toaster } from '@/components/ui/sonner';
import { List, Table as TableIcon, GitCompare, AlertCircle, FileText, ListTodo } from 'lucide-react';
import { exportBatchToCSV, exportBatchToJSON } from './lib/batchExport';
import type { AnalysisResult } from './types';

type MainMode = 'analyze' | 'comparison' | 'batch';
type VisualizationMode = 'tree' | 'table';

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

  // Mode and filter states
  const [mainMode, setMainMode] = useState<MainMode>('analyze');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);

  // Comparison mode states
  const [comparisonResults, setComparisonResults] = useState<
    [AnalysisResult | null, AnalysisResult | null]
  >([null, null]);

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
      {/* Header */}
      <Header />

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs />
        {/* Main Mode Navigation */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Analyze Card */}
              <button
                onClick={() => setMainMode('analyze')}
                className={`group relative p-6 rounded-lg border-2 transition-all ${
                  mainMode === 'analyze'
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-full ${
                    mainMode === 'analyze' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10'
                  }`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">Analyze</h3>
                  <p className="text-sm text-muted-foreground">
                    Check heading structure from HTML, URL, or file
                  </p>
                </div>
              </button>

              {/* Compare Card */}
              <button
                onClick={() => setMainMode('comparison')}
                className={`group relative p-6 rounded-lg border-2 transition-all ${
                  mainMode === 'comparison'
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-full ${
                    mainMode === 'comparison' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10'
                  }`}>
                    <GitCompare className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">Compare</h3>
                  <p className="text-sm text-muted-foreground">
                    Compare two documents side by side
                  </p>
                </div>
              </button>

              {/* Batch Card */}
              <button
                onClick={() => setMainMode('batch')}
                className={`group relative p-6 rounded-lg border-2 transition-all ${
                  mainMode === 'batch'
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-full ${
                    mainMode === 'batch' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10'
                  }`}>
                    <ListTodo className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">Batch</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze multiple URLs at once
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Analyze Mode - Input Section */}
        {mainMode === 'analyze' && (
          <>
            {/* Show collapsed summary if results exist, otherwise show full input */}
            {result ? (
              <div className="max-w-4xl mx-auto mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Analysis Complete</p>
                          <p className="text-xs text-muted-foreground">
                            {result.metrics.totalHeadings} headings found across {result.metrics.maxDepth} levels
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={reset}
                        variant="outline"
                        size="sm"
                      >
                        New Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <UrlInput
                onAnalyzeHtml={analyzeFromHtml}
                onAnalyzeUrl={analyzeFromUrl}
                onAnalyzeFile={analyzeFromFile}
                isAnalyzing={isAnalyzing}
                hasResults={!!result}
                onReset={reset}
              />
            )}

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
          </>
        )}

        {/* Comparison Mode */}
        {mainMode === 'comparison' && (
          <div className="max-w-7xl mx-auto">
            <ComparisonMode results={comparisonResults} onAnalyze={handleComparisonAnalyze} />
          </div>
        )}

        {/* Batch Analysis Mode */}
        {mainMode === 'batch' && (
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
        {result && mainMode === 'analyze' && (
          <div className="max-w-6xl mx-auto">
            {/* Metrics Summary */}
            <MetricsSummary result={result} />

            {/* Visual Charts */}
            <MetricsCharts result={result} />

            {/* Search and Filter (for table view) */}
            {(visualizationMode === 'table' || searchQuery || levelFilter.length > 0 || severityFilter.length > 0) && (
              <SearchFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                levelFilter={levelFilter}
                onLevelFilterChange={setLevelFilter}
                severityFilter={severityFilter}
                onSeverityFilterChange={setSeverityFilter}
              />
            )}

            {/* Issues Management */}
            <IssueManager
              errors={result.validation.errors}
              warnings={result.validation.warnings}
              info={result.validation.info || []}
            />

            {/* Visualization Mode Tabs */}
            <div className="mt-8 mb-4">
              <Tabs value={visualizationMode} onValueChange={(v) => setVisualizationMode(v as VisualizationMode)}>
                <TabsList>
                  <TabsTrigger value="tree" title="Tree view (Ctrl+T)">
                    <List className="mr-2 h-4 w-4" />
                    Tree
                  </TabsTrigger>
                  <TabsTrigger value="table" title="Table view (Ctrl+B)">
                    <TableIcon className="mr-2 h-4 w-4" />
                    Table
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Heading Visualization */}
            {visualizationMode === 'tree' ? (
              <HeadingTree hierarchy={result.hierarchy} />
            ) : (
              <HeadingTable
                result={result}
                searchQuery={searchQuery}
                levelFilter={levelFilter}
                severityFilter={severityFilter}
              />
            )}

            {/* Export Buttons - Moved Below Visualization */}
            <div className="mt-8">
              <ExportButtons result={result} />
            </div>

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

        {/* Loading Skeleton */}
        {isAnalyzing && !result && (
          <AnalysisSkeleton />
        )}

        {/* Empty State */}
        {!result && !error && !isAnalyzing && mainMode === 'analyze' && (
          <div className="max-w-4xl mx-auto mt-12">
            <Card className="animate-fade-in">
              <CardContent className="pt-12 pb-12 text-center">
                <FileText className="mx-auto h-16 w-16 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Ready to analyze your heading structure
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Paste HTML, enter a URL, or upload a file to get instant SEO and accessibility insights
                </p>

                {/* Try Sample Button */}
                <div className="mb-6">
                  <Button
                    onClick={() => {
                      const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Sample Page</title>
</head>
<body>
    <h1>Main Page Title</h1>
    <p>Introduction paragraph</p>

    <h2>First Section</h2>
    <p>Content for first section</p>

    <h3>Subsection A</h3>
    <p>Details about subsection A</p>

    <h3>Subsection B</h3>
    <p>Details about subsection B</p>

    <h2>Second Section</h2>
    <h4>This skips H3 - an error!</h4>
    <p>This will trigger a validation error</p>

    <h2>Third Section</h2>
    <h3>Proper nesting here</h3>
    <p>More content</p>
</body>
</html>`;
                      analyzeFromHtml(sampleHTML);
                    }}
                    size="lg"
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Try Sample Analysis
                  </Button>
                </div>

                <div className="flex flex-col gap-2 text-xs text-muted-foreground max-w-md mx-auto">
                  <p className="flex items-center justify-center gap-2">
                    <span>💡</span>
                    Analyzes heading hierarchy (H1-H6) for WCAG compliance
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span>🔍</span>
                    Detects SEO issues and provides actionable recommendations
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <Toaster />

      {/* About Section - Only show when no results */}
      {!result && mainMode === 'analyze' && !isAnalyzing && (
        <AboutSection />
      )}

      {/* FAQ Section - Only show when no results */}
      {!result && mainMode === 'analyze' && !isAnalyzing && (
        <FAQSection />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
