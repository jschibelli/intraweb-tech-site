# IntraWeb Technologies – Documentation

Repository documentation for the IntraWeb Technologies marketing website: **Next.js 16** (App Router), **React 19**, TypeScript, and Tailwind CSS. Covers the public site, contact form (reCAPTCHA Enterprise, Resend), service and careers pages, compliance, and implementation guides.

**Last updated:** February 2025

---

## Overview

| Document | Description |
|----------|-------------|
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Executive overview, accomplishments, outstanding items, next steps |
| [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) | Stack, architecture, scripts, components, deployment |
| [COMPLIANCE_AND_ACCESSIBILITY.md](./COMPLIANCE_AND_ACCESSIBILITY.md) | Privacy, legal, cookie consent, WCAG 2.1 AA, automation |

---

## Implementation Guides

| Document | Description |
|----------|-------------|
| [intraweb-implementation-guide.md](./intraweb-implementation-guide.md) | Pre-launch technical implementation (performance, SEO, compliance, brand) |
| [intraweb-about-page-implementation.md](./intraweb-about-page-implementation.md) | About page structure, sections, and implementation details |
| [404-implementation.md](./404-implementation.md) | Custom 404 page implementation (design, accessibility, App Router) |
| [cms-implementation-spec.md](./cms-implementation-spec.md) | Custom CMS & admin dashboard requirements (future) |

---

## Integrations & APIs

| Document | Description |
|----------|-------------|
| [recaptcha-enterprise-postman.md](./recaptcha-enterprise-postman.md) | Testing reCAPTCHA Enterprise Create Assessment (contact form) |
| [postman-recaptcha-create-assessment.json](./postman-recaptcha-create-assessment.json) | Postman collection for Create Assessment API |
| [prompts/hubspot-integration-prompt.md](./prompts/hubspot-integration-prompt.md) | Prompt template for consent-aware HubSpot tracking integration |

---

## Quick Reference

- **Setup:** See repository [README.md](../README.md) and [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md).
- **Scripts:** `npm run dev` · `npm run build` · `npm run lighthouse:audit` · `npm run check:links` · `npm run seo:check` · `npm run audit:cookies` · `npm run analyze` · `npm run recaptcha:token`
- **Compliance contact:** [contact@intrawebtech.com](mailto:contact@intrawebtech.com).
