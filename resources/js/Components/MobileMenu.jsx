import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/Components/ui/sheet';

/**
 * The mobile navigation drawer. Extracted into its own chunk so the Radix
 * dialog primitive (Sheet) is only downloaded/parsed when a mobile user opens
 * the menu — keeping it out of the initial bundle to reduce Total Blocking Time.
 *
 * Rendered controlled: the parent owns `open`/`onOpenChange` state and only
 * mounts this component once the menu has been opened at least once.
 */
export default function MobileMenu({ open, onOpenChange, navItems, isActive }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card border-border">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <nav className="flex flex-col space-y-4 mt-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => onOpenChange(false)}
              className={`px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-border mt-4">
            <Link href="/contact#contact-form" onClick={() => onOpenChange(false)}>
              <Button className="w-full btn-primary py-6 text-base">
                Let's Build
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
