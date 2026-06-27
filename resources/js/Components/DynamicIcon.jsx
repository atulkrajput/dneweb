import React, { lazy, Suspense } from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Renders a Lucide icon by name. Falls back to null if the icon doesn't exist.
 * @param {string} name - The PascalCase Lucide icon name (e.g. "Rocket", "Bot")
 * @param {string} className - Tailwind classes for sizing/color
 */
export default function DynamicIcon({ name, className = 'w-6 h-6' }) {
  if (!name) return null;

  const IconComponent = LucideIcons[name];
  if (!IconComponent) return null;

  return <IconComponent className={className} />;
}
