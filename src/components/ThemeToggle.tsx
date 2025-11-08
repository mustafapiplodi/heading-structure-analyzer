import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    console.log('ThemeToggle clicked! Current theme:', theme);
    toggleTheme();
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="icon"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95"
    >
      <div className="relative w-5 h-5">
        <Moon
          className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${
            theme === 'light'
              ? 'rotate-0 opacity-100 scale-100'
              : 'rotate-90 opacity-0 scale-0'
          }`}
        />
        <Sun
          className={`absolute inset-0 h-5 w-5 transition-all duration-500 ${
            theme === 'dark'
              ? 'rotate-0 opacity-100 scale-100'
              : '-rotate-90 opacity-0 scale-0'
          }`}
        />
      </div>
    </Button>
  );
}
