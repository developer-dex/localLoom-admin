/**
 * Shared error → toast bridge (Requirement 4.11, design.md §Error Handling).
 *
 * Every mutation hook in the admin panel funnels rejections through the
 * function returned by `useApiErrorToast` so error rendering is consistent:
 *
 *   - `title` is the normalized `ApiError.message`.
 *   - `description` is the first entry of `ApiError.errors` when present,
 *     otherwise omitted so the toast doesn't render an empty second line.
 *   - `variant` is `"destructive"` for any real failure — i.e. an HTTP
 *     status of 400+ or the sentinel `0` that `normalizeAxiosError`
 *     emits for network/timeout/CORS failures.
 *
 * The returned function accepts `unknown` so it can be passed directly to
 * React Query's `onError` callback. Anything that isn't an `ApiError`
 * (which should be rare, since the Api_Client normalizes everything)
 * still surfaces as a destructive toast with a generic title so the
 * failure isn't swallowed silently.
 */

import { useCallback } from "react";

import { ApiError } from "@/api/errors";
import { toast } from "@/hooks/use-toast";

type ApiErrorToastHandler = (error: unknown) => void;

export function useApiErrorToast(): ApiErrorToastHandler {
  return useCallback<ApiErrorToastHandler>((error) => {
    if (error instanceof ApiError) {
      const isFailure = error.status >= 400 || error.status === 0;
      toast({
        title: error.message,
        description: error.errors.length > 0 ? error.errors[0] : undefined,
        variant: isFailure ? "destructive" : "default",
      });
      return;
    }

    // Fallback for the rare case that something non-normalized reaches the
    // handler — never swallow it silently.
    toast({
      title: "Unexpected error",
      description: error instanceof Error ? error.message : undefined,
      variant: "destructive",
    });
  }, []);
}
