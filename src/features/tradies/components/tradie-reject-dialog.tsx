/**
 * `TradieRejectDialog`: confirmation prompt with a required rejection
 * reason textarea for rejecting one or more tradies.
 *
 * Supports two modes via props:
 *   - Single reject: `mode="single"` with a `tradieId`
 *   - Bulk reject: `mode="bulk"` with an `ids` array
 *
 * Uses Zod validation (min 1, max 1000 chars) matching the backend
 * constraint. On confirm, calls the appropriate reject mutation and
 * closes only on success.
 */

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useRejectTradieMutation } from "@/features/tradies/hooks/use-reject-tradie-mutation";
import { useBulkRejectTradieMutation } from "@/features/tradies/hooks/use-bulk-reject-tradies-mutation";
import {
  rejectTradieSchema,
  type RejectTradieFormValues,
} from "@/features/tradies/tradies.schema";
import { cn } from "@/lib/utils";

export type TradieRejectDialogProps =
  | {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      mode: "single";
      tradieId: string;
    }
  | {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      mode: "bulk";
      ids: string[];
    };

export function TradieRejectDialog(props: TradieRejectDialogProps) {
  const { open, onOpenChange, mode } = props;
  const rejectMutation = useRejectTradieMutation();
  const bulkRejectMutation = useBulkRejectTradieMutation();

  const form = useForm<RejectTradieFormValues>({
    resolver: zodResolver(rejectTradieSchema),
    defaultValues: { rejectionReason: "" },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ rejectionReason: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isPending = rejectMutation.isPending || bulkRejectMutation.isPending;

  const handleConfirm = async (event: React.MouseEvent) => {
    event.preventDefault();
    const valid = await form.trigger();
    if (!valid) return;

    const { rejectionReason } = form.getValues();

    try {
      if (mode === "single") {
        await rejectMutation.mutateAsync({
          id: (props as { tradieId: string }).tradieId,
          rejectionReason,
        });
      } else {
        await bulkRejectMutation.mutateAsync({
          ids: (props as { ids: string[] }).ids,
          rejectionReason,
        });
      }
      onOpenChange(false);
    } catch {
      // Error toast is handled by the mutation's onError callback.
    }
  };

  const description =
    mode === "single"
      ? "Please provide a reason for rejecting this tradie. This will be visible to the tradie."
      : `Please provide a reason for rejecting ${(props as { ids: string[] }).ids.length} selected tradies.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject tradie</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="rejectionReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rejection reason</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter the reason for rejection…"
                      disabled={isPending}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Rejecting…" : "Reject"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
