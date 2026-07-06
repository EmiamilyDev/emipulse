import { describe, expect, it } from "vitest";
import { eventSchema } from "@/lib/validation/event";

describe("eventSchema", () => {
  it("accepts valid payload for create/edit event flow", () => {
    const parsed = eventSchema.safeParse({
      title: "EMI Summer Stage",
      description: "A full live showcase with fan meet-and-greet.",
      location: "Bangkok Arena",
      event_date: "2026-08-01T20:00",
      status: "published",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid payload", () => {
    const parsed = eventSchema.safeParse({
      title: "",
      description: "short",
      location: "",
      event_date: "",
      status: "invalid",
    });

    expect(parsed.success).toBe(false);
  });
});
