/**
 * `RegionDeleteDialog`: confirmation prompt for soft-deleting a
 * region (Requirement 9.5, design.md §5.6).
 *
 * Wraps the shadcn `AlertDialog` so the destructive action requires
 * an explicit confirmation step. The confirm handler calls
 * `useDeleteRegionMutation` and closes the dialog only on success —
 * on failure the mutation's `onError` callback already surfaces a
 * destructive toast via `useApiErrorToast`, and the dialog stays open
 * so the operator can retry or cancel.
 */

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useDeleteRegionMutation } from "@/features/regions/hooks/use-delete-region-mutation";
import type { Region } from "@/features/regions/regions.types";
import { cn } from "@/lib/utils";

export interface RegionDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region?: Region;
}

export function RegionDeleteDialog({
  open,
  onOpenChange,
  region,
}: RegionDeleteDialogProps) {
  const deleteMutation = useDeleteRegionMutation();

  const handleConfirm = React.useCallback(
    async (event: React.MouseEvent) => {
      // AlertDialog's Action element closes the dialog via Radix's
      // default handling; prevent that so we can decide based on the
      // mutation outcome.
      event.preventDefault();
      if (!region) return;
      try {
        await deleteMutation.mutateAsync(region.id);
        onOpenChange(false);
      } catch {
        // The mutation's `onError` already surfaced a toast. Keep the
        // dialog open so the operator can retry or cancel.
      }
    },
    [region, deleteMutation, onOpenChange],
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete region</AlertDialogTitle>
          <AlertDialogDescription>
            {region
              ? `Are you sure you want to delete “${region.name}”? This action cannot be undone.`
              : "Are you sure you want to delete this region? This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
