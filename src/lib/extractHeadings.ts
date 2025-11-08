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

  return Array.from(headings).map((heading, index) => ({
    tag: heading.tagName.toLowerCase(),
    level: parseInt(heading.tagName[1]) as HeadingLevel,
    text: heading.textContent?.trim() || '',
    html: heading.outerHTML,
    position: index,
    depth: getDepth(heading),
  }));
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
