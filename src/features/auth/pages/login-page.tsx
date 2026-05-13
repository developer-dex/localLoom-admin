/**
 * `LoginPage` — admin sign-in screen (Requirements 5.1–5.5, 11.4).
 *
 * `/login` is the only public route in the app (Req 11.1) and it lives
 * OUTSIDE `AppLayout`, which means the layout-level `<Toaster />` is not
 * mounted on this screen. To keep error toasts visible during sign-in
 * we render a local `<Toaster />` at the page root.
 *
 * Auth error handling follows the split described in the spec:
 *
 *   - `ApiError` with status 401 → bad credentials (Req 5.4). We surface
 *     the backend message as a destructive toast and stay on `/login`.
 *   - `ApiError` with status 403 → admin account not active (Req 5.5).
 *     Same treatment: destructive toast, no navigation.
 *   - Any other rejection flows through `useApiErrorToast` so validation
 *     or network failures land in the shared toast surface.
 *
 * On success we honour the `redirectTo` search param (Req 11.4) but only
 * when it is a safe in-app path: it MUST start with `/` AND MUST NOT
 * contain `://`. Anything else (external URL, scheme-relative `//evil`,
 * missing value) falls back to `/dashboard` per Req 5.3.
 */

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { ApiError } from "@/api/errors";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Toaster } from "@/components/ui/toaster";
import { TextFormField } from "@/components/wrappers/form-field";
import { env } from "@/config/env";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";

const loginFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const DEFAULT_REDIRECT = "/dashboard";

/**
 * Clamp the `redirectTo` query param to a safe, same-origin admin path.
 *
 * The guard is intentionally strict (Req 11.4): the value must start
 * with a single `/` AND must not contain `://` so attackers cannot use
 * `?redirectTo=https://evil.tld/x` or `?redirectTo=//evil.tld/x` to
 * phish signed-in admins. Anything outside that shape falls back to
 * `/dashboard`.
 */
function resolveRedirectTo(raw: string | null): string {
  if (!raw) return DEFAULT_REDIRECT;
  if (!raw.startsWith("/")) return DEFAULT_REDIRECT;
  if (raw.includes("://")) return DEFAULT_REDIRECT;
  return raw;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apiErrorToast = useApiErrorToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = React.useCallback(
    async (values: LoginFormValues) => {
      try {
        await login(values.email, values.password);
        const target = resolveRedirectTo(searchParams.get("redirectTo"));
        navigate(target, { replace: true });
      } catch (err) {
        // 401 (bad credentials) and 403 (inactive admin) stay on /login
        // with a destructive toast sourced from the backend envelope.
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          toast({
            title: err.message,
            description: err.errors.length > 0 ? err.errors[0] : undefined,
            variant: "destructive",
          });
          return;
        }
        // Everything else (network, 5xx, validation) funnels through the
        // shared ApiError → toast bridge so the message is consistent
        // with the rest of the app.
        apiErrorToast(err);
      }
    },
    [apiErrorToast, login, navigate, searchParams],
  );

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">{env.appName}</CardTitle>
          <CardDescription>
            Sign in with your admin credentials to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <TextFormField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="username"
                disabled={isSubmitting}
              />
              <TextFormField
                control={form.control}
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {/*
       * LoginPage is mounted outside AppLayout (Req 11.1), so the
       * layout-level Toaster is not available. Mount a local one here
       * so login errors surface during sign-in.
       */}
      <Toaster />
    </div>
  );
}
