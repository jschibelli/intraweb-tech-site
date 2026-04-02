/**
 * Optional HubSpot property updates after a kickoff is booked via Cal API.
 * Set HUBSPOT_CONTACT_KICKOFF_* / HUBSPOT_DEAL_KICKOFF_* to internal names of existing properties.
 */

export type KickoffHubSpotSyncInput = {
  contactId: string;
  dealId?: string;
  /** ISO 8601 */
  meetingStart: string;
  calBookingUid: string;
  managementUrl?: string;
};

export async function hubspotSyncKickoffBooking(
  token: string,
  input: KickoffHubSpotSyncInput,
): Promise<{ contactUpdated: boolean; dealUpdated: boolean; errors: string[] }> {
  const errors: string[] = [];
  let contactUpdated = false;
  let dealUpdated = false;

  const contactStartProp = process.env.HUBSPOT_CONTACT_KICKOFF_START_PROPERTY?.trim();
  const contactUidProp = process.env.HUBSPOT_CONTACT_KICKOFF_CAL_UID_PROPERTY?.trim();
  const dealStartProp = process.env.HUBSPOT_DEAL_KICKOFF_START_PROPERTY?.trim();
  const dealUidProp = process.env.HUBSPOT_DEAL_KICKOFF_CAL_UID_PROPERTY?.trim();

  const contactProps: Record<string, string> = {};
  if (contactStartProp) {
    contactProps[contactStartProp] = input.meetingStart;
  }
  if (contactUidProp) {
    contactProps[contactUidProp] = input.calBookingUid;
  }

  if (Object.keys(contactProps).length > 0) {
    const res = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(input.contactId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ properties: contactProps }),
    });
    if (res.ok) {
      contactUpdated = true;
    } else {
      const t = await res.text();
      errors.push(`contact PATCH ${res.status}: ${t.slice(0, 200)}`);
    }
  }

  if (input.dealId) {
    const dealProps: Record<string, string> = {};
    if (dealStartProp) {
      dealProps[dealStartProp] = input.meetingStart;
    }
    if (dealUidProp) {
      dealProps[dealUidProp] = input.calBookingUid;
    }
    if (Object.keys(dealProps).length > 0) {
      const res = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${encodeURIComponent(input.dealId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ properties: dealProps }),
      });
      if (res.ok) {
        dealUpdated = true;
      } else {
        const t = await res.text();
        errors.push(`deal PATCH ${res.status}: ${t.slice(0, 200)}`);
      }
    }
  }

  return { contactUpdated, dealUpdated, errors };
}
