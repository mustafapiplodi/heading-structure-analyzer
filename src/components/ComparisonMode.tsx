import { useState } from 'react';
import type { AnalysisResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, ArrowRightLeft } from 'lucide-react';
import HeadingTree from './HeadingTree';
import IssueCard from './IssueCard';

interface ComparisonModeProps {
  results: [AnalysisResult | null, AnalysisResult | null];
  onAnalyze: (index: 0 | 1, html: string) => void;
}

export default function ComparisonMode({ results, onAnalyze }: ComparisonModeProps) {
  const [htmlInputs, setHtmlInputs] = useState<[string, string]>(['', '']);

  const handleAnalyze = (index: 0 | 1) => {
    if (htmlInputs[index].trim()) {
      onAnalyze(index, htmlInputs[index]);
    }
  };

  const renderInputPanel = (index: 0 | 1, label: string) => {
    const result = results[index];

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{label}</span>
            {result && (
              <Badge variant="secondary">
                {result.metrics.totalHeadings} headings
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result ? (
            <>
              <Textarea
                value={htmlInputs[index]}
                onChange={(e) => {
                  const newInputs: [string, string] = [...htmlInputs];
                  newInputs[index] = e.target.value;
                  setHtmlInputs(newInputs);
                }}
                placeholder="Paste HTML content here..."
                className="min-h-[200px] font-mono text-sm"
              />
              <Button
                onClick={() => handleAnalyze(index)}
                disabled={!htmlInputs[index].trim()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Analyze {label}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              {/* Mini Metrics Summary */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold">{result.metrics.totalHeadings}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Max Depth</div>
                  <div className="text-2xl font-bold">{result.metrics.maxDepth}</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Errors</div>
                  <div className="text-2xl font-bold text-destructive">
                    {result.validation.errors.length}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground">Warnings</div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                    {result.validation.warnings.length}
                  </div>
                </div>
              </div>

              {/* Issues */}
              {(result.validation.errors.length > 0 || result.validation.warnings.length > 0) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Issues</h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {result.validation.errors.map((error, idx) => (
                      <IssueCard key={`error-${idx}`} issue={error} />
                    ))}
                    {result.validation.warnings.map((warning, idx) => (
                      <IssueCard key={`warning-${idx}`} issue={warning} />
                    ))}
                  </div>
                </div>
              )}

              {/* Re-analyze button */}
              <Button
                onClick={() => {
                  const newResults = [...results] as [AnalysisResult | null, AnalysisResult | null];
                  newResults[index] = null;
                  setHtmlInputs((prev) => {
                    const newInputs: [string, string] = [...prev];
                    newInputs[index] = '';
                    return newInputs;
                  });
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Analyze Different Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderComparison = () => {
    const [result1, result2] = results;

    if (!result1 || !result2) {
      return null;
    }

    const differences = {
      totalHeadings: result2.metrics.totalHeadings - result1.metrics.totalHeadings,
      maxDepth: result2.metrics.maxDepth - result1.metrics.maxDepth,
      errors: result2.validation.errors.length - result1.validation.errors.length,
      warnings: result2.validation.warnings.length - result1.validation.warnings.length,
    };

    const formatDiff = (value: number) => {
      if (value === 0) return '—';
      const sign = value > 0 ? '+' : '';
      return `${sign}${value}`;
    };

    const getDiffColor = (value: number, inverse = false) => {
      if (value === 0) return 'text-muted-foreground';
      const isPositive = inverse ? value < 0 : value > 0;
      return isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';
    };

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Comparison Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Total Headings</div>
              <div className={`text-xl font-bold ${getDiffColor(differences.totalHeadings)}`}>
                {formatDiff(differences.totalHeadings)}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Max Depth</div>
              <div className={`text-xl font-bold ${getDiffColor(differences.maxDepth)}`}>
                {formatDiff(differences.maxDepth)}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Errors</div>
              <div className={`text-xl font-bold ${getDiffColor(differences.errors, true)}`}>
                {formatDiff(differences.errors)}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Warnings</div>
              <div className={`text-xl font-bold ${getDiffColor(differences.warnings, true)}`}>
                {formatDiff(differences.warnings)}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="before">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="before">Before Structure</TabsTrigger>
                <TabsTrigger value="after">After Structure</TabsTrigger>
              </TabsList>
              <TabsContent value="before" className="mt-4">
                <HeadingTree hierarchy={result1.hierarchy} />
              </TabsContent>
              <TabsContent value="after" className="mt-4">
                <HeadingTree hierarchy={result2.hierarchy} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Comparison Mode</h2>
        <p className="text-muted-foreground">
          Compare two HTML documents side-by-side to see how heading structure changes
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderInputPanel(0, 'Before')}
        {renderInputPanel(1, 'After')}
      </div>

      {renderComparison()}
    </div>
  );
}
