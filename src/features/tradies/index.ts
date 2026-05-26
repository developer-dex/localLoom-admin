/**
 * Public API for the tradies Feature_Module.
 * Re-exports page, hooks, repository, schema, types, and components.
 */

export { default as TradiesPage } from "./pages/tradies-page";
export { default as TradieDetailPage } from "./pages/tradie-detail-page";

// Repository
export { adminTradiesRepository } from "./tradies.repository";

// Types
export type {
  ApprovalStatus,
  TradieListItem,
  TradieDetail,
  TradieListParams,
  BulkActionResult,
} from "./tradies.types";

// Schema
export { rejectTradieSchema } from "./tradies.schema";
export type { RejectTradieFormValues } from "./tradies.schema";

// Hooks
export { useTradiesQuery } from "./hooks/use-tradies-query";
export { useTradieDetailQuery } from "./hooks/use-tradie-detail-query";
export { useApproveTradieMutation } from "./hooks/use-approve-tradie-mutation";
export { useRejectTradieMutation } from "./hooks/use-reject-tradie-mutation";
export { useBulkApproveTradieMutation } from "./hooks/use-bulk-approve-tradies-mutation";
export { useBulkRejectTradieMutation } from "./hooks/use-bulk-reject-tradies-mutation";

// Components
export { TradieRejectDialog } from "./components/tradie-reject-dialog";
export { TradieBulkToolbar } from "./components/tradie-bulk-toolbar";
