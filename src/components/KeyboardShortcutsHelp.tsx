import { formatShortcut } from '../hooks/useKeyboardShortcuts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: Shortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({
  shortcuts,
  isOpen,
  onClose,
}: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Keyboard Shortcuts</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Use these keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index}>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-900 dark:text-gray-100">{shortcut.description}</span>
                <Badge variant="outline" className="font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                  {formatShortcut(shortcut as any)}
                </Badge>
              </div>
              {index < shortcuts.length - 1 && <Separator className="bg-gray-200 dark:bg-gray-700" />}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
