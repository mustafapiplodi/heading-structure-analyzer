import type { Heading, HeadingLevel } from '../types';

/**
 * Get the DOM depth of an element
 */
function getDepth(element: Element): number {
  let depth = 0;
  let current = element.parentElement;
  while (current) {
    depth++;
    current = current.parentElement;
  }
  return depth;
}

/**
 * Check if an element is visually hidden
 */
function checkVisibility(element: Element): {
  isHidden: boolean;
  hiddenMethod?: 'display-none' | 'visibility-hidden' | 'aria-hidden' | 'opacity-0' | 'off-screen';
} {
  // Check aria-hidden attribute
  if (element.getAttribute('aria-hidden') === 'true') {
    return { isHidden: true, hiddenMethod: 'aria-hidden' };
  }

  // For parsed HTML strings, we can't use getComputedStyle
  // So we check inline styles and class names
  const style = element.getAttribute('style') || '';
  const className = element.getAttribute('class') || '';

  // Check display: none
  if (style.includes('display:none') || style.includes('display: none')) {
    return { isHidden: true, hiddenMethod: 'display-none' };
  }

  // Check visibility: hidden
  if (style.includes('visibility:hidden') || style.includes('visibility: hidden')) {
    return { isHidden: true, hiddenMethod: 'visibility-hidden' };
  }

  // Check opacity: 0
  if (style.includes('opacity:0') || style.includes('opacity: 0')) {
    return { isHidden: true, hiddenMethod: 'opacity-0' };
  }

  // Check common off-screen classes
  const offScreenClasses = ['sr-only', 'visually-hidden', 'screen-reader-only', 'hidden'];
  if (offScreenClasses.some(cls => className.includes(cls))) {
    return { isHidden: true, hiddenMethod: 'off-screen' };
  }

  return { isHidden: false };
}

/**
 * Find the nearest semantic parent element
 */
function findSemanticParent(element: Element): {
  parentSemanticTag?: string;
  isInLandmark?: boolean;
  landmarkType?: string;
} {
  const semanticTags = ['article', 'section', 'nav', 'aside', 'header', 'footer', 'main'];
  const landmarkRoles = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'search', 'form'];

  let current = element.parentElement;
  let parentSemanticTag: string | undefined;
  let isInLandmark = false;
  let landmarkType: string | undefined;

  while (current && !parentSemanticTag) {
    const tagName = current.tagName.toLowerCase();

    // Check if it's a semantic HTML5 element
    if (semanticTags.includes(tagName)) {
      parentSemanticTag = tagName;

      // Check if this semantic element is also a landmark
      if (['nav', 'aside', 'header', 'footer', 'main'].includes(tagName)) {
        isInLandmark = true;
        landmarkType = tagName;
      }
    }

    // Check for ARIA landmark roles
    const role = current.getAttribute('role');
    if (role && landmarkRoles.includes(role)) {
      isInLandmark = true;
      landmarkType = role;
    }

    current = current.parentElement;
  }

  return { parentSemanticTag, isInLandmark, landmarkType };
}

/**
 * Extract all headings from a container element
 * @param container - CSS selector for the container (default: 'body')
 * @param htmlString - Optional HTML string to parse (for server-side or HTML paste)
 * @returns Array of heading objects with metadata
 */
export function extractHeadings(
  container: string = 'body',
  htmlString?: string
): Heading[] {
  let cont: Element | null;

  if (htmlString) {
    // Parse HTML string using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    cont = doc.querySelector(container);
  } else {
    // Use live DOM
    cont = document.querySelector(container);
  }

  if (!cont) {
    return [];
  }

  const headings = cont.querySelectorAll('h1, h2, h3, h4, h5, h6');

  return Array.from(headings).map((heading, index) => {
    const visibility = checkVisibility(heading);
    const semanticContext = findSemanticParent(heading);

    return {
      tag: heading.tagName.toLowerCase(),
      level: parseInt(heading.tagName[1]) as HeadingLevel,
      text: heading.textContent?.trim() || '',
      html: heading.outerHTML,
      position: index,
      depth: getDepth(heading),
      // ARIA attributes
      ariaLabel: heading.getAttribute('aria-label') || undefined,
      ariaLabelledby: heading.getAttribute('aria-labelledby') || undefined,
      ariaHidden: heading.getAttribute('aria-hidden') === 'true',
      ariaLevel: heading.getAttribute('aria-level')
        ? parseInt(heading.getAttribute('aria-level')!)
        : undefined,
      role: heading.getAttribute('role') || undefined,
      // Visibility
      isHidden: visibility.isHidden,
      hiddenMethod: visibility.hiddenMethod,
      // Semantic context
      parentElement: heading.parentElement?.tagName.toLowerCase(),
      parentSemanticTag: semanticContext.parentSemanticTag,
      isInLandmark: semanticContext.isInLandmark,
      landmarkType: semanticContext.landmarkType,
    };
  });
}

/**
 * Extract headings from a URL using fetch
 * @param url - The URL to fetch and analyze
 * @returns Promise resolving to array of headings
 */
export async function extractHeadingsFromUrl(url: string): Promise<Heading[]> {
  try {
    // Validate URL format
    new URL(url);

    // For client-side, we need a CORS proxy or backend
    // For now, this is a placeholder that will need backend implementation
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    return extractHeadings('body', html);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Invalid URL format');
    }
    throw error;
  }
}

/**
 * Extract headings from an HTML file
 * @param file - File object from file input
 * @returns Promise resolving to array of headings
 */
export async function extractHeadingsFromFile(file: File): Promise<Heading[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const html = e.target?.result as string;
      try {
        const headings = extractHeadings('body', html);
        resolve(headings);
      } catch (error) {
        reject(new Error('Failed to parse HTML file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
