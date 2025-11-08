import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onShowShortcuts: () => void;
}

export default function Header({ onShowShortcuts }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-40 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-xl">
              H
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Heading Structure Analyzer
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                SEO optimization and WCAG accessibility compliance
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onShowShortcuts}
              variant="ghost"
              size="sm"
              title="Keyboard shortcuts (Shift + ?)"
            >
              <Keyboard className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Shortcuts</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
