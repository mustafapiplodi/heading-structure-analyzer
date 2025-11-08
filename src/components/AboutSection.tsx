import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Accessibility,
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
  FileCheck,
  Download,
  GitCompare,
} from 'lucide-react';

export default function AboutSection() {
  const features = [
    {
      icon: Search,
      title: 'SEO Optimization',
      description:
        'Analyze heading hierarchy to improve search engine rankings and content structure for better organic visibility.',
    },
    {
      icon: Accessibility,
      title: 'WCAG Accessibility',
      description:
        'Ensure compliance with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards for screen readers.',
    },
    {
      icon: FileCheck,
      title: 'Multi-Input Methods',
      description:
        'Paste HTML directly, enter any URL, or upload HTML files for instant heading structure analysis.',
    },
    {
      icon: Zap,
      title: 'Real-Time Validation',
      description:
        'Get instant feedback on heading issues including missing H1, skipped levels, and empty headings.',
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      description:
        'Interactive tree view and table displays with detailed metrics, charts, and distribution analysis.',
    },
    {
      icon: Shield,
      title: 'Quick Fix Suggestions',
      description:
        'Actionable recommendations with before/after code examples and one-click copy buttons for fast fixes.',
    },
    {
      icon: Download,
      title: 'Export Reports',
      description:
        'Download comprehensive analysis reports in PDF, CSV, or JSON formats for documentation and sharing.',
    },
    {
      icon: GitCompare,
      title: 'Comparison Mode',
      description:
        'Compare heading structures between two HTML documents to track changes and improvements over time.',
    },
  ];

  return (
    <section className="max-w-6xl mx-auto py-12 px-4" id="about">
      {/* Main About Content */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Free SEO & Accessibility Tool
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            About Heading Structure Analyzer
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A professional-grade, free online tool for analyzing HTML heading structures (H1-H6) to
            optimize SEO performance and ensure WCAG accessibility compliance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Why Heading Structure Matters for SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Search engines like Google use heading tags (H1, H2, H3, H4, H5, H6) to understand
                your content hierarchy and topic relevance. Proper heading structure helps:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Improve search engine rankings and organic traffic</li>
                <li>Increase click-through rates from search results</li>
                <li>Enhance content scannability and user engagement</li>
                <li>Target featured snippets and rich results</li>
                <li>Reduce bounce rates with better content organization</li>
              </ul>
              <p className="pt-2">
                <strong>SEO Best Practice:</strong> Use a single H1 tag that captures your main
                topic, followed by H2-H6 tags in logical hierarchy. Avoid skipping levels (e.g., H1
                → H3).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-primary" />
                WCAG Accessibility Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Properly structured headings are essential for web accessibility, helping screen
                reader users navigate content efficiently. Our tool validates:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>WCAG 2.1 Level A:</strong> Semantic heading markup (Success Criterion
                  1.3.1)
                </li>
                <li>
                  <strong>WCAG 2.1 Level AA:</strong> Descriptive headings (Success Criterion
                  2.4.6)
                </li>
                <li>
                  <strong>WCAG 2.1 Level AAA:</strong> Section headings (Success Criterion 2.4.10)
                </li>
                <li>Screen reader navigation and document outline</li>
                <li>Hidden heading detection and ARIA attributes</li>
              </ul>
              <p className="pt-2">
                <strong>Accessibility Fact:</strong> 60% of screen reader users prefer single H1
                headings. Maintain explicit hierarchy for optimal navigation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-center mb-8">Powerful Features</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <Card className="mb-16">
        <CardHeader>
          <CardTitle className="text-2xl">How to Use This HTML Heading Checker</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <Badge variant="outline" className="h-8 w-8 flex items-center justify-center shrink-0">
                1
              </Badge>
              <div>
                <h4 className="font-semibold mb-1">Choose Input Method</h4>
                <p className="text-sm text-muted-foreground">
                  Paste HTML code, enter a URL, or upload an HTML file (.html or .htm format).
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <Badge variant="outline" className="h-8 w-8 flex items-center justify-center shrink-0">
                2
              </Badge>
              <div>
                <h4 className="font-semibold mb-1">Analyze Structure</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Analyze Heading Structure" to scan all H1-H6 tags and validate hierarchy.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <Badge variant="outline" className="h-8 w-8 flex items-center justify-center shrink-0">
                3
              </Badge>
              <div>
                <h4 className="font-semibold mb-1">Review Issues</h4>
                <p className="text-sm text-muted-foreground">
                  View critical errors, warnings, and SEO recommendations with actionable fixes.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <Badge variant="outline" className="h-8 w-8 flex items-center justify-center shrink-0">
                4
              </Badge>
              <div>
                <h4 className="font-semibold mb-1">Implement & Export</h4>
                <p className="text-sm text-muted-foreground">
                  Use Quick Fix suggestions to correct issues and export reports for documentation.
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* SEO Keywords Section */}
      <div className="text-center text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>Related Keywords:</strong> HTML heading checker, H1 tag analyzer, heading
          structure validator, SEO heading tool, WCAG compliance checker, heading hierarchy
          analyzer, H1-H6 validator, accessibility heading checker, heading tag SEO, HTML outline
          checker, webpage heading analyzer, heading structure audit tool
        </p>
      </div>
    </section>
  );
}
