import React, { useState, lazy, Suspense } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import ThemeToggle from '@/Components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

// The mobile drawer pulls in the Radix dialog primitive. Load it in its own
// chunk and only after the menu is first opened, so it never blocks initial load.
const MobileMenu = lazy(() => import('@/Components/MobileMenu'));

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  // Once the menu has been opened at least once, keep the component mounted so
  // the open/close animation stays smooth on subsequent toggles.
  const [menuMounted, setMenuMounted] = useState(false);
  const { url } = usePage();
  const { theme } = useTheme();

  const openMenu = () => {
    setMenuMounted(true);
    setIsOpen(true);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About DNE', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Products', path: '/products' },
    { name: 'Insights', path: '/insights' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return url === '/';
    return url.startsWith(path);
  };

  const logoSrc = theme === 'dark' ? '/logo-white.png' : '/logo.png';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 py-[3px] items-center justify-between">
          <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-80">
            <img src={logoSrc} alt="DNE Consultants" className="h-[50px] w-auto" width="89" height="50" />
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link href="/contact#contact-form">
              <Button className="btn-primary px-6 py-5">
                Let's Build
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-muted"
              aria-label="Open navigation menu"
              aria-expanded={isOpen}
              onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            {menuMounted && (
              <Suspense fallback={null}>
                <MobileMenu
                  open={isOpen}
                  onOpenChange={setIsOpen}
                  navItems={navItems}
                  isActive={isActive}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
