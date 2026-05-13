/**
 * `ChangePasswordPage` — signed-in admin password update (Requirement 5.11).
 *
 * This route is mounted at `/change-password` inside the guarded route
 * group (see `App_Router`), which means it renders under `AppLayout`
 * and therefore inside the layout-level `<Toaster />` mounted once in
 * `app-layout.tsx` (Req 6.6). Unlike `login-page.tsx`, this file
 * deliberately does NOT render a local `<Toaster />` — doing so would
 * mount a second viewport and the success toast (emitted from
 * `useChangePasswordMutation`) would render twice.
 *
 * Form shape & validation
 * -----------------------
 * Mirrors the backend Joi schema in
 * `localloom-backend/src/modules/admin-auth/admin-auth.validation.ts`:
 *   - `currentPassword`: non-empty string
 *   - `newPassword`: length 8..128
 *
 * Keeping these constraints in sync with the backend means client-side
 * rejection shapes match what the server would return, so the user gets
 * the same feedback regardless of which layer catches the error first.
 *
 * Success handling
 * ----------------
 * `useChangePasswordMutation` already surfaces a toast on success (see
 * that hook's JSDoc for the rationale — the change-password flow has
 * no `Auth_Provider` counterpart to route side effects through). This
 * component therefore only calls `form.reset()` on success per Req
 * 5.11; duplicating the toast here would double-notify the user.
 *
 * Error handling
 * --------------
 * Mirrors the `login-page.tsx` split:
 *   - `ApiError` with populated `fieldErrors` → map each entry into a
 *     `form.setError(field, { message })` call so the error renders
 *     inline next to the offending input.
 *   - Anything else → the shared `useApiErrorToast` bridge so the
 *     message is rendered consistently with the rest of the app.
 */

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";
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
import { TextFormField } from "@/components/wrappers/form-field";
import { PageHeader } from "@/components/wrappers/page-header";
import { useChangePasswordMutation } from "@/features/auth/hooks/use-change-password-mutation";
import { useApiErrorToast } from "@/hooks/use-api-error-toast";

// Mirrors the backend Joi schema in
// `localloom-backend/src/modules/admin-auth/admin-auth.validation.ts`
// (currentPassword required, newPassword 8..128).
const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "New password must be 128 characters or fewer"),
});

type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

const DEFAULT_VALUES: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
};

export default function ChangePasswordPage() {
  const mutation = useChangePasswordMutation();
  const apiErrorToast = useApiErrorToast();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = React.useCallback(
    async (values: ChangePasswordFormValues) => {
      try {
        await mutation.mutateAsync(values);
        form.reset(DEFAULT_VALUES);
      } catch (err) {
        if (
          err instanceof ApiError &&
          Object.keys(err.fieldErrors).length > 0
        ) {
          for (const [field, message] of Object.entries(err.fieldErrors)) {
            form.setError(
              field as FieldPath<ChangePasswordFormValues>,
              { message },
            );
          }
          return;
        }
        apiErrorToast(err);
      }
    },
    [apiErrorToast, form, mutation],
  );

  const isSubmitting = form.formState.isSubmitting || mutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change password"
        description="Update the password you use to sign in to the admin panel."
      />
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2">
            <CardTitle>Update your password</CardTitle>
            <CardDescription>
              Enter your current password and choose a new one. New passwords
              must be at least 8 characters.
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
                  name="currentPassword"
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <TextFormField
                  control={form.control}
                  name="newPassword"
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Changing password…" : "Change password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
