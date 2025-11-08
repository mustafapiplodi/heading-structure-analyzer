import { useState } from 'react';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  levelFilter: number[];
  onLevelFilterChange: (levels: number[]) => void;
  severityFilter: string[];
  onSeverityFilterChange: (severities: string[]) => void;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
  severityFilter,
  onSeverityFilterChange,
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleLevel = (level: number) => {
    if (levelFilter.includes(level)) {
      onLevelFilterChange(levelFilter.filter((l) => l !== level));
    } else {
      onLevelFilterChange([...levelFilter, level]);
    }
  };

  const toggleSeverity = (severity: string) => {
    if (severityFilter.includes(severity)) {
      onSeverityFilterChange(severityFilter.filter((s) => s !== severity));
    } else {
      onSeverityFilterChange([...severityFilter, severity]);
    }
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onLevelFilterChange([]);
    onSeverityFilterChange([]);
  };

  const hasActiveFilters =
    searchQuery || levelFilter.length > 0 || severityFilter.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search headings..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            hasActiveFilters
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {(levelFilter.length > 0 ? 1 : 0) + (severityFilter.length > 0 ? 1 : 0)}
              </span>
            )}
          </div>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Heading Level Filter */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Heading Levels
              </h4>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={`px-3 py-1 text-sm font-medium rounded-lg border transition-colors ${
                      levelFilter.includes(level)
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    H{level}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Issue Severity</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'none', label: 'No Issues', color: 'green' },
                  { value: 'info', label: 'Info', color: 'blue' },
                  { value: 'warning', label: 'Warning', color: 'orange' },
                  { value: 'critical', label: 'Critical', color: 'red' },
                ].map((severity) => (
                  <button
                    key={severity.value}
                    onClick={() => toggleSeverity(severity.value)}
                    className={`px-3 py-1 text-sm font-medium rounded-lg border transition-colors ${
                      severityFilter.includes(severity.value)
                        ? `bg-${severity.color}-100 text-${severity.color}-800 border-${severity.color}-300`
                        : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {severity.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
