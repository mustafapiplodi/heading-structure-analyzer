import type { Heading, ValidationResult, Issue } from '../types';
import { performAdvancedValidation } from './advancedValidation';
import { validateAccessibility } from './accessibilityValidation';
import { validateSemanticHTML } from './semanticValidation';

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
      message: 'No headings detected on this page',
      recommendation: 'Add semantic heading tags (H1-H6) to improve content structure, SEO, and accessibility. Start with an H1 that describes your main topic.',
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
      message: `Page starts with H${headings[0].level} instead of H1 - this hurts SEO and accessibility`,
      recommendation: 'Begin your page with a unique H1 heading that clearly describes the main topic. This is crucial for search engines and screen readers.',
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
          message: `Found ${h1Count} H1 tags on this page - modern SEO recommends using only one`,
          recommendation:
            'Use a single H1 that captures your main topic, then use H2-H6 for subsections. Multiple H1s can dilute your page\'s topical focus.',
        });
      }

      // Check H1 length
      if (currentText.length < 20) {
        warnings.push({
          type: 'h1_length',
          severity: 'warning',
          message: `Your H1 is too short (${currentText.length} characters) - aim for 20-70 characters`,
          recommendation: 'A good H1 should be descriptive enough to tell users and search engines what the page is about. Add more context to reach 20-70 characters.',
        });
      } else if (currentText.length > 70) {
        warnings.push({
          type: 'h1_length',
          severity: 'warning',
          message: `Your H1 is too long (${currentText.length} characters) - aim for 20-70 characters`,
          recommendation: 'Long H1s may get truncated in search results. Keep it concise and impactful at 20-70 characters.',
        });
      }
    }

    // Check for empty headings
    if (currentText === '') {
      errors.push({
        type: 'empty_heading',
        severity: 'critical',
        message: `Empty ${heading.tag.toUpperCase()} tag found at position ${index + 1} - this is an accessibility violation`,
        recommendation: 'Empty headings confuse screen readers and provide no value to users. Either remove this tag or add descriptive content that explains what follows.',
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
        message: `Heading hierarchy jump: H${previousLevel} → H${currentLevel} skips ${skippedLevels.join(', ')}`,
        recommendation: `Screen readers and search engines expect a logical heading flow. Insert ${skippedLevels.join(' and ')} level${skippedLevels.length > 1 ? 's' : ''} to maintain proper document outline.`,
      });
    }

    // Check heading length
    if (currentText.length > 70 && currentLevel !== 1) {
      warnings.push({
        type: 'heading_too_long',
        severity: 'warning',
        message: `${heading.tag.toUpperCase()} is lengthy at ${currentText.length} characters - readers may lose focus`,
        recommendation: 'Headings work best when concise. Try to communicate the main idea in under 70 characters for better scannability.',
      });
    }

    if (currentText.length > 0 && currentText.length < 3) {
      warnings.push({
        type: 'heading_too_short',
        severity: 'warning',
        message: `${heading.tag.toUpperCase()} "${currentText}" is too vague (${currentText.length} characters)`,
        recommendation: 'Very short headings rarely provide enough context. Aim for at least 3-5 words that clearly describe the section content.',
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
        message: `Generic heading "${currentText}" doesn't help users or SEO`,
        recommendation: 'Replace vague headings with specific, keyword-rich alternatives. For example, instead of "About Us", try "About [Company Name]: Our Mission and Values".',
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
        message: `Repeated words detected: "${repeatedWords.map(([word]) => word).join(', ')}" - this may look like spam to search engines`,
        recommendation: 'Modern search engines penalize keyword stuffing. Write naturally for humans, using synonyms and varied language instead of repetition.',
      });
    }

    // Check for all caps headings
    if (currentText === currentText.toUpperCase() && currentText.length > 3) {
      warnings.push({
        type: 'all_caps',
        severity: 'info',
        message: `Heading "${currentText}" uses all capitals - this impacts readability`,
        recommendation:
          'Screen readers may read ALL CAPS letter by letter. Use Title Case or sentence case for better readability and accessibility compliance.',
      });
    }

    previousLevel = currentLevel;
  });

  // Check for missing H1
  if (h1Count === 0) {
    errors.push({
      type: 'missing_h1',
      severity: 'critical',
      message: 'No H1 heading found - this is critical for SEO and accessibility',
      recommendation: 'Every page needs exactly one H1 that clearly states the main topic. This helps search engines understand your content and assists screen reader users in navigation.',
    });
  }

  // Check for H5/H6 overuse (might indicate over-complexity)
  const h5h6Count = headings.filter((h) => h.level >= 5).length;
  if (h5h6Count > 5) {
    warnings.push({
      type: 'excessive_depth',
      severity: 'warning',
      message: `Found ${h5h6Count} deep headings (H5/H6) - your content structure may be too complex`,
      recommendation:
        'Most readers struggle with deeply nested content. Try restructuring to use only H1-H4, breaking complex sections into separate pages, or using lists instead of nested headings.',
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

  // Perform accessibility validation (ARIA, hidden headings)
  const accessibilityIssues = validateAccessibility(headings);
  accessibilityIssues.forEach(issue => {
    if (issue.severity === 'critical') {
      errors.push(issue);
    } else if (issue.severity === 'warning') {
      warnings.push(issue);
    } else {
      info.push(issue);
    }
  });

  // Perform semantic HTML5 validation (nesting, landmarks)
  const semanticIssues = validateSemanticHTML(headings);
  semanticIssues.forEach(issue => {
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
