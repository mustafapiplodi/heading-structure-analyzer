import { useState, useMemo } from 'react';
import type { HeadingNode } from '../types';
import IssueCard from './IssueCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, ChevronsDown, ChevronsRight, Search, X } from 'lucide-react';

interface HeadingTreeProps {
  hierarchy: HeadingNode;
}

interface TreeNodeProps {
  node: HeadingNode;
  depth?: number;
  expandAll?: boolean;
  searchQuery?: string;
}

function TreeNode({ node, depth = 0, expandAll = false, searchQuery = '' }: TreeNodeProps) {
  const [isManuallyExpanded, setIsManuallyExpanded] = useState<boolean | null>(null);

  // Use manual state if set, otherwise use expandAll prop or default behavior
  const isExpanded = isManuallyExpanded !== null
    ? isManuallyExpanded
    : expandAll || depth < 2;

  const handleToggle = () => {
    setIsManuallyExpanded(!isExpanded);
  };

  // Filter based on search query
  const matchesSearch = searchQuery === '' ||
    node.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.html.toLowerCase().includes(searchQuery.toLowerCase());

  if ((node.level as number) === 0) {
    return (
      <div>
        {node.items.map((child, index) => (
          <TreeNode
            key={`${child.id}-${index}`}
            node={child}
            depth={depth}
            expandAll={expandAll}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    );
  }

  // Don't render if doesn't match search
  if (!matchesSearch) {
    return null;
  }

  const hasChildren = node.items.length > 0;
  const hasIssues = node.issues.length > 0;

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

  // Highlight search matches
  const highlightText = (text: string) => {
    if (!searchQuery) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase()
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">{part}</mark>
        : part
    );
  };

  return (
    <div className="ml-6 my-2 animate-fade-in">
      <Card className={`transition-all duration-200 ${hasIssues ? 'border-destructive' : ''} ${searchQuery && matchesSearch ? 'ring-2 ring-yellow-400 dark:ring-yellow-600' : ''}`}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            {hasChildren && (
              <Button
                onClick={handleToggle}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 transition-transform duration-200 hover:scale-110"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge className={`${getLevelColor(node.level)} transition-all duration-200`}>
                  H{node.level}
                </Badge>
                <span className="font-medium">{highlightText(node.text)}</span>
                {hasIssues && (
                  <Badge variant="destructive" className="animate-pulse-soft">
                    {node.issues.length} issue{node.issues.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {hasIssues && (
                <div className="mt-3 space-y-2">
                  {node.issues.map((issue, idx) => (
                    <IssueCard key={idx} issue={issue} />
                  ))}
                </div>
              )}

              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  View HTML
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                  <code>{node.html}</code>
                </pre>
              </details>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasChildren && isExpanded && (
        <div className="mt-1 animate-slide-down">
          {node.items.map((child, index) => (
            <TreeNode
              key={`${child.id}-${index}`}
              node={child}
              depth={depth + 1}
              expandAll={expandAll}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeadingTree({ hierarchy }: HeadingTreeProps) {
  const [expandAll, setExpandAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Count total headings
  const countHeadings = (node: HeadingNode): number => {
    if ((node.level as number) === 0) {
      return node.items.reduce((sum, child) => sum + countHeadings(child), 0);
    }
    return 1 + node.items.reduce((sum, child) => sum + countHeadings(child), 0);
  };

  const totalHeadings = useMemo(() => countHeadings(hierarchy), [hierarchy]);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>Heading Hierarchy</CardTitle>
            <CardDescription>
              Visual tree representation of your document structure ({totalHeadings} heading{totalHeadings !== 1 ? 's' : ''})
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setExpandAll(!expandAll)}
              variant="outline"
              size="sm"
              className="transition-all duration-200 hover:scale-105"
              title={expandAll ? 'Collapse all headings' : 'Expand all headings'}
            >
              {expandAll ? (
                <>
                  <ChevronsRight className="h-4 w-4 mr-2" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronsDown className="h-4 w-4 mr-2" />
                  Expand All
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search headings by text or HTML..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <TreeNode
          node={hierarchy}
          expandAll={expandAll}
          searchQuery={searchQuery}
        />
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            {totalHeadings === 0
              ? 'No headings match your search'
              : `Showing matching headings (clear search to see all)`
            }
          </p>
        )}
      </CardContent>
    </Card>
  );
}
