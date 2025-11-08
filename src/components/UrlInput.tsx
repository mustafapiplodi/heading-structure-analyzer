import { useState, useRef } from 'react';
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
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Heading Structure Analyzer
        </h1>
        <p className="text-gray-600">
          Analyze HTML heading structures for SEO optimization and WCAG accessibility compliance
        </p>
      </div>

      {/* Input Method Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setInputMethod('html')}
          className={`px-4 py-2 font-medium transition-colors ${
            inputMethod === 'html'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Paste HTML
        </button>
        <button
          onClick={() => setInputMethod('url')}
          className={`px-4 py-2 font-medium transition-colors ${
            inputMethod === 'url'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Enter URL
        </button>
        <button
          onClick={() => setInputMethod('file')}
          className={`px-4 py-2 font-medium transition-colors ${
            inputMethod === 'file'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upload File
        </button>
      </div>

      {/* Input Area */}
      {inputMethod === 'file' ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="text-gray-600">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium mb-1">
              Drop HTML file here or click to browse
            </p>
            <p className="text-sm">Accepts .html and .htm files (Max 5MB)</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {inputMethod === 'url' ? (
            <div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isAnalyzing}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the URL of the webpage you want to analyze
              </p>
            </div>
          ) : (
            <div>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste your HTML code here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isAnalyzing}
              />
              <p className="mt-2 text-sm text-gray-500">
                Paste HTML content to analyze heading structure
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isAnalyzing || !inputValue.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze Heading Structure'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
