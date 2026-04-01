/**
 * Maps website intake (nested object from /api/website-intake) to HubSpot contact custom properties.
 * Internal names use prefix `website_intake_` and are listed in alphabetical order.
 */

/** HubSpot contact property internal names (alphabetical). Must match scripts/create-hubspot-website-intake-contact-properties.js */
export const WEBSITE_INTAKE_CONTACT_PROPERTY_NAMES: readonly string[] = [
  "website_intake_audience",
  "website_intake_brand_colors",
  "website_intake_budget_notes",
  "website_intake_budget_range",
  "website_intake_business_description",
  "website_intake_cms",
  "website_intake_competitors",
  "website_intake_copywriter",
  "website_intake_design_notes",
  "website_intake_differentiator",
  "website_intake_dislike_about",
  "website_intake_dont_want",
  "website_intake_features",
  "website_intake_final_notes",
  "website_intake_font_style",
  "website_intake_funding",
  "website_intake_goal_detail",
  "website_intake_goals",
  "website_intake_hard_deadline",
  "website_intake_has_logo",
  "website_intake_has_photos",
  "website_intake_industry",
  "website_intake_inspiration_sites",
  "website_intake_like_about",
  "website_intake_location",
  "website_intake_ongoing_support",
  "website_intake_other_pages",
  "website_intake_pages",
  "website_intake_payment",
  "website_intake_timeline",
  "website_intake_vibe",
] as const;

function str(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) {
    return v
      .map((x) => String(x).trim())
      .filter(Boolean)
      .join(", ");
  }
  return String(v).trim();
}

function obj(name: string, value: string): Record<string, string> {
  if (!value) return {};
  return { [name]: value };
}

/**
 * Returns HubSpot contact `properties` entries for all website intake fields (non-empty only).
 * Keys are alphabetical by internal name.
 */
export function mapWebsiteIntakeToHubSpotContactProperties(intake: unknown): Record<string, string> {
  if (!intake || typeof intake !== "object" || Array.isArray(intake)) {
    return {};
  }
  const I = intake as Record<string, unknown>;

  const contact =
    I.contact && typeof I.contact === "object" && !Array.isArray(I.contact)
      ? (I.contact as Record<string, unknown>)
      : {};
  const goals =
    I.goals && typeof I.goals === "object" && !Array.isArray(I.goals)
      ? (I.goals as Record<string, unknown>)
      : {};
  const design =
    I.design && typeof I.design === "object" && !Array.isArray(I.design)
      ? (I.design as Record<string, unknown>)
      : {};
  const content =
    I.content && typeof I.content === "object" && !Array.isArray(I.content)
      ? (I.content as Record<string, unknown>)
      : {};
  const budget =
    I.budget && typeof I.budget === "object" && !Array.isArray(I.budget)
      ? (I.budget as Record<string, unknown>)
      : {};
  const research =
    I.research && typeof I.research === "object" && !Array.isArray(I.research)
      ? (I.research as Record<string, unknown>)
      : {};

  const out: Record<string, string> = {
    ...obj("website_intake_audience", str(goals.audience)),
    ...obj("website_intake_brand_colors", str(design.brandColors)),
    ...obj("website_intake_budget_notes", str(budget.notes)),
    ...obj("website_intake_budget_range", str(budget.range)),
    ...obj("website_intake_business_description", str(contact.bizDesc)),
    ...obj("website_intake_cms", str(content.cms)),
    ...obj("website_intake_competitors", str(research.competitors)),
    ...obj("website_intake_copywriter", str(content.copywriter)),
    ...obj("website_intake_design_notes", str(design.designNotes)),
    ...obj("website_intake_differentiator", str(research.differentiator)),
    ...obj("website_intake_dislike_about", str(research.dislikeAbout)),
    ...obj("website_intake_dont_want", str(design.dontWant)),
    ...obj("website_intake_features", str(content.features)),
    ...obj("website_intake_final_notes", str(research.finalNotes)),
    ...obj("website_intake_font_style", str(design.fontStyle)),
    ...obj("website_intake_funding", str(budget.funding)),
    ...obj("website_intake_goal_detail", str(goals.goalDetail)),
    ...obj("website_intake_goals", str(goals.goals)),
    ...obj("website_intake_hard_deadline", str(goals.hardDeadline)),
    ...obj("website_intake_has_logo", str(design.hasLogo)),
    ...obj("website_intake_has_photos", str(design.hasPhotos)),
    ...obj("website_intake_industry", str(contact.industry)),
    ...obj("website_intake_inspiration_sites", str(research.inspiration)),
    ...obj("website_intake_like_about", str(research.likeAbout)),
    ...obj("website_intake_location", str(contact.location)),
    ...obj("website_intake_ongoing_support", str(budget.ongoing)),
    ...obj("website_intake_other_pages", str(content.otherPages)),
    ...obj("website_intake_pages", str(content.pages)),
    ...obj("website_intake_payment", str(budget.payment)),
    ...obj("website_intake_timeline", str(goals.timeline)),
    ...obj("website_intake_vibe", str(design.vibe)),
  };

  return out;
}
