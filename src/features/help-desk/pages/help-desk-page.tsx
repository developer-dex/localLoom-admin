import * as React from 'react';
import { PageHeader } from '@/components/wrappers/page-header';
import { DataTable, type DataTableColumn } from '@/components/wrappers/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHelpDeskListQuery, useResolveHelpDeskMutation } from '../hooks/use-help-desk-queries';
import type { HelpDeskRequest, HelpDeskStatus } from '../help-desk.types';

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return DATE_FORMATTER.format(d);
}

export default function HelpDeskPage() {
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<HelpDeskStatus | undefined>(undefined);
  const limit = 10;

  const { data, isLoading } = useHelpDeskListQuery({ page, limit, status: statusFilter });
  const resolveMutation = useResolveHelpDeskMutation();

  const requests = data?.data ?? [];
  const meta = data?.meta;

  const columns: DataTableColumn<HelpDeskRequest>[] = React.useMemo(
    () => [
      { key: 'name', header: 'Name', cell: (row) => row.name },
      { key: 'email', header: 'Email', cell: (row) => row.email },
      {
        key: 'message',
        header: 'Message',
        cell: (row) => (
          <span className="line-clamp-2 max-w-xs text-sm">{row.message}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (row) => (
          <Badge variant={row.status === 'resolved' ? 'default' : 'secondary'}>
            {row.status}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        header: 'Submitted',
        cell: (row) => (
          <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>
        ),
      },
      {
        key: 'actions',
        header: '',
        cell: (row) =>
          row.status === 'pending' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => resolveMutation.mutate(row.id)}
              disabled={resolveMutation.isPending}
            >
              Resolve
            </Button>
          ) : null,
      },
    ],
    [resolveMutation],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help Desk"
        description="View and manage user support requests."
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={statusFilter === undefined ? 'default' : 'outline'}
          onClick={() => { setStatusFilter(undefined); setPage(1); }}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={statusFilter === 'pending' ? 'default' : 'outline'}
          onClick={() => { setStatusFilter('pending'); setPage(1); }}
        >
          Pending
        </Button>
        <Button
          size="sm"
          variant={statusFilter === 'resolved' ? 'default' : 'outline'}
          onClick={() => { setStatusFilter('resolved'); setPage(1); }}
        >
          Resolved
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          getRowId={(row) => row.id}
          emptyState="No help desk requests found."
        />
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= (meta.totalPages ?? 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
