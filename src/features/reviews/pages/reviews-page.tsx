/**
 * `ReviewsPage`: full implementation of the admin reviews management
 * page with status filter tabs, search, data table with row selection,
 * detail dialog, and bulk actions toolbar.
 */

import * as React from "react";
import { MoreHorizontal, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/wrappers/data-table";
import { PageHeader } from "@/components/wrappers/page-header";
import { ReviewDetailDialog } from "@/features/reviews/components/review-detail-dialog";
import { ReviewRejectDialog } from "@/features/reviews/components/review-reject-dialog";
import { ReviewBulkToolbar } from "@/features/reviews/components/review-bulk-toolbar";
import { useReviewsQuery } from "@/features/reviews/hooks/use-reviews-query";
import { useApproveReviewMutation } from "@/features/reviews/hooks/use-approve-review-mutation";
import type {
  ApprovalStatus,
  ReviewListItem,
} from "@/features/reviews/reviews.types";

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return DATE_FORMATTER.format(date);
}

type StatusFilter = "all" | ApprovalStatus;

const PAGE_SIZE = 10;
const COMMENT_TRUNCATE_LENGTH = 60;

export default function ReviewsPage() {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [detailId, setDetailId] = React.useState<string | undefined>(undefined);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [rejectId, setRejectId] = React.useState<string | undefined>(undefined);
  const [rejectOpen, setRejectOpen] = React.useState(false);

  const approveMutation = useApproveReviewMutation();

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [statusFilter]);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
    }),
    [page, statusFilter, debouncedSearch],
  );

  const { data, isLoading } = useReviewsQuery(queryParams);

  const reviews = data?.data ?? [];
  const meta = data?.meta;

  const toggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = React.useCallback(() => {
    if (selectedIds.length === reviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reviews.map((r) => r.id));
    }
  }, [selectedIds.length, reviews]);

  const openDetail = React.useCallback((id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  }, []);

  const handleApprove = React.useCallback(
    async (id: string) => {
      try {
        await approveMutation.mutateAsync(id);
      } catch {
        // Error toast handled by mutation
      }
    },
    [approveMutation],
  );

  const openReject = React.useCallback((id: string) => {
    setRejectId(id);
    setRejectOpen(true);
  }, []);

  const columns: DataTableColumn<ReviewListItem>[] = React.useMemo(
    () => [
      {
        key: "checkbox",
        header: (
          <input
            type="checkbox"
            checked={reviews.length > 0 && selectedIds.length === reviews.length}
            onChange={toggleSelectAll}
            aria-label="Select all"
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        headClassName: "w-[40px]",
        cellClassName: "w-[40px]",
        cell: (row) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.id)}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelect(row.id);
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select review by ${row.customer.name}`}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
      },
      {
        key: "customer",
        header: "Customer",
        cell: (row) => (
          <button
            type="button"
            className="font-medium text-foreground hover:underline"
            onClick={() => openDetail(row.id)}
          >
            {row.customer.name}
          </button>
        ),
      },
      {
        key: "tradie",
        header: "Tradie",
        cell: (row) => <span>{row.tradieProfile.businessName}</span>,
      },
      {
        key: "rating",
        header: "Rating",
        cell: (row) => (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{row.rating}</span>
          </div>
        ),
      },
      {
        key: "comment",
        header: "Comment",
        cell: (row) => (
          <span className="text-sm text-muted-foreground">
            {row.comment
              ? row.comment.length > COMMENT_TRUNCATE_LENGTH
                ? `${row.comment.slice(0, COMMENT_TRUNCATE_LENGTH)}…`
                : row.comment
              : "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => {
          const variant =
            row.status === "approved"
              ? "default"
              : row.status === "rejected"
                ? "destructive"
                : "secondary";
          return <Badge variant={variant}>{row.status}</Badge>;
        },
      },
      {
        key: "date",
        header: "Date",
        cell: (row) => (
          <span className="text-muted-foreground">
            {formatDate(row.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: <span className="sr-only">Actions</span>,
        headClassName: "w-[1%]",
        cellClassName: "w-[1%] whitespace-nowrap",
        cell: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openDetail(row.id)}>
                View details
              </DropdownMenuItem>
              {(row.status === "pending" || row.status === "rejected") && (
                <DropdownMenuItem onClick={() => handleApprove(row.id)}>
                  Approve
                </DropdownMenuItem>
              )}
              {(row.status === "pending" || row.status === "approved") && (
                <DropdownMenuItem onClick={() => openReject(row.id)}>
                  Reject
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      reviews.length,
      selectedIds,
      toggleSelectAll,
      toggleSelect,
      openDetail,
      handleApprove,
      openReject,
    ],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Moderate customer reviews before they go live."
      />

      <div className="space-y-4">
        {/* Status filter tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or tradie business name…"
          className="max-w-sm"
        />

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={reviews}
            getRowId={(row) => row.id}
            emptyState="No reviews found."
          />
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasPrevPage}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk toolbar */}
      <ReviewBulkToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Detail dialog */}
      <ReviewDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        reviewId={detailId}
      />

      {/* Single reject dialog */}
      {rejectId && (
        <ReviewRejectDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          mode="single"
          reviewId={rejectId}
        />
      )}
    </div>
  );
}
