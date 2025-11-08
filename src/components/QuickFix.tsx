import { useState } from 'react';
import type { Issue } from '../types';

interface QuickFixProps {
  issue: Issue;
  html?: string;
  text?: string;
}

export default function QuickFix({ issue, html, text }: QuickFixProps) {
  const [showFix, setShowFix] = useState(false);

  const generateFix = (): { before: string; after: string; explanation: string } | null => {
    switch (issue.type) {
      case 'empty_heading':
        return {
          before: html || '<h2></h2>',
          after: '<h2>Descriptive Heading Text</h2>',
          explanation: 'Add descriptive text that explains the content of this section.',
        };

      case 'heading_too_long':
        if (text && text.length > 70) {
          const shortened = text.substring(0, 67) + '...';
          return {
            before: html || `<h2>${text}</h2>`,
            after: `<h2>${shortened}</h2>`,
            explanation:
              'Shorten the heading to under 70 characters for better SEO and readability.',
          };
        }
        break;

      case 'heading_too_short':
        return {
          before: html || '<h3>Hi</h3>',
          after: '<h3>Welcome to Our Platform</h3>',
          explanation: 'Use more descriptive text (at least 3 characters).',
        };

      case 'skipped_level':
        const match = issue.message.match(/H(\d) to H(\d)/);
        if (match) {
          const from = match[1];
          const to = match[2];
          const missing = parseInt(from) + 1;
          return {
            before: `<h${from}>Parent Section</h${from}>\n<h${to}>${text || 'Content'}</h${to}>`,
            after: `<h${from}>Parent Section</h${from}>\n<h${missing}>Intermediate Section</h${missing}>\n<h${to}>${text || 'Content'}</h${to}>`,
            explanation: `Add an H${missing} heading between H${from} and H${to} to maintain proper hierarchy.`,
          };
        }
        break;

      case 'multiple_h1':
        return {
          before: '<h1>First Title</h1>\n...\n<h1>Second Title</h1>',
          after: '<h1>Main Page Title</h1>\n...\n<h2>Section Title</h2>',
          explanation: 'Use only one H1 per page. Convert additional H1s to H2 or lower.',
        };

      case 'missing_h1':
      case 'missing_h1_start':
        return {
          before: '<h2>Section Title</h2>',
          after: '<h1>Main Page Title</h1>\n<h2>Section Title</h2>',
          explanation: 'Add an H1 heading at the start of your page to identify the main topic.',
        };

      case 'generic_heading':
        const genericMap: Record<string, string> = {
          welcome: 'Welcome to Our Platform',
          introduction: 'Introduction to Web Development',
          'about us': 'About Our Company and Mission',
          overview: 'Product Overview and Key Features',
        };
        const replacement = genericMap[text?.toLowerCase() || ''] || 'Specific Descriptive Heading';
        return {
          before: html || `<h2>${text}</h2>`,
          after: `<h2>${replacement}</h2>`,
          explanation: 'Use specific, descriptive headings instead of generic phrases.',
        };

      case 'all_caps':
        return {
          before: html || '<h2>THIS IS ALL CAPS</h2>',
          after: '<h2>This Is Title Case</h2>',
          explanation: 'Use proper title case instead of all capitals for better accessibility.',
        };

      default:
        return null;
    }
    return null;
  };

  const fix = generateFix();

  if (!fix) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setShowFix(!showFix)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {showFix ? 'Hide Quick Fix' : 'Show Quick Fix'}
      </button>

      {showFix && (
        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 mb-3">{fix.explanation}</p>

          <div className="space-y-3">
            {/* Before */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-red-700">Before:</span>
                <button
                  onClick={() => copyToClipboard(fix.before)}
                  className="text-xs text-gray-600 hover:text-gray-800"
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
              </div>
              <pre className="p-2 bg-red-50 border border-red-200 rounded text-xs overflow-x-auto">
                <code>{fix.before}</code>
              </pre>
            </div>

            {/* After */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-green-700">After:</span>
                <button
                  onClick={() => copyToClipboard(fix.after)}
                  className="text-xs text-gray-600 hover:text-gray-800"
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
              </div>
              <pre className="p-2 bg-green-50 border border-green-200 rounded text-xs overflow-x-auto">
                <code>{fix.after}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
