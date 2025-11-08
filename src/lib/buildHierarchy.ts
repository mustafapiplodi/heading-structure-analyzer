import type { Heading, HeadingNode } from '../types';

/**
 * Generate a URL-safe ID from heading text
 */
export function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Build a hierarchical tree structure from a flat list of headings
 * @param headings - Array of heading objects
 * @returns Root node of the heading hierarchy
 */
export function buildHeadingHierarchy(headings: Heading[]): HeadingNode {
  // Initialize root node
  const root: HeadingNode = {
    text: 'root',
    level: 0 as any, // Root is level 0
    items: [],
    id: 'root',
    html: '',
    issues: [],
  };

  // Stack to track parent chain
  const stack: HeadingNode[] = [root];

  headings.forEach((h) => {
    // Create node for current heading
    const self: HeadingNode = {
      text: h.text,
      level: h.level,
      items: [],
      id: generateId(h.text),
      html: h.html,
      issues: [],
    };

    // Pop stack until we find appropriate parent
    // A heading can only be a child of a heading with a lower level
    while (
      self.level <= (stack[stack.length - 1]?.level || 0) &&
      stack.length > 1
    ) {
      stack.pop();
    }

    // Get the parent node
    const parent = stack[stack.length - 1];

    // Validate heading hierarchy and flag issues
    if (parent && parent.level > 0) {
      // Check for skipped levels
      if (self.level > parent.level + 1) {
        const skippedLevels: number[] = [];
        for (let i = parent.level + 1; i < self.level; i++) {
          skippedLevels.push(i);
        }

        self.issues.push({
          type: 'skipped_level',
          severity: 'critical',
          message: `Heading skips from H${parent.level} to H${self.level}`,
          recommendation: `Add ${skippedLevels.map((l) => `H${l}`).join(', ')} before this heading`,
        });
      }
    }

    // Check for empty headings
    if (self.text.trim() === '') {
      self.issues.push({
        type: 'empty_heading',
        severity: 'critical',
        message: 'Heading has no text content',
        recommendation: 'Add descriptive text to this heading or remove it',
      });
    }

    // Check for very short headings
    if (self.text.trim().length > 0 && self.text.trim().length < 3) {
      self.issues.push({
        type: 'heading_too_short',
        severity: 'warning',
        message: `Heading text is too short (${self.text.length} characters)`,
        recommendation: 'Use more descriptive heading text (at least 3 characters)',
      });
    }

    // Check for very long headings
    if (self.text.length > 70) {
      self.issues.push({
        type: 'heading_too_long',
        severity: 'warning',
        message: `Heading is too long (${self.text.length} characters)`,
        recommendation: 'Consider shortening to under 70 characters for better SEO',
      });
    }

    // Add to parent's children
    parent.items.push(self);

    // Push current node to stack
    stack.push(self);
  });

  return root;
}

/**
 * Calculate the maximum depth of the heading tree
 */
export function calculateMaxDepth(node: HeadingNode, depth: number = 0): number {
  if (node.items.length === 0) {
    return depth;
  }

  return Math.max(
    ...node.items.map((child) => calculateMaxDepth(child, depth + 1))
  );
}

/**
 * Count headings by level
 */
export function countHeadingsByLevel(headings: Heading[]): {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
} {
  return headings.reduce(
    (acc, h) => {
      acc[`h${h.level}` as keyof typeof acc]++;
      return acc;
    },
    { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 }
  );
}

/**
 * Flatten the hierarchy tree back to a list
 */
export function flattenHierarchy(node: HeadingNode): HeadingNode[] {
  const result: HeadingNode[] = [];

  function traverse(n: HeadingNode) {
    if (n.level > 0) {
      // Skip root node
      result.push(n);
    }
    n.items.forEach(traverse);
  }

  traverse(node);
  return result;
}
