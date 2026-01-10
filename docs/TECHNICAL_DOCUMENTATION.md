# Technical Documentation – IntraWeb Technologies Landing Page

## 1. Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Languages**: TypeScript, JavaScript
- **Styling**: Tailwind CSS (custom theme, typography, breakpoints)
- **UI Libraries**: shadcn/ui, lucide-react, Framer Motion
- **Testing**: Jest, @testing-library/react, Playwright
- **Linting/Formatting**: ESLint, Prettier, Husky, lint-staged
- **Deployment**: Vercel (preview + production), custom domain

---

## 2. Architecture & Folder Structure
- `components/` – Modular, reusable UI components (Navbar, Footer, Hero, Services, etc.)
- `components/ui/` – Core UI primitives (Button, Section, OptimizedImage)
- `pages/` & `app/` – Next.js routing and page components
- `data/` – JSON content files for dynamic sections
- `public/` – Static assets, images, sitemap, robots.txt
- `scripts/` – Automation scripts (Lighthouse, link checker, cookie audit)
- `styles/` – Tailwind and global styles

---

## 3. Key Scripts & Automation
- **Lighthouse Audit**: `npm run lighthouse:audit` – Runs Lighthouse on key pages, outputs HTML/JSON reports
- **Link Checker**: `npm run check:links` – Validates all internal/external links for 404s
- **Cookie Audit**: `npm run audit:cookies` – Scans for third-party scripts/cookies requiring consent
- **Bundle Analyzer**: `npm run analyze` – Visualizes bundle size and dead code

---

## 4. UI Components
- **Button**: Multiple variants (primary, secondary, outline, text), sizes, loading, icons, accessibility
- **Section**: Consistent spacing, background, and responsive container
- **OptimizedImage**: Wrapper for next/image with responsive, high-quality defaults
- **SEO**: Meta tags, Open Graph, Twitter cards, JSON-LD
- **CookieConsentBanner**: Category-based consent, blocks non-essential scripts
- **ErrorBoundary**: Global error handling
- **Animated404Visual**: SVG animation for 404 page

---

## 5. Content Management
- All major content (hero, services, tech stack, process, etc.) is managed via JSON files in `/data` for easy updates and localization.

---

## 6. Performance & SEO
- **Image Optimization**: All images use next/image with responsive sizes and lazy loading
- **Code Splitting**: Dynamic imports for heavy components
- **Lighthouse**: Automated audits for performance, accessibility, SEO, best practices
- **SEO**: Sitemap, robots.txt, meta tags, Open Graph, Twitter cards, JSON-LD
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, focus management, color contrast

---

## 7. Deployment & Monitoring
- **Vercel**: CI/CD, preview/production, custom domain
- **Analytics**: Google Analytics 4 or Plausible
- **Error Logging**: Sentry (optional)
- **Monitoring**: Lighthouse CI integration 