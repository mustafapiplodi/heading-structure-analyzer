import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ListTodo, FileText, Loader2, AlertCircle } from 'lucide-react';
import { parseSitemap, parseUrlList } from '../lib/sitemapParser';

interface BatchInputProps {
  onStartBatch: (urls: string[]) => void;
  isProcessing: boolean;
}

type InputMode = 'urls' | 'sitemap';

export default function BatchInput({ onStartBatch, isProcessing }: BatchInputProps) {
  const [inputMode, setInputMode] = useState<InputMode>('urls');
  const [urlListInput, setUrlListInput] = useState('');
  const [sitemapInput, setSitemapInput] = useState('');
  const [isLoadingSitemap, setIsLoadingSitemap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedUrls, setParsedUrls] = useState<string[]>([]);

  const handleUrlListAnalyze = () => {
    setError(null);
    const urls = parseUrlList(urlListInput);

    if (urls.length === 0) {
      setError('Please enter at least one valid URL (one per line)');
      return;
    }

    setParsedUrls(urls);
    onStartBatch(urls);
  };

  const handleSitemapAnalyze = async () => {
    setError(null);
    setIsLoadingSitemap(true);

    try {
      const urls = await parseSitemap(sitemapInput);

      if (urls.length === 0) {
        setError('No URLs found in sitemap');
        setIsLoadingSitemap(false);
        return;
      }

      setParsedUrls(urls);
      onStartBatch(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse sitemap');
    } finally {
      setIsLoadingSitemap(false);
    }
  };

  const urlCount = inputMode === 'urls' ? parseUrlList(urlListInput).length : 0;

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-6 w-6" />
          Batch Analysis
        </CardTitle>
        <CardDescription>
          Analyze multiple URLs at once from a list or sitemap.xml file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="urls">
              <ListTodo className="mr-2 h-4 w-4" />
              URL List
            </TabsTrigger>
            <TabsTrigger value="sitemap">
              <FileText className="mr-2 h-4 w-4" />
              Sitemap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="urls" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enter URLs (one per line)</label>
                {urlCount > 0 && (
                  <Badge variant="secondary">{urlCount} URL{urlCount !== 1 ? 's' : ''}</Badge>
                )}
              </div>
              <Textarea
                value={urlListInput}
                onChange={(e) => {
                  setUrlListInput(e.target.value);
                  setError(null);
                }}
                placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3&#10;# Lines starting with # are ignored"
                className="min-h-[250px] font-mono text-sm"
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Enter one URL per line. Lines starting with # or // are ignored.
              </p>
            </div>

            <Button
              onClick={handleUrlListAnalyze}
              disabled={isProcessing || urlListInput.trim().length === 0}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing {parsedUrls.length} URLs...
                </>
              ) : (
                <>
                  <ListTodo className="mr-2 h-4 w-4" />
                  Start Batch Analysis
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="sitemap" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sitemap URL</label>
              <Input
                type="url"
                value={sitemapInput}
                onChange={(e) => {
                  setSitemapInput(e.target.value);
                  setError(null);
                }}
                placeholder="https://example.com/sitemap.xml"
                disabled={isProcessing || isLoadingSitemap}
              />
              <p className="text-xs text-muted-foreground">
                Enter the URL of your sitemap.xml file. Sitemap indexes are supported.
              </p>
            </div>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Large sitemaps may take some time to process. The system
                will automatically handle sitemap indexes and fetch nested sitemaps.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSitemapAnalyze}
              disabled={isProcessing || isLoadingSitemap || !sitemapInput.trim()}
              className="w-full"
              size="lg"
            >
              {isLoadingSitemap ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Sitemap...
                </>
              ) : isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing {parsedUrls.length} URLs...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Load & Analyze Sitemap
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {parsedUrls.length > 0 && !isProcessing && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Ready:</strong> {parsedUrls.length} URL{parsedUrls.length !== 1 ? 's' : ''} parsed
              and ready to analyze.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
