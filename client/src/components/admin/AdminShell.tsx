import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
}

const navigation = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Sessions & Participants', href: '/admin/sessions', icon: Users },
  { label: 'Behavior Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Task Funnels', href: '/admin/analytics#tasks', icon: ClipboardList },
  { label: 'Event Timeline', href: '/admin/analytics#events', icon: Clock3 },
  { label: 'Issues & Errors', href: '/admin/analytics#issues', icon: Activity },
  { label: 'Research Insights', href: '/admin/analytics#insights', icon: Sparkles },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export const AdminShell: React.FC<AdminShellProps> = ({ children, title = 'Research workspace' }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href.split('#')[0]);
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] gap-5">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:z-auto lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${collapsed ? 'lg:w-[76px]' : 'lg:w-60'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <Link to="/admin" className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"><ShieldCheck className="h-4 w-4" /></span>
            {!collapsed && <span className="whitespace-nowrap text-sm font-bold text-slate-900">Research OS</span>}
          </Link>
          <button type="button" className="text-slate-400 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {!collapsed && <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</p>}
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              to={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                isActive(href) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          {!collapsed && <p className="px-3 pb-2 text-[10px] font-medium text-slate-400">{title}</p>}
          <button type="button" onClick={() => setCollapsed((value) => !value)} className="hidden w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 lg:flex">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">Menu</button>
          <span className="text-xs font-bold text-slate-500">Research OS</span>
          <CircleHelp className="h-4 w-4 text-slate-400" />
        </div>
        {children}
      </div>
    </div>
  );
};
