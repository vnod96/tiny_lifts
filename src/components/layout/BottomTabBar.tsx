import { NavLink } from 'react-router-dom';
import { Dumbbell, History, TrendingUp, Settings } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Log', icon: Dumbbell },
  { to: '/history', label: 'History', icon: History },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-atlas-surface border-t border-atlas-border pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `ripple flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-atlas-accent bg-atlas-accent/10'
                  : 'text-atlas-text-muted hover:text-atlas-text active:scale-90'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[11px] transition-all duration-200 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
