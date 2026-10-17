import { describe, expect, it } from "vitest";
import { accessFrom } from "./access";

const base = { comped: false, stripe_customer_id: null, subscription_status: null, current_period_end: null, cancel_at_period_end: false };

describe("access", () => {
  it("gives friends and family full access", () => {
    expect(accessFrom({ ...base, comped: true })).toMatchObject({ canEdit: true, kind: "free" });
  });
  it("gives subscribers full access, including while cancelling", () => {
    expect(accessFrom({ ...base, subscription_status: "active" })).toMatchObject({ canEdit: true, kind: "subscribed" });
    expect(accessFrom({ ...base, subscription_status: "active", cancel_at_period_end: true })).toMatchObject({
      canEdit: true,
      kind: "cancelling",
    });
  });
  it("makes lapsed and unknown accounts read-only", () => {
    expect(accessFrom({ ...base, subscription_status: "canceled" }).canEdit).toBe(false);
    expect(accessFrom(null).canEdit).toBe(false);
  });
});
