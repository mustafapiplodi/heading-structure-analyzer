import { useState, useMemo } from 'react';
import type { AnalysisResult, Heading, Issue } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IssueCard from './IssueCard';

interface HeadingTableProps {
  result: AnalysisResult;
  searchQuery: string;
  levelFilter: number[];
  severityFilter: string[];
}

type SortField = 'position' | 'level' | 'text' | 'issues';
type SortDirection = 'asc' | 'desc';

interface HeadingWithIssues extends Heading {
  issues: Issue[];
}

export default function HeadingTable({
  result,
  searchQuery,
  levelFilter,
  severityFilter,
}: HeadingTableProps) {
  const [sortField, setSortField] = useState<SortField>('position');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Get issues for each heading from the hierarchy
  const getIssuesForHeading = (heading: Heading): Issue[] => {
    const issues: Issue[] = [];

    const findNode = (node: any, pos: number): Issue[] => {
      if (node.position === pos) {
        return node.issues || [];
      }
      for (const child of node.items || []) {
        const found = findNode(child, pos);
        if (found.length > 0) return found;
      }
      return [];
    };

    // Also check global validation errors/warnings for this heading
    const allIssues = [
      ...result.validation.errors,
      ...result.validation.warnings,
    ];

    // Match issues to heading by text or position
    allIssues.forEach((issue) => {
      if (
        issue.message.includes(heading.text) ||
        issue.message.includes(`H${heading.level}`)
      ) {
        issues.push(issue);
      }
    });

    return issues;
  };

  // Enrich headings with their issues
  const headingsWithIssues: HeadingWithIssues[] = useMemo(() => {
    return result.headings.map((heading) => ({
      ...heading,
      issues: getIssuesForHeading(heading),
    }));
  }, [result]);

  // Filter headings
  const filteredHeadings = useMemo(() => {
    let filtered = headingsWithIssues;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((h) =>
        h.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Level filter
    if (levelFilter.length > 0) {
      filtered = filtered.filter((h) => levelFilter.includes(h.level));
    }

    // Severity filter
    if (severityFilter.length > 0) {
      filtered = filtered.filter((h) => {
        if (severityFilter.includes('none') && h.issues.length === 0) {
          return true;
        }
        return h.issues.some((issue) =>
          severityFilter.includes(issue.severity)
        );
      });
    }

    return filtered;
  }, [headingsWithIssues, searchQuery, levelFilter, severityFilter]);

  // Sort headings
  const sortedHeadings = useMemo(() => {
    const sorted = [...filteredHeadings];

    sorted.sort((a, b) => {
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
          comparison = a.issues.length - b.issues.length;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredHeadings, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  const getLevelColor = (level: number) => {
    const colors = [
      '',
      'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-900 dark:text-red-300',
      'bg-blue-100 dark:bg-blue-950 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-300',
      'bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800 text-green-900 dark:text-green-300',
      'bg-yellow-100 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-800 text-yellow-900 dark:text-yellow-300',
      'bg-purple-100 dark:bg-purple-950 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-300',
      'bg-teal-100 dark:bg-teal-950 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-300',
    ];
    return colors[level] || 'bg-gray-100 border-gray-300 text-gray-900';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Headings Table
          {filteredHeadings.length !== result.headings.length && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredHeadings.length} of {result.headings.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('position')}
                  className="h-8 px-2"
                >
                  #
                  <SortIcon field="position" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('level')}
                  className="h-8 px-2"
                >
                  Level
                  <SortIcon field="level" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('text')}
                  className="h-8 px-2"
                >
                  Text
                  <SortIcon field="text" />
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('issues')}
                  className="h-8 px-2"
                >
                  Issues
                  <SortIcon field="issues" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHeadings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No headings found matching the current filters.
                </TableCell>
              </TableRow>
            ) : (
              sortedHeadings.map((heading, index) => (
                <TableRow key={`${heading.position}-${index}`}>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {heading.position}
                  </TableCell>
                  <TableCell>
                    <Badge className={getLevelColor(heading.level)}>
                      H{heading.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{heading.text}</div>
                      {heading.issues.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {heading.issues.map((issue, idx) => (
                            <IssueCard
                              key={idx}
                              issue={issue}
                              html={heading.html}
                              text={heading.text}
                            />
                          ))}
                        </div>
                      )}
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          View HTML
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          <code>{heading.html}</code>
                        </pre>
                      </details>
                    </div>
                  </TableCell>
                  <TableCell>
                    {heading.issues.length > 0 ? (
                      <Badge variant="destructive">
                        {heading.issues.length}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-300">
                        None
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
