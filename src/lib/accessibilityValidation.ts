import type { Heading, Issue } from '../types';

/**
 * Validate ARIA attributes and accessibility compliance
 * @param headings - Array of heading objects with ARIA information
 * @returns Array of accessibility-related issues
 */
export function validateAccessibility(headings: Heading[]): Issue[] {
  const issues: Issue[] = [];

  headings.forEach((heading, index) => {
    // Check for hidden headings
    if (heading.isHidden) {
      const hiddenMethodText = {
        'display-none': 'display: none',
        'visibility-hidden': 'visibility: hidden',
        'aria-hidden': 'aria-hidden="true"',
        'opacity-0': 'opacity: 0',
        'off-screen': 'screen reader only class',
      }[heading.hiddenMethod || 'off-screen'];

      if (heading.hiddenMethod === 'aria-hidden') {
        issues.push({
          type: 'aria_hidden_heading',
          severity: 'warning',
          message: `${heading.tag.toUpperCase()} at position ${index + 1} is hidden from screen readers (aria-hidden="true")`,
          recommendation:
            'Headings with aria-hidden="true" are invisible to screen readers, which can break navigation for assistive technology users. Only hide headings if they are purely decorative and don\'t contribute to document structure.',
        });
      } else if (heading.hiddenMethod === 'display-none' || heading.hiddenMethod === 'visibility-hidden') {
        issues.push({
          type: 'hidden_heading',
          severity: 'warning',
          message: `${heading.tag.toUpperCase()} at position ${index + 1} is visually hidden (${hiddenMethodText})`,
          recommendation:
            'Visually hidden headings can confuse screen reader users who expect visible structure. If this is intentional for accessibility, use screen reader-only classes instead of display:none or visibility:hidden.',
        });
      } else if (heading.hiddenMethod === 'off-screen') {
        issues.push({
          type: 'screen_reader_only_heading',
          severity: 'info',
          message: `${heading.tag.toUpperCase()} at position ${index + 1} is screen reader-only (${hiddenMethodText})`,
          recommendation:
            'Screen reader-only headings can improve accessibility, but ensure they provide meaningful context that\'s missing from the visual design. Overuse can create confusing experiences.',
        });
      }
    }

    // Check ARIA label usage
    if (heading.ariaLabel) {
      if (heading.text && heading.text.trim().length > 0) {
        issues.push({
          type: 'aria_label_override',
          severity: 'warning',
          message: `${heading.tag.toUpperCase()} "${heading.text}" has aria-label="${heading.ariaLabel}" which overrides the visible text`,
          recommendation:
            'The aria-label will be announced instead of the visible text. This can create confusion when the spoken text differs from what sighted users see. Only use aria-label when necessary, and ensure it matches or enhances the visible text.',
        });
      } else {
        issues.push({
          type: 'aria_label_valid',
          severity: 'info',
          message: `${heading.tag.toUpperCase()} uses aria-label="${heading.ariaLabel}" to provide accessible text`,
          recommendation:
            'Using aria-label for headings without visible text is acceptable, but prefer using visible text when possible for consistency across all users.',
        });
      }
    }

    // Check aria-labelledby usage
    if (heading.ariaLabelledby) {
      issues.push({
        type: 'aria_labelledby_used',
        severity: 'info',
        message: `${heading.tag.toUpperCase()} at position ${index + 1} uses aria-labelledby="${heading.ariaLabelledby}"`,
        recommendation:
          'Ensure the referenced element (id="${heading.ariaLabelledby}") exists and provides meaningful context. The referenced text will be announced instead of the heading\'s visible text.',
      });
    }

    // Check conflicting ARIA level
    if (heading.ariaLevel && heading.ariaLevel !== heading.level) {
      issues.push({
        type: 'aria_level_mismatch',
        severity: 'critical',
        message: `${heading.tag.toUpperCase()} has aria-level="${heading.ariaLevel}" which conflicts with its semantic level (${heading.level})`,
        recommendation:
          'Mismatched aria-level can confuse screen readers. If you need a different heading level for assistive technology, consider using the correct HTML heading tag instead of aria-level.',
      });
    }

    // Check inappropriate role attribute
    if (heading.role && heading.role !== 'heading') {
      issues.push({
        type: 'heading_role_override',
        severity: 'critical',
        message: `${heading.tag.toUpperCase()} has role="${heading.role}" which overrides its native heading semantics`,
        recommendation:
          'Changing the role of a heading element removes its semantic meaning. Screen readers will no longer recognize it as a heading. Remove the role attribute to restore proper heading semantics.',
      });
    }

    // Check for empty headings with only ARIA labels (edge case)
    if (!heading.text && !heading.ariaLabel && !heading.ariaLabelledby) {
      // This is already caught by the main validation, but let's add accessibility context
      issues.push({
        type: 'empty_heading_no_aria',
        severity: 'critical',
        message: `${heading.tag.toUpperCase()} at position ${index + 1} is empty and has no aria-label or aria-labelledby`,
        recommendation:
          'Empty headings without ARIA labels are completely inaccessible. Screen readers will announce an empty heading, which provides no value and creates a poor user experience. Add visible text or remove this heading.',
      });
    }

    // Check for headings that only contain images without alt text (inferred from HTML)
    if (heading.text.trim() === '' && heading.html.includes('<img')) {
      const hasAltText = /alt=["'][^"']+["']/.test(heading.html);
      if (!hasAltText) {
        issues.push({
          type: 'image_heading_no_alt',
          severity: 'critical',
          message: `${heading.tag.toUpperCase()} at position ${index + 1} contains an image without alt text`,
          recommendation:
            'Headings with images but no alt text are inaccessible to screen readers. Add descriptive alt text to the image or provide visible heading text.',
        });
      }
    }
  });

  // Check for overall accessibility compliance
  const hiddenCount = headings.filter(h => h.isHidden).length;
  const totalHeadings = headings.length;

  if (hiddenCount > 0 && hiddenCount === totalHeadings) {
    issues.push({
      type: 'all_headings_hidden',
      severity: 'critical',
      message: 'All headings are hidden - the document has no accessible heading structure',
      recommendation:
        'Screen readers rely on headings for navigation. Having all headings hidden defeats the purpose of semantic HTML and creates a completely inaccessible document structure. Make at least the main headings visible.',
    });
  } else if (hiddenCount > totalHeadings * 0.5) {
    issues.push({
      type: 'most_headings_hidden',
      severity: 'warning',
      message: `Over half of your headings (${hiddenCount}/${totalHeadings}) are hidden`,
      recommendation:
        'A large number of hidden headings may indicate an accessibility issue. Review whether these hidden headings are necessary and providing value to screen reader users.',
    });
  }

  return issues;
}
