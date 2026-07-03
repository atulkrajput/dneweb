import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Settings, Users, Briefcase, MessageSquare, Menu, X, LogOut, FileText, Package, ChevronDown, Star, Handshake, Target, BarChart3, Building2, FolderKanban, CheckSquare, Receipt, FileSignature, Bell, PieChart, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function AdminLayout({ children, title }) {
  const { auth } = usePage().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const unreadCount = auth?.unreadNotifications || 0;
  const role = auth?.role || 'developer';
  const isSuperAdmin = auth?.isSuperAdmin || false;

  const canAccess = (module) => {
    if (isSuperAdmin) return true;
    const access = {
      leads: ['sales', 'project_manager'],
      clients: ['sales', 'project_manager', 'accountant'],
      proposals: ['sales', 'project_manager'],
      projects: ['project_manager', 'developer'],
      tasks: ['project_manager', 'developer'],
      invoices: ['accountant', 'sales'],
      campaigns: ['sales'],
      services: ['project_manager'],
      team: ['project_manager'],
    };
    return (access[module] || []).includes(role);
  };

  const allNavItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, module: null },
    { name: 'Leads', href: '/admin/leads', icon: Target, module: 'leads' },
    { name: 'Clients', href: '/admin/clients', icon: Building2, module: 'clients' },
    { name: 'Proposals', href: '/admin/proposals', icon: FileSignature, module: 'proposals' },
    { name: 'Projects', href: '/admin/projects', icon: FolderKanban, module: 'projects' },
    { name: 'Tasks', href: '/admin/tasks', icon: CheckSquare, module: 'tasks' },
    { name: 'Invoices', href: '/admin/invoices', icon: Receipt, module: 'invoices' },
    { name: 'Campaigns', href: '/admin/campaigns', icon: BarChart3, module: 'campaigns' },
    { name: 'Reports', href: '/admin/reports', icon: PieChart, module: null },
    { name: 'Services', href: '/admin/services', icon: Briefcase, module: 'services' },
    { name: 'Team', href: '/admin/team', icon: Users, module: 'team' },
    { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare, module: null },
    { name: 'Settings', href: '/admin/settings', icon: Settings, module: null },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.module === null) {
      if (item.name === 'Settings') return isSuperAdmin;
      return true;
    }
    return canAccess(item.module);
  });

  const currentPath = usePage().url;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <img src="/logo-white.png" alt="DNE Admin" className="h-7 w-auto" />
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-foreground">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full min-h-0">
          <div className="p-6 border-b border-border">
            <Link href="/admin" className="flex items-center gap-3">
              <img src="/logo-white.png" alt="DNE" className="h-7 w-auto" />
              <span className="text-sm font-semibold text-primary">Admin</span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.href || (item.href !== '/admin' && currentPath.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border shrink-0">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{auth?.user?.name?.[0] || 'A'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{auth?.user?.name}</p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
            <Link
              href="/admin/notifications"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2 mt-2 w-full rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">{unreadCount}</span>
              )}
            </Link>
            <Link
              href="/logout"
              method="post"
              as="button"
              className="flex items-center gap-3 px-4 py-2 mt-1 w-full rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2 mt-1 w-full rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              ← View Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {title && (
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
