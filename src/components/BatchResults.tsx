import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  FileDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { BatchJob, BatchStats } from '../types';
import IssueCard from './IssueCard';

interface BatchResultsProps {
  jobs: BatchJob[];
  stats: BatchStats;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export default function BatchResults({ jobs, stats, onExportCSV, onExportJSON }: BatchResultsProps) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Aggregate Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Batch Analysis Results
              </CardTitle>
              <CardDescription>Aggregate statistics across all analyzed pages</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={onExportCSV} variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button onClick={onExportJSON} variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">{stats.totalPages}</div>
                <div className="text-sm text-muted-foreground">Total Pages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600">{stats.completedPages}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-destructive">{stats.failedPages}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600">{stats.totalHeadings}</div>
                <div className="text-sm text-muted-foreground">Total Headings</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div>
                    <div className="text-2xl font-bold text-destructive">{stats.totalErrors}</div>
                    <div className="text-xs text-muted-foreground">Critical Errors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.totalWarnings}</div>
                    <div className="text-xs text-muted-foreground">Warnings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.pagesWithoutH1}
                    </div>
                    <div className="text-xs text-muted-foreground">Missing H1</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.pagesWithMultipleH1}
                    </div>
                    <div className="text-xs text-muted-foreground">Multiple H1s</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Avg. Headings per Page:</span>
                <span className="ml-2 font-semibold">
                  {stats.avgHeadingsPerPage.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Pages with Issues:</span>
                <span className="ml-2 font-semibold">
                  {stats.pagesWithIssues} ({((stats.pagesWithIssues / stats.completedPages) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>Click on any row to view detailed analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Headings</TableHead>
                <TableHead className="w-[100px]">Errors</TableHead>
                <TableHead className="w-[100px]">Warnings</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <>
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  >
                    <TableCell>
                      {expandedJob === job.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm truncate max-w-[400px]" title={job.url}>
                      {job.url}
                    </TableCell>
                    <TableCell>
                      {job.status === 'completed' ? (
                        <Badge className="bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-300">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Success
                        </Badge>
                      ) : job.status === 'failed' ? (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{job.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{job.result?.metrics.totalHeadings || '—'}</TableCell>
                    <TableCell>
                      {job.result?.validation.errors.length ? (
                        <span className="text-destructive font-semibold">
                          {job.result.validation.errors.length}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {job.result?.validation.warnings.length ? (
                        <span className="text-yellow-600 font-semibold">
                          {job.result.validation.warnings.length}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(job.url, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedJob === job.id && job.result && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <div className="p-4 space-y-4">
                          {/* Metrics */}
                          <div>
                            <h4 className="font-semibold mb-2">Heading Distribution</h4>
                            <div className="grid grid-cols-6 gap-2">
                              {[1, 2, 3, 4, 5, 6].map((level) => {
                                const count = job.result!.metrics[`h${level}Count` as keyof typeof job.result.metrics] as number;
                                return (
                                  <div key={level} className="text-center p-2 bg-card rounded border">
                                    <div className="text-lg font-bold">{count}</div>
                                    <div className="text-xs text-muted-foreground">H{level}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Issues */}
                          {(job.result.validation.errors.length > 0 ||
                            job.result.validation.warnings.length > 0) && (
                            <div>
                              <h4 className="font-semibold mb-2">Issues Detected</h4>
                              <div className="space-y-2">
                                {job.result.validation.errors.map((error, idx) => (
                                  <IssueCard key={`error-${idx}`} issue={error} />
                                ))}
                                {job.result.validation.warnings.map((warning, idx) => (
                                  <IssueCard key={`warning-${idx}`} issue={warning} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
