import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Settings, Users, Briefcase, MessageSquare, Menu, X, LogOut, FileText, Package, ChevronDown } from 'lucide-react';

export default function AdminLayout({ children, title }) {
  const { auth } = usePage().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Services', href: '/admin/services', icon: Briefcase },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Team Members', href: '/admin/team', icon: Users },
    { name: 'Contacts', href: '/admin/contacts', icon: MessageSquare },
    { name: 'Legal Pages', href: '/admin/legal-pages', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

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
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <Link href="/admin" className="flex items-center gap-3">
              <img src="/logo-white.png" alt="DNE" className="h-7 w-auto" />
              <span className="text-sm font-semibold text-primary">Admin</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
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

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{auth?.user?.name?.[0] || 'A'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{auth?.user?.name}</p>
              </div>
            </div>
            <Link
              href="/logout"
              method="post"
              as="button"
              className="flex items-center gap-3 px-4 py-2 mt-2 w-full rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
