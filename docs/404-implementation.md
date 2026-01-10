# IntraWeb Technologies - 404 Page Implementation Guidelines

## Overview

This document provides detailed implementation instructions for building the custom 404 error page for IntraWeb Technologies. The design maintains visual consistency with our existing landing page while providing users with a helpful experience when they encounter missing content.

## Technical Requirements

- **Stack**: Next.js, React, TypeScript, Tailwind CSS
- **Dependencies**: Framer Motion, Sentry (optional for error logging)
- **File Structure**: Pages directory pattern with component extraction
- **Responsive Requirements**: Mobile-first approach with breakpoints at 375px, 768px, and 1440px

## Implementation Steps

### 1. Create the Base 404 Page

Start by creating the 404.tsx file in your pages directory:

```typescript
// pages/404.tsx
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Animated404Visual } from '../components/Animated404Visual';

// Optional: Import Sentry if you're using error logging
// import * as Sentry from '@sentry/nextjs';

const NotFoundPage: React.FC = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    // Auto-focus heading for accessibility
    if (headingRef.current) {
      headingRef.current.focus();
    }
    
    // Optional: Log 404 error to Sentry
    // Sentry.captureMessage(`404 - Page Not Found: ${currentPath}`, 'info');
    
    // Optional: Analytics tracking
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'pageNotFound',
        'pagePath': currentPath
      });
    }
  }, [currentPath]);

  return (
    <>
      <Head>
        <title>Page Not Found | IntraWeb Technologies</title>
        <meta name="description" content="The page you're looking for doesn't exist or has been moved." />
      </Head>
      
      <main 
        className="min-h-screen bg-white dark:bg-charcoal-900 text-charcoal dark:text-gray-100 flex flex-col items-center justify-center px-6 py-16 text-center" 
        role="main" 
        aria-labelledby="404-heading"
      >
        <div className="max-w-md">
          <h1 
            id="404-heading"
            ref={headingRef}
            className="text-5xl md:text-7xl font-bold text-purple dark:text-purple-light mb-4"
            tabIndex={-1}
          >
            404
          </h1>
          <p className="text-xl font-semibold mb-2">Page Not Found</p>
          <p className="text-base md:text-sm text-gray-600 dark:text-gray-300 mb-8">
            We couldn't find the page you were looking for. It might have been moved or deleted.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/" 
              className="px-5 py-3 rounded-md bg-orange text-white hover:bg-orange-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange dark:focus:ring-offset-charcoal-900"
            >
              Go to Homepage
            </Link>
            <Link 
              href="/contact" 
              className="px-5 py-3 rounded-md border border-purple text-purple dark:text-purple-light dark:border-purple-light hover:bg-purple-light dark:hover:bg-purple-dark/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple dark:focus:ring-offset-charcoal-900"
            >
              Contact Support
            </Link>
          </div>
        </div>

        <div className="mt-12 max-w-[400px] w-full">
          <Animated404Visual />
        </div>
      </main>
    </>
  );
};

export default NotFoundPage;
```

### 2. Create the Reduced Motion Hook

Create a custom hook to respect user motion preferences:

```typescript
// hooks/useReducedMotion.ts
import { useState, useEffect } from 'react';

export const useReducedMotion = (): boolean => {
  // Default to false to ensure animations run server-side on first render
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } 
    // Older browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => {
        mediaQuery.removeListener(handleChange);
      };
    }
  }, []);
  
  return prefersReducedMotion;
};
```

### 3. Implement the Animation Component

Create the visual component with the network node animation:

```typescript
// components/Animated404Visual.tsx
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
            Oops, this one's off the grid.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

### 4. Update Tailwind Configuration

Ensure your tailwind.config.js includes the required colors and dark mode:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'media', // Use 'class' if you prefer manual dark mode toggle
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#7F5AF0',
          light: '#9D7EF2',
          dark: '#6A4AD0'
        },
        orange: {
          DEFAULT: '#FF6B3B',
          dark: '#E55A2A'
        },
        charcoal: {
          DEFAULT: '#333333',
          800: '#242424',
          900: '#1A1A1A'
        }
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
```

### 5. Install Required Dependencies

Make sure to install the necessary dependencies:

```bash
npm install framer-motion
# Or if using yarn
yarn add framer-motion

# Optional: For error logging
npm install @sentry/nextjs
# Or
yarn add @sentry/nextjs
```

## Accessibility Considerations

- The page provides keyboard focus management via `useRef` and `tabIndex`
- SVG elements are marked with `aria-hidden="true"` as they are decorative
- Focus states are clearly visible with proper contrast
- Animations respect user preferences with the `useReducedMotion` hook
- All interactive elements have proper focus styles

## Responsive Behavior

The implementation follows a mobile-first approach with these key breakpoints:
- Mobile (375px): Stacked CTAs, smaller heading text
- Tablet/Medium (768px): Side-by-side CTAs, larger heading text
- Desktop (1440px): Maximum width container centered, optimal spacing

## Dark Mode Support

Dark mode automatically activates based on system preferences with:
- Color adjustments for background, text, and SVG elements
- Focus ring offsets that work on dark backgrounds
- Hover states that maintain proper contrast in both modes

## Testing Instructions

1. Verify the page appears correctly when navigating to a non-existent route
2. Test keyboard navigation through all interactive elements
3. Confirm hover states and the Easter egg tooltip work as expected
4. Ensure proper rendering on mobile, tablet, and desktop widths
5. Test with reduced motion preferences enabled
6. Verify dark mode rendering
7. Confirm screen readers properly announce the heading and content

## Performance Considerations

- SVG animations use CSS rather than JavaScript when possible
- Framer Motion is tree-shakable and only imports what's needed
- Cleanup functions prevent memory leaks on component unmount
- Animations are conditionally rendered based on user preferences

---

This implementation achieves all our 404 page goals:
- Brand-aligned visual continuity
- Useful recovery paths for users
- Creative touch that aligns with our "approachable tech" tone
- Performance-optimized and fully responsive design
- Accessibility-first approach with proper keyboard support
- Dark mode compatibility