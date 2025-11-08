import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton component for loading states
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted rounded ${className}`}
      style={{ animationDuration: '1.5s' }}
    />
  );
}

/**
 * Skeleton loader for the metrics section
 */
export function MetricsSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for the heading tree view
 */
export function TreeSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Level 1 */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />

          {/* Level 2 */}
          <div className="ml-6 space-y-2">
            <Skeleton className="h-8 w-11/12" />

            {/* Level 3 */}
            <div className="ml-6 space-y-2">
              <Skeleton className="h-8 w-10/12" />
              <Skeleton className="h-8 w-9/12" />
            </div>
          </div>

          {/* Level 2 */}
          <div className="ml-6">
            <Skeleton className="h-8 w-11/12" />
          </div>
        </div>

        {/* Level 1 */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />

          {/* Level 2 */}
          <div className="ml-6">
            <Skeleton className="h-8 w-10/12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for issues section
 */
export function IssuesSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and filters */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Issue cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loader for charts
 */
export function ChartSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Complete analysis loading skeleton
 */
export function AnalysisLoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics skeleton */}
      <MetricsSkeleton />

      {/* Charts skeleton */}
      <ChartSkeleton />

      {/* Issues skeleton */}
      <IssuesSkeleton />

      {/* Tree skeleton */}
      <TreeSkeleton />
    </div>
  );
}
