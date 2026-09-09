import { describe, expect, it } from "vitest";

import { registerSchema } from "@/lib/validators/auth";

const validInput = {
  name: "Learner",
  email: "learner@example.com",
  password: "long-enough-password",
  confirmPassword: "long-enough-password",
};

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      confirmPassword: "different-password",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined();
    }
  });

  it("rejects invalid email and short passwords", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      email: "not-an-email",
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    }
  });

  it("trims the display name", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      name: "  Learner  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Learner");
    }
  });
});
