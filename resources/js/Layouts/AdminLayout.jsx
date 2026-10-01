import React, { useState, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Settings, Users, Briefcase, Menu, X, LogOut, Package, ChevronDown, Handshake, Target, BarChart3, Building2, FolderKanban, CheckSquare, Receipt, FileSignature, Bell, PieChart, Moon, Sun, Wrench, Lightbulb, Key, Flag, Share2, Sparkles, Megaphone, Building } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import FlashNotification from '@/Components/FlashNotification';

export default function AdminLayout({ children, title }) {
  const { auth } = usePage().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const unreadCount = auth?.unreadNotifications || 0;
  const role = auth?.role || 'developer';
  const isSuperAdmin = auth?.isSuperAdmin || false;
  const currentPath = usePage().url;

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
      goals: ['project_manager'],
      social: ['project_manager', 'sales'],
    };
    return (access[module] || []).includes(role);
  };

  // Standalone item (no group) renders on its own.
  // Grouped items render inside a collapsible submenu.
  const dashboardItem = { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, module: null };

  const navGroups = [
    {
      name: 'Marketing Management',
      icon: Megaphone,
      items: [
        { name: 'Leads', href: '/admin/leads', icon: Target, module: 'leads' },
        { name: 'Clients', href: '/admin/clients', icon: Building2, module: 'clients' },
        { name: 'Proposals', href: '/admin/proposals', icon: FileSignature, module: 'proposals' },
        { name: 'Invoices', href: '/admin/invoices', icon: Receipt, module: 'invoices' },
        { name: 'Campaigns', href: '/admin/campaigns', icon: BarChart3, module: 'campaigns' },
        { name: 'Social Media', href: '/admin/social', icon: Share2, module: 'social' },
      ],
    },
    {
      name: 'Project Management',
      icon: FolderKanban,
      items: [
        { name: 'Projects', href: '/admin/projects', icon: FolderKanban, module: 'projects' },
        { name: 'Tasks', href: '/admin/tasks', icon: CheckSquare, module: 'tasks' },
        { name: 'Services', href: '/admin/services', icon: Briefcase, module: 'services' },
      ],
    },
    {
      name: 'Company Management',
      icon: Building,
      items: [
        { name: 'Team', href: '/admin/team', icon: Users, module: 'team' },
        { name: 'Goals', href: '/admin/goals', icon: Flag, module: 'goals' },
      ],
    },
    {
      name: 'Insights & AI',
      icon: Sparkles,
      items: [
        { name: 'AI Assistant', href: '/admin/ai-assistant', icon: Sparkles, module: null },
        { name: 'Reports', href: '/admin/reports', icon: PieChart, module: null },
        { name: 'Insights', href: '/admin/insights', icon: Lightbulb, module: null },
      ],
    },
    {
      name: 'Other',
      icon: Settings,
      items: [
        { name: 'Settings', href: '/admin/settings', icon: Settings, module: null, superAdmin: true },
        { name: 'API Management', href: '/admin/api-keys', icon: Key, module: null, superAdmin: true },
        { name: 'Maintenance', href: '/admin/maintenance', icon: Wrench, module: null, superAdmin: true },
      ],
    },
  ];

  const itemVisible = (item) => {
    if (item.superAdmin) return isSuperAdmin;
    if (item.module === null) return true;
    return canAccess(item.module);
  };

  // Filter groups down to visible items.
  const visibleGroups = useMemo(
    () =>
      navGroups
        .map((group) => ({ ...group, items: group.items.filter(itemVisible) }))
        .filter((group) => group.items.length > 0),
    [role, isSuperAdmin]
  );

  const isItemActive = (href) =>
    currentPath === href || (href !== '/admin' && currentPath.startsWith(href));

  // A group is open if it contains the active route (default), tracked in state so users can toggle.
  const initialOpen = {};
  visibleGroups.forEach((group) => {
    initialOpen[group.name] = group.items.some((item) => isItemActive(item.href));
  });
  const [openGroups, setOpenGroups] = useState(initialOpen);

  const toggleGroup = (name) =>
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));

  const closeSidebar = () => setSidebarOpen(false);

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
            {/* Dashboard (standalone) */}
            <Link
              href={dashboardItem.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isItemActive(dashboardItem.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <dashboardItem.icon className="h-5 w-5" />
              {dashboardItem.name}
            </Link>

            {/* Categorized groups */}
            {visibleGroups.map((group) => {
              const groupActive = group.items.some((item) => isItemActive(item.href));
              const isOpen = openGroups[group.name];
              return (
                <div key={group.name}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.name)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      groupActive && !isOpen
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    aria-expanded={isOpen}
                  >
                    <group.icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{group.name}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-1 ml-4 pl-3 border-l border-border space-y-1">
                      {group.items.map((item) => {
                        const active = isItemActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeSidebar}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              active
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer: name + theme + notifications + logout in one row */}
          <div className="p-4 border-t border-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{auth?.user?.name?.[0] || 'A'}</span>
              </div>
              <p className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">{auth?.user?.name}</p>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <Link
                href="/admin/notifications"
                onClick={closeSidebar}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-medium bg-primary text-primary-foreground rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/logout"
                method="post"
                as="button"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Link>
            </div>

            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2 mt-2 w-full rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={closeSidebar} />
      )}

      <FlashNotification />
    </div>
  );
}
