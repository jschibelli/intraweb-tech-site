# 🛠️ Developer Roadmap: IntraWeb Technologies Landing Page

> A clear, actionable roadmap for building the landing page from setup to deployment—structured by component sequence and cross-functional concerns (testing, accessibility, performance).

---

## 1. Project Kickoff & Setup (Est. 1 day)

- **Initialize repo**
  - Next.js 14 App Router, TypeScript, Tailwind CSS
  - Follow defined structure (`components/`, `lib/`, `types/`, `hooks/`, etc.)
- **Install dependencies**
  - Core: `react-hook-form`, `framer-motion`, `embla-carousel-react`, `@radix-ui/react-*`
  - UI: `shadcn/ui`, `lucide-react`
  - Testing: `jest`, `@testing-library/react`, `playwright`
  - Dev: `eslint`, `prettier`, `husky`, `lint-staged`
- **Configure tools**
  - Tailwind: custom colors (Midnight Navy, Teal Green, Orange Sunset)
  - Fonts: Montserrat (headings), Roboto (body) via Google Fonts
  - ESLint/Prettier: setup with Husky pre-commit hook
  - GitHub Actions: setup CI/CD, Lighthouse CI

---

## 2. Core Layout & Global Components (Est. 2 days)

- **Navbar**
  - Sticky top, logo left, links + CTA right, mobile hamburger
- **Footer & Final CTA**
  - Navy CTA block with orange button
  - Footer with 4-column layout, social icons, newsletter, legal links

---

## 3. Content & Media Prep (Est. 1 day)

- Create JSON content files under `/data`:
  - `hero.json`, `services.json`, `tech-stack.json`, etc.
- Prepare assets:
  - Company logo (SVG), project screenshots, tech + client logos, avatars

---

## 4. Landing Page Sections (Est. 5–7 days)

### 4.1 Hero (1 day)
- Canvas/Framer Motion background animation
- Heading, subheading, CTA, SynaplyAI announcement
- Responsive layout + client logos grid/carousel

### 4.2 Services (0.5 day)
- 3-1 grid with `lucide-react` icons
- CTA: "Explore Our Services" (outline button)

### 4.3 Technology Stack (0.5 day)
- 2-row desktop / 3-col mobile grid
- Logo cards, staggered animations

### 4.4 Featured Work (1 day)
- Responsive grid (3/2/1 layout)
- Overlay info, "View Case Study" CTA

### 4.5 Process (0.5 day)
- Numbered steps, connecting line (desktop)
- Horizontal/vertical layout + animations

### 4.6 About (0.5 day)
- Heading, tagline, company description
- Bullet list + dual CTAs

### 4.7 Testimonials (1 day)
- Two-column grid (desktop)
- Embla carousel (mobile)
- Avatar, quote, name/title/company

### 4.8 SynaplyAI Feature (0.5 day)
- Gradient background + SVG accents
- Feature list, sparkle icon, dual CTAs

### 4.9 FAQ (1 day)
- Accordion with animation
- 2-col desktop / single-col mobile
- Optional contact CTA at bottom

---

## 5. Integration & Testing (Est. 2–3 days)

- Assemble sections in `app/page.tsx`
- **Responsive checks**: 375px, 768px, 1440px
- **Accessibility audit**:
  - Focus management, ARIA roles, color contrast (WCAG AA)
- **Performance optimization**:
  - Lazy load images/components
  - Code splitting, font swap, animation polish

---

## 6. Quality Assurance (Est. 1–2 days)

- **Cross-browser tests**: Chrome, Safari, Firefox, Edge + mobile browsers
- **Performance audit**:
  - Lighthouse: target 90+ across categories
  - Web vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **SEO**:
  - OpenGraph, meta tags, `next-sitemap`, optional structured data

---

## 7. Deployment & Monitoring (Est. 1 day)

- **Deploy with Vercel**
  - Preview + production environments
  - Custom domain
- **Monitoring**
  - Analytics: GA4 or Plausible
  - Error logging: Sentry
  - Lighthouse CI integration

---

## 8. Documentation & Handoff (Est. 0.5 day)

- `README.md`:
  - Install instructions, folder overview, how to update content
- **Future Enhancements**:
  - A/B testing, optional CMS, animation perf, SSR caching

---

## ⏱️ Total Estimated Timeline: 2–3 weeks

---

## 🚀 Getting Started (for Cursor)

1. Clone repo
2. `npm install`
3. Set up `/lib/fonts.ts`, `tailwind.config.js`, and `/config/site.ts`
4. Build components in sequence using `/data/` content files

---

## 💡 Design Standards

- **Fonts**: Montserrat (heading), Roboto (body)
- **Brand Colors**:
  - `#0B1F36` – Midnight Navy
  - `#15B8A1` – Teal Green
  - `#F59E0B` – Orange Sunset
- **Breakpoints**: 375px, 768px, 1440px
- **Accessibility**: Keyboard support, focus styles, semantic HTML
- **Animation**: Framer Motion (subtle, purpose-driven)
- **Performance**: Next Image, font preload, code-split sections

---

## Compliance

This project includes several compliance features to ensure GDPR, CCPA, and accessibility standards are met:

### Privacy and Legal Pages
- `/privacy` - Privacy Policy page detailing data collection and usage
- `/terms` - Terms of Service page outlining user obligations and legal terms
- `/accessibility` - Accessibility Statement page with WCAG 2.1 AA compliance details

### Cookie Consent
- Enhanced cookie consent banner with category-based consent management
- Blocks non-essential scripts until user consent is granted
- Stores consent preferences in cookies
- Supports granular control over analytics and marketing cookies

### SEO compliance check
Run the SEO compliance check (metadata, canonical, FAQ schema, sitemap) with the app serving: `npm run seo:check`. Uses `BASE_URL=http://localhost:3000` by default; set `BASE_URL` to a deployed URL to validate production.

### Cookie Audit Tool
Run the cookie audit tool to identify third-party scripts that require consent:
```bash
npm run audit:cookies
```

### Environment Variables
Configure compliance-related email addresses in `.env.local`:
```
NEXT_PUBLIC_PRIVACY_EMAIL=privacy@intrawebtech.com
NEXT_PUBLIC_GA_ID=your-ga-id
NEXT_PUBLIC_HUBSPOT_ID=your-hubspot-id
```

For contact form reCAPTCHA Enterprise (optional; form works without these, but verification is skipped):
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-enterprise-site-key
RECAPTCHA_ENTERPRISE_SITE_KEY=your-recaptcha-enterprise-site-key
RECAPTCHA_ENTERPRISE_PROJECT_ID=your-gcp-project-id
```
Use the same site key for both `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_ENTERPRISE_SITE_KEY`. Server-side verification requires a GCP project with reCAPTCHA Enterprise API enabled and Application Default Credentials (e.g. `GOOGLE_APPLICATION_CREDENTIALS` or default service account on GCP).

For HubSpot contact sync and n8n lead scoring (optional): set `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_FORM_GUID` (Forms API), and for automatic lead scoring after each form submission, set the n8n webhook URL:
```
N8N_LEAD_SCORING_WEBHOOK_URL=https://your-n8n-instance/webhook/your-webhook-path
```
Copy the Production (or Test) webhook URL from the n8n "Lead Qualification & Routing" workflow Webhook node. When set, the contact API triggers this workflow after each successful HubSpot contact create/update so leads are scored and updated in HubSpot.

**HubSpot + n8n lead scoring checklist:**
- In HubSpot: create custom contact properties `lead_score` (number), `lead_tier` (string), `scoring_breakdown` (string) if they do not exist; ensure `numberofemployees` exists on contacts (standard or custom).
- In n8n: in the "Get recently created/updated contacts" node, add `numberofemployees` to the list of requested properties so the scoring Code node can use it.

### HTTPS Enforcement
The site enforces HTTPS in production through:
- HSTS header configuration
- Automatic HTTP to HTTPS redirection
- Secure cookie settings

