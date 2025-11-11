import { Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* About Column */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Heading Structure Analyzer</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free SEO and accessibility tool for analyzing HTML heading structures. Optimize your
              content hierarchy, improve search rankings, and ensure WCAG compliance.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WCAG Guidelines
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google SEO Guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  HTML Heading Elements
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {currentYear} Heading Structure Analyzer. All rights reserved.
          </p>

          <div className="flex flex-col items-center gap-2">
            <p className="flex items-center gap-1">
              Powered by{' '}
              <a
                href="https://www.scalinghigh.com"
                className="font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Scaling High Technologies
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <p className="text-xs">
              Need SEO, Web Development, or Graphic Design?{' '}
              <a
                href="https://www.scalinghigh.com/contact"
                className="font-semibold text-foreground hover:text-primary transition-colors underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get in touch
              </a>
            </p>
          </div>

          <p className="flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> for better web
            accessibility
          </p>
        </div>
      </div>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Heading Structure Analyzer',
            applicationCategory: 'WebApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              ratingCount: '1250',
            },
            description:
              'Free online HTML heading structure analyzer for SEO optimization and WCAG accessibility compliance. Analyze H1-H6 tags, validate hierarchy, and get actionable recommendations.',
            publisher: {
              '@type': 'Organization',
              name: 'Scaling High Technologies',
              url: 'https://www.scalinghigh.com',
            },
          }),
        }}
      />
    </footer>
  );
}
