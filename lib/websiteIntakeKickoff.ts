/** Shared kickoff title for Cal metadata / booking API (matches website-intake form). */
export type KickoffIntakeContact = {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
};

export function buildKickoffTitle(data: KickoffIntakeContact): string {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  return `${data.businessName || fullName || "Website lead"} kickoff`;
}
