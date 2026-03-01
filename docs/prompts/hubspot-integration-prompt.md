---
title: HubSpot Integration Prompt
description: Prompt template for consent-aware HubSpot tracking (Next.js/React).
last_updated: 2025-02
---

# Prompt: Proper HubSpot Integration

Use this prompt when asking an AI or developer to add HubSpot tracking to a website (Next.js, React, or similar).

---

## Copy-paste prompt

```
Integrate HubSpot tracking on this site with the following requirements:

**1. Environment**
- Add one env var: NEXT_PUBLIC_HUBSPOT_ID (the HubSpot portal/tracking code ID from HubSpot → Settings → Tracking Code).
- Document it in README or .env.example.

**2. Script loading (consent-aware)**
- Load the HubSpot script only when the user has given **marketing** consent (e.g. cookie banner “marketing” or “Accept all”).
- Script URL: https://js.hs-scripts.com/${NEXT_PUBLIC_HUBSPOT_ID}.js
- Load it asynchronously (async script, append to document.head).
- Do not load the script on initial page load unless the user has already consented (check stored consent, e.g. cookie like cookie_consent_marketing).

**3. When to load the script**
- On app/shell mount: if stored consent includes marketing → inject the script once.
- When user accepts cookies: if they accept “marketing” or “Accept all” → inject the script once (avoid duplicate script tags).

**4. Privacy and compliance**
- Mention HubSpot in the privacy policy (e.g. “HubSpot for CRM and marketing automation”) and in any cookie/script audit list.
- In any cookie-audit or third-party script list, classify HubSpot domains (hubspot.com, hs-scripts.com) as “marketing.”

**5. Optional**
- If the project has a site/config or settings model, an optional hubspotId field can store the portal ID; the live script should still use NEXT_PUBLIC_HUBSPOT_ID from env.

Implement the integration so it works with the existing cookie-consent flow and does not load HubSpot before marketing consent is given.
```

---

## Short version (minimal prompt)

```
Add HubSpot tracking using NEXT_PUBLIC_HUBSPOT_ID. Load the script from https://js.hs-scripts.com/${NEXT_PUBLIC_HUBSPOT_ID}.js only when the user has given marketing cookie consent. Do not load before consent. Mention HubSpot in the privacy policy and treat hubspot.com / hs-scripts.com as marketing in any cookie audit.
```

---

## Reference: behavior to expect

| Requirement | Expected behavior |
|-------------|-------------------|
| Env | `NEXT_PUBLIC_HUBSPOT_ID` set and documented |
| Script URL | `https://js.hs-scripts.com/<ID>.js` |
| Consent | Load only when marketing consent is true (stored + on accept) |
| No double load | Check for existing script or consent before injecting |
| Privacy | HubSpot listed in privacy policy and cookie/audit as marketing |
| Optional DB | `hubspotId` on site/config only if needed; script uses env |
