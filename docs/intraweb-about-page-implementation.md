# IntraWeb Technologies - About Page Implementation

## Project Overview

Implement the About page for IntraWeb Technologies following the established design system and wireframe patterns. This page should communicate the company's mission, vision, values, story, team approach, and provide a clear call to action.

## Technical Requirements

- **Stack:** Next.js, React, TypeScript, Tailwind CSS
- **Responsive Breakpoints:** Desktop (1440px), Tablet (768px), Mobile (375px)
- **Design System:** Follow existing typography scales, color palette, and component patterns
- **Accessibility:** Ensure WCAG 2.1 AA compliance
- **Performance:** Optimize for Core Web Vitals

## Page Structure

Implement the following sections in order:

### 1. Hero Section

```jsx
// Hero component with pentagon pattern background (reuse from landing page)
<section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
  {/* Pentagon pattern background - reuse from landing page */}
  <div className="container mx-auto px-4">
    <h1 className="text-5xl md:text-6xl font-bold mb-4">About IntraWeb Technologies</h1>
    <p className="text-xl md:text-2xl max-w-3xl">
      We build high-performance web solutions that blend innovative design with rock-solid technology—delivering digital experiences that drive real business impact.
    </p>
  </div>
</section>
```

### 2. Mission Section

```jsx
<section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
    <p className="text-lg md:text-xl max-w-3xl">
      To empower startups and enterprises with high-performance web solutions that blend innovative design and rock-solid technology, so every digital experience we build drives real business impact.
    </p>
  </div>
</section>
```

### 3. Vision Section

```jsx
<section className="py-16 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Vision</h2>
    <p className="text-lg md:text-xl max-w-3xl">
      To lead the future of web collaboration by harnessing AI-driven workflows and real-time interfaces, making seamless, intelligent digital experiences the new standard for every organization.
    </p>
  </div>
</section>
```

### 4. Values Section

```jsx
<section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold mb-10">Our Values</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {/* Value Card: Innovation */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-3 text-teal-600">Innovation</h3>
        <p>We relentlessly explore new ideas and technologies to deliver smarter, faster solutions.</p>
      </div>
      
      {/* Value Card: Craftsmanship */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-3 text-teal-600">Craftsmanship</h3>
        <p>We sweat the details—from code architecture to pixel-perfect design—because excellence lives in the smallest decisions.</p>
      </div>
      
      {/* Value Card: Collaboration */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-3 text-teal-600">Collaboration</h3>
        <p>We believe that human insight and AI potential together create the strongest outcomes.</p>
      </div>
      
      {/* Value Card: Integrity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-3 text-teal-600">Integrity</h3>
        <p>We build trust through transparency, respect deadlines, and honor our commitments.</p>
      </div>
      
      {/* Value Card: Customer Success */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-3 text-teal-600">Customer Success</h3>
        <p>We measure our success by yours—your goals become our north star from day one.</p>
      </div>
    </div>
  </div>
</section>
```

### 5. Our Story Section

```jsx
<section className="py-16 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold mb-10">Our Story</h2>
    
    {/* Timeline */}
    <div className="space-y-12 max-w-4xl">
      {/* 2020 */}
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4">
          <h3 className="text-2xl font-bold text-teal-600 mb-2 md:mb-0">2020</h3>
        </div>
        <div className="md:w-3/4">
          <p className="text-lg">IntraWeb Technologies was founded with a simple mission: bring enterprise-grade web experiences within reach of startups and established organizations alike.</p>
        </div>
      </div>
      
      {/* 2022 */}
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4">
          <h3 className="text-2xl font-bold text-teal-600 mb-2 md:mb-0">2022</h3>
        </div>
        <div className="md:w-3/4">
          <p className="text-lg">As AI capabilities began to accelerate and market demands shifted toward more intelligent workflows, we hit pause to rethink our approach—seeking a way to fuse human expertise with emerging AI potential.</p>
        </div>
      </div>
      
      {/* 2024 */}
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4">
          <h3 className="text-2xl font-bold text-teal-600 mb-2 md:mb-0">2024</h3>
        </div>
        <div className="md:w-3/4">
          <p className="text-lg">We relaunched with a renewed focus on AI-powered collaboration, assembling a hybrid team of expert designers, engineers, and proprietary AI agents to innovate faster and smarter.</p>
        </div>
      </div>
      
      {/* April 2025 */}
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4">
          <h3 className="text-2xl font-bold text-teal-600 mb-2 md:mb-0">April 2025</h3>
        </div>
        <div className="md:w-3/4">
          <p className="text-lg">We're preparing to open SynaplyAI's beta—leveraging 50+ projects delivered, a 96% client retention rate, and a 4.9/5 average satisfaction score.</p>
        </div>
      </div>
    </div>
    
    {/* Metrics */}
    <div className="mt-16 bg-white p-8 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-6 text-center">Our approach has delivered results that speak for themselves:</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <p className="text-4xl font-bold text-teal-600 mb-2">50+</p>
          <p className="text-lg">Projects Delivered</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-teal-600 mb-2">96%</p>
          <p className="text-lg">Client Retention</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-teal-600 mb-2">4.9/5</p>
          <p className="text-lg">Average Satisfaction</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 6. Team & Hybrid Model Section

```jsx
<section className="py-16 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold mb-4">Team & Hybrid Model</h2>
    <h3 className="text-2xl font-semibold mb-8">Meet Our Team</h3>
    <p className="text-lg max-w-4xl mb-10">
      We combine world-class human talent with intelligent AI collaborators to deliver outcomes neither could achieve alone.
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
      {/* Human Experts */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          {/* Insert icon or illustration here */}
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-teal-600 text-2xl">👤</span>
          </div>
        </div>
        <h4 className="text-xl font-bold text-center mb-4">Human Experts</h4>
        <p className="text-center">
          Our designers, developers, and strategists bring deep industry knowledge, creative problem-solving, and personal accountability.
        </p>
      </div>
      
      {/* AI Agents */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          {/* Insert icon or illustration here */}
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-teal-600 text-2xl">🤖</span>
          </div>
        </div>
        <h4 className="text-xl font-bold text-center mb-4">AI Agents</h4>
        <p className="text-center">
          Specialized AI collaborators accelerate ideation, generate production-ready code snippets, analyze performance, and surface design refinements in real time.
        </p>
      </div>
      
      {/* Seamless Collaboration */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          {/* Insert icon or illustration here */}
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <span className="text-teal-600 text-2xl">🔄</span>
          </div>
        </div>
        <h4 className="text-xl font-bold text-center mb-4">Seamless Collaboration</h4>
        <p className="text-center">
          By pairing each human role with an AI counterpart—from front-end development to quality assurance—we accelerate delivery cycles, elevate craftsmanship, and ensure 24/7 responsiveness.
        </p>
      </div>
    </div>
    
    <p className="text-lg max-w-4xl mx-auto text-center">
      Together, our hybrid model transforms every project into a dynamic partnership, so you get not just a website, but a continuously evolving digital experience.
    </p>
  </div>
</section>
```

### 7. CTA Section

```jsx
<section className="py-16 bg-gray-50">
  <div className="container mx-auto px-4 text-center max-w-2xl">
    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Amplify Your Digital Presence?</h2>
    <p className="text-lg mb-8">
      Experience the power of our human + AI team—where creativity meets efficiency to deliver exceptional results, on time and on budget.
    </p>
    <a 
      href="/contact" 
      className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 text-center"
    >
      Schedule Your Strategy Session
    </a>
  </div>
</section>
```

## Additional Implementation Notes

### Animation Effects

- Add subtle fade-in animations as users scroll down the page
- Consider adding a subtle pentagon pattern animation in the hero section (similar to landing page)
- Implement hover effects on CTA buttons and value cards

```jsx
// Example animation with Framer Motion
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

### Custom Components

#### Pentagon Pattern Background

Reuse the subtle network/pentagon animation from the landing page hero section.

#### Timeline Component

Create a responsive timeline component that shows vertical connecting lines on tablet/desktop views.

### SEO Optimization

```jsx
// Add in Head component
<Head>
  <title>About IntraWeb Technologies | AI-Powered Web Development</title>
  <meta name="description" content="IntraWeb Technologies combines human expertise with AI capabilities to build high-performance web solutions for startups and enterprises." />
  <meta property="og:title" content="About IntraWeb Technologies" />
  <meta property="og:description" content="We build high-performance web solutions that blend innovative design with rock-solid technology." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://intrawebtech.com/about" />
  <meta property="og:image" content="https://intrawebtech.com/images/og-image.jpg" />
</Head>
```

### Accessibility Considerations

- Ensure proper heading hierarchy (h1 → h2 → h3)
- Add appropriate alt text for all images and icons
- Maintain color contrast ratios (minimum 4.5:1 for normal text)
- Implement proper focus states for interactive elements
- Add aria labels where needed

### Responsive Behavior

- Follow the responsive strategy from existing wireframes
- Adjust grid layouts for different breakpoints:
  - Values: 3 columns on desktop, 2 on tablet, 1 on mobile
  - Metrics: Side-by-side on desktop, stacked on mobile
  - Team model: 3 columns on desktop, single column on mobile
- Typography scaling as per wireframe guidelines

## Design Style Guide

- Typography:
  - Main headline: 56px desktop → 36px mobile (font-bold)
  - Subheadings: 32px desktop → 24px mobile (font-bold)
  - Body text: 16px consistent across devices
  - Button text: 16px consistent across devices (font-medium)
  
- Colors:
  - Primary: Teal (#0D9488)
  - Secondary/Accent: Orange (to be used sparingly)
  - Background: White and light gray (#F9FAFB)
  - Text: Dark gray (#1F2937)

## Next Steps

1. Create the page components following this structure
2. Integrate with the main navigation and footer components
3. Add animations and interaction effects
4. Test across all breakpoints and devices
5. Validate accessibility using automated tools and manual testing
6. Deploy to staging for review