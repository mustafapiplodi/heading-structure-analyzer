import { useHeadingAnalysis } from './hooks/useHeadingAnalysis';
import UrlInput from './components/UrlInput';
import MetricsSummary from './components/MetricsSummary';
import HeadingTree from './components/HeadingTree';
import IssueCard from './components/IssueCard';
import ExportButtons from './components/ExportButtons';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header/Input Section */}
        <UrlInput
          onAnalyzeHtml={analyzeFromHtml}
          onAnalyzeUrl={analyzeFromUrl}
          onAnalyzeFile={analyzeFromFile}
          isAnalyzing={isAnalyzing}
        />

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <span className="text-red-500 text-xl mr-3">✗</span>
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="max-w-6xl mx-auto mt-8">
            {/* Reset Button */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={reset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Analyze Another
              </button>
            </div>

            {/* Metrics Summary */}
            <MetricsSummary result={result} />

            {/* Export Buttons */}
            <ExportButtons result={result} />

            {/* Issues List */}
            {(result.validation.errors.length > 0 ||
              result.validation.warnings.length > 0) && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Issues Detected</h2>

                {result.validation.errors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-3">
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
                    <h3 className="text-lg font-semibold text-orange-600 mb-3">
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

            {/* Heading Tree */}
            <HeadingTree hierarchy={result.hierarchy} />

            {/* Footer Actions */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                Found {result.metrics.totalHeadings} heading
                {result.metrics.totalHeadings !== 1 ? 's' : ''} across{' '}
                {result.metrics.maxDepth} level
                {result.metrics.maxDepth !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Empty State - Show when no result and no error */}
        {!result && !error && !isAnalyzing && (
          <div className="max-w-4xl mx-auto mt-12 text-center text-gray-500">
            <svg
              className="mx-auto h-16 w-16 mb-4 text-gray-400"
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
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Ready to analyze
            </h3>
            <p className="text-sm">
              Enter HTML, a URL, or upload a file to get started
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>
            Heading Structure Analyzer - SEO & Accessibility Compliance Tool
          </p>
          <p className="mt-1 text-xs">
            Analyze heading hierarchies for better content structure and WCAG compliance
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
