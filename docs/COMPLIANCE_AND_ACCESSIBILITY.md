# Compliance & Accessibility – IntraWeb Technologies Landing Page

## 1. Privacy & Legal
- **Privacy Policy**: `/privacy-policy` ([View Source](app/privacy-policy/page.tsx))
  - Details on data collection, retention, third-party sharing, and user rights (GDPR/CCPA)
  - Contact: [contact@intrawebtech.com](mailto:contact@intrawebtech.com)
- **Terms of Service**: `/terms-of-service` ([View Source](app/terms-of-service/page.tsx))
  - User obligations, intellectual property, disclaimers, and liability
- **Accessibility Statement**: `/accessibility` ([View Source](app/accessibility/page.tsx))
  - Commitment to WCAG 2.1 AA, keyboard navigation, assistive tech support

---

## 2. Cookie Consent & Audit
- **Cookie Consent Banner**: Category-based consent, blocks non-essential scripts until user approval
- **Cookie Audit Script**: `npm run audit:cookies` ([View Source](scripts/auditCookies.ts))
  - Scans for third-party scripts/cookies requiring consent
- **Cookie Policy**: Integrated into privacy policy

---

## 3. Accessibility (WCAG 2.1 AA)
- **Keyboard Navigation**: Tab, Shift+Tab, Enter/Space, arrow keys, Escape
- **Screen Reader Support**: Proper heading hierarchy, alt text, ARIA roles
- **Color Contrast**: Meets/exceeds 4.5:1 ratio for text
- **Focus Management**: Clear focus states, auto-focus on error/404 pages
- **Reduced Motion**: Respects user motion preferences
- **Dark Mode**: Automatic based on system settings

---

## 4. SEO & Compliance Automation
- **Sitemap**: `/sitemap.xml` ([View Source](public/sitemap.xml))
- **Robots.txt**: `/robots.txt` ([View Source](public/robots.txt))
- **Lighthouse Audit**: `npm run lighthouse:audit` ([View Source](scripts/lighthouse-audit.js))
- **Link Checker**: `npm run check:links` ([View Source](scripts/check-links.js))

---

## 5. Ongoing Compliance
- Regular accessibility and privacy reviews
- Continuous improvement based on user feedback and audits
- Contact for compliance issues: [contact@intrawebtech.com](mailto:contact@intrawebtech.com) 