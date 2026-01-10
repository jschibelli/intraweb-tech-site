import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { AnimatePresence, motion } from 'framer-motion';

export const Animated404Visual: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion || !svgRef.current) return;

    // Animation logic using vanilla JS
    const nodes = svgRef.current.querySelectorAll('.node, .broken-node');
    const lines = svgRef.current.querySelectorAll('.connection-line, .broken-line');

    // Animate nodes with subtle floating effect
    nodes.forEach((node, index) => {
      const duration = 2 + (index * 0.5);
      const delay = index * 0.2;

      // Simple CSS animation for floating effect
      (node as HTMLElement).style.animation = `float ${duration}s ease-in-out ${delay}s infinite alternate`;
    });

    // Animate connection lines with pulse/opacity effect
    lines.forEach((line, index) => {
      const duration = 3 + (index * 0.3);
      const delay = index * 0.5;

      // Pulse effect for lines
      (line as HTMLElement).style.animation = `pulse ${duration}s ease-in-out ${delay}s infinite alternate`;
    });

    return () => {
      // Cleanup animations if needed
      nodes.forEach((node) => {
        (node as HTMLElement).style.animation = '';
      });

      lines.forEach((line) => {
        (line as HTMLElement).style.animation = '';
      });
    };
  }, [prefersReducedMotion]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox="0 0 400 300"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        aria-hidden="true"
      >
        <style>
          {`
            @keyframes float {
              0% { transform: translateY(0); }
              100% { transform: translateY(-10px); }
            }
            
            @keyframes pulse {
              0% { opacity: 0.3; }
              100% { opacity: 0.7; }
            }
            
            .node {
              fill: var(--color-purple, #7F5AF0);
              stroke: none;
              cursor: pointer;
            }
            
            .broken-node {
              fill: var(--color-orange, #FF6B3B);
              stroke: none;
              cursor: pointer;
              transition: transform 0.2s ease;
            }
            
            .broken-node:hover {
              transform: scale(1.1);
            }
            
            .connection-line {
              stroke: var(--color-purple, #7F5AF0);
              stroke-width: 2;
              stroke-dasharray: 5, 5;
              opacity: 0.5;
            }
            
            .broken-line {
              stroke: var(--color-orange, #FF6B3B);
              stroke-width: 2;
              stroke-dasharray: 2, 8;
              opacity: 0.7;
            }
            
            @media (prefers-color-scheme: dark) {
              .node {
                fill: var(--color-purple-light, #9D7EF2);
              }
              .connection-line {
                stroke: var(--color-purple-light, #9D7EF2);
              }
            }
          `}
        </style>

        {/* Connected nodes */}
        <circle className="node" cx="100" cy="100" r="15" />
        <circle className="node" cx="200" cy="60" r="15" />
        <circle className="node" cx="300" cy="120" r="15" />
        <circle className="node" cx="120" cy="220" r="15" />
        <circle className="node" cx="230" cy="180" r="15" />

        {/* The "broken" or "missing" node */}
        <circle
          className="broken-node"
          cx="320"
          cy="220"
          r="15"
          onMouseEnter={() => setHoveredNode(1)}
          onMouseLeave={() => setHoveredNode(null)}
        />

        {/* Connection lines between nodes */}
        <line className="connection-line" x1="100" y1="100" x2="200" y2="60" />
        <line className="connection-line" x1="200" y1="60" x2="300" y2="120" />
        <line className="connection-line" x1="100" y1="100" x2="120" y2="220" />
        <line className="connection-line" x1="120" y1="220" x2="230" y2="180" />
        <line className="connection-line" x1="230" y1="180" x2="200" y2="60" />

        {/* Broken connection line */}
        <line className="broken-line" x1="230" y1="180" x2="320" y2="220" />
        <line className="broken-line" x1="300" y1="120" x2="320" y2="220" />

        {/* Subtle "404" text integrated with the design */}
        <text
          x="220"
          y="250"
          textAnchor="middle"
          fill="var(--color-purple, #7F5AF0)"
          opacity="0.15"
          fontWeight="bold"
          fontSize="60"
          className="dark:fill-purple-light"
        >
          404
        </text>
      </svg>

      {/* Easter egg tooltip */}
      <AnimatePresence>
        {hoveredNode === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[220px] right-[60px] bg-white dark:bg-charcoal-800 text-charcoal dark:text-white text-sm px-3 py-2 rounded-md shadow-md"
          >
            Oops, this one&apos;s off the grid.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 