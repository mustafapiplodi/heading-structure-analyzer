export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type IssueSeverity = 'critical' | 'warning' | 'info';

export interface Issue {
  type: string;
  severity: IssueSeverity;
  message: string;
  recommendation?: string;
}

export interface Heading {
  tag: string;
  level: HeadingLevel;
  text: string;
  html: string;
  position: number;
  depth?: number;
}

export interface HeadingNode {
  text: string;
  level: HeadingLevel;
  items: HeadingNode[];
  id: string;
  html: string;
  issues: Issue[];
}

export interface ValidationResult {
  errors: Issue[];
  warnings: Issue[];
}

export interface AnalysisResult {
  headings: Heading[];
  hierarchy: HeadingNode;
  validation: ValidationResult;
  metrics: {
    totalHeadings: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    maxDepth: number;
    avgSectionLength?: number;
  };
}

export type InputMethod = 'url' | 'html' | 'file';

export interface AnalysisState {
  inputMethod: InputMethod;
  inputValue: string;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
