import type { AnalysisResult } from '../types';
import { exportToPdf, exportToCsv, exportToJson } from '../lib/exportHandlers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Table2, FileCode } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonsProps {
  result: AnalysisResult;
}

export default function ExportButtons({ result }: ExportButtonsProps) {
  const handleExport = async (type: 'pdf' | 'csv' | 'json') => {
    try {
      switch (type) {
        case 'pdf':
          await exportToPdf(result);
          toast.success('PDF exported successfully!', {
            description: 'Your analysis report has been downloaded.',
          });
          break;
        case 'csv':
          await exportToCsv(result);
          toast.success('CSV exported successfully!', {
            description: 'Your data is ready for spreadsheet analysis.',
          });
          break;
        case 'json':
          await exportToJson(result);
          toast.success('JSON exported successfully!', {
            description: 'Your data is ready for programmatic use.',
          });
          break;
      }
    } catch (error) {
      toast.error(`Failed to export ${type.toUpperCase()}`, {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Export Results</CardTitle>
        <CardDescription>
          Export your analysis results in your preferred format for further review or
          integration with other tools.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handleExport('pdf')}
            variant="outline"
            className="flex-1 min-w-[140px]"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>

          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            className="flex-1 min-w-[140px]"
          >
            <Table2 className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          <Button
            onClick={() => handleExport('json')}
            variant="outline"
            className="flex-1 min-w-[140px]"
          >
            <FileCode className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
