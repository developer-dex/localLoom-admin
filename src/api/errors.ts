/**
 * Normalized error type flowing out of Repositories.
 *
 * Per design.md §Error Handling.1 and Requirement 4.5, every rejection from
 * the Api_Client is mapped into an `ApiError` so hooks and components only
 * need to handle a single exception class. The normalizer in this module
 * covers five input shapes:
 *
 *   1. No response (network / timeout / CORS): status 0, generic message.
 *   2. Envelope JSON response with `errors: string[]`.
 *   3. Envelope JSON response with `errors: Array<{ field?, message }>`.
 *   4. Non-envelope JSON response (no `message` field): falls back to the
 *      HTTP status text.
 *   5. Response with no JSON body (e.g. an HTML 500 page): same as case 4.
 *
 * `normalizeAxiosError` must never throw and must accept any `unknown`
 * value so interceptor code can pass whatever axios rejected with.
 */

import axios from "axios";

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors: string[];
  public readonly fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    errors: string[] = [],
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.fieldErrors = fieldErrors;
  }
}

type EnvelopeErrorEntry = { field?: string; message: string };
type EnvelopeErrors = string[] | EnvelopeErrorEntry[];

interface EnvelopeResponse {
  message?: unknown;
  errors?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function looksLikeEnvelope(data: unknown): data is EnvelopeResponse {
  // An "envelope" response is an object whose `message` is a string. The
  // backend envelope also uses `success` and `errors`, but `message` is the
  // single most reliable discriminator because the normalizer uses it
  // verbatim for `ApiError.message` (Req 4.5).
  return isRecord(data) && typeof data.message === "string";
}

function coerceStringErrors(raw: unknown): {
  errors: string[];
  fieldErrors: Record<string, string>;
} {
  if (!Array.isArray(raw)) {
    return { errors: [], fieldErrors: {} };
  }

  // Case 2: plain string[].
  if (raw.every((entry): entry is string => typeof entry === "string")) {
    return { errors: raw, fieldErrors: {} };
  }

  // Case 3: Array<{ field?, message }>. Skip any entries that don't at
  // least carry a `message` string so a malformed element can't blow up
  // the whole normalization.
  const entries = raw.filter(
    (entry): entry is EnvelopeErrorEntry =>
      isRecord(entry) && typeof entry.message === "string",
  );
  const messages = entries.map((entry) => entry.message);
  const fieldPairs = entries
    .filter((entry): entry is Required<Pick<EnvelopeErrorEntry, "field">> & EnvelopeErrorEntry =>
      typeof entry.field === "string" && entry.field.length > 0,
    )
    .map((entry) => [entry.field, entry.message] as const);

  return {
    errors: messages,
    fieldErrors: Object.fromEntries(fieldPairs),
  };
}

export function normalizeAxiosError(err: unknown): ApiError {
  // Detect axios errors robustly. `axios.isAxiosError` is the recommended
  // runtime check; it also narrows the type for the rest of the function.
  if (axios.isAxiosError(err)) {
    const response = err.response;

    // Case 1: no response at all — network error, timeout, CORS, aborted.
    if (!response) {
      return new ApiError(0, "Network error. Please try again.", []);
    }

    const status = response.status;
    const statusText = response.statusText;
    const data: unknown = response.data;

    if (looksLikeEnvelope(data)) {
      // `data.message` was verified to be a string in looksLikeEnvelope.
      const message =
        (typeof data.message === "string" && data.message) ||
        statusText ||
        "Request failed";
      const { errors, fieldErrors } = coerceStringErrors(
        (data.errors as EnvelopeErrors | undefined) ?? [],
      );
      return new ApiError(status, message, errors, fieldErrors);
    }

    // Cases 4 & 5: non-envelope JSON, or no JSON body at all (string,
    // number, null, undefined, HTML string, etc.). Fall back to the HTTP
    // status text.
    return new ApiError(status, statusText || "Request failed", []);
  }

  // Non-axios error (something threw before axios could produce a response
  // object, or a caller passed an unrelated value). Preserve the original
  // message when available but always surface a well-formed ApiError.
  if (err instanceof Error) {
    return new ApiError(0, err.message || "Unknown error", []);
  }

  return new ApiError(0, "Unknown error", []);
}
