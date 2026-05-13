/**
 * `RegionDialog`: create/edit form for service regions
 * (Requirements 9.2, 9.3, 9.4, design.md §5.6).
 *
 * The same dialog drives both the "New region" and "Edit region"
 * flows — the behavior differs only in which mutation is called and
 * which initial values populate the form.
 *
 * Field composition
 * -----------------
 * The `name` input is driven through `TextFormField` since it is a
 * plain text input and fits the wrapper's single-prop API. The
 * `isActive` field composes the shadcn
 * `FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage`
 * primitives inline around a shadcn `Switch` — shadcn's UI
 * primitives are not modified (Req 2.2, 2.6). The `Switch` is bound
 * to the form controller via `checked` + `onCheckedChange`.
 *
 * Error handling
 * --------------
 * On submission failure the dialog inspects the caught error for
 * `ApiError`:
 *   - If `fieldErrors` has entries, each one is surfaced inline via
 *     `form.setError(field, { message })` so the user sees the
 *     backend message next to the offending input.
 *   - If the backend rejects with HTTP 409 (duplicate name) and
 *     `fieldErrors` is empty, the error is pinned to the `name`
 *     field.
 *   - Everything else bubbles up to the mutation hook, which already
 *     surfaces the message via `useApiErrorToast`.
 */

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";

import { ApiError } from "@/api/errors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { TextFormField } from "@/components/wrappers/form-field";
import { useCreateRegionMutation } from "@/features/regions/hooks/use-create-region-mutation";
import { useUpdateRegionMutation } from "@/features/regions/hooks/use-update-region-mutation";
import {
  regionFormSchema,
  type RegionFormValues,
} from "@/features/regions/regions.schema";
import type {
  CreateRegionInput,
  Region,
  UpdateRegionInput,
} from "@/features/regions/regions.types";

export type RegionDialogMode = "create" | "edit";

export interface RegionDialogProps {
  mode: RegionDialogMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required when `mode === "edit"`. */
  region?: Region;
}

const EMPTY_DEFAULTS: RegionFormValues = {
  name: "",
  isActive: true,
};

function toDefaultValues(
  mode: RegionDialogMode,
  region: Region | undefined,
): RegionFormValues {
  if (mode === "edit" && region) {
    return {
      name: region.name,
      isActive: region.isActive,
    };
  }
  return EMPTY_DEFAULTS;
}

/**
 * Build the payload sent to the backend from the validated form values.
 * The wire type is plain JSON (Req 9.3, 9.4).
 */
function toMutationInput(
  values: RegionFormValues,
): CreateRegionInput & UpdateRegionInput {
  return {
    name: values.name,
    isActive: values.isActive,
  };
}

export function RegionDialog({
  mode,
  open,
  onOpenChange,
  region,
}: RegionDialogProps) {
  const createMutation = useCreateRegionMutation();
  const updateMutation = useUpdateRegionMutation();

  const form = useForm<RegionFormValues>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: toDefaultValues(mode, region),
  });

  // Reset the form every time the dialog opens with a different
  // region or flips between modes so stale values from a prior edit
  // don't leak into the next interaction.
  React.useEffect(() => {
    if (open) {
      form.reset(toDefaultValues(mode, region));
    }
    // form is stable; reset identity is not but we only want to run when
    // the logical inputs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, region?.id]);

  const isSubmitting =
    form.formState.isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending;

  const onSubmit = async (values: RegionFormValues) => {
    const input = toMutationInput(values);
    try {
      if (mode === "edit") {
        if (!region) return;
        await updateMutation.mutateAsync({ id: region.id, input });
      } else {
        await createMutation.mutateAsync(input);
      }
      form.reset(EMPTY_DEFAULTS);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        const entries = Object.entries(err.fieldErrors);
        if (entries.length > 0) {
          for (const [field, message] of entries) {
            form.setError(field as FieldPath<RegionFormValues>, { message });
          }
          return;
        }
        if (err.status === 409) {
          form.setError("name", { message: err.message });
          return;
        }
      }
      // Any other error already surfaces through the mutation hook's
      // `onError` → `useApiErrorToast`. Nothing else to do here.
    }
  };

  const title = mode === "edit" ? "Edit region" : "New region";
  const description =
    mode === "edit"
      ? "Update the details for this service region."
      : "Create a new service region your tradies can operate in.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <TextFormField
              control={form.control}
              name="name"
              label="Name"
              placeholder="Sydney"
              disabled={isSubmitting}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-md border border-border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === "edit"
                    ? "Saving…"
                    : "Creating…"
                  : mode === "edit"
                    ? "Save changes"
                    : "Create region"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
