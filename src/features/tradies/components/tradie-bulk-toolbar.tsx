/**
 * `TradieBulkToolbar`: floating toolbar that appears when one or more
 * tradies are selected in the data table. Shows the selection count
 * with Bulk Approve, Bulk Reject, and Clear selection actions.
 */

import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBulkApproveTradieMutation } from "@/features/tradies/hooks/use-bulk-approve-tradies-mutation";
import { TradieRejectDialog } from "@/features/tradies/components/tradie-reject-dialog";

export interface TradieBulkToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function TradieBulkToolbar({
  selectedIds,
  onClearSelection,
}: TradieBulkToolbarProps) {
  const bulkApproveMutation = useBulkApproveTradieMutation();
  const [rejectOpen, setRejectOpen] = React.useState(false);

  if (selectedIds.length === 0) return null;

  const handleBulkApprove = async () => {
    try {
      await bulkApproveMutation.mutateAsync(selectedIds);
      onClearSelection();
    } catch {
      // Error toast handled by mutation
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
        <span className="text-sm font-medium">
          {selectedIds.length} selected
        </span>
        <Button
          size="sm"
          onClick={handleBulkApprove}
          disabled={bulkApproveMutation.isPending}
        >
          {bulkApproveMutation.isPending ? "Approving…" : "Bulk Approve"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setRejectOpen(true)}
          disabled={bulkApproveMutation.isPending}
        >
          Bulk Reject
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          disabled={bulkApproveMutation.isPending}
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      </div>

      <TradieRejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        mode="bulk"
        ids={selectedIds}
      />
    </>
  );
}
