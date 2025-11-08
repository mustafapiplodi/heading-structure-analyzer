import type { Heading, ValidationResult, Issue } from '../types';
import { performAdvancedValidation } from './advancedValidation';

/**
 * Validate heading structure and detect common issues
 * @param headings - Array of heading objects
 * @returns Validation result with errors and warnings
 */
export function validateHeadingStructure(
  headings: Heading[]
): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const info: Issue[] = [];

  // Check if there are any headings
  if (headings.length === 0) {
    errors.push({
      type: 'no_headings',
      severity: 'critical',
      message: 'No headings detected on page',
      recommendation: 'Add semantic heading tags (H1-H6) to structure your content',
    });
    return { errors, warnings };
  }

  let previousLevel = 0;
  let h1Count = 0;

  // Check first heading
  if (headings[0].level !== 1) {
    errors.push({
      type: 'missing_h1_start',
      severity: 'critical',
      message: `Page should start with H1, but starts with H${headings[0].level}`,
      recommendation: 'Add an H1 heading at the beginning of your content',
    });
  }

  headings.forEach((heading, index) => {
    const currentLevel = heading.level;
    const currentText = heading.text.trim();

    // Count H1 tags
    if (currentLevel === 1) {
      h1Count++;
      if (h1Count > 1) {
        warnings.push({
          type: 'multiple_h1',
          severity: 'warning',
          message: `Multiple H1 tags found (${h1Count} total)`,
          recommendation:
            'Consider using only one H1 per page for clarity and SEO best practices',
        });
      }

      // Check H1 length
      if (currentText.length < 20 || currentText.length > 70) {
        warnings.push({
          type: 'h1_length',
          severity: 'warning',
          message: `H1 length (${currentText.length} chars) outside optimal range (20-70)`,
          recommendation: 'Optimal H1 length is 20-70 characters for SEO',
        });
      }
    }

    // Check for empty headings
    if (currentText === '') {
      errors.push({
        type: 'empty_heading',
        severity: 'critical',
        message: `Empty ${heading.tag.toUpperCase()} tag at position ${index + 1}`,
        recommendation: 'Remove empty heading or add descriptive content',
      });
      return; // Skip further validation for empty headings
    }

    // Check for skipped levels when going deeper
    if (previousLevel > 0 && currentLevel > previousLevel + 1) {
      const skippedLevels: string[] = [];
      for (let i = previousLevel + 1; i < currentLevel; i++) {
        skippedLevels.push(`H${i}`);
      }

      errors.push({
        type: 'heading_skipped',
        severity: 'critical',
        message: `Heading level skipped from H${previousLevel} to H${currentLevel}`,
        recommendation: `Add ${skippedLevels.join(', ')} before ${heading.tag.toUpperCase()} for proper hierarchy`,
      });
    }

    // Check heading length
    if (currentText.length > 70) {
      warnings.push({
        type: 'heading_too_long',
        severity: 'warning',
        message: `${heading.tag.toUpperCase()} is too long (${currentText.length} characters)`,
        recommendation: 'Consider shortening to under 70 characters',
      });
    }

    if (currentText.length > 0 && currentText.length < 3) {
      warnings.push({
        type: 'heading_too_short',
        severity: 'warning',
        message: `${heading.tag.toUpperCase()} is very short (${currentText.length} characters)`,
        recommendation: 'Use more descriptive heading text',
      });
    }

    // Check for generic headings
    const genericPhrases = [
      'welcome',
      'introduction',
      'about',
      'about us',
      'overview',
      'home',
      'contents',
      'more',
      'click here',
    ];

    if (genericPhrases.includes(currentText.toLowerCase())) {
      warnings.push({
        type: 'generic_heading',
        severity: 'warning',
        message: `Generic heading text: "${currentText}"`,
        recommendation: 'Use more specific, descriptive headings',
      });
    }

    // Check for keyword stuffing (repeated words)
    const words = currentText.toLowerCase().split(/\s+/);
    const wordCounts = words.reduce((acc, word) => {
      if (word.length > 3) {
        // Only count words longer than 3 chars
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const repeatedWords = Object.entries(wordCounts).filter(
      ([_, count]) => count > 2
    );
    if (repeatedWords.length > 0) {
      warnings.push({
        type: 'keyword_stuffing',
        severity: 'warning',
        message: `Possible keyword stuffing detected: "${repeatedWords.map(([word]) => word).join(', ')}"`,
        recommendation: 'Avoid repeating keywords too many times in a single heading',
      });
    }

    // Check for all caps headings
    if (currentText === currentText.toUpperCase() && currentText.length > 3) {
      warnings.push({
        type: 'all_caps',
        severity: 'info',
        message: 'Heading uses all capital letters',
        recommendation:
          'Use proper title case for better readability and accessibility',
      });
    }

    previousLevel = currentLevel;
  });

  // Check for missing H1
  if (h1Count === 0) {
    errors.push({
      type: 'missing_h1',
      severity: 'critical',
      message: 'Page has no H1 heading',
      recommendation: 'Add a descriptive H1 heading to identify the main topic',
    });
  }

  // Check for H5/H6 overuse (might indicate over-complexity)
  const h5h6Count = headings.filter((h) => h.level >= 5).length;
  if (h5h6Count > 5) {
    warnings.push({
      type: 'excessive_depth',
      severity: 'warning',
      message: `Excessive use of deep heading levels (${h5h6Count} H5/H6 tags)`,
      recommendation:
        'Consider simplifying your content structure - most content works well with H1-H4',
    });
  }

  // Perform advanced SEO and readability validation
  const advancedIssues = performAdvancedValidation(headings);
  advancedIssues.forEach(issue => {
    if (issue.severity === 'critical') {
      errors.push(issue);
    } else if (issue.severity === 'warning') {
      warnings.push(issue);
    } else {
      info.push(issue);
    }
  });

  return { errors, warnings, info };
}

/**
 * Get a severity color for UI display
 */
export function getSeverityColor(severity: Issue['severity']): string {
  switch (severity) {
    case 'critical':
      return 'text-critical bg-critical-bg border-critical';
    case 'warning':
      return 'text-warning bg-warning-bg border-warning';
    case 'info':
      return 'text-info bg-info-bg border-info';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-300';
  }
}

/**
 * Get severity icon
 */
export function getSeverityIcon(severity: Issue['severity']): string {
  switch (severity) {
    case 'critical':
      return '✗';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ⓘ';
    default:
      return '•';
  }
}
