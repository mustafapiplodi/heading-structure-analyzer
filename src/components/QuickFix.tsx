import { useState } from 'react';
import type { Issue } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface QuickFixProps {
  issue: Issue;
  html?: string;
  text?: string;
}

export default function QuickFix({ issue, html, text }: QuickFixProps) {
  const [showFix, setShowFix] = useState(false);
  const [copiedBefore, setCopiedBefore] = useState(false);
  const [copiedAfter, setCopiedAfter] = useState(false);

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

  const copyToClipboard = async (text: string, type: 'before' | 'after') => {
    await navigator.clipboard.writeText(text);
    if (type === 'before') {
      setCopiedBefore(true);
      setTimeout(() => setCopiedBefore(false), 2000);
    } else {
      setCopiedAfter(true);
      setTimeout(() => setCopiedAfter(false), 2000);
    }
  };

  return (
    <div className="mt-3">
      <Button
        onClick={() => setShowFix(!showFix)}
        variant="ghost"
        size="sm"
        className="h-8"
      >
        {showFix ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}
        {showFix ? 'Hide Quick Fix' : 'Show Quick Fix'}
      </Button>

      {showFix && (
        <Card className="mt-3 border-primary/20">
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">{fix.explanation}</p>

            {/* Before */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="destructive" className="text-xs">
                  Before
                </Badge>
                <Button
                  onClick={() => copyToClipboard(fix.before, 'before')}
                  variant="ghost"
                  size="sm"
                  className="h-7"
                >
                  {copiedBefore ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs overflow-x-auto">
                <code>{fix.before}</code>
              </pre>
            </div>

            {/* After */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-green-600 text-xs">
                  After
                </Badge>
                <Button
                  onClick={() => copyToClipboard(fix.after, 'after')}
                  variant="ghost"
                  size="sm"
                  className="h-7"
                >
                  {copiedAfter ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md text-xs overflow-x-auto">
                <code>{fix.after}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
