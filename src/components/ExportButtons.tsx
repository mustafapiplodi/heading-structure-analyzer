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
    <Card className="mb-6 animate-fade-in">
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
            className="flex-1 min-w-[140px] transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in-scale"
            style={{ animationDelay: '0.1s' }}
          >
            <FileText className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            Export PDF
          </Button>

          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            className="flex-1 min-w-[140px] transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in-scale"
            style={{ animationDelay: '0.2s' }}
          >
            <Table2 className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            Export CSV
          </Button>

          <Button
            onClick={() => handleExport('json')}
            variant="outline"
            className="flex-1 min-w-[140px] transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in-scale"
            style={{ animationDelay: '0.3s' }}
          >
            <FileCode className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            Export JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
