/**
 * `CategoryDeleteDialog`: confirmation prompt for soft-deleting a
 * category (Requirement 8.6, design.md §5.6).
 *
 * Wraps the shadcn `AlertDialog` so the destructive action requires
 * an explicit confirmation step. The confirm handler calls
 * `useDeleteCategoryMutation` and closes the dialog only on success —
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
import type { Category } from "@/features/categories/categories.types";
import { useDeleteCategoryMutation } from "@/features/categories/hooks/use-delete-category-mutation";
import { cn } from "@/lib/utils";

export interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
}: CategoryDeleteDialogProps) {
  const deleteMutation = useDeleteCategoryMutation();

  const handleConfirm = React.useCallback(
    async (event: React.MouseEvent) => {
      // AlertDialog's Action element closes the dialog via Radix's
      // default handling; prevent that so we can decide based on the
      // mutation outcome.
      event.preventDefault();
      if (!category) return;
      try {
        await deleteMutation.mutateAsync(category.id);
        onOpenChange(false);
      } catch {
        // The mutation's `onError` already surfaced a toast. Keep the
        // dialog open so the operator can retry or cancel.
      }
    },
    [category, deleteMutation, onOpenChange],
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete category</AlertDialogTitle>
          <AlertDialogDescription>
            {category
              ? `Are you sure you want to delete “${category.name}”? This action cannot be undone.`
              : "Are you sure you want to delete this category? This action cannot be undone."}
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
