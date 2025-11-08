import type { AnalysisResult } from '../types';

interface MetricsSummaryProps {
  result: AnalysisResult;
}

export default function MetricsSummary({ result }: MetricsSummaryProps) {
  const { metrics, validation } = result;
  const totalIssues = validation.errors.length + validation.warnings.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Analysis Summary</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-600">
            {metrics.totalHeadings}
          </div>
          <div className="text-sm text-gray-600">Total Headings</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-600">
            {metrics.maxDepth}
          </div>
          <div className="text-sm text-gray-600">Max Depth</div>
        </div>
        <div
          className={`rounded-lg p-4 ${
            validation.errors.length > 0 ? 'bg-red-50' : 'bg-green-50'
          }`}
        >
          <div
            className={`text-3xl font-bold ${
              validation.errors.length > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {validation.errors.length}
          </div>
          <div className="text-sm text-gray-600">Critical Errors</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-3xl font-bold text-orange-600">
            {validation.warnings.length}
          </div>
          <div className="text-sm text-gray-600">Warnings</div>
        </div>
      </div>

      {/* Heading Distribution */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Heading Distribution</h3>
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((level) => {
            const count = metrics[`h${level}Count` as keyof typeof metrics] as number;
            return (
              <div
                key={level}
                className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200"
              >
                <div className="text-2xl font-bold text-gray-700">{count}</div>
                <div className="text-xs text-gray-500">H{level}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      {totalIssues === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <span className="text-2xl mr-3">✓</span>
          <div>
            <h4 className="font-semibold text-green-800">
              Excellent heading structure!
            </h4>
            <p className="text-sm text-green-700">
              No critical issues or warnings detected. Your heading hierarchy follows
              best practices.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <span className="text-2xl mr-3">⚠</span>
          <div>
            <h4 className="font-semibold text-yellow-800">
              Issues detected: {totalIssues}
            </h4>
            <p className="text-sm text-yellow-700">
              {validation.errors.length > 0 &&
                `${validation.errors.length} critical error${validation.errors.length !== 1 ? 's' : ''}`}
              {validation.errors.length > 0 && validation.warnings.length > 0 && ' and '}
              {validation.warnings.length > 0 &&
                `${validation.warnings.length} warning${validation.warnings.length !== 1 ? 's' : ''}`}{' '}
              found. Review the details below.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
