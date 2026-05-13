/**
 * `RegionsPage`: authenticated route at `/regions`
 * (Requirement 9.1, design.md §10.1).
 *
 * Responsibilities:
 *   - Fetch the admin regions list via `useRegionsQuery` so the
 *     cache is shared with the dashboard counts hook and mutation
 *     invalidations (Req 4.10).
 *   - Render a `PageHeader` with the title, description, and a
 *     "New region" button that opens `RegionDialog` in create mode.
 *   - Render a `DataTable` with Name, Active, Created at, and
 *     Actions columns. Actions expose small Edit and Delete
 *     buttons driving `RegionDialog` (edit mode) and
 *     `RegionDeleteDialog` respectively.
 *   - While the underlying query is loading, render a compact stack
 *     of `Skeleton` rows above the table so the loading state is
 *     visually distinct from an empty result set.
 */

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/wrappers/data-table";
import { PageHeader } from "@/components/wrappers/page-header";
import { RegionDeleteDialog } from "@/features/regions/components/region-delete-dialog";
import { RegionDialog } from "@/features/regions/components/region-dialog";
import { useRegionsQuery } from "@/features/regions/hooks/use-regions-query";
import type { Region } from "@/features/regions/regions.types";

const CREATED_AT_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return CREATED_AT_FORMATTER.format(date);
}

export default function RegionsPage() {
  const query = useRegionsQuery();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedRegion, setSelectedRegion] = React.useState<
    Region | undefined
  >(undefined);

  const regions = React.useMemo(() => query.data ?? [], [query.data]);

  const openEdit = React.useCallback((region: Region) => {
    setSelectedRegion(region);
    setEditOpen(true);
  }, []);

  const openDelete = React.useCallback((region: Region) => {
    setSelectedRegion(region);
    setDeleteOpen(true);
  }, []);

  const columns: DataTableColumn<Region>[] = React.useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        cell: (row) => (
          <span className="font-medium text-foreground">{row.name}</span>
        ),
      },
      {
        key: "isActive",
        header: "Active",
        cell: (row) => (
          <Badge variant={row.isActive ? "default" : "secondary"}>
            {row.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        header: "Created at",
        cell: (row) => (
          <span className="text-muted-foreground">
            {formatCreatedAt(row.createdAt)}
          </span>
        ),
      },
      {
        key: "actions",
        header: <span className="sr-only">Actions</span>,
        headClassName: "w-[1%]",
        cellClassName: "w-[1%] whitespace-nowrap",
        cell: (row) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openEdit(row)}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => openDelete(row)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [openDelete, openEdit],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regions"
        description="Service regions your tradies operate in."
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            New region
          </Button>
        }
      />

      <div className="space-y-4">
        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={regions}
            getRowId={(row) => row.id}
            emptyState="No regions yet."
          />
        )}
      </div>

      <RegionDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <RegionDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        region={selectedRegion}
      />
      <RegionDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        region={selectedRegion}
      />
    </div>
  );
}
