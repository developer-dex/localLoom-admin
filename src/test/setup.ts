/**
 * Global Vitest setup (Task 21.1).
 *
 * 1. Extends Vitest's `expect` with the matchers from
 *    `@testing-library/jest-dom` (e.g. `toBeInTheDocument`).
 * 2. Starts the shared MSW node server before the suite, resets handler
 *    overrides and localStorage between tests, and closes the server
 *    when the suite finishes so leaked sockets don't keep the runner
 *    alive.
 * 3. Polyfills `matchMedia` under jsdom because `Theme_Provider` reads
 *    it synchronously during construction; jsdom does not implement it.
 */

import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./server";

// --- MSW lifecycle --------------------------------------------------------

beforeAll(() => {
  // `error` surfaces any unhandled request as a test failure, which
  // catches missing handlers quickly instead of letting tests silently
  // hit the real network (which jsdom won't do, but better to be loud).
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  // Auth storage keys are stored in localStorage; clearing between
  // tests prevents cross-test bleed of tokens/profile.
  window.localStorage.clear();
});

afterAll(() => {
  server.close();
});

// --- jsdom polyfills ------------------------------------------------------

// jsdom does not implement `window.matchMedia`. `ThemeProvider` reads it
// during initial render to resolve the "system" preference, so we
// register a minimal stub that always reports light mode. Tests that
// need a different result can call `window.matchMedia = vi.fn(...)`.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
