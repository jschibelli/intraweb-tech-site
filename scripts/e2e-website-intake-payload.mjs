/**
 * Writes a one-off JSON body for POST /api/website-intake (same shape as WebsiteIntakeForm).
 * Usage: node scripts/e2e-website-intake-payload.mjs > .tmp-e2e-payload.json
 *        curl -sS -X POST http://localhost:3000/api/website-intake -H "Content-Type: application/json" -d @.tmp-e2e-payload.json
 */
const id = Date.now();
const email = `e2e-local-${id}@intrawebtech.com`;

const payload = {
  contact: {
    firstName: "E2E",
    lastName: "Local",
    email,
    phone: "+15555550199",
    company: "E2E Local Test Co",
    industry: "Restaurant / Food",
  },
  createDeal: false,
  dealStage: "qualifiedtobuy",
  tier: "starter",
  painOverride: `E2E automated test ${new Date().toISOString()}`,
  intake: {
    contact: {
      firstName: "E2E",
      lastName: "Local",
      email,
      phone: "+15555550199",
      businessName: "E2E Local Test Co",
      industry: "Restaurant / Food",
      location: "Hoboken, NJ",
      website: "https://example.com/e2e",
      bizDesc: "Automated end-to-end intake test from scripts/e2e-website-intake-payload.mjs",
    },
    goals: {
      goals: ["Generate more leads"],
      goalDetail: "More table bookings",
      timeline: "6–8 weeks",
      hardDeadline: "",
      audience: "Local diners",
    },
    design: {
      vibe: ["Clean & minimal", "Bold & modern"],
      hasLogo: "Yes — I will provide files",
      brandColors: "#0f172a, #14b8a6",
      fontStyle: "Sans-serif (modern, clean)",
      hasPhotos: "Yes — professional photos",
      dontWant: "Stock corporate photos",
      designNotes: "E2E design notes",
    },
    content: {
      pages: ["Home", "About", "Pricing", "Booking / Scheduling"],
      otherPages: "Private events",
      copywriter: "Split — I have some, need help with the rest",
      cms: "Yes",
      features: ["Contact / Lead Forms", "Appointment Booking"],
    },
    budget: {
      range: "$2,500 – $5,000",
      ongoing: "Possibly",
      funding: "Business funds",
      payment: "Upfront / milestone",
      notes: "E2E budget note",
    },
    research: {
      competitors: ["competitor-test.example"],
      inspiration: ["https://inspo.example"],
      likeAbout: "Clear menus",
      dislikeAbout: "Autoplay video",
      differentiator: "Family recipes since 1999",
      finalNotes: "E2E final notes",
    },
  },
};

process.stdout.write(JSON.stringify(payload));
