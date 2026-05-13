/**
 * `DataTable`: thin generic shadcn_Wrapper around the shadcn `Table`
 * primitive so feature pages declare their columns + rows once and
 * share styling, empty-state handling, and the hover/focus treatments
 * that `Table` already provides (design.md §4, Requirements 2.3, 2.5).
 *
 * This file imports from `@/components/ui/table` and does NOT modify
 * any file under `src/components/ui/` (Req 2.2, 2.6).
 *
 * Usage:
 *
 *   <DataTable
 *     data={rows}
 *     getRowId={(r) => r.id}
 *     columns={[
 *       { key: "name",   header: "Name",   cell: (r) => r.name },
 *       { key: "active", header: "Active", cell: (r) => r.isActive ? "Yes" : "No" },
 *     ]}
 *   />
 *
 * When `data.length === 0` the component renders a single full-width
 * row containing `emptyState ?? "No results."` with muted foreground
 * styling so the empty case is visually distinct from a loading state
 * (pages should gate the table on a loading query separately).
 */

import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<TRow> {
  /** Stable identifier for the column; also used as the React key. */
  key: string;
  /** Rendered inside the `<TableHead>` for this column. */
  header: React.ReactNode;
  /** Renders the cell body for a given row. */
  cell: (row: TRow) => React.ReactNode;
  /** Optional extra class names for the column's `<TableHead>`. */
  headClassName?: string;
  /** Optional extra class names for every `<TableCell>` in the column. */
  cellClassName?: string;
}

export interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[];
  data: TRow[];
  /** Stable row identifier; used as the React key for each row. */
  getRowId: (row: TRow) => string;
  /** Optional override for the empty-state cell content. */
  emptyState?: React.ReactNode;
  /** Optional extra class names for the outer `<Table>` element. */
  className?: string;
}

export function DataTable<TRow>({
  columns,
  data,
  getRowId,
  emptyState,
  className,
}: DataTableProps<TRow>) {
  return (
    <Table className={cn(className)}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} className={column.headClassName}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="text-center text-muted-foreground"
            >
              {emptyState ?? "No results."}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={getRowId(row)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.cellClassName}>
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
