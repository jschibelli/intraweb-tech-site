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
  /** Full human-readable intake (maps to HUBSPOT_WEBSITE_INTAKE_PLAIN_PROPERTY). */
  intakePlainText?: string;
  /** JSON snapshot of `intake` (maps to HUBSPOT_WEBSITE_INTAKE_JSON_PROPERTY). */
  intakeJson?: string;
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
    intakePlainText,
    intakeJson,
  } = input;

  const plainProp =
    process.env.HUBSPOT_WEBSITE_INTAKE_PLAIN_PROPERTY?.trim() || "website_intake_details";
  const jsonProp =
    process.env.HUBSPOT_WEBSITE_INTAKE_JSON_PROPERTY?.trim() || "website_intake_json";

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
  if (intakePlainText?.trim()) {
    contactProperties[plainProp] = intakePlainText.trim();
  }
  if (intakeJson?.trim()) {
    contactProperties[jsonProp] = intakeJson.trim();
  }

  const hadIntakeProps = Boolean(contactProperties[plainProp] || contactProperties[jsonProp]);
  const withoutIntake = (): Record<string, string> => {
    const p = { ...contactProperties };
    delete p[plainProp];
    delete p[jsonProp];
    return p;
  };

  try {
    const postContact = (props: Record<string, string>) =>
      fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hubspotAccessToken}`,
        },
        body: JSON.stringify({ properties: props }),
      });

    const patchByEmail = (props: Record<string, string>) => {
      const updateUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`;
      return fetch(updateUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hubspotAccessToken}`,
        },
        body: JSON.stringify({ properties: props }),
      });
    };

    let propsForRequest: Record<string, string> = contactProperties;
    let res = await postContact(propsForRequest);

    if (!res.ok && res.status === 400 && hadIntakeProps) {
      const err400 = await res.text();
      console.warn(
        "[hubspotCreateOrUpdateContact] Contact POST 400 with intake fields; retrying without custom intake properties.",
        err400.slice(0, 280),
      );
      propsForRequest = withoutIntake();
      res = await postContact(propsForRequest);
    }

    if (!res.ok) {
      if (res.status === 409) {
        let updateResponse = await patchByEmail(propsForRequest);

        if (!updateResponse.ok && updateResponse.status === 400 && hadIntakeProps) {
          const patchErr = await updateResponse.text();
          console.warn(
            "[hubspotCreateOrUpdateContact] Contact PATCH 400 with intake fields; retrying without them.",
            patchErr.slice(0, 280),
          );
          propsForRequest = withoutIntake();
          updateResponse = await patchByEmail(propsForRequest);
        }

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
