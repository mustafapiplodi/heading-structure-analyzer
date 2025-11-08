# Heading Structure Analyzer

A powerful web-based tool for analyzing HTML heading structures (H1-H6) to optimize SEO performance and ensure WCAG accessibility compliance.

## Overview

The Heading Structure Analyzer helps content creators, developers, and SEO professionals validate heading hierarchies, detect structural issues, and receive actionable recommendations for improvement.

## Key Features

- **Comprehensive Analysis**: Extract and analyze all H1-H6 headings from any webpage
- **Hierarchy Validation**: Detect structural violations including skipped levels, multiple H1s, and empty headings
- **Visual Representation**: Interactive tree view, table view, and outline view with color-coded severity indicators
- **Accessibility Focus**: Ensure WCAG compliance and screen reader compatibility
- **Multiple Input Methods**: URL input, HTML paste, and file upload support
- **Export Options**: PDF reports, CSV data exports, and JSON for programmatic access
- **Actionable Insights**: Quick-fix suggestions with before/after code comparisons

## Problem Statement

Based on Google's July 2024 clarification, while heading order isn't a direct ranking factor, proper heading structure remains crucial for:
- User experience and content scannability
- Accessibility and screen reader navigation
- Behavioral signals (dwell time, bounce rate) that influence rankings
- Featured snippet optimization
- AI-generated result surfacing

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: React Flow for interactive tree diagrams
- **DOM Parsing**: Cheerio (server-side) and native DOMParser (client-side)
- **Deployment**: Vercel

## Getting Started

Detailed implementation instructions are available in `claude.md`.

### Development Roadmap

**Phase 1 (Weeks 1-4)**: MVP with core analysis and tree visualization
**Phase 2 (Weeks 5-8)**: Enhanced features including browser extension
**Phase 3 (Weeks 9-16)**: Advanced capabilities with AI suggestions and historical tracking

## Validation Rules

### Critical Errors
- Multiple H1 tags on a single page
- Skipped heading levels (e.g., H1→H3 without H2)
- Empty headings with no content
- Missing H1 at the start of the page
- Headings nested inside other headings

### Warnings
- Headings longer than 70 characters
- Headings shorter than 3 characters
- Generic heading text
- Keyword stuffing patterns
- Inconsistent structural patterns

## SEO & Accessibility Guidelines

### SEO Best Practices (2024-2025)
- Single H1 per page (recommended)
- H1 length: 20-70 characters optimal
- H2 tags every 200-500 words in long-form content
- Descriptive, unique headings
- Focus on user experience and scannability

### WCAG Compliance
- **Level A**: Semantic heading markup required (1.3.1)
- **Level AA**: Headings must describe topic/purpose (2.4.6)
- **Level AAA**: Section headings recommended (2.4.10)

## Market Differentiation

Our tool stands out through:
1. Best-in-class interactive visualizations
2. Combined SEO + Accessibility analysis
3. Bulk analysis capabilities
4. AI-powered recommendations
5. Historical tracking and monitoring

## Contributing

This project is in active development. Contributions, issues, and feature requests are welcome.

## License

MIT License - see LICENSE file for details

## Resources

- [Implementation Guide](claude.md) - Comprehensive development documentation
- [Research Document](heading%20structure.md) - Detailed market research and technical specifications
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Flow Documentation](https://reactflow.dev/)

## Contact

For questions, feedback, or collaboration opportunities, please open an issue in this repository.

---

**Status**: Planning & Initial Development
**Version**: 0.1.0
**Last Updated**: January 2025
