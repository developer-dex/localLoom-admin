/**
 * MSW node server shared by every Vitest run (Task 21.1).
 *
 * Tests can override individual handlers at runtime with
 * `server.use(http.get(..., () => new HttpResponse(null, { status: 401 })))`;
 * the `afterEach` hook in `setup.ts` resets those overrides so test
 * isolation is preserved.
 */

import { setupServer } from "msw/node";

import { handlers } from "./handlers";

export const server = setupServer(...handlers);
