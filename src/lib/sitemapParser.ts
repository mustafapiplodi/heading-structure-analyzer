/**
 * Sitemap Parser Utility
 * Parses sitemap.xml files and extracts URLs
 */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

/**
 * Parse a sitemap.xml file and extract URLs
 */
export async function parseSitemap(sitemapUrl: string): Promise<string[]> {
  try {
    const response = await fetch(sitemapUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
    }

    const text = await response.text();
    const urls = extractUrlsFromXml(text);

    // Check if this is a sitemap index (contains other sitemaps)
    if (isSitemapIndex(text)) {
      const childSitemaps = extractSitemapUrls(text);
      const allUrls: string[] = [];

      // Fetch and parse child sitemaps
      for (const childUrl of childSitemaps) {
        try {
          const childUrls = await parseSitemap(childUrl);
          allUrls.push(...childUrls);
        } catch (error) {
          console.warn(`Failed to parse child sitemap: ${childUrl}`, error);
        }
      }

      return [...urls, ...allUrls];
    }

    return urls;
  } catch (error) {
    throw new Error(
      `Failed to parse sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract URLs from sitemap XML content
 */
function extractUrlsFromXml(xml: string): string[] {
  const urls: string[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XML format');
  }

  // Extract <loc> elements
  const locElements = doc.querySelectorAll('url > loc');
  locElements.forEach((loc) => {
    const url = loc.textContent?.trim();
    if (url) {
      urls.push(url);
    }
  });

  return urls;
}

/**
 * Check if the sitemap is a sitemap index (contains other sitemaps)
 */
function isSitemapIndex(xml: string): boolean {
  return xml.includes('<sitemapindex') || xml.includes('<sitemap>');
}

/**
 * Extract sitemap URLs from a sitemap index
 */
function extractSitemapUrls(xml: string): string[] {
  const urls: string[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const locElements = doc.querySelectorAll('sitemap > loc');
  locElements.forEach((loc) => {
    const url = loc.textContent?.trim();
    if (url) {
      urls.push(url);
    }
  });

  return urls;
}

/**
 * Parse a list of URLs from text input (one URL per line)
 */
export function parseUrlList(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      // Remove empty lines and comments
      if (!line || line.startsWith('#') || line.startsWith('//')) {
        return false;
      }
      // Basic URL validation
      try {
        new URL(line);
        return true;
      } catch {
        return false;
      }
    });
}

/**
 * Validate if a string is a valid sitemap URL
 */
export function isSitemapUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.pathname.endsWith('.xml') ||
      urlObj.pathname.includes('sitemap') ||
      urlObj.pathname.endsWith('/sitemap')
    );
  } catch {
    return false;
  }
}
