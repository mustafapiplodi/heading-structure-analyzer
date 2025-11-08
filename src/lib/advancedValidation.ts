import type { Heading, Issue } from '../types';

/**
 * Advanced validation features for heading analysis
 */

// SEO Power words that improve click-through rates
const POWER_WORDS = [
  'free', 'proven', 'new', 'instant', 'essential', 'complete', 'ultimate',
  'comprehensive', 'easy', 'simple', 'quick', 'amazing', 'incredible',
  'exclusive', 'limited', 'bonus', 'guarantee', 'discover', 'secret',
  'powerful', 'effective', 'best', 'top', 'must-have', 'revolutionary'
];

// Common stop words that add little SEO value
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have'
]);

/**
 * Calculate Flesch Reading Ease score for text
 * Returns 0-100, higher is easier to read
 */
export function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  return Math.max(0, Math.min(100, score));
}

/**
 * Count syllables in a word (simplified algorithm)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 1;

  // Adjust for silent 'e'
  if (word.endsWith('e')) count--;

  // Adjust for multiple vowels in a row
  if (word.match(/[aeiouy]{2,}/)) count--;

  return Math.max(1, count);
}

/**
 * Detect if heading is in question format (good for featured snippets)
 */
export function isQuestionFormat(text: string): boolean {
  const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can', 'will', 'should', 'does', 'is', 'are'];
  const lowerText = text.toLowerCase().trim();

  // Check if starts with question word or ends with question mark
  return questionWords.some(word => lowerText.startsWith(word)) || lowerText.endsWith('?');
}

/**
 * Detect power words in heading
 */
export function detectPowerWords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  return POWER_WORDS.filter(powerWord =>
    words.some(word => word.includes(powerWord))
  );
}

/**
 * Detect numbers in heading (lists perform better in SEO)
 */
export function hasNumbers(text: string): boolean {
  return /\d+/.test(text);
}

/**
 * Check for duplicate or very similar headings
 */
export function findSimilarHeadings(headings: Heading[]): Array<{ heading1: Heading; heading2: Heading; similarity: number }> {
  const similar: Array<{ heading1: Heading; heading2: Heading; similarity: number }> = [];

  for (let i = 0; i < headings.length; i++) {
    for (let j = i + 1; j < headings.length; j++) {
      const similarity = calculateTextSimilarity(headings[i].text, headings[j].text);
      if (similarity > 0.7) { // 70% similar or more
        similar.push({
          heading1: headings[i],
          heading2: headings[j],
          similarity
        });
      }
    }
  }

  return similar;
}

/**
 * Calculate text similarity using Levenshtein distance
 */
function calculateTextSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matrix: number[][] = [];

  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  return 1 - matrix[s2.length][s1.length] / maxLength;
}

/**
 * Analyze sentiment of heading (positive/negative/neutral)
 */
export function analyzeSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral'; score: number } {
  const positiveWords = ['great', 'amazing', 'excellent', 'best', 'good', 'wonderful', 'fantastic', 'love', 'perfect', 'beautiful'];
  const negativeWords = ['bad', 'worst', 'terrible', 'awful', 'poor', 'horrible', 'hate', 'ugly', 'disgusting', 'fail'];

  const words = text.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) score++;
    if (negativeWords.some(nw => word.includes(nw))) score--;
  });

  if (score > 0) return { sentiment: 'positive', score };
  if (score < 0) return { sentiment: 'negative', score };
  return { sentiment: 'neutral', score: 0 };
}

/**
 * Count stop words percentage
 */
export function calculateStopWordsPercentage(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;

  const stopWordCount = words.filter(word => STOP_WORDS.has(word)).length;
  return (stopWordCount / words.length) * 100;
}

/**
 * Estimate reading time for content (words per minute)
 */
export function estimateReadingTime(wordCount: number, wordsPerMinute = 200): number {
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Advanced validation for headings with SEO and accessibility insights
 */
export function performAdvancedValidation(headings: Heading[]): Issue[] {
  const issues: Issue[] = [];

  // Check for duplicate/similar headings
  const similar = findSimilarHeadings(headings);
  similar.forEach(({ heading1, heading2, similarity }) => {
    issues.push({
      type: 'similar_headings',
      severity: 'warning',
      message: `Headings "${heading1.text}" and "${heading2.text}" are ${Math.round(similarity * 100)}% similar`,
      recommendation: 'Use unique, descriptive headings to avoid confusing users and search engines'
    });
  });

  // Analyze each heading
  headings.forEach((heading, index) => {
    const text = heading.text.trim();

    // Readability analysis
    const readability = calculateReadabilityScore(text);
    if (readability < 30) {
      issues.push({
        type: 'low_readability',
        severity: 'info',
        message: `${heading.tag.toUpperCase()} has low readability score (${readability.toFixed(0)}): "${text}"`,
        recommendation: 'Simplify the heading text for better user understanding'
      });
    }

    // Question format detection (good for featured snippets)
    if (isQuestionFormat(text) && heading.level >= 2) {
      issues.push({
        type: 'question_format',
        severity: 'info',
        message: `Question-format heading detected: "${text}"`,
        recommendation: 'This is good for featured snippets! Consider providing a direct answer in the content below.'
      });
    }

    // Power words detection
    const powerWords = detectPowerWords(text);
    if (heading.level === 1 && powerWords.length === 0) {
      issues.push({
        type: 'no_power_words_h1',
        severity: 'info',
        message: `H1 lacks power words for engagement: "${text}"`,
        recommendation: `Consider adding power words like: ${POWER_WORDS.slice(0, 5).join(', ')}`
      });
    }

    // Numbers in headings (lists perform well)
    if (hasNumbers(text) && heading.level <= 3) {
      issues.push({
        type: 'numbered_heading',
        severity: 'info',
        message: `Numbered heading detected: "${text}"`,
        recommendation: 'Great! Numbered headings (lists) tend to perform well in search results.'
      });
    }

    // Stop words analysis
    const stopWordsPercent = calculateStopWordsPercentage(text);
    if (stopWordsPercent > 50) {
      issues.push({
        type: 'too_many_stop_words',
        severity: 'warning',
        message: `${heading.tag.toUpperCase()} contains ${stopWordsPercent.toFixed(0)}% stop words: "${text}"`,
        recommendation: 'Reduce common words and use more descriptive, keyword-rich terms'
      });
    }

    // Sentiment analysis
    const { sentiment, score } = analyzeSentiment(text);
    if (sentiment === 'negative' && heading.level === 1) {
      issues.push({
        type: 'negative_sentiment_h1',
        severity: 'warning',
        message: `H1 has negative sentiment: "${text}"`,
        recommendation: 'Consider using more positive or neutral language for main headings'
      });
    }
  });

  return issues;
}

/**
 * Analyze content structure around headings
 */
export interface ContentStructure {
  averageWordsPerSection: number;
  sectionsWithMinimalContent: number;
  sectionsWithExcessiveContent: number;
  readingTimeMinutes: number;
  contentDensity: string; // 'sparse', 'balanced', 'dense'
}

export function analyzeContentStructure(headings: Heading[], totalWordCount: number): ContentStructure {
  const sectionCount = headings.length || 1;
  const avgWords = totalWordCount / sectionCount;

  // Estimate sections with too little (<50 words) or too much content (>500 words)
  const minimalSections = 0; // Would need actual HTML parsing to determine
  const excessiveSections = 0;

  let density: 'sparse' | 'balanced' | 'dense' = 'balanced';
  if (avgWords < 100) density = 'sparse';
  if (avgWords > 400) density = 'dense';

  return {
    averageWordsPerSection: avgWords,
    sectionsWithMinimalContent: minimalSections,
    sectionsWithExcessiveContent: excessiveSections,
    readingTimeMinutes: estimateReadingTime(totalWordCount),
    contentDensity: density
  };
}
