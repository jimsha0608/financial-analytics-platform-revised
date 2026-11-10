import { describe, expect, it } from "vitest";

import { getErrorMessage } from "./apiError";

function mockAxiosError(data: unknown, message = "Request failed"): unknown {
  return { isAxiosError: true, message, response: { data } };
}

describe("getErrorMessage", () => {
  it("extracts the first field error message", () => {
    const error = mockAxiosError({
      detail: "Validation failed.",
      errors: { email: ["This field is required."] },
    });
    expect(getErrorMessage(error)).toBe("This field is required.");
  });

  it("falls back to detail when there are no field errors", () => {
    const error = mockAxiosError({ detail: "Invalid credentials." });
    expect(getErrorMessage(error)).toBe("Invalid credentials.");
  });

  it("returns a generic message for a non-axios error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("Something went wrong. Please try again.");
  });

  it("returns a network-specific message when the request never reached the server", () => {
    const error = mockAxiosError(undefined, "Network Error");
    expect(getErrorMessage(error)).toBe(
      "Could not reach the server. Please check your connection and try again."
    );
  });
});
