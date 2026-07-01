import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between rounded-2xl px-4 py-3 mb-6">
      <button className="lg:hidden focus-ring rounded p-1" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <div className="hidden lg:block">
        <p className="text-sm text-ink-muted">
          Welcome back,{' '}
          <span className="font-medium text-ink">{user?.profile?.firstName || user?.email}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="focus-ring rounded-full p-2 hover:bg-surface"
          aria-label="Toggle dark and light mode"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={handleLogout}
          className="focus-ring flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-surface"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </header>
  );
}
