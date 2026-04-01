/**
 * Create or update a HubSpot contact by email (CRM v3).
 * Mirrors the Contacts API flow used in app/api/contact/route.ts.
 */

import {
  mapWebsiteIntakeToHubSpotContactProperties,
} from "@/lib/mapWebsiteIntakeToHubSpotContactProperties";

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
  /** Nested intake object from the website form; mapped to `website_intake_*` contact properties. */
  intake?: unknown;
};

export type HubSpotContactSyncResult =
  | {
      contactId: string;
      action: "created" | "updated";
      /** Set when the second PATCH (website_intake_* only) failed; contact core fields may still be saved. */
      intakeFieldsSyncError?: string;
    }
  | { contactId: null; error: string };

/** Narrows the union so TypeScript allows `.error` on the failure branch (CI-safe). */
export function isHubSpotSyncFailure(
  r: HubSpotContactSyncResult,
): r is { contactId: null; error: string } {
  return r.contactId === null;
}

export async function hubspotCreateOrUpdateContact(
  hubspotAccessToken: string,
  input: HubSpotContactSyncInput,
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
    intake,
  } = input;

  const plainProp =
    process.env.HUBSPOT_WEBSITE_INTAKE_PLAIN_PROPERTY?.trim() || "website_intake_details";
  const jsonProp =
    process.env.HUBSPOT_WEBSITE_INTAKE_JSON_PROPERTY?.trim() || "website_intake_json";

  const intakeMapped = mapWebsiteIntakeToHubSpotContactProperties(intake);

  /** Standard + pain + snapshots — never includes `website_intake_*` (those are PATCHed in a second request). */
  const coreProperties: Record<string, string> = {
    email,
    firstname: firstName,
    lastname: lastName,
    company,
    phone: phone || "",
    pain_point: painPoint,
  };
  if (websiteForHubSpot?.trim()) {
    coreProperties.website = websiteForHubSpot.trim();
  }
  if (intakePlainText?.trim()) {
    coreProperties[plainProp] = intakePlainText.trim();
  }
  if (intakeJson?.trim()) {
    coreProperties[jsonProp] = intakeJson.trim();
  }

  const hadPlainOrJson =
    Boolean(intakePlainText?.trim()) || Boolean(intakeJson?.trim());

  const withoutPlainJson = (): Record<string, string> => {
    const p = { ...coreProperties };
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

    let propsForRequest: Record<string, string> = coreProperties;
    let res = await postContact(propsForRequest);

    if (!res.ok && res.status === 400 && hadPlainOrJson) {
      const err400 = await res.text();
      console.warn(
        "[hubspotCreateOrUpdateContact] Contact POST 400 with plain/json snapshot fields; retrying without them.",
        err400.slice(0, 280),
      );
      propsForRequest = withoutPlainJson();
      res = await postContact(propsForRequest);
    }

    if (!res.ok) {
      if (res.status === 409) {
        let updateResponse = await patchByEmail(propsForRequest);

        if (!updateResponse.ok && updateResponse.status === 400 && hadPlainOrJson) {
          const patchErr = await updateResponse.text();
          console.warn(
            "[hubspotCreateOrUpdateContact] Contact PATCH 400 with plain/json; retrying without them.",
            patchErr.slice(0, 280),
          );
          propsForRequest = withoutPlainJson();
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

        const intakePatch = await patchIntakeFields(patchByEmail, intakeMapped);
        return {
          contactId: id,
          action: "updated",
          ...(intakePatch.error ? { intakeFieldsSyncError: intakePatch.error } : {}),
        };
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

    const intakePatch = await patchIntakeFields(patchByEmail, intakeMapped);
    return {
      contactId: id,
      action: "created",
      ...(intakePatch.error ? { intakeFieldsSyncError: intakePatch.error } : {}),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { contactId: null, error: msg };
  }
}

/** HubSpot can reject very large single PATCH bodies; smaller chunks are easier to debug if one property misbehaves. */
const INTAKE_PATCH_CHUNK_SIZE = 12;

async function patchIntakeFields(
  patchByEmail: (props: Record<string, string>) => Promise<Response>,
  intakeMapped: Record<string, string>,
): Promise<{ error?: string }> {
  const keys = Object.keys(intakeMapped);
  if (keys.length === 0) {
    return {};
  }

  for (let i = 0; i < keys.length; i += INTAKE_PATCH_CHUNK_SIZE) {
    const sliceKeys = keys.slice(i, i + INTAKE_PATCH_CHUNK_SIZE);
    const chunk = Object.fromEntries(sliceKeys.map((k) => [k, intakeMapped[k]]));
    const patchRes = await patchByEmail(chunk);
    if (!patchRes.ok) {
      const errText = await patchRes.text();
      const msg = `PATCH website_intake_* chunk [${sliceKeys[0]}…${sliceKeys[sliceKeys.length - 1]}] HTTP ${
        patchRes.status
      } — ${errText.slice(0, 500)}`;
      console.error(
        "[hubspotCreateOrUpdateContact] Failed to save website_intake_* contact properties:",
        errText.slice(0, 800),
      );
      return { error: msg };
    }
  }

  return {};
}
