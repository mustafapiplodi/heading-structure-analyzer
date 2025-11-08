import type { Issue } from '../types';
import QuickFix from './QuickFix';
import HighlightedText from './HighlightedText';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  searchQuery?: string;
}

export default function IssueCard({ issue, searchQuery = '' }: IssueCardProps) {
  const severityConfig = {
    critical: {
      icon: AlertCircle,
      className: 'border-destructive bg-destructive/10',
      badgeVariant: 'destructive' as const,
    },
    warning: {
      icon: AlertTriangle,
      className: 'border-orange-500 bg-orange-50 dark:bg-orange-950',
      badgeVariant: 'outline' as const,
    },
    info: {
      icon: Info,
      className: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
      badgeVariant: 'secondary' as const,
    },
  };

  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <Alert className={config.className}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span className="uppercase font-semibold">{issue.severity}</span>
        <Badge variant={config.badgeVariant} className="ml-2 font-mono text-xs">
          {issue.type}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p className="font-medium">
          <HighlightedText text={issue.message} query={searchQuery} />
        </p>
        {issue.recommendation && (
          <p className="text-sm">
            <strong>Fix:</strong>{' '}
            <HighlightedText text={issue.recommendation} query={searchQuery} />
          </p>
        )}
        <QuickFix issue={issue} html={issue.headingHtml} text={issue.headingText} />
      </AlertDescription>
    </Alert>
  );
}
