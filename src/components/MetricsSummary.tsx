import type { AnalysisResult } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface MetricsSummaryProps {
  result: AnalysisResult;
}

export default function MetricsSummary({ result }: MetricsSummaryProps) {
  const { metrics, validation } = result;
  const totalIssues = validation.errors.length + validation.warnings.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">Analysis Summary</CardTitle>
        <CardDescription>Overview of heading structure and detected issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">
                {metrics.totalHeadings}
              </div>
              <div className="text-sm text-muted-foreground">Total Headings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600">
                {metrics.maxDepth}
              </div>
              <div className="text-sm text-muted-foreground">Max Depth</div>
            </CardContent>
          </Card>
          <Card className={validation.errors.length > 0 ? 'border-destructive' : 'border-green-500'}>
            <CardContent className="pt-6">
              <div className={`text-3xl font-bold ${
                validation.errors.length > 0 ? 'text-destructive' : 'text-green-600'
              }`}>
                {validation.errors.length}
              </div>
              <div className="text-sm text-muted-foreground">Critical Errors</div>
            </CardContent>
          </Card>
          <Card className="border-orange-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600">
                {validation.warnings.length}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </CardContent>
          </Card>
        </div>

        {/* Heading Distribution */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Heading Distribution</h3>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((level) => {
              const count = metrics[`h${level}Count` as keyof typeof metrics] as number;
              const colors = [
                'border-red-500 bg-red-50 dark:bg-red-950',
                'border-blue-500 bg-blue-50 dark:bg-blue-950',
                'border-green-500 bg-green-50 dark:bg-green-950',
                'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
                'border-purple-500 bg-purple-50 dark:bg-purple-950',
                'border-teal-500 bg-teal-50 dark:bg-teal-950',
              ];
              return (
                <Card key={level} className={colors[level - 1]}>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">H{level}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        {totalIssues === 0 ? (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-400">
                    Excellent heading structure!
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-500">
                    No critical issues or warnings detected. Your heading hierarchy follows
                    best practices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-400">
                    Issues detected: {totalIssues}
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500">
                    {validation.errors.length > 0 &&
                      `${validation.errors.length} critical error${validation.errors.length !== 1 ? 's' : ''}`}
                    {validation.errors.length > 0 && validation.warnings.length > 0 && ' and '}
                    {validation.warnings.length > 0 &&
                      `${validation.warnings.length} warning${validation.warnings.length !== 1 ? 's' : ''}`}{' '}
                    found. Review the details below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
