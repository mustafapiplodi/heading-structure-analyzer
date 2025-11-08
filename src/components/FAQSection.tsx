import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  keywords?: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQ[] = [
    {
      question: 'What is a heading structure analyzer and why do I need it?',
      answer:
        'A heading structure analyzer is a tool that examines HTML heading tags (H1, H2, H3, H4, H5, H6) on your webpage to ensure proper hierarchy and SEO optimization. You need it to improve search engine rankings, enhance accessibility for screen readers, and create better content organization. Proper heading structure helps Google understand your content better, leading to improved organic traffic and user experience.',
      keywords: 'heading analyzer, SEO tool, HTML checker',
    },
    {
      question: 'How many H1 tags should a webpage have?',
      answer:
        'Best practice is to use exactly ONE H1 tag per page. While HTML5 allows multiple H1 tags, SEO experts recommend a single H1 that clearly describes your main topic. Multiple H1 tags can dilute your page\'s topical focus and confuse search engines. Our tool flags multiple H1s as a warning to help you maintain clean heading hierarchy.',
      keywords: 'H1 tag, SEO best practices, heading count',
    },
    {
      question: 'What does "skipped heading level" mean and why is it bad?',
      answer:
        'A skipped heading level occurs when you jump from one heading level to another non-sequential level (e.g., H1 → H3, skipping H2). This is bad because it breaks the document outline, confuses screen reader users who rely on heading hierarchy for navigation, and can negatively impact SEO. Search engines expect logical heading flow to understand content structure. Always use headings in sequential order.',
      keywords: 'heading hierarchy, WCAG compliance, accessibility',
    },
    {
      question: 'Is this heading checker tool free to use?',
      answer:
        'Yes! Our Heading Structure Analyzer is completely free with no registration required. You can analyze unlimited webpages, paste HTML, upload files, compare documents, and export reports in PDF, CSV, or JSON formats at no cost. We believe in making SEO and accessibility tools accessible to everyone.',
      keywords: 'free tool, no registration, unlimited use',
    },
    {
      question: 'How does this tool help with WCAG accessibility compliance?',
      answer:
        'Our tool validates heading structure against WCAG 2.1 guidelines (Success Criteria 1.3.1, 2.4.6, and 2.4.10). It checks for semantic heading markup, descriptive heading text, proper hierarchy, empty headings, hidden headings, and ARIA attributes. Screen reader users navigate pages by heading structure, so proper headings are essential for accessibility. The tool identifies violations and provides Quick Fix suggestions to achieve WCAG Level AA compliance.',
      keywords: 'WCAG 2.1, accessibility compliance, screen readers',
    },
    {
      question: 'Can I analyze password-protected or private pages?',
      answer:
        'For password-protected pages, use the "Paste HTML" or "Upload File" options instead of URL input. Simply view the page source in your browser (Ctrl+U or Cmd+U), copy the HTML, and paste it into our analyzer. For private localhost development, save the HTML file and use the file upload feature. The URL method only works for publicly accessible webpages.',
      keywords: 'private pages, localhost, HTML paste',
    },
    {
      question: 'What\'s the difference between Critical, Warning, and Info issues?',
      answer:
        'Critical issues (red) are severe problems that violate WCAG accessibility standards and significantly harm SEO, such as missing H1, skipped levels, or empty headings. Warnings (orange) are recommended fixes that improve SEO and user experience, like multiple H1 tags or overly long headings. Info items (blue) are best practice suggestions and optimization tips. Focus on fixing Critical errors first, then Warnings for maximum impact.',
      keywords: 'issue severity, error types, validation levels',
    },
    {
      question: 'How do I fix heading structure issues on my WordPress site?',
      answer:
        'For WordPress sites: 1) Use our analyzer to identify issues by entering your page URL. 2) Review the Quick Fix suggestions with before/after code examples. 3) Edit your page in WordPress block editor or theme customizer. 4) Modify heading blocks or HTML to match recommended structure. 5) Re-analyze to verify fixes. Popular SEO plugins like Yoast or Rank Math also provide heading analysis, but our tool offers more detailed validation and Quick Fix code snippets.',
      keywords: 'WordPress, CMS, heading fixes',
    },
    {
      question: 'Does Google penalize websites for bad heading structure?',
      answer:
        'While heading order is not a direct ranking factor according to Google (as of 2024), proper heading structure provides "strong signals" about page content and improves user experience metrics (dwell time, bounce rate) which DO affect rankings. Google uses headings to understand content hierarchy for featured snippets and rich results. Bad heading structure can also harm accessibility, potentially violating legal requirements in some jurisdictions.',
      keywords: 'Google ranking, SEO factors, search algorithms',
    },
    {
      question: 'Can I use this tool for bulk analysis of multiple pages?',
      answer:
        'Yes! Use our Batch Analysis mode to analyze multiple URLs simultaneously. Add up to 50 URLs, start the batch process, and view aggregated results. You can pause, resume, or cancel batch jobs, view individual page results, and export comprehensive reports in CSV or JSON format. Perfect for site audits, competitor analysis, or ongoing SEO monitoring.',
      keywords: 'batch analysis, bulk checker, multiple URLs',
    },
    {
      question: 'What export formats are available and how do I use them?',
      answer:
        'Export your analysis in three formats: 1) PDF - Comprehensive report with charts, ideal for client presentations and documentation. 2) CSV - Spreadsheet format for data analysis in Excel or Google Sheets. 3) JSON - Structured data for developers and API integrations. All exports include heading hierarchy, validation issues, metrics, and recommendations. Use the Export buttons below the analysis results.',
      keywords: 'export formats, PDF, CSV, JSON',
    },
    {
      question: 'How often should I check my website\'s heading structure?',
      answer:
        'Check heading structure: 1) Before launching new pages or blog posts. 2) After major content updates or redesigns. 3) During regular SEO audits (monthly or quarterly). 4) When experiencing drops in search rankings. 5) After migrating to a new CMS or theme. Regular monitoring ensures consistent SEO and accessibility compliance as your site evolves.',
      keywords: 'SEO monitoring, site audits, best practices',
    },
  ];

  return (
    <section className="max-w-4xl mx-auto py-12 px-4" id="faq">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-muted-foreground">
          Everything you need to know about HTML heading analysis and SEO optimization
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-start justify-between gap-4">
                <span>{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            {openIndex === index && (
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                {faq.keywords && (
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Related: {faq.keywords}
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Schema.org FAQ markup for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
