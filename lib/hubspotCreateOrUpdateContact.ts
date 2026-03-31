/**
 * Create or update a HubSpot contact by email (CRM v3).
 * Mirrors the Contacts API flow used in app/api/contact/route.ts.
 */

export type HubSpotContactSyncInput = {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  website?: string;
  painPoint: string;
};

export type HubSpotContactSyncResult =
  | { contactId: string; action: "created" | "updated" }
  | { contactId: null; error: string };

/** Narrows the union so TypeScript allows `.error` on the failure branch (CI-safe). */
export function isHubSpotSyncFailure(
  r: HubSpotContactSyncResult,
): r is { contactId: null; error: string } {
  return r.contactId === null;
}

export async function hubspotCreateOrUpdateContact(
  hubspotAccessToken: string,
  input: HubSpotContactSyncInput
): Promise<HubSpotContactSyncResult> {
  const {
    email,
    firstName,
    lastName,
    company,
    phone,
    website: websiteForHubSpot,
    painPoint,
  } = input;

  const contactProperties: Record<string, string> = {
    email,
    firstname: firstName,
    lastname: lastName,
    company,
    phone: phone || "",
    pain_point: painPoint,
  };
  if (websiteForHubSpot?.trim()) {
    contactProperties.website = websiteForHubSpot.trim();
  }

  const contactData = { properties: contactProperties };

  try {
    const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hubspotAccessToken}`,
      },
      body: JSON.stringify(contactData),
    });

    if (!res.ok) {
      if (res.status === 409) {
        const updateUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`;
        const updateResponse = await fetch(updateUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hubspotAccessToken}`,
          },
          body: JSON.stringify(contactData),
        });

        if (!updateResponse.ok) {
          const updateError = await updateResponse.text();
          return {
            contactId: null,
            error: `PATCH by email HTTP ${updateResponse.status} — ${updateError.slice(0, 400)}`,
          };
        }

        const updateResult = (await updateResponse.json()) as { id?: string };
        const id = updateResult.id != null ? String(updateResult.id) : null;
        if (!id) {
          return { contactId: null, error: "PATCH succeeded but response had no contact id" };
        }
        return { contactId: id, action: "updated" };
      }

      const errorBody = await res.text();
      return {
        contactId: null,
        error: `POST contact HTTP ${res.status} — ${errorBody.slice(0, 400)}${errorBody.length > 400 ? "…" : ""}`,
      };
    }

    const created = (await res.json()) as { id?: string };
    const id = created.id != null ? String(created.id) : null;
    if (!id) {
      return { contactId: null, error: "POST succeeded but response had no contact id" };
    }
    return { contactId: id, action: "created" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { contactId: null, error: msg };
  }
}
