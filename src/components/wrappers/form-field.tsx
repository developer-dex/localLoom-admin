/**
 * `TextFormField`: shadcn_Wrapper that composes the shadcn `FormField`,
 * `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, and
 * `FormMessage` primitives behind a single-prop API so feature forms
 * stay readable (design.md §4, Requirements 2.3, 2.4, 2.5).
 *
 * The shadcn `Form` primitive itself is NOT re-exported here — it
 * lives in `@/components/ui/form` and MUST be imported from there (Req
 * 2.2, 2.6). This file is a composition layer only; it does not
 * modify any file under `src/components/ui/`.
 *
 * Generic over the surrounding `react-hook-form` schema so callers
 * retain auto-complete on `name`:
 *
 *   <TextFormField control={form.control} name="email" label="Email"
 *                  type="email" autoComplete="username" />
 */

import * as React from "react";
import type {
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface TextFormFieldProps<TFieldValues extends FieldValues> {
  /** `react-hook-form` controller — typically `form.control`. */
  control: Control<TFieldValues>;
  /** Field name; narrowed to the form's declared paths. */
  name: FieldPath<TFieldValues>;
  /** Label text rendered via shadcn `FormLabel`. */
  label: string;
  /** Optional helper copy rendered via shadcn `FormDescription`. */
  description?: string;
  /** Placeholder forwarded to the underlying `<input>`. */
  placeholder?: string;
  /** HTML input type (defaults to `"text"`). */
  type?: React.HTMLInputTypeAttribute;
  /** Disables the underlying `<input>`. */
  disabled?: boolean;
  /** Forwarded to `<input autocomplete>` — see RFC 6204 §17 tokens. */
  autoComplete?: string;
}

export function TextFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = "text",
  disabled,
  autoComplete,
}: TextFormFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
