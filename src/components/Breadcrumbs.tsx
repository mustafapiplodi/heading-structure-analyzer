import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        <li>
          <a
            href="https://www.scalinghigh.com"
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Home
          </a>
        </li>
        <li>
          <ChevronRight className="h-4 w-4" />
        </li>
        <li className="font-medium text-foreground" aria-current="page">
          Heading Structure Analyzer
        </li>
      </ol>
    </nav>
  );
}
