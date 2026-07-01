import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, CalendarCheck, CreditCard, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'RECEPTIONIST'] },
  { to: '/members', label: 'Members', icon: Users, roles: ['ADMIN', 'RECEPTIONIST', 'TRAINER'] },
  { to: '/trainers', label: 'Trainers', icon: Dumbbell, roles: ['ADMIN', 'RECEPTIONIST'] },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['ADMIN', 'RECEPTIONIST', 'TRAINER'] },
  { to: '/payments', label: 'Payments', icon: CreditCard, roles: ['ADMIN', 'RECEPTIONIST'] },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((i) => !user || i.roles.includes(user.role));

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-surface/80 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 lg:bg-transparent lg:backdrop-blur-none',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-kinetic flex items-center justify-center font-display font-bold text-white">
              P
            </div>
            <span className="font-display text-lg font-bold tracking-tight">PRIME</span>
          </div>
          <button className="lg:hidden focus-ring rounded" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="px-3 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-kinetic text-white'
                    : 'text-ink-muted hover:bg-surface hover:text-ink'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
