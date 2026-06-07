/**
 * `TradieDeleteDialog`: destructive confirmation dialog that requires
 * the admin to type "delete" before the action is enabled.
 *
 * This deletes the user account and all associated data (profile,
 * favourites, reviews, etc.) while preserving chat history so other
 * participants can still see the conversation.
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { useDeleteUserMutation } from "@/features/tradies/hooks/use-delete-user-mutation";
import { cn } from "@/lib/utils";

export interface TradieDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName?: string;
}

export function TradieDeleteDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: TradieDeleteDialogProps) {
  const deleteMutation = useDeleteUserMutation();
  const [confirmText, setConfirmText] = React.useState("");

  const isConfirmed = confirmText.toLowerCase() === "delete";

  // Reset input when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setConfirmText("");
    }
  }, [open]);

  const handleConfirm = React.useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      if (!isConfirmed) return;
      try {
        await deleteMutation.mutateAsync(userId);
        onOpenChange(false);
      } catch {
        // Error toast is handled by the mutation's onError callback.
      }
    },
    [isConfirmed, userId, deleteMutation, onOpenChange],
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              {userName
                ? `Are you sure you want to permanently delete "${userName}"?`
                : "Are you sure you want to permanently delete this user?"}
            </span>
            <span className="block">
              This will remove the user account and all associated data
              (profile, reviews, favourites, etc.). Chat history will be
              preserved for other participants.
            </span>
            <span className="block font-medium text-destructive">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="delete-confirm-input">
            Type <span className="font-semibold">delete</span> to confirm
          </Label>
          <Input
            id="delete-confirm-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
            disabled={deleteMutation.isPending}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={handleConfirm}
            disabled={!isConfirmed || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
