# IntraWeb Technologies - Website Pre-Launch Technical Implementation Guide

## Overview

You are tasked with implementing the website pre-launch optimizations for IntraWeb Technologies. The website is built with Next.js, React, TypeScript, and Tailwind CSS. Please provide actual, working code snippets that can be directly copied and used without modification, and detailed technical guidance for implementing each required improvement.

Focus on delivering production-ready code rather than theory or explanations. For each task, provide:
1. The exact code/files to create or modify
2. Clear file paths where applicable
3. Step-by-step implementation instructions
4. Complete, working examples that can be directly used

## 1. Performance & SEO Implementation

### 1.1. Lighthouse Audit Implementation

- Create a script file at `/scripts/lighthouse-audit.js` that can be run to automatically generate Lighthouse reports for key pages
- Include code to export the results as HTML and JSON
- Provide a npm script to add to package.json

### 1.2. Image Optimization Implementation

- Create reusable image components that properly implement next/image
- Provide exact code for responsive hero images, gallery images, and thumbnail implementations
- Include responsive image handling for all breakpoints (1440px, 768px, 375px)

### 1.3. Meta Tags Implementation 

- Create a `components/SEO.tsx` component with all necessary meta tags, Open Graph tags, and Twitter cards
- Implement JSON-LD structured data for a web development agency
- Show exact implementation for homepage, about page, and services page

### 1.4. Sitemap.xml & robots.txt Implementation

- Implement sitemap generation for Next.js with all relevant pages
- Create the exact robots.txt file content
- Provide installation and implementation steps for next-sitemap

## 2. Content & Linking Implementation

### 2.1. 404 Page Implementation

- Create a complete, styled 404.tsx page component with:
  - On-brand styling matching the IntraWeb design system
  - Helpful navigation options
  - Error tracking implementation

### 2.2. Legal Compliance Implementation

- Create the basic structure for Privacy Policy and Terms of Service pages
- Implement a reusable footer component with proper legal links
- Add cookie consent banner implementation if required

### 2.3. Navigation Link Audit Implementation

- Create a script at `/scripts/check-links.js` to validate all internal and external links
- Implement proper navigation components with accessibility features
- Ensure all CTAs have proper tracking attributes

### 2.4. Dead Code Removal Implementation

- Implement Webpack Bundle Analyzer configuration
- Create a script to identify unused components and CSS
- Provide exact commands to run for code cleanup

## 3. Brand Consistency Implementation

### 3.1. Color/Typography Audit Implementation

- Create a comprehensive Tailwind theme configuration at `tailwind.config.js`
- Implement design tokens for colors, typography, and spacing
- Provide a theme utility to ensure consistent usage across components

### 3.2. Button/CTA Implementation

- Create a complete `components/ui/Button.tsx` component with:
  - Multiple variants (primary, secondary, outline, text)
  - Size variations (sm, md, lg)
  - Loading states
  - Icon support
  - Full accessibility features

### 3.3. Section Spacing Implementation

- Create a `components/ui/Section.tsx` component with consistent spacing
- Implement responsive padding/margin system
- Ensure vertical rhythm with a spacing scale

## 4. Functionality Implementation

### 4.1. Contact Form Implementation

- Create a complete, working contact form at `components/ContactForm.tsx`
- Implement form validation with proper error states
- Create the API route at `pages/api/contact.ts`
- Implement honeypot and/or reCAPTCHA protection

### 4.2. Analytics Implementation

- Implement Google Analytics 4 or Plausible analytics
- Create custom event tracking for key user interactions
- Ensure GDPR compliance with cookie consent integration

### 4.3. Error Boundaries Implementation

- Create a reusable error boundary component
- Implement global error handling
- Add logging integration

## Instructions:

1. Proceed section by section, providing complete implementation code
2. For each component, include full TypeScript interfaces, props, and implementation details
3. Provide actual file paths where code should be placed
4. Include installation commands for any required packages
5. Ensure all code follows Next.js best practices and is optimized for performance
6. Make all implementations compatible with the latest Next.js app router
7. Ensure code follows the IntraWeb design system and brand guidelines
8. Provide complete, copy-pastable code snippets - no placeholders or "to be implemented" comments
9. Include precise npm/yarn commands where needed

Please provide comprehensive implementations for each section without skipping any requirements. The code should be production-ready and thoroughly tested.