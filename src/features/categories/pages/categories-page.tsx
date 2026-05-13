/**
 * `CategoriesPage`: authenticated route at `/categories`
 * (Requirements 8.1, 8.2, design.md §10.1).
 *
 * Responsibilities:
 *   - Fetch the admin categories list via `useCategoriesQuery` so the
 *     cache is shared with the dashboard counts hook and mutation
 *     invalidations (Req 4.10).
 *   - Render a `PageHeader` with the title, description, and a
 *     "New category" button that opens `CategoryDialog` in create
 *     mode.
 *   - Provide a client-side name filter via a shadcn `Input`
 *     bound to `nameFilter` state (case-insensitive substring match).
 *   - Render a `DataTable` with Name, Icon, Sort order, Active, Created
 *     at, and Actions columns. Actions expose small Edit and Delete
 *     buttons driving `CategoryDialog` (edit mode) and
 *     `CategoryDeleteDialog` respectively.
 *   - While the underlying query is loading, render a compact stack of
 *     `Skeleton` rows above the table so the loading state is
 *     visually distinct from an empty result set.
 */

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/wrappers/data-table";
import { PageHeader } from "@/components/wrappers/page-header";
import { CategoryDeleteDialog } from "@/features/categories/components/category-delete-dialog";
import { CategoryDialog } from "@/features/categories/components/category-dialog";
import { useCategoriesQuery } from "@/features/categories/hooks/use-categories-query";
import type { Category } from "@/features/categories/categories.types";

const CREATED_AT_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return CREATED_AT_FORMATTER.format(date);
}

function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : "?";
}

export default function CategoriesPage() {
  const query = useCategoriesQuery();

  const [nameFilter, setNameFilter] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<
    Category | undefined
  >(undefined);

  const categories = React.useMemo(() => query.data ?? [], [query.data]);

  const filteredCategories = React.useMemo(() => {
    const needle = nameFilter.trim().toLowerCase();
    if (needle.length === 0) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(needle),
    );
  }, [categories, nameFilter]);

  const openEdit = React.useCallback((category: Category) => {
    setSelectedCategory(category);
    setEditOpen(true);
  }, []);

  const openDelete = React.useCallback((category: Category) => {
    setSelectedCategory(category);
    setDeleteOpen(true);
  }, []);

  const columns: DataTableColumn<Category>[] = React.useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        cell: (row) => (
          <span className="font-medium text-foreground">{row.name}</span>
        ),
      },
      {
        key: "icon",
        header: "Icon",
        cell: (row) => (
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.icon ?? undefined} alt={row.name} />
            <AvatarFallback>{getInitial(row.name)}</AvatarFallback>
          </Avatar>
        ),
      },
      {
        key: "sortOrder",
        header: "Sort order",
        cell: (row) => row.sortOrder,
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
        title="Categories"
        description="Service categories tradies can be listed under."
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            New category
          </Button>
        }
      />

      <div className="space-y-4">
        <Input
          type="search"
          value={nameFilter}
          onChange={(event) => setNameFilter(event.target.value)}
          placeholder="Filter by name…"
          className="max-w-xs"
        />

        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredCategories}
            getRowId={(row) => row.id}
            emptyState={
              nameFilter.trim().length > 0
                ? "No categories match the current filter."
                : "No categories yet."
            }
          />
        )}
      </div>

      <CategoryDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      <CategoryDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        category={selectedCategory}
      />
      <CategoryDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={selectedCategory}
      />
    </div>
  );
}
