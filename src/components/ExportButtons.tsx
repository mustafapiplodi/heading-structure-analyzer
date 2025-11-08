import type { AnalysisResult } from '../types';
import { exportToPdf, exportToCsv, exportToJson } from '../lib/exportHandlers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Table2, FileCode } from 'lucide-react';

interface ExportButtonsProps {
  result: AnalysisResult;
}

export default function ExportButtons({ result }: ExportButtonsProps) {
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
            onClick={() => exportToPdf(result)}
            variant="outline"
            className="flex-1 min-w-[140px]"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>

          <Button
            onClick={() => exportToCsv(result)}
            variant="outline"
            className="flex-1 min-w-[140px]"
          >
            <Table2 className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          <Button
            onClick={() => exportToJson(result)}
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
