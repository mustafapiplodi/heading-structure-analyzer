import { useState } from 'react';
import type {
  AnalysisResult,
  AnalysisState,
  InputMethod,
  Heading,
} from '../types';
import { extractHeadings, extractHeadingsFromUrl, extractHeadingsFromFile } from '../lib/extractHeadings';
import { buildHeadingHierarchy, calculateMaxDepth, countHeadingsByLevel } from '../lib/buildHierarchy';
import { validateHeadingStructure } from '../lib/validateStructure';

export function useHeadingAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    inputMethod: 'html',
    inputValue: '',
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const setInputMethod = (method: InputMethod) => {
    setState((prev) => ({ ...prev, inputMethod: method, error: null }));
  };

  const setInputValue = (value: string) => {
    setState((prev) => ({ ...prev, inputValue: value, error: null }));
  };

  const analyzeHeadings = (headings: Heading[]): AnalysisResult => {
    const hierarchy = buildHeadingHierarchy(headings);
    const validation = validateHeadingStructure(headings);
    const counts = countHeadingsByLevel(headings);
    const maxDepth = calculateMaxDepth(hierarchy);

    return {
      headings,
      hierarchy,
      validation,
      metrics: {
        totalHeadings: headings.length,
        h1Count: counts.h1,
        h2Count: counts.h2,
        h3Count: counts.h3,
        h4Count: counts.h4,
        h5Count: counts.h5,
        h6Count: counts.h6,
        maxDepth,
      },
    };
  };

  const analyzeFromHtml = async (html: string) => {
    setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const headings = extractHeadings('body', html);
      const result = analyzeHeadings(headings);

      setState((prev) => ({
        ...prev,
        result,
        isAnalyzing: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze HTML',
        isAnalyzing: false,
      }));
    }
  };

  const analyzeFromUrl = async (url: string) => {
    setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // Validate and normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const headings = await extractHeadingsFromUrl(normalizedUrl);
      const result = analyzeHeadings(headings);

      setState((prev) => ({
        ...prev,
        result,
        isAnalyzing: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch and analyze URL',
        isAnalyzing: false,
      }));
    }
  };

  const analyzeFromFile = async (file: File) => {
    setState((prev) => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      const headings = await extractHeadingsFromFile(file);
      const result = analyzeHeadings(headings);

      setState((prev) => ({
        ...prev,
        result,
        isAnalyzing: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to analyze file',
        isAnalyzing: false,
      }));
    }
  };

  const reset = () => {
    setState({
      inputMethod: 'html',
      inputValue: '',
      isAnalyzing: false,
      result: null,
      error: null,
    });
  };

  return {
    ...state,
    setInputMethod,
    setInputValue,
    analyzeFromHtml,
    analyzeFromUrl,
    analyzeFromFile,
    reset,
  };
}
