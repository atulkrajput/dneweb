import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Cpu, Globe, Cloud, Zap, Shield, Database, Code } from 'lucide-react';

const techNodes = [
  { id: 'ai', label: 'AI', icon: Bot, angle: 270 },
  { id: 'automation', label: 'Automation', icon: Zap, angle: 315 },
  { id: 'cloud', label: 'Cloud', icon: Cloud, angle: 0 },
  { id: 'web', label: 'Web', icon: Globe, angle: 45 },
  { id: 'security', label: 'Security', icon: Shield, angle: 90 },
  { id: 'data', label: 'Data', icon: Database, angle: 135 },
  { id: 'code', label: 'Code', icon: Code, angle: 180 },
  { id: 'compute', label: 'Compute', icon: Cpu, angle: 225 },
];

const GLOBE_R = 25; // Globe radius in viewBox units (center is 50,50)
const NODE_ORBIT = 42; // Node distance from center in viewBox units

function getNodeXY(angle) {
  const rad = (angle) * (Math.PI / 180);
  return {
    x: 50 + NODE_ORBIT * Math.cos(rad),
    y: 50 + NODE_ORBIT * Math.sin(rad),
  };
}

// Stars as simple positioned divs
function Stars() {
  const stars = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
  }));

  return (
    <>
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-foreground/15 dark:bg-white/30"
          style={{ left: star.left, top: star.top, width: star.size, height: star.size }}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
        />
      ))}
    </>
  );
}

function FloatingNode({ node, index }) {
  const Icon = node.icon;
  const { x, y } = getNodeXY(node.angle);

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: '60px',
        marginLeft: '-30px',
        marginTop: '-24px',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1, type: "spring", stiffness: 150 }}
    >
      <motion.div
        className="flex items-center justify-center w-11 h-11 rounded-xl
          bg-card/90 dark:bg-card/80 backdrop-blur-md border border-border/50 dark:border-border/40
          shadow-lg shadow-black/5 dark:shadow-black/20
          hover:border-primary/50 hover:shadow-primary/10 transition-all duration-300 cursor-default"
        whileHover={{ scale: 1.12 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ y: { duration: 3 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 } }}
      >
        <Icon className="w-5 h-5 text-primary" />
      </motion.div>
      <span className="text-[9px] font-semibold mt-1 text-muted-foreground/70 uppercase tracking-wider text-center whitespace-nowrap">
        {node.label}
      </span>
    </motion.div>
  );
}

export default function TechNetworkAnimation() {
  const r = GLOBE_R;

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto overflow-visible">
      {/* Stars */}
      <Stars />

      {/* Globe SVG — centered at 50,50 in a 0-100 viewBox, maps to container center */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="globe-glow">
            <stop offset="60%" stopColor="hsl(25, 95%, 53%)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="hsl(25, 95%, 53%)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow */}
        <circle cx="50" cy="50" r={r * 1.3} fill="url(#globe-glow)" />

        {/* Globe outline */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          className="stroke-primary/25 dark:stroke-primary/35"
          strokeWidth="0.4"
        />

        {/* Vertical meridians */}
        {[-45, -15, 15, 45].map((tilt, i) => (
          <ellipse
            key={`m-${i}`}
            cx="50" cy="50"
            rx={r * Math.abs(Math.cos((tilt * Math.PI) / 180))}
            ry={r}
            fill="none"
            className="stroke-primary/10 dark:stroke-primary/15"
            strokeWidth="0.3"
            transform={`rotate(${tilt} 50 50)`}
          />
        ))}

        {/* Center meridian */}
        <ellipse cx="50" cy="50" rx={r * 0.15} ry={r} fill="none" className="stroke-primary/10 dark:stroke-primary/15" strokeWidth="0.3" />

        {/* Latitude lines */}
        {[-20, -10, 10, 20].map((offset, i) => {
          const latY = 50 + offset;
          const cosLat = Math.sqrt(Math.max(0, 1 - (offset / r) * (offset / r)));
          const rx = r * cosLat;
          return (
            <ellipse
              key={`l-${i}`}
              cx="50" cy={latY}
              rx={rx} ry={rx * 0.12}
              fill="none"
              className="stroke-primary/10 dark:stroke-primary/15"
              strokeWidth="0.3"
            />
          );
        })}

        {/* Equator */}
        <ellipse cx="50" cy="50" rx={r} ry={r * 0.12} fill="none" className="stroke-primary/20 dark:stroke-primary/30" strokeWidth="0.4" />

        {/* Rotating arc */}
        <motion.ellipse
          cx="50" cy="50"
          rx={r * 0.7} ry={r}
          fill="none"
          className="stroke-primary/15 dark:stroke-primary/20"
          strokeWidth="0.3"
          strokeDasharray="6 10"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '50px 50px' }}
        />

        {/* Orbiting dots */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={`d-${i}`}
            r="0.7"
            className="fill-primary/60"
            animate={{
              cx: [
                50 + r * 0.8 * Math.cos(i * 1.3),
                50 - r * 0.5 * Math.cos(i * 0.9 + 1),
                50 + r * 0.8 * Math.cos(i * 1.3),
              ],
              cy: [
                50 + r * 0.5 * Math.sin(i * 1.4),
                50 - r * 0.7 * Math.sin(i + 0.5),
                50 + r * 0.5 * Math.sin(i * 1.4),
              ],
            }}
            transition={{ duration: 7 + i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* Nodes — positioned using same percentage system (50% = center, matching SVG 50,50) */}
      {techNodes.map((node, i) => (
        <FloatingNode key={node.id} node={node} index={i} />
      ))}

      {/* Center text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className="text-center">
          <div className="text-base font-bold text-primary tracking-wide">DNE</div>
          <div className="text-[10px] text-muted-foreground/60 mt-0.5 leading-tight">
            Connecting Your<br />Ecosystem
          </div>
        </div>
      </motion.div>
    </div>
  );
}
