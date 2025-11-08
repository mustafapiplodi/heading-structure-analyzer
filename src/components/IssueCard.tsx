import type { Issue } from '../types';
import { getSeverityColor, getSeverityIcon } from '../lib/validateStructure';
import QuickFix from './QuickFix';

interface IssueCardProps {
  issue: Issue;
  html?: string;
  text?: string;
}

export default function IssueCard({ issue, html, text }: IssueCardProps) {
  return (
    <div
      className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(issue.severity)}`}
    >
      <div className="flex items-start">
        <span className="text-xl mr-3" aria-label={issue.severity}>
          {getSeverityIcon(issue.severity)}
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm uppercase tracking-wide">
              {issue.severity}
            </h4>
            <span className="text-xs font-mono bg-white px-2 py-1 rounded">
              {issue.type}
            </span>
          </div>
          <p className="font-medium mb-2">{issue.message}</p>
          {issue.recommendation && (
            <p className="text-sm opacity-90">
              <strong>Fix:</strong> {issue.recommendation}
            </p>
          )}
          <QuickFix issue={issue} html={html} text={text} />
        </div>
      </div>
    </div>
  );
}
