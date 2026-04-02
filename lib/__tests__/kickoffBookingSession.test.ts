/** @jest-environment node */
import { signKickoffBookingSession, verifyKickoffBookingSession } from "../kickoffBookingSession";

describe("kickoffBookingSession", () => {
  const secret = "test-secret-at-least-16-chars";

  it("round-trips JWT claims", () => {
    const token = signKickoffBookingSession(
      {
        sub: "12345",
        email: "a@b.com",
        firstName: "A",
        lastName: "B",
        company: "Co",
        phone: "+1",
        dealId: "999",
      },
      secret,
      3600,
    );
    const v = verifyKickoffBookingSession(token, secret);
    expect(v).not.toBeNull();
    expect(v!.sub).toBe("12345");
    expect(v!.email).toBe("a@b.com");
    expect(v!.dealId).toBe("999");
  });

  it("rejects wrong secret", () => {
    const token = signKickoffBookingSession(
      { sub: "1", email: "x@y.com", firstName: "X", lastName: "Y", company: "Z" },
      secret,
      3600,
    );
    expect(verifyKickoffBookingSession(token, "wrong-secret-not-matching")).toBeNull();
  });
});
