import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

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
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search headings..."
              className="pl-10"
            />
          </div>

          {/* Filter Toggle Button */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={hasActiveFilters ? 'default' : 'outline'}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {(levelFilter.length > 0 ? 1 : 0) + (severityFilter.length > 0 ? 1 : 0)}
              </Badge>
            )}
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button onClick={clearAllFilters} variant="ghost" size="sm">
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Heading Level Filter */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Heading Levels</h4>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <Button
                      key={level}
                      onClick={() => toggleLevel(level)}
                      variant={levelFilter.includes(level) ? 'default' : 'outline'}
                      size="sm"
                    >
                      H{level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Severity Filter */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Issue Severity</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'none', label: 'No Issues', variant: 'outline' as const },
                    { value: 'info', label: 'Info', variant: 'secondary' as const },
                    { value: 'warning', label: 'Warning', variant: 'outline' as const },
                    { value: 'critical', label: 'Critical', variant: 'destructive' as const },
                  ].map((severity) => (
                    <Button
                      key={severity.value}
                      onClick={() => toggleSeverity(severity.value)}
                      variant={
                        severityFilter.includes(severity.value) ? severity.variant : 'outline'
                      }
                      size="sm"
                    >
                      {severity.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
