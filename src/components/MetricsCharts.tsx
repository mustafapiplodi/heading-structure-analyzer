import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AnalysisResult } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MetricsChartsProps {
  result: AnalysisResult;
}

const COLORS = {
  h1: '#ef4444', // red
  h2: '#3b82f6', // blue
  h3: '#10b981', // green
  h4: '#f59e0b', // yellow
  h5: '#8b5cf6', // purple
  h6: '#14b8a6', // teal
  errors: '#dc2626',
  warnings: '#f59e0b',
  info: '#3b82f6',
};

export default function MetricsCharts({ result }: MetricsChartsProps) {
  const { metrics, validation } = result;

  // Heading distribution data
  const headingDistribution = [
    { name: 'H1', value: metrics.h1Count, color: COLORS.h1 },
    { name: 'H2', value: metrics.h2Count, color: COLORS.h2 },
    { name: 'H3', value: metrics.h3Count, color: COLORS.h3 },
    { name: 'H4', value: metrics.h4Count, color: COLORS.h4 },
    { name: 'H5', value: metrics.h5Count, color: COLORS.h5 },
    { name: 'H6', value: metrics.h6Count, color: COLORS.h6 },
  ].filter(item => item.value > 0); // Only show headings that exist

  // Issue severity data
  const issueSeverity = [
    { name: 'Critical Errors', value: validation.errors.length, color: COLORS.errors },
    { name: 'Warnings', value: validation.warnings.length, color: COLORS.warnings },
    { name: 'Info', value: validation.info?.length || 0, color: COLORS.info },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Count: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {((payload[0].value / metrics.totalHeadings) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const IssueTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = validation.errors.length + validation.warnings.length + (validation.info?.length || 0);
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Count: <span className="font-bold">{payload[0].value}</span>
          </p>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              {((payload[0].value / total) * 100).toFixed(1)}% of issues
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-6 animate-fade-in">
      <CardHeader>
        <CardTitle>Visual Analytics</CardTitle>
        <CardDescription>
          Interactive charts showing heading distribution and issue breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="transition-all duration-300">
        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="distribution">Heading Distribution</TabsTrigger>
            <TabsTrigger value="issues">Issue Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="mt-6 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-sm font-semibold mb-4 text-center">Proportional Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={headingDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {headingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-sm font-semibold mb-4 text-center">Count Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={headingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {headingDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Analysis:</strong> {
                  metrics.h1Count === 0 ? 'No H1 heading found - this is critical for SEO.' :
                  metrics.h1Count > 1 ? `Multiple H1 headings detected (${metrics.h1Count}). Consider using only one.` :
                  metrics.maxDepth > 4 ? `Deep heading structure (${metrics.maxDepth} levels). Consider simplifying.` :
                  'Heading structure looks well-balanced.'
                }
              </p>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="mt-6 animate-fade-in">
            {issueSeverity.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Issue Pie Chart */}
                <div className="transition-all duration-300 hover:scale-[1.02]">
                  <h3 className="text-sm font-semibold mb-4 text-center">Issue Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={issueSeverity}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${(entry.percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {issueSeverity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<IssueTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Issue Bar Chart */}
                <div className="transition-all duration-300 hover:scale-[1.02]">
                  <h3 className="text-sm font-semibold mb-4 text-center">Issue Count by Severity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={issueSeverity}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip content={<IssueTooltip />} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {issueSeverity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold mb-2">Perfect Score!</h3>
                <p className="text-muted-foreground">
                  No issues detected. Your heading structure is excellent!
                </p>
              </div>
            )}

            {issueSeverity.length > 0 && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Priority:</strong> {
                    validation.errors.length > 0 ? `Focus on ${validation.errors.length} critical error${validation.errors.length !== 1 ? 's' : ''} first.` :
                    validation.warnings.length > 0 ? `Address ${validation.warnings.length} warning${validation.warnings.length !== 1 ? 's' : ''} to improve quality.` :
                    'Review the SEO insights to optimize further.'
                  }
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
