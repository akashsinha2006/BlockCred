import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || 'light');
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('bc-theme', next); } catch { /* ignore */ }
    setTheme(next);
  };
  return (
    <button className="icon-btn lg" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
