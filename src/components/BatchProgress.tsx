import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Pause, Play, X, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { BatchAnalysisState, BatchJob } from '../types';

interface BatchProgressProps {
  state: BatchAnalysisState;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export default function BatchProgress({ state, onPause, onResume, onCancel }: BatchProgressProps) {
  const { jobs, isRunning, isPaused, totalJobs, completedJobs, failedJobs } = state;

  const progress = totalJobs > 0 ? ((completedJobs + failedJobs) / totalJobs) * 100 : 0;
  const elapsedTime = state.startedAt ? Date.now() - state.startedAt : 0;
  const avgTimePerJob =
    completedJobs + failedJobs > 0 ? elapsedTime / (completedJobs + failedJobs) : 0;
  const remainingJobs = totalJobs - completedJobs - failedJobs;
  const estimatedTimeRemaining = avgTimePerJob * remainingJobs;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusBadge = (status: BatchJob['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'analyzing':
        return (
          <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Analyzing
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-300">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
    }
  };

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isRunning && !isPaused ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            ) : isPaused ? (
              <Pause className="h-5 w-5 text-yellow-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            Batch Analysis Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            {isRunning && !isPaused && (
              <Button onClick={onPause} variant="outline" size="sm">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}
            {isPaused && (
              <Button onClick={onResume} variant="outline" size="sm">
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
            {(isRunning || isPaused) && (
              <Button onClick={onCancel} variant="destructive" size="sm">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {completedJobs + failedJobs} / {totalJobs} pages
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-green-600">{completedJobs}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">{failedJobs}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{remainingJobs}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>

        {/* Time Estimates */}
        {(isRunning || isPaused) && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Elapsed</div>
                <div className="font-semibold">{formatTime(elapsedTime)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Est. Remaining</div>
                <div className="font-semibold">
                  {remainingJobs > 0 ? formatTime(estimatedTimeRemaining) : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job List */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">URL Queue</h3>
          <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-lg p-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
              >
                <div className="flex-1 truncate mr-4" title={job.url}>
                  {job.url}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                  {job.error && (
                    <span className="text-xs text-destructive" title={job.error}>
                      Error
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
