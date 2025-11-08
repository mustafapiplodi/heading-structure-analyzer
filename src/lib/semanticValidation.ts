import type { Heading, Issue } from '../types';

/**
 * Validate semantic HTML5 structure and heading nesting
 * @param headings - Array of heading objects with semantic context
 * @returns Array of semantic HTML5-related issues
 */
export function validateSemanticHTML(headings: Heading[]): Issue[] {
  const issues: Issue[] = [];

  // Track landmarks and semantic sections
  const h1Headings = headings.filter(h => h.level === 1);
  const headingsOutsideLandmarks = headings.filter(h => !h.isInLandmark);

  // Inappropriate parent elements that should not contain headings
  const inappropriateParents = ['button', 'a', 'label', 'span', 'strong', 'em', 'b', 'i'];

  headings.forEach((heading, index) => {
    // Check for headings nested in inappropriate elements
    if (heading.parentElement && inappropriateParents.includes(heading.parentElement)) {
      issues.push({
        type: 'inappropriate_nesting',
        severity: 'critical',
        message: `${heading.tag.toUpperCase()} is nested inside a <${heading.parentElement}> element`,
        recommendation:
          `Headings should not be nested within ${heading.parentElement} elements. This creates invalid HTML and confuses screen readers. Move the heading outside the ${heading.parentElement} or use a different element structure.`,
      });
    }

    // Check for headings without semantic context (not in article, section, etc.)
    if (!heading.parentSemanticTag && heading.level > 1 && !heading.isInLandmark) {
      issues.push({
        type: 'missing_semantic_context',
        severity: 'info',
        message: `${heading.tag.toUpperCase()} at position ${index + 1} is not wrapped in a semantic container (article, section, nav, etc.)`,
        recommendation:
          'Using HTML5 semantic elements like <article>, <section>, or <nav> helps create a clear document outline. While not required, wrapping related content in semantic containers improves accessibility and SEO.',
      });
    }

    // Check for H1 outside main content landmark
    if (heading.level === 1 && heading.isInLandmark && heading.landmarkType !== 'main' && heading.landmarkType !== 'banner') {
      issues.push({
        type: 'h1_wrong_landmark',
        severity: 'warning',
        message: `H1 "${heading.text}" is inside <${heading.landmarkType}> instead of <main> or <header>`,
        recommendation:
          'The primary H1 should typically be within the <main> landmark or page <header>. Having it in navigation or aside sections can confuse the document structure. Consider restructuring to place your H1 in the main content area.',
      });
    }

    // Check for section/article without headings (we can infer this from parent context)
    if (heading.parentSemanticTag === 'div' && heading.level > 1) {
      issues.push({
        type: 'div_instead_of_section',
        severity: 'info',
        message: `${heading.tag.toUpperCase()} is inside a <div> - consider using <section> or <article> instead`,
        recommendation:
          'When content has a heading, wrap it in <section> or <article> rather than <div>. This creates better semantic structure and helps screen readers identify distinct content areas.',
      });
    }
  });

  // Overall semantic structure checks
  if (headingsOutsideLandmarks.length === headings.length && headings.length > 0) {
    issues.push({
      type: 'no_landmark_structure',
      severity: 'warning',
      message: 'No headings are within HTML5 landmark elements (main, nav, header, footer, aside)',
      recommendation:
        'Using HTML5 landmark elements creates an accessible page structure that helps screen reader users navigate. Wrap your main content in <main>, navigation in <nav>, and site header/footer in <header> and <footer> elements.',
    });
  }

  // Check if H1s are properly distributed across semantic sections
  if (h1Headings.length > 1) {
    const h1InDifferentSections = h1Headings.filter(h =>
      h.parentSemanticTag === 'article' || h.parentSemanticTag === 'section'
    );

    if (h1InDifferentSections.length === h1Headings.length) {
      issues.push({
        type: 'multiple_h1_sectioning',
        severity: 'info',
        message: `Found ${h1Headings.length} H1 tags, but they are properly scoped within different <article> or <section> elements`,
        recommendation:
          'While the HTML5 spec allows multiple H1s when scoped within sectioning elements, many screen readers and SEO tools still expect a single H1. Consider using H2-H6 for sub-sections instead.',
      });
    }
  }

  // Check for proper landmark distribution
  const landmarkTypes = new Set(headings.filter(h => h.landmarkType).map(h => h.landmarkType));

  if (landmarkTypes.size > 0) {
    // Check if main landmark exists
    const hasMainLandmark = headings.some(h => h.landmarkType === 'main');
    if (!hasMainLandmark && headings.length > 3) {
      issues.push({
        type: 'missing_main_landmark',
        severity: 'warning',
        message: 'No headings found within a <main> landmark',
        recommendation:
          'Every page should have a <main> landmark containing the primary content. This helps screen reader users skip directly to your main content, bypassing navigation and headers.',
      });
    }

    // Check if navigation landmark exists for sites with multiple pages
    const hasNavLandmark = headings.some(h => h.landmarkType === 'nav' || h.landmarkType === 'navigation');
    if (!hasNavLandmark && headings.length > 5) {
      issues.push({
        type: 'missing_nav_landmark',
        severity: 'info',
        message: 'No headings found within a <nav> landmark',
        recommendation:
          'If your page has navigation menus, wrap them in <nav> elements with descriptive headings. This helps screen reader users locate and access navigation quickly.',
      });
    }
  }

  // Check for deeply nested non-semantic structure
  const deeplyNested = headings.filter(h => (h.depth || 0) > 10);
  if (deeplyNested.length > 0) {
    issues.push({
      type: 'excessive_dom_depth',
      severity: 'info',
      message: `${deeplyNested.length} heading${deeplyNested.length > 1 ? 's are' : ' is'} nested more than 10 levels deep in the DOM`,
      recommendation:
        'Excessive DOM nesting can impact performance and make the HTML structure harder to maintain. Consider simplifying your HTML structure and using CSS for layout instead of nested divs.',
    });
  }

  return issues;
}
