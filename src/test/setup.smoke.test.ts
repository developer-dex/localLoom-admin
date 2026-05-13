/**
 * Smoke test for the Vitest + Testing Library + MSW setup (Task 21.1).
 *
 * Confirms three guarantees the rest of the test suite relies on:
 *   1. jest-dom matchers are registered on Vitest's `expect`.
 *   2. The MSW node server is running and the default `GET /categories`
 *      handler returns the envelope shape.
 *   3. `window.matchMedia` is available under jsdom (polyfilled in
 *      `setup.ts`).
 */

import { describe, expect, it } from "vitest";

import { env } from "@/config/env";
import { ADMIN_PATHS } from "@/api/paths";

describe("test infrastructure", () => {
  it("registers jest-dom matchers on expect", () => {
    const div = document.createElement("div");
    div.textContent = "hello";
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
    document.body.removeChild(div);
  });

  it("polyfills window.matchMedia under jsdom", () => {
    expect(typeof window.matchMedia).toBe("function");
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    expect(mql).toHaveProperty("matches");
  });

  it("serves the default MSW handler for GET /categories", async () => {
    const res = await fetch(
      `${env.apiBaseUrl}/api/admin${ADMIN_PATHS.categories.root}`,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: unknown;
    };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});
