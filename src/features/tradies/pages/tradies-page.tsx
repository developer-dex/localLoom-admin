/**
 * `TradiesPage`: full implementation of the admin tradies management
 * page with status filter tabs, search, data table with row selection,
 * detail dialog, and bulk actions toolbar.
 */

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

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
import { TradieRejectDialog } from "@/features/tradies/components/tradie-reject-dialog";
import { TradieBulkToolbar } from "@/features/tradies/components/tradie-bulk-toolbar";
import { useTradiesQuery } from "@/features/tradies/hooks/use-tradies-query";
import { useApproveTradieMutation } from "@/features/tradies/hooks/use-approve-tradie-mutation";
import type {
  ApprovalStatus,
  TradieListItem,
} from "@/features/tradies/tradies.types";

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

export default function TradiesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [rejectId, setRejectId] = React.useState<string | undefined>(undefined);
  const [rejectOpen, setRejectOpen] = React.useState(false);

  const approveMutation = useApproveTradieMutation();

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

  const { data, isLoading } = useTradiesQuery(queryParams);

  const tradies = data?.data ?? [];
  const meta = data?.meta;

  const toggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = React.useCallback(() => {
    if (selectedIds.length === tradies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tradies.map((t) => t.id));
    }
  }, [selectedIds.length, tradies]);

  const openDetail = React.useCallback(
    (id: string) => {
      navigate(`/tradies/${id}`);
    },
    [navigate],
  );

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

  const columns: DataTableColumn<TradieListItem>[] = React.useMemo(
    () => [
      {
        key: "checkbox",
        header: (
          <input
            type="checkbox"
            checked={tradies.length > 0 && selectedIds.length === tradies.length}
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
            aria-label={`Select ${row.businessName ?? "tradie"}`}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
      },
      {
        key: "businessName",
        header: "Business Name",
        cell: (row) => (
          <button
            type="button"
            className="font-medium text-foreground hover:underline"
            onClick={() => openDetail(row.id)}
          >
            {row.businessName ?? "—"}
          </button>
        ),
      },
      {
        key: "abn",
        header: "ABN",
        cell: (row) => <span className="font-mono text-sm">{row.abn}</span>,
      },
      {
        key: "category",
        header: "Category",
        cell: (row) =>
          row.services.length > 0
            ? row.services.map((s) => s.name).join(", ")
            : "—",
      },
      {
        key: "region",
        header: "Region",
        cell: (row) =>
          row.serviceRegions.length > 0
            ? row.serviceRegions.map((r) => r.name).join(", ")
            : "—",
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => {
          const variant =
            row.profileStatus === "approved"
              ? "default"
              : row.profileStatus === "rejected"
                ? "destructive"
                : "secondary";
          return <Badge variant={variant}>{row.profileStatus}</Badge>;
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
              {(row.profileStatus === "pending" ||
                row.profileStatus === "rejected") && (
                <DropdownMenuItem onClick={() => handleApprove(row.id)}>
                  Approve
                </DropdownMenuItem>
              )}
              {(row.profileStatus === "pending" ||
                row.profileStatus === "approved") && (
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
      tradies.length,
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
        title="Tradies"
        description="Manage tradie registrations and approvals."
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
          placeholder="Search by business name or ABN…"
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
            data={tradies}
            getRowId={(row) => row.id}
            emptyState="No tradies found."
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
      <TradieBulkToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Single reject dialog */}
      {rejectId && (
        <TradieRejectDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          mode="single"
          tradieId={rejectId}
        />
      )}
    </div>
  );
}
