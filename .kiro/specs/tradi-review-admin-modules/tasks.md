# Implementation Plan: Tradi & Review Admin Modules

## Overview

Convert the feature design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

Implementation flows: backend admin-tradies module → backend admin-reviews module → backend route mounting → frontend shared setup (paths, query keys, types) → frontend tradies feature module → frontend reviews feature module → feature flag activation → tests. Both backend modules follow the existing controller → service → repository → validation → routes pattern. Both frontend modules follow the existing repository → types → schema → hooks → pages → components pattern with React Query v5 and shadcn/ui.

## Tasks

- [x] 1. Backend admin-tradies module
  - [x] 1.1 Create admin-tradies validation schemas
    - Create `localloom-backend/src/modules/admin-tradies/admin-tradies.validation.ts`
    - Define Joi schemas: `tradieIdParamSchema`, `tradieListQuerySchema` (page, limit, status, search), `rejectTradieSchema` (rejectionReason required, max 1000), `bulkApproveSchema` (ids array, min 1, max 50), `bulkRejectSchema` (ids + rejectionReason)
    - _Requirements: 9.1, 9.3, 9.4, 9.5, 9.6_

  - [x] 1.2 Create admin-tradies repository
    - Create `localloom-backend/src/modules/admin-tradies/admin-tradies.repository.ts`
    - Implement `AdminTradiesRepository` with `findAll(options)` returning `PaginatedResult<TradieProfile>` with includes (user, services, serviceRegions), optional status filter, optional ILIKE search on businessName/abn, ordered by createdAt DESC
    - Implement `findById(id)` with full includes (user, services, serviceRegions, workPhotos)
    - Implement `updateStatus(id, status, rejectionReason?)` updating profileStatus and rejectionReason fields
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 1.3 Create admin-tradies service
    - Create `localloom-backend/src/modules/admin-tradies/admin-tradies.service.ts`
    - Implement `AdminTradiesService` with `list`, `getById` (throws NotFoundException), `approve`, `reject`, `bulkApprove`, `bulkReject`
    - Bulk operations process each ID independently, incrementing processed/failed counters, ensuring partial success behavior
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 1.4 Create admin-tradies controller
    - Create `localloom-backend/src/modules/admin-tradies/admin-tradies.controller.ts`
    - Implement `AdminTradiesController` with handlers: `getAll`, `getById`, `approve`, `reject`, `bulkApprove`, `bulkReject`
    - Use `asyncHandler` wrapper and `ApiResponse` helpers matching existing pattern
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 1.5 Create admin-tradies routes
    - Create `localloom-backend/src/modules/admin-tradies/admin-tradies.routes.ts`
    - Wire routes: GET `/`, GET `/:id`, PATCH `/:id/approve`, PATCH `/:id/reject`, POST `/bulk-approve`, POST `/bulk-reject`
    - Apply `validate` middleware with appropriate schemas for params, query, and body
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [x] 1.6 Create admin-tradies module index
    - Create `localloom-backend/src/modules/admin-tradies/index.ts`
    - Export the routes as `adminTradiesRoutes`
    - _Requirements: 9.7_


- [x] 2. Backend admin-reviews module
  - [x] 2.1 Create admin-reviews validation schemas
    - Create `localloom-backend/src/modules/admin-reviews/admin-reviews.validation.ts`
    - Define Joi schemas: `reviewIdParamSchema`, `reviewListQuerySchema` (page, limit, status, search), `rejectReviewSchema` (rejectionReason required, max 1000), `bulkApproveReviewsSchema` (ids array, min 1, max 50), `bulkRejectReviewsSchema` (ids + rejectionReason)
    - _Requirements: 10.1, 10.3, 10.4, 10.5, 10.6_

  - [x] 2.2 Create admin-reviews repository
    - Create `localloom-backend/src/modules/admin-reviews/admin-reviews.repository.ts`
    - Implement `AdminReviewsRepository` with `findAll(options)` returning `PaginatedResult<Review>` with includes (customer User: name, tradieProfile: businessName), optional status filter, optional ILIKE search on customer name or tradie businessName, ordered by createdAt DESC
    - Implement `findById(id)` with full includes (customer: name, email, avatar; tradieProfile: id, businessName)
    - Implement `updateStatus(id, data)` updating status, rejectionReason, reviewedByAdmin, reviewedAt fields
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 2.3 Create admin-reviews service
    - Create `localloom-backend/src/modules/admin-reviews/admin-reviews.service.ts`
    - Implement `AdminReviewsService` with `list`, `getById` (throws NotFoundException), `approve(id, adminId)`, `reject(id, rejectionReason, adminId)`, `bulkApprove(ids, adminId)`, `bulkReject(ids, rejectionReason, adminId)`
    - Approve/reject set `reviewedByAdmin` and `reviewedAt` fields
    - Bulk operations process each ID independently with partial success behavior
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 2.4 Create admin-reviews controller
    - Create `localloom-backend/src/modules/admin-reviews/admin-reviews.controller.ts`
    - Implement `AdminReviewsController` with handlers: `getAll`, `getById`, `approve`, `reject`, `bulkApprove`, `bulkReject`
    - Extract `adminId` from `req.admin.id` (set by authenticateAdmin middleware) for approve/reject operations
    - Use `asyncHandler` wrapper and `ApiResponse` helpers
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 2.5 Create admin-reviews routes
    - Create `localloom-backend/src/modules/admin-reviews/admin-reviews.routes.ts`
    - Wire routes: GET `/`, GET `/:id`, PATCH `/:id/approve`, PATCH `/:id/reject`, POST `/bulk-approve`, POST `/bulk-reject`
    - Apply `validate` middleware with appropriate schemas for params, query, and body
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 2.6 Create admin-reviews module index
    - Create `localloom-backend/src/modules/admin-reviews/index.ts`
    - Export the routes as `adminReviewsRoutes`
    - _Requirements: 10.7_

- [x] 3. Mount backend routes and checkpoint
  - [x] 3.1 Mount admin-tradies and admin-reviews routes
    - Update `localloom-backend/src/routes/admin/index.ts`
    - Import `adminTradiesRoutes` and `adminReviewsRoutes`
    - Mount at `/tradies` and `/reviews` below the `authenticateAdmin` middleware line
    - _Requirements: 9.7, 10.7_

  - [x] 3.2 Checkpoint - Backend modules complete
    - Ensure the backend compiles without errors (`npm run build` or `tsc --noEmit`)
    - Ensure all tests pass, ask the user if questions arise.


- [x] 4. Frontend shared setup
  - [x] 4.1 Extend ADMIN_PATHS with approve/reject/bulk paths
    - Update `localloom-admin/src/api/paths.ts`
    - Add `approve`, `reject`, `bulkApprove`, `bulkReject` path helpers to the existing `tradies` and `reviews` entries
    - `approve: (id: string) => \`/tradies/${id}/approve\``, `reject: (id: string) => \`/tradies/${id}/reject\``, `bulkApprove: "/tradies/bulk-approve"`, `bulkReject: "/tradies/bulk-reject"` (same pattern for reviews)
    - _Requirements: 12.4_

  - [x] 4.2 Add query keys for tradies and reviews
    - Update `localloom-admin/src/lib/query-keys.ts`
    - Add `tradies: { all, list(params), detail(id) }` and `reviews: { all, list(params), detail(id) }` key factories returning readonly tuples
    - _Requirements: 12.5_

  - [x] 4.3 Add PaginatedResult type to shared types
    - Update `localloom-admin/src/types/api.ts`
    - Add `PaginatedResult<T>` interface with `data: T[]` and `meta: { page, limit, total, totalPages, hasNextPage, hasPrevPage }` if not already present
    - _Requirements: 1.1, 1.4, 5.1, 5.4_

- [x] 5. Frontend tradies feature module - types, repository, schema
  - [x] 5.1 Create tradies types
    - Create `localloom-admin/src/features/tradies/tradies.types.ts`
    - Export `ApprovalStatus`, `TradieListItem`, `TradieDetail`, `TradieListParams`, `BulkActionResult` interfaces as specified in design
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 5.2 Create tradies repository
    - Create `localloom-admin/src/features/tradies/tradies.repository.ts`
    - Implement `AdminTradiesRepository` with `list(params)`, `getById(id)`, `approve(id)`, `reject(id, rejectionReason)`, `bulkApprove(ids)`, `bulkReject(ids, rejectionReason)`
    - All calls go through `apiClient` using `ADMIN_PATHS.tradies.*`
    - Export singleton `adminTradiesRepository`
    - _Requirements: 12.4, 12.5_

  - [x] 5.3 Create tradies schema
    - Create `localloom-admin/src/features/tradies/tradies.schema.ts`
    - Define Zod schema for rejection reason: `rejectionReason` (trim, min 1, max 1000, required)
    - Export `RejectTradieFormValues` inferred type
    - _Requirements: 3.2_

- [x] 6. Frontend tradies feature module - hooks
  - [x] 6.1 Create tradies query hooks
    - Create `localloom-admin/src/features/tradies/hooks/use-tradies-query.ts` using `queryKeys.tradies.list(params)` and `adminTradiesRepository.list(params)`
    - Create `localloom-admin/src/features/tradies/hooks/use-tradie-detail-query.ts` using `queryKeys.tradies.detail(id)` with `enabled: !!id`
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.1, 12.5_

  - [x] 6.2 Create tradies mutation hooks
    - Create `localloom-admin/src/features/tradies/hooks/use-approve-tradie-mutation.ts` — invalidates `queryKeys.tradies.all()`, shows success toast
    - Create `localloom-admin/src/features/tradies/hooks/use-reject-tradie-mutation.ts` — invalidates `queryKeys.tradies.all()`, shows success toast
    - Create `localloom-admin/src/features/tradies/hooks/use-bulk-approve-tradies-mutation.ts` — invalidates `queryKeys.tradies.all()`, shows summary toast with processed/failed counts
    - Create `localloom-admin/src/features/tradies/hooks/use-bulk-reject-tradies-mutation.ts` — invalidates `queryKeys.tradies.all()`, shows summary toast with processed/failed counts
    - All mutations use `useApiErrorToast()` for error handling
    - _Requirements: 3.1, 3.2, 3.6, 3.7, 4.3, 4.4, 4.5, 12.5_


- [x] 7. Frontend tradies feature module - components and page
  - [x] 7.1 Create tradie reject dialog component
    - Create `localloom-admin/src/features/tradies/components/tradie-reject-dialog.tsx`
    - AlertDialog with textarea for rejection reason, Zod validation (required, min 1, max 1000), confirm/cancel buttons
    - On confirm, calls the reject mutation (single or bulk depending on props)
    - _Requirements: 3.2, 3.7_

  - [x] 7.2 Create tradie detail dialog component
    - Create `localloom-admin/src/features/tradies/components/tradie-detail-dialog.tsx`
    - Full-screen Dialog showing all tradie profile fields organized in sections: Business Info, Services & Regions, Operating Hours, Media (images gallery, work photos grid, intro video), Documents (download links), Status
    - Action buttons in footer: Approve/Reject conditional on current status (pending shows both, approved shows reject only, rejected shows approve only)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.3, 3.4, 3.5_

  - [x] 7.3 Create tradie bulk toolbar component
    - Create `localloom-admin/src/features/tradies/components/tradie-bulk-toolbar.tsx`
    - Floating toolbar showing "{n} selected" with Bulk Approve button, Bulk Reject button (opens reject dialog), and Clear selection button
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 7.4 Implement tradies page (replace placeholder)
    - Replace `localloom-admin/src/features/tradies/pages/tradies-page.tsx` with full implementation
    - PageHeader with title "Tradies"
    - Status filter tabs (All / Pending / Approved / Rejected)
    - Search input for business name / ABN
    - DataTable with columns: checkbox, business name, ABN, category, region, status badge, date, actions dropdown (Approve/Reject conditional on status)
    - Row click opens TradieDetailDialog
    - BulkToolbar appears when rows are selected
    - Pagination controls below table using server-side pagination
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2_

  - [x] 7.5 Create tradies module index
    - Create `localloom-admin/src/features/tradies/index.ts`
    - Re-export page, hooks, repository, schema, types, components
    - _Requirements: 12.3_

- [x] 8. Frontend reviews feature module - types, repository, schema
  - [x] 8.1 Create reviews types
    - Create `localloom-admin/src/features/reviews/reviews.types.ts`
    - Export `ApprovalStatus`, `ReviewListItem`, `ReviewDetail`, `ReviewListParams`, `BulkActionResult` interfaces as specified in design
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4_

  - [x] 8.2 Create reviews repository
    - Create `localloom-admin/src/features/reviews/reviews.repository.ts`
    - Implement `AdminReviewsRepository` with `list(params)`, `getById(id)`, `approve(id)`, `reject(id, rejectionReason)`, `bulkApprove(ids)`, `bulkReject(ids, rejectionReason)`
    - All calls go through `apiClient` using `ADMIN_PATHS.reviews.*`
    - Export singleton `adminReviewsRepository`
    - _Requirements: 12.4, 12.5_

  - [x] 8.3 Create reviews schema
    - Create `localloom-admin/src/features/reviews/reviews.schema.ts`
    - Define Zod schema for rejection reason: `rejectionReason` (trim, min 1, max 1000, required)
    - Export `RejectReviewFormValues` inferred type
    - _Requirements: 7.2_


- [x] 9. Frontend reviews feature module - hooks
  - [x] 9.1 Create reviews query hooks
    - Create `localloom-admin/src/features/reviews/hooks/use-reviews-query.ts` using `queryKeys.reviews.list(params)` and `adminReviewsRepository.list(params)`
    - Create `localloom-admin/src/features/reviews/hooks/use-review-detail-query.ts` using `queryKeys.reviews.detail(id)` with `enabled: !!id`
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 6.1, 12.5_

  - [x] 9.2 Create reviews mutation hooks
    - Create `localloom-admin/src/features/reviews/hooks/use-approve-review-mutation.ts` — invalidates `queryKeys.reviews.all()`, shows success toast
    - Create `localloom-admin/src/features/reviews/hooks/use-reject-review-mutation.ts` — invalidates `queryKeys.reviews.all()`, shows success toast
    - Create `localloom-admin/src/features/reviews/hooks/use-bulk-approve-reviews-mutation.ts` — invalidates `queryKeys.reviews.all()`, shows summary toast with processed/failed counts
    - Create `localloom-admin/src/features/reviews/hooks/use-bulk-reject-reviews-mutation.ts` — invalidates `queryKeys.reviews.all()`, shows summary toast with processed/failed counts
    - All mutations use `useApiErrorToast()` for error handling
    - _Requirements: 7.1, 7.2, 7.6, 7.7, 8.3, 8.4, 8.5, 12.5_

- [x] 10. Frontend reviews feature module - components and page
  - [x] 10.1 Create review reject dialog component
    - Create `localloom-admin/src/features/reviews/components/review-reject-dialog.tsx`
    - AlertDialog with textarea for rejection reason, Zod validation (required, min 1, max 1000), confirm/cancel buttons
    - On confirm, calls the reject mutation (single or bulk depending on props)
    - _Requirements: 7.2, 7.7_

  - [x] 10.2 Create review detail dialog component
    - Create `localloom-admin/src/features/reviews/components/review-detail-dialog.tsx`
    - Dialog showing: customer info (name, email, avatar), tradie reference (business name), rating with stars, full comment text, status badge, rejection reason (if rejected), submission date
    - Action buttons: Approve/Reject conditional on current status
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.3, 7.4, 7.5_

  - [x] 10.3 Create review bulk toolbar component
    - Create `localloom-admin/src/features/reviews/components/review-bulk-toolbar.tsx`
    - Floating toolbar showing "{n} selected" with Bulk Approve button, Bulk Reject button (opens reject dialog), and Clear selection button
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 10.4 Implement reviews page (replace placeholder)
    - Replace `localloom-admin/src/features/reviews/pages/reviews-page.tsx` with full implementation
    - PageHeader with title "Reviews"
    - Status filter tabs (All / Pending / Approved / Rejected)
    - Search input for customer name / tradie business name
    - DataTable with columns: checkbox, customer name, tradie name, rating (with star), comment preview (truncated), status badge, date, actions dropdown (Approve/Reject conditional on status)
    - Row click opens ReviewDetailDialog
    - BulkToolbar appears when rows are selected
    - Pagination controls below table using server-side pagination
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.3, 7.4, 7.5, 8.1, 8.2_

  - [x] 10.5 Create reviews module index
    - Create `localloom-admin/src/features/reviews/index.ts`
    - Re-export page, hooks, repository, schema, types, components
    - _Requirements: 12.3_

- [x] 11. Feature flag activation and integration wiring
  - [x] 11.1 Enable feature flags
    - Update `localloom-admin/src/config/features.ts`
    - Set `tradies: true` and `reviews: true`
    - _Requirements: 12.1, 12.2_

  - [x] 11.2 Checkpoint - Frontend modules complete
    - Run `npm run lint`, `npm run typecheck`, `npm run build` in `localloom-admin/` and confirm all exit 0
    - Ensure all tests pass, ask the user if questions arise.


- [x] 12. Property-based and unit tests
  - [ ]* 12.1 Write property test for bulk action count invariant
    - **Property 1: Bulk action count invariant**
    - **Validates: Requirements 4.5, 8.5**
    - Use `fast-check` to generate random arrays of UUIDs (mix of existing and non-existing IDs)
    - Call bulk approve/reject on the admin-tradies service and admin-reviews service
    - Assert `processed + failed === ids.length` for every generated input

  - [ ]* 12.2 Write property test for non-approved tradie exclusion
    - **Property 2: Non-approved tradie exclusion**
    - **Validates: Requirements 11.1, 11.3**
    - Use `fast-check` to generate random tradie profiles with random statuses (pending, approved, rejected)
    - Insert into test DB, call public tradie listing endpoint
    - Assert no profile with status !== 'approved' appears in results

  - [ ]* 12.3 Write property test for non-approved review exclusion
    - **Property 3: Non-approved review exclusion**
    - **Validates: Requirements 11.2, 11.4**
    - Use `fast-check` to generate random reviews with random statuses (pending, approved, rejected)
    - Insert into test DB, call public review listing endpoint
    - Assert no review with status !== 'approved' appears in results

  - [ ]* 12.4 Write unit tests for backend admin-tradies service
    - Test approve/reject single tradie (success and not-found cases)
    - Test bulk operations with mix of valid/invalid IDs
    - Test list with pagination, status filter, and search
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 12.5 Write unit tests for backend admin-reviews service
    - Test approve/reject single review (success and not-found cases)
    - Test bulk operations with mix of valid/invalid IDs
    - Test list with pagination, status filter, and search
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 12.6 Write frontend component tests for tradies page
    - Test DataTable renders with correct columns
    - Test status filter tabs change query params
    - Test row actions show conditional approve/reject based on status
    - Test bulk toolbar appears on selection
    - _Requirements: 1.1, 1.2, 1.3, 3.3, 4.1, 4.2_

  - [ ]* 12.7 Write frontend component tests for reviews page
    - Test DataTable renders with correct columns including star rating
    - Test status filter tabs change query params
    - Test row actions show conditional approve/reject based on status
    - Test bulk toolbar appears on selection
    - _Requirements: 5.1, 5.2, 5.3, 7.3, 8.1, 8.2_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Run `npm run lint`, `npm run typecheck`, `npm run build` in both `localloom-backend/` and `localloom-admin/`
  - Confirm backend compiles and frontend produces a static bundle
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP.
- Each task references specific requirements for traceability.
- Checkpoints (tasks 3.2, 11.2, 13) guard transitions between backend, frontend, and verification phases.
- Property tests validate the three universal correctness properties defined in the design document using `fast-check`.
- The backend modules follow the exact same pattern as `admin-categories` (controller → service → repository → validation → routes).
- The frontend modules follow the exact same pattern as the `categories` feature module (repository → types → schema → hooks → pages → components).
