/**
 * `PageHeader`: project-authored shadcn_Wrapper that renders the
 * consistent title/description/actions block used at the top of every
 * feature page (design.md §4, Requirements 2.3, 2.5, 2.7).
 *
 * This file lives under `src/components/wrappers/` because shadcn's
 * generated primitives in `src/components/ui/` MUST NOT be hand-edited
 * (Req 2.2, 2.6); project-specific compositions belong here. It
 * imports `Separator` directly from `@/components/ui/separator` and
 * composes class names through `cn` from `@/lib/utils` (Req 2.7).
 *
 * Styling is 100% token-driven (`text-foreground`,
 * `text-muted-foreground`) so a token swap in `tokens.css` restyles
 * every `PageHeader` instance without any change here (Req 3.7).
 */

import * as React from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The primary heading rendered as an `<h1>`. */
  title: string;
  /** Optional supporting copy rendered below the title. */
  description?: string;
  /** Optional right-aligned slot for action buttons (New, Refresh, …). */
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)} {...rest}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <Separator />
    </div>
  );
}
