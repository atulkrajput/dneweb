import React from 'react';

// Avatar for "Dani", the website AI assistant. Drawn from the dneco logo: the slanted
// blue "o" ring with its orange dot, which looks around and blinks like an eye.
// Animations live in app.css (.dot-avatar-*) and stop for reduced motion.
//
// variant: 'solid' (navy disc, for the launcher) or 'light' (white disc, for
// use on the orange chat header). `active` speeds the eye up while thinking.
export default function DotAvatar({ size = 40, variant = 'solid', active = false, className = '' }) {
  const disc = variant === 'light' ? '#ffffff' : '#0A1E3E';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`dot-avatar ${active ? 'dot-avatar--active' : ''} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="24" cy="24" r="24" fill={disc} />
      {/* Slanted ring, like the "o" in the logo */}
      <g transform="rotate(-24 24 24)">
        <rect x="9" y="13.5" width="30" height="21" rx="10.5" fill="none" stroke="#1985F0" strokeWidth="5" />
      </g>
      {/* The orange dot: drifts around inside the ring and blinks */}
      <g className="dot-avatar-look">
        <circle className="dot-avatar-eye" cx="24" cy="24" r="4.6" fill="#FF6A14" />
      </g>
    </svg>
  );
}
