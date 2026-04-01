/**
 * Creates a HubSpot deal and associates it with an existing contact (CRM v3),
 * matching the n8n subworkflow SW — Create HubSpot Deal (simplified: no CONFIG fetch).
 *
 * Env (optional, align with your portal / n8n CONFIG):
 * - HUBSPOT_DEAL_PIPELINE_ID — default "default"
 * - HUBSPOT_DEAL_STAGE_LEAD_QUALIFIED — numeric stage id; when form sends qualifiedtobuy, this replaces it (custom pipelines)
 * - HUBSPOT_DEAL_OWNER_ID — hubspot_owner_id on the deal
 *
 * Tier amounts match CONFIG — Global Settings tiers (starter/growth setup+monthly).
 */

export type HubSpotWebsiteIntakeDealInput = {
  contactId: string;
  company: string;
  firstName: string;
  lastName: string;
  industry: string;
  tier: "starter" | "growth";
  /** Normalized stage (e.g. qualifiedtobuy) or numeric id from hubSpotDealStageOrDefault. */
  dealStage: string;
  /** Stored on deal `description` (same as SW — Create HubSpot Deal). */
  painSummary: string;
};

/** Association type: deal → contact (HubSpot-defined), same as n8n Build Create Deal Request. */
const DEAL_TO_CONTACT_ASSOCIATION_TYPE_ID = 3;

const TIER_DEFAULT_AMOUNT: Record<"starter" | "growth", number> = {
  starter: 1300,
  growth: 2450,
};

export async function hubspotCreateWebsiteIntakeDeal(
  token: string,
  input: HubSpotWebsiteIntakeDealInput,
): Promise<{ dealId: string } | { error: string }> {
  const pipeline = process.env.HUBSPOT_DEAL_PIPELINE_ID?.trim() || "default";

  let dealstage = (input.dealStage || "qualifiedtobuy").trim();
  const leadQualifiedStage = process.env.HUBSPOT_DEAL_STAGE_LEAD_QUALIFIED?.trim();
  if (leadQualifiedStage && (dealstage === "qualifiedtobuy" || dealstage === "")) {
    dealstage = leadQualifiedStage;
  }

  const dealOwnerId = process.env.HUBSPOT_DEAL_OWNER_ID?.trim();
  const closeDate = new Date();
  closeDate.setDate(closeDate.getDate() + 90);

  const baseLabel =
    input.company.trim() ||
    `${input.firstName} ${input.lastName}`.trim() ||
    "Website lead";
  const dealName = `${baseLabel} - Website`;

  const amount = TIER_DEFAULT_AMOUNT[input.tier] ?? TIER_DEFAULT_AMOUNT.starter;

  const properties: Record<string, string> = {
    dealname: dealName,
    amount: String(amount),
    closedate: closeDate.toISOString(),
    dealstage,
    pipeline,
    dealtype: "newbusiness",
  };
  if (dealOwnerId) {
    properties.hubspot_owner_id = dealOwnerId;
  }
  const pain = input.painSummary.trim();
  if (pain) {
    properties.description = pain;
  }

  const body = {
    properties,
    associations: [
      {
        to: { id: String(input.contactId) },
        types: [
          { associationCategory: "HUBSPOT_DEFINED", associationTypeId: DEAL_TO_CONTACT_ASSOCIATION_TYPE_ID },
        ],
      },
    ],
  };

  const res = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    return { error: `POST deal HTTP ${res.status}: ${t.slice(0, 500)}` };
  }

  const json = (await res.json()) as { id?: string };
  if (!json.id) {
    return { error: "Deal create succeeded but response had no id" };
  }
  return { dealId: String(json.id) };
}
