import { useState } from 'react';
import type { HeadingNode } from '../types';
import IssueCard from './IssueCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface HeadingTreeProps {
  hierarchy: HeadingNode;
}

interface TreeNodeProps {
  node: HeadingNode;
  depth?: number;
}

function TreeNode({ node, depth = 0 }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  if ((node.level as number) === 0) {
    return (
      <div>
        {node.items.map((child, index) => (
          <TreeNode key={`${child.id}-${index}`} node={child} depth={depth} />
        ))}
      </div>
    );
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

  return (
    <div className="ml-6 my-2">
      <Card className={hasIssues ? 'border-destructive' : ''}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            {hasChildren && (
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge className={getLevelColor(node.level)}>
                  H{node.level}
                </Badge>
                <span className="font-medium">{node.text}</span>
                {hasIssues && (
                  <Badge variant="destructive">
                    {node.issues.length} issue{node.issues.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {hasIssues && (
                <div className="mt-3 space-y-2">
                  {node.issues.map((issue, idx) => (
                    <IssueCard key={idx} issue={issue} html={node.html} text={node.text} />
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
        <div className="mt-1">
          {node.items.map((child, index) => (
            <TreeNode key={`${child.id}-${index}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeadingTree({ hierarchy }: HeadingTreeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Heading Hierarchy</CardTitle>
      </CardHeader>
      <CardContent>
        <TreeNode node={hierarchy} />
      </CardContent>
    </Card>
  );
}
