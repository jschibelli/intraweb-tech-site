/**
 * HubSpot dealstage must be an internal stage ID (e.g. qualifiedtobuy, closedwon)
 * or a numeric stage id from the portal — never a display label like "New - Starter".
 */

const BUILTIN_STAGES = new Set([
  "appointmentscheduled",
  "qualifiedtobuy",
  "presentationscheduled",
  "decisionmakerboughtin",
  "contractsent",
  "closedwon",
  "closedlost",
]);

/** null = caller should use default pipeline stage (e.g. qualifiedtobuy → CONFIG.leadQualified). */
export function normalizeHubSpotDealStage(value: unknown): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return raw;
  const lc = raw.toLowerCase();
  if (BUILTIN_STAGES.has(lc)) return lc;
  if (/\s-\s/.test(raw)) return null;
  if (/\s/.test(raw)) return null;
  return null;
}

export function hubSpotDealStageOrDefault(value: unknown, fallback = "qualifiedtobuy"): string {
  return normalizeHubSpotDealStage(value) ?? fallback;
}
