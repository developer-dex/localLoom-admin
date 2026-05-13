/**
 * `CategoryDialog`: create/edit form for service categories
 * (Requirements 8.3, 8.4, 8.5, 8.7, 8.8, design.md §5.6).
 *
 * The same dialog drives both the "New category" and "Edit category"
 * flows — the behavior differs only in which mutation is called and
 * which initial values populate the form. When `mode === "edit"` the
 * `icon` field is deliberately left undefined so an edit submission
 * that does not touch the file input will not overwrite the stored
 * asset on the server (see `buildCategoryFormData`).
 *
 * Field composition
 * -----------------
 * The `name` input is driven through `TextFormField` since it is a
 * plain text input and fits the wrapper's single-prop API. The
 * `description`, `sortOrder`, and `icon` fields compose the shadcn
 * `FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage`
 * primitives inline — shadcn's UI primitives are not modified (Req
 * 2.2, 2.6). The Textarea and file input are bound to the form
 * controller via `render={({ field }) => ... }` callbacks.
 *
 * Error handling
 * --------------
 * On submission failure the dialog inspects the caught error for
 * `ApiError`:
 *   - If `fieldErrors` has entries, each one is surfaced inline via
 *     `form.setError(field, { message })` so the user sees the
 *     backend message next to the offending input (Req 8.7).
 *   - If the backend rejects with HTTP 409 (duplicate name) and
 *     `fieldErrors` is empty, the error is pinned to the `name` field
 *     (Req 8.8).
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TextFormField } from "@/components/wrappers/form-field";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/features/categories/categories.schema";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/categories/categories.types";
import { useCreateCategoryMutation } from "@/features/categories/hooks/use-create-category-mutation";
import { useUpdateCategoryMutation } from "@/features/categories/hooks/use-update-category-mutation";

export type CategoryDialogMode = "create" | "edit";

export interface CategoryDialogProps {
  mode: CategoryDialogMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required when `mode === "edit"`. */
  category?: Category;
}

const EMPTY_DEFAULTS: CategoryFormValues = {
  name: "",
  description: "",
  sortOrder: undefined,
  icon: undefined,
};

function toDefaultValues(
  mode: CategoryDialogMode,
  category: Category | undefined,
): CategoryFormValues {
  if (mode === "edit" && category) {
    return {
      name: category.name,
      description: category.description ?? "",
      sortOrder: category.sortOrder,
      // Deliberately omit `icon` so an untouched icon is not sent on
      // submission (see `buildCategoryFormData`).
      icon: undefined,
    };
  }
  return EMPTY_DEFAULTS;
}

/**
 * Build the payload sent to the backend from the validated form values,
 * dropping empty-string descriptions so optional fields stay truly
 * optional on the wire.
 */
function toMutationInput(
  values: CategoryFormValues,
): CreateCategoryInput & UpdateCategoryInput {
  const input: CreateCategoryInput & UpdateCategoryInput = {
    name: values.name,
  };
  if (values.description !== undefined && values.description !== "") {
    input.description = values.description;
  }
  if (values.sortOrder !== undefined) {
    input.sortOrder = values.sortOrder;
  }
  if (values.icon instanceof File) {
    input.icon = values.icon;
  }
  return input;
}

export function CategoryDialog({
  mode,
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: toDefaultValues(mode, category),
  });

  // Reset the form every time the dialog opens with a different
  // category or flips between modes so stale values from a prior edit
  // don't leak into the next interaction.
  React.useEffect(() => {
    if (open) {
      form.reset(toDefaultValues(mode, category));
    }
    // form is stable; reset identity is not but we only want to run when
    // the logical inputs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, category?.id]);

  const isSubmitting =
    form.formState.isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending;

  const onSubmit = async (values: CategoryFormValues) => {
    const input = toMutationInput(values);
    try {
      if (mode === "edit") {
        if (!category) return;
        await updateMutation.mutateAsync({ id: category.id, input });
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
            form.setError(field as FieldPath<CategoryFormValues>, { message });
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

  const title = mode === "edit" ? "Edit category" : "New category";
  const description =
    mode === "edit"
      ? "Update the details for this service category."
      : "Create a new service category that tradies can be listed under.";

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
              placeholder="Plumbing"
              disabled={isSubmitting}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Optional supporting copy shown to tradies."
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const raw = event.target.value;
                        field.onChange(raw === "" ? undefined : raw);
                      }}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field: { onChange, name, ref, onBlur } }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      name={name}
                      ref={ref}
                      onBlur={onBlur}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        onChange(file);
                      }}
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
                    : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
