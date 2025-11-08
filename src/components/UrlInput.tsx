import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Link2 } from 'lucide-react';
import type { InputMethod } from '../types';

interface UrlInputProps {
  onAnalyzeHtml: (html: string) => void;
  onAnalyzeUrl: (url: string) => void;
  onAnalyzeFile: (file: File) => void;
  isAnalyzing: boolean;
}

export default function UrlInput({
  onAnalyzeHtml,
  onAnalyzeUrl,
  onAnalyzeFile,
  isAnalyzing,
}: UrlInputProps) {
  const [inputMethod, setInputMethod] = useState<InputMethod>('html');
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAnalyzing || !inputValue.trim()) return;

    if (inputMethod === 'url') {
      onAnalyzeUrl(inputValue.trim());
    } else if (inputMethod === 'html') {
      onAnalyzeHtml(inputValue.trim());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
      onAnalyzeFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
      onAnalyzeFile(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">Heading Structure Analyzer</CardTitle>
          <CardDescription>
            Analyze HTML heading structures for SEO optimization and WCAG accessibility compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as InputMethod)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="html">Paste HTML</TabsTrigger>
              <TabsTrigger value="url">Enter URL</TabsTrigger>
              <TabsTrigger value="file">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste your HTML code here..."
                  rows={10}
                  className="font-mono text-sm"
                  disabled={isAnalyzing}
                />
                <p className="text-sm text-muted-foreground">
                  Paste HTML content to analyze heading structure
                </p>
                <Button type="submit" className="w-full" disabled={isAnalyzing || !inputValue.trim()}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Heading Structure'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://example.com"
                  disabled={isAnalyzing}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the URL of the webpage you want to analyze
                </p>
                <Button type="submit" className="w-full" disabled={isAnalyzing || !inputValue.trim()}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Analyze Heading Structure
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-accent transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-1">
                  Drop HTML file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">Accepts .html and .htm files (Max 5MB)</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
