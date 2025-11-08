import { useState } from 'react';
import type { AnalysisResult } from '../types';
import MetricsSummary from './MetricsSummary';
import HeadingTree from './HeadingTree';

interface ComparisonModeProps {
  results: [AnalysisResult | null, AnalysisResult | null];
  onAnalyze: (index: 0 | 1, html: string) => void;
}

export default function ComparisonMode({ results, onAnalyze }: ComparisonModeProps) {
  const [htmlInputs, setHtmlInputs] = useState<[string, string]>(['', '']);

  const handleAnalyze = (index: 0 | 1) => {
    if (htmlInputs[index].trim()) {
      onAnalyze(index, htmlInputs[index]);
    }
  };

  const ComparisonPanel = ({ index }: { index: 0 | 1 }) => {
    const result = results[index];
    const title = index === 0 ? 'Before' : 'After';

    return (
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-bold mb-3">{title} Version</h3>

          {!result ? (
            <div>
              <textarea
                value={htmlInputs[index]}
                onChange={(e) => {
                  const newInputs: [string, string] = [...htmlInputs] as [string, string];
                  newInputs[index] = e.target.value;
                  setHtmlInputs(newInputs);
                }}
                placeholder={`Paste ${title.toLowerCase()} HTML here...`}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => handleAnalyze(index)}
                disabled={!htmlInputs[index].trim()}
                className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Analyze {title}
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  const newResults = [...results] as [
                    AnalysisResult | null,
                    AnalysisResult | null
                  ];
                  newResults[index] = null;
                  const newInputs: [string, string] = [...htmlInputs] as [string, string];
                  newInputs[index] = '';
                  setHtmlInputs(newInputs);
                }}
                className="mb-3 text-sm text-blue-600 hover:text-blue-800"
              >
                ← Change {title} HTML
              </button>
              <MetricsSummary result={result} />
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-4">
            <HeadingTree hierarchy={result.hierarchy} />
          </div>
        )}
      </div>
    );
  };

  // Comparison Summary
  const ComparisonSummary = () => {
    if (!results[0] || !results[1]) return null;

    const before = results[0].metrics;
    const after = results[1].metrics;

    const changes = {
      totalHeadings: after.totalHeadings - before.totalHeadings,
      h1Count: after.h1Count - before.h1Count,
      h2Count: after.h2Count - before.h2Count,
      h3Count: after.h3Count - before.h3Count,
      h4Count: after.h4Count - before.h4Count,
      h5Count: after.h5Count - before.h5Count,
      h6Count: after.h6Count - before.h6Count,
      errors: results[1].validation.errors.length - results[0].validation.errors.length,
      warnings:
        results[1].validation.warnings.length - results[0].validation.warnings.length,
    };

    const ChangeIndicator = ({ value }: { value: number }) => {
      if (value === 0)
        return <span className="text-gray-500 text-sm">No change</span>;
      if (value > 0)
        return (
          <span className="text-green-600 text-sm font-medium">
            +{value} ↑
          </span>
        );
      return (
        <span className="text-red-600 text-sm font-medium">
          {value} ↓
        </span>
      );
    };

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">📊 Comparison Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Total Headings</div>
            <ChangeIndicator value={changes.totalHeadings} />
          </div>

          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Critical Errors</div>
            <ChangeIndicator value={changes.errors} />
          </div>

          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Warnings</div>
            <ChangeIndicator value={changes.warnings} />
          </div>

          {[1, 2, 3, 4, 5, 6].map((level) => (
            <div key={level} className="bg-white rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">H{level} Count</div>
              <ChangeIndicator
                value={changes[`h${level}Count` as keyof typeof changes] as number}
              />
            </div>
          ))}
        </div>

        {changes.errors < 0 && changes.warnings < 0 && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ Great! You've improved the heading structure by reducing issues.
            </p>
          </div>
        )}

        {(changes.errors > 0 || changes.warnings > 0) && (
          <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
            <p className="text-orange-800 font-medium">
              ⚠ Warning: The changes introduced new issues. Review the after version.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <ComparisonSummary />

      <div className="flex flex-col lg:flex-row gap-6">
        <ComparisonPanel index={0} />
        <ComparisonPanel index={1} />
      </div>
    </div>
  );
}
