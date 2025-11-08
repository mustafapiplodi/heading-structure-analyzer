import { useState, useMemo } from 'react';
import type { AnalysisResult, HeadingNode } from '../types';
import IssueCard from './IssueCard';
import { getSeverityIcon } from '../lib/validateStructure';

interface HeadingTableProps {
  result: AnalysisResult;
  searchQuery?: string;
  levelFilter?: number[];
  severityFilter?: string[];
}

type SortField = 'position' | 'level' | 'text' | 'issues';
type SortDirection = 'asc' | 'desc';

interface FlatHeading {
  position: number;
  level: number;
  text: string;
  html: string;
  issues: HeadingNode['issues'];
  issueCount: number;
  maxSeverity: 'none' | 'info' | 'warning' | 'critical';
}

export default function HeadingTable({
  result,
  searchQuery = '',
  levelFilter = [],
  severityFilter = [],
}: HeadingTableProps) {
  const [sortField, setSortField] = useState<SortField>('position');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Flatten hierarchy to table rows
  const flattenedHeadings = useMemo(() => {
    const flattened: FlatHeading[] = [];
    let position = 0;

    function traverse(node: HeadingNode) {
      if (node.level > 0) {
        const maxSeverity =
          node.issues.length === 0
            ? 'none'
            : node.issues.some((i) => i.severity === 'critical')
            ? 'critical'
            : node.issues.some((i) => i.severity === 'warning')
            ? 'warning'
            : 'info';

        flattened.push({
          position: position++,
          level: node.level,
          text: node.text,
          html: node.html,
          issues: node.issues,
          issueCount: node.issues.length,
          maxSeverity,
        });
      }
      node.items.forEach(traverse);
    }

    traverse(result.hierarchy);
    return flattened;
  }, [result.hierarchy]);

  // Filter and sort headings
  const filteredAndSortedHeadings = useMemo(() => {
    let filtered = flattenedHeadings;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((h) => h.text.toLowerCase().includes(query));
    }

    // Apply level filter
    if (levelFilter.length > 0) {
      filtered = filtered.filter((h) => levelFilter.includes(h.level));
    }

    // Apply severity filter
    if (severityFilter.length > 0) {
      filtered = filtered.filter((h) => {
        if (severityFilter.includes('none') && h.maxSeverity === 'none') return true;
        if (severityFilter.includes('critical') && h.maxSeverity === 'critical')
          return true;
        if (severityFilter.includes('warning') && h.maxSeverity === 'warning')
          return true;
        if (severityFilter.includes('info') && h.maxSeverity === 'info') return true;
        return false;
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'position':
          comparison = a.position - b.position;
          break;
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'text':
          comparison = a.text.localeCompare(b.text);
          break;
        case 'issues':
          comparison = a.issueCount - b.issueCount;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [flattenedHeadings, searchQuery, levelFilter, severityFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRowExpansion = (position: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(position)) {
      newExpanded.delete(position);
    } else {
      newExpanded.add(position);
    }
    setExpandedRows(newExpanded);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  const getLevelBadgeColor = (level: number) => {
    const colors = [
      '',
      'bg-red-100 text-red-800 border-red-300',
      'bg-blue-100 text-blue-800 border-blue-300',
      'bg-green-100 text-green-800 border-green-300',
      'bg-yellow-100 text-yellow-800 border-yellow-300',
      'bg-purple-100 text-purple-800 border-purple-300',
      'bg-teal-100 text-teal-800 border-teal-300',
    ];
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getSeverityBadgeColor = (severity: FlatHeading['maxSeverity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('level')}
              >
                <div className="flex items-center gap-2">
                  Level <SortIcon field="level" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('text')}
              >
                <div className="flex items-center gap-2">
                  Text <SortIcon field="text" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('issues')}
              >
                <div className="flex items-center gap-2">
                  Issues <SortIcon field="issues" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedHeadings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No headings match the current filters
                </td>
              </tr>
            ) : (
              filteredAndSortedHeadings.map((heading) => (
                <>
                  <tr
                    key={heading.position}
                    className={`hover:bg-gray-50 ${
                      heading.issueCount > 0 ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {heading.position + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold border rounded ${getLevelBadgeColor(
                          heading.level
                        )}`}
                      >
                        H{heading.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 break-words max-w-md">
                        {heading.text}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {heading.issueCount > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border rounded ${getSeverityBadgeColor(
                            heading.maxSeverity
                          )}`}
                        >
                          {getSeverityIcon(
                            heading.maxSeverity === 'none' ? 'info' : heading.maxSeverity
                          )}{' '}
                          {heading.issueCount} issue{heading.issueCount !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 border border-green-300 rounded">
                          ✓ No issues
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRowExpansion(heading.position)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {expandedRows.has(heading.position) ? 'Hide Details' : 'Show Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(heading.position) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 bg-gray-50">
                        <div className="space-y-3">
                          {/* HTML Code */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">
                              HTML Code:
                            </h4>
                            <pre className="p-3 bg-white rounded border border-gray-200 text-xs overflow-x-auto">
                              <code>{heading.html}</code>
                            </pre>
                          </div>

                          {/* Issues */}
                          {heading.issues.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-2">
                                Issues:
                              </h4>
                              <div className="space-y-2">
                                {heading.issues.map((issue, idx) => (
                                  <IssueCard key={idx} issue={issue} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        Showing {filteredAndSortedHeadings.length} of {flattenedHeadings.length} headings
      </div>
    </div>
  );
}
