import {
  calculateExpiryStatus,
  DEFAULT_EXPIRY_WARNING_DAYS,
  maskExpiryDateInput,
} from "./expiryUtils";

describe("maskExpiryDateInput", () => {
  it("keeps typed digits and inserts YYYY-MM-DD separators", () => {
    expect(maskExpiryDateInput("2")).toBe("2");
    expect(maskExpiryDateInput("2026")).toBe("2026");
    expect(maskExpiryDateInput("202609")).toBe("2026-09");
    expect(maskExpiryDateInput("20260925")).toBe("2026-09-25");
  });

  it("ignores non-digits and extra characters", () => {
    expect(maskExpiryDateInput("2026-09-25")).toBe("2026-09-25");
    expect(maskExpiryDateInput("2026/09/25")).toBe("2026-09-25");
    expect(maskExpiryDateInput("2026092511")).toBe("2026-09-25");
  });
});

describe("calculateExpiryStatus", () => {
  const now = new Date(2026, 8, 17); // 2026-09-17 local

  it("returns none for empty or invalid dates", () => {
    expect(calculateExpiryStatus("", now)).toBe("none");
    expect(calculateExpiryStatus("   ", now)).toBe("none");
    expect(calculateExpiryStatus("not-a-date", now)).toBe("none");
    expect(calculateExpiryStatus("2026-13-40", now)).toBe("none");
  });

  it("returns expired when the date is before today", () => {
    expect(calculateExpiryStatus("2026-09-16", now)).toBe("expired");
    expect(calculateExpiryStatus("2020-01-01", now)).toBe("expired");
  });

  it("returns warning when the date is today", () => {
    expect(calculateExpiryStatus("2026-09-17", now)).toBe("warning");
  });

  it("returns warning when the date is within the default warning window", () => {
    expect(calculateExpiryStatus("2026-09-18", now)).toBe("warning");
    expect(
      calculateExpiryStatus(
        "2026-09-24",
        now,
        DEFAULT_EXPIRY_WARNING_DAYS,
      ),
    ).toBe("warning");
  });

  it("returns fresh when the date is after the warning window", () => {
    expect(calculateExpiryStatus("2026-09-25", now)).toBe("fresh");
    expect(calculateExpiryStatus("2027-01-01", now)).toBe("fresh");
  });

  it("respects a custom warningDays value", () => {
    expect(calculateExpiryStatus("2026-09-19", now, 1)).toBe("fresh");
    expect(calculateExpiryStatus("2026-09-18", now, 1)).toBe("warning");
  });
});
