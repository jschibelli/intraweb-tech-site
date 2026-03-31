/**
 * Formats website intake payload for HubSpot multi-line text fields.
 * HubSpot multi-line text is typically capped ~65,535 characters.
 */

export const HUBSPOT_MULTILINE_TEXT_SAFE_MAX = 65000;

function joinLines(label: string, value: string): string {
  const v = value.trim();
  if (!v) return "";
  return `${label}\n${v}\n`;
}

function arrLine(label: string, arr: unknown): string {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  return joinLines(label, arr.map((x) => String(x)).join(", "));
}

/**
 * Human-readable full intake for CRM (website_intake_details or similar).
 */
export function formatWebsiteIntakePlainText(intake: unknown): string {
  if (!intake || typeof intake !== "object" || Array.isArray(intake)) {
    return "";
  }
  const I = intake as Record<string, unknown>;
  const lines: string[] = ["=== Website intake (full) ===", ""];

  const contact = I.contact as Record<string, unknown> | undefined;
  if (contact && typeof contact === "object") {
    lines.push("— Contact & business —");
    lines.push(joinLines("Name", `${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim()));
    lines.push(joinLines("Email", String(contact.email ?? "")));
    lines.push(joinLines("Phone", String(contact.phone ?? "")));
    lines.push(joinLines("Business", String(contact.businessName ?? contact.company ?? "")));
    lines.push(joinLines("Industry", String(contact.industry ?? "")));
    lines.push(joinLines("Location", String(contact.location ?? "")));
    lines.push(joinLines("Current website", String(contact.website ?? "")));
    lines.push(joinLines("Business description", String(contact.bizDesc ?? "")));
    lines.push("");
  }

  const goals = I.goals as Record<string, unknown> | undefined;
  if (goals && typeof goals === "object") {
    lines.push("— Goals & timeline —");
    lines.push(arrLine("Goals", goals.goals));
    lines.push(joinLines("Outcome / detail", String(goals.goalDetail ?? "")));
    lines.push(joinLines("Timeline", String(goals.timeline ?? "")));
    lines.push(joinLines("Hard deadline", String(goals.hardDeadline ?? "")));
    lines.push(joinLines("Audience", String(goals.audience ?? "")));
    lines.push("");
  }

  const design = I.design as Record<string, unknown> | undefined;
  if (design && typeof design === "object") {
    lines.push("— Design —");
    lines.push(arrLine("Vibe", design.vibe));
    lines.push(joinLines("Logo", String(design.hasLogo ?? "")));
    lines.push(joinLines("Brand colors", String(design.brandColors ?? "")));
    lines.push(joinLines("Font style", String(design.fontStyle ?? "")));
    lines.push(joinLines("Photos", String(design.hasPhotos ?? "")));
    lines.push(joinLines("Don't want", String(design.dontWant ?? "")));
    lines.push(joinLines("Design notes", String(design.designNotes ?? "")));
    lines.push("");
  }

  const content = I.content as Record<string, unknown> | undefined;
  if (content && typeof content === "object") {
    lines.push("— Content & pages —");
    lines.push(arrLine("Pages", content.pages));
    lines.push(joinLines("Other pages", String(content.otherPages ?? "")));
    lines.push(joinLines("Copywriter", String(content.copywriter ?? "")));
    lines.push(joinLines("CMS", String(content.cms ?? "")));
    lines.push(arrLine("Features / integrations", content.features));
    lines.push("");
  }

  const budget = I.budget as Record<string, unknown> | undefined;
  if (budget && typeof budget === "object") {
    lines.push("— Budget —");
    lines.push(joinLines("Range", String(budget.range ?? "")));
    lines.push(joinLines("Ongoing support", String(budget.ongoing ?? "")));
    lines.push(joinLines("Funding", String(budget.funding ?? "")));
    lines.push(joinLines("Payment preference", String(budget.payment ?? "")));
    lines.push(joinLines("Budget notes", String(budget.notes ?? "")));
    lines.push("");
  }

  const research = I.research as Record<string, unknown> | undefined;
  if (research && typeof research === "object") {
    lines.push("— Competitors & inspiration —");
    lines.push(arrLine("Competitors", research.competitors));
    lines.push(arrLine("Sites you love", research.inspiration));
    lines.push(joinLines("What you like", String(research.likeAbout ?? "")));
    lines.push(joinLines("What you dislike", String(research.dislikeAbout ?? "")));
    lines.push(joinLines("Differentiator", String(research.differentiator ?? "")));
    lines.push(joinLines("Final notes", String(research.finalNotes ?? "")));
  }

  const out = lines
    .filter((x) => typeof x === "string")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (out.length <= HUBSPOT_MULTILINE_TEXT_SAFE_MAX) return out;
  return `${out.slice(0, HUBSPOT_MULTILINE_TEXT_SAFE_MAX - 80)}\n\n[…truncated for HubSpot field limit]`;
}

/**
 * Pretty JSON for automation / backup (website_intake_json or similar).
 */
export function formatWebsiteIntakeJsonSafe(intake: unknown): string {
  try {
    const s = JSON.stringify(intake, null, 2);
    if (s.length <= HUBSPOT_MULTILINE_TEXT_SAFE_MAX) return s;
    const compact = JSON.stringify(intake);
    if (compact.length <= HUBSPOT_MULTILINE_TEXT_SAFE_MAX) return compact;
    return `${compact.slice(0, HUBSPOT_MULTILINE_TEXT_SAFE_MAX - 80)}\n[…truncated]`;
  } catch {
    return "{}";
  }
}
