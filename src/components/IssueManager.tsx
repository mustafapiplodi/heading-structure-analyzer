import { useState, useMemo } from 'react';
import type { Issue } from '../types';
import IssueCard from './IssueCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Search,
  SortAsc,
  SortDesc,
  Filter,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronUp
} from 'lucide-react';

interface IssueManagerProps {
  errors: Issue[];
  warnings: Issue[];
  info: Issue[];
}

type SortBy = 'severity' | 'type' | 'default';
type SortOrder = 'asc' | 'desc';
type GroupBy = 'none' | 'severity' | 'type';

export default function IssueManager({ errors, warnings, info }: IssueManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [groupBy, setGroupBy] = useState<GroupBy>('severity');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['critical', 'warning', 'info']));

  // Combine all issues with severity labels
  const allIssues = useMemo(() => {
    return [
      ...errors.map(e => ({ ...e, severity: 'critical' as const })),
      ...warnings.map(w => ({ ...w, severity: 'warning' as const })),
      ...info.map(i => ({ ...i, severity: 'info' as const }))
    ];
  }, [errors, warnings, info]);

  // Filter issues by search query
  const filteredIssues = useMemo(() => {
    if (!searchQuery) return allIssues;

    const query = searchQuery.toLowerCase();
    return allIssues.filter(issue =>
      issue.message.toLowerCase().includes(query) ||
      issue.type.toLowerCase().includes(query) ||
      issue.recommendation?.toLowerCase().includes(query)
    );
  }, [allIssues, searchQuery]);

  // Sort issues
  const sortedIssues = useMemo(() => {
    const issues = [...filteredIssues];

    if (sortBy === 'default') return issues;

    const severityOrder = { critical: 3, warning: 2, info: 1 };

    issues.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'severity') {
        comparison = severityOrder[a.severity] - severityOrder[b.severity];
      } else if (sortBy === 'type') {
        comparison = a.type.localeCompare(b.type);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return issues;
  }, [filteredIssues, sortBy, sortOrder]);

  // Group issues
  const groupedIssues = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Issues': sortedIssues };
    }

    const groups: Record<string, Issue[]> = {};

    sortedIssues.forEach(issue => {
      const key = groupBy === 'severity' ? issue.severity : issue.type;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(issue);
    });

    return groups;
  }, [sortedIssues, groupBy]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'warning': return 'text-orange-600 dark:text-orange-500';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      default: return '';
    }
  };

  const totalIssues = errors.length + warnings.length + info.length;
  const filteredCount = filteredIssues.length;

  if (totalIssues === 0) {
    return null;
  }

  return (
    <Card className="mb-6 animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Analysis Results
              <Badge variant="outline" className="animate-fade-in-scale">{totalIssues} issue{totalIssues !== 1 ? 's' : ''}</Badge>
            </CardTitle>
            <CardDescription>
              Review and manage detected issues with your heading structure
            </CardDescription>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 mt-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search issues by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Sort and Group Controls */}
          <div className="flex flex-wrap gap-2">
            <Select value={sortBy} onValueChange={(v: string) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Order</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="type">Issue Type</SelectItem>
              </SelectContent>
            </Select>

            {sortBy !== 'default' && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="h-10"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4 mr-2" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-2" />
                )}
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            )}

            <Select value={groupBy} onValueChange={(v: string) => setGroupBy(v as GroupBy)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="severity">By Severity</SelectItem>
                <SelectItem value="type">By Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredCount} of {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filteredCount === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No issues match your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedIssues).map(([groupName, issues]) => {
              const isExpanded = expandedGroups.has(groupName);
              const isSeverityGroup = ['critical', 'warning', 'info'].includes(groupName);

              return (
                <div key={groupName}>
                  {/* Group Header */}
                  {groupBy !== 'none' && (
                    <button
                      onClick={() => toggleGroup(groupName)}
                      className="flex items-center justify-between w-full mb-3 p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        {isSeverityGroup && <span className="transition-transform duration-300 hover:scale-110">{getSeverityIcon(groupName)}</span>}
                        <h3 className={`text-lg font-semibold transition-colors duration-200 ${isSeverityGroup ? getSeverityColor(groupName) : ''}`}>
                          {groupName === 'critical' ? 'Critical Errors' :
                           groupName === 'warning' ? 'Warnings' :
                           groupName === 'info' ? 'SEO & Accessibility Insights' :
                           groupName}
                        </h3>
                        <Badge variant="outline" className="transition-all duration-200">
                          {issues.length}
                        </Badge>
                      </div>
                      <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}>
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      </span>
                    </button>
                  )}

                  {/* Issues List */}
                  {(groupBy === 'none' || isExpanded) && (
                    <div className="space-y-3 animate-slide-down">
                      {issues.map((issue, idx) => (
                        <div key={`${groupName}-${idx}`} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}>
                          <IssueCard issue={issue} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
