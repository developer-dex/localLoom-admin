/**
 * Public API for the regions Feature_Module (Requirement 12.2,
 * design.md §10.1).
 *
 * Re-exports the page component (default-exported as
 * `RegionsPage`), the repository + types helpers, the Zod schema,
 * and every React Query hook so consumers — including the router
 * and the dashboard counts hook — can reach the module through a
 * single import path.
 */

export { default as RegionsPage } from "./pages/regions-page";

export {
  AdminRegionsRepository,
  adminRegionsRepository,
} from "./regions.repository";

export type {
  CreateRegionInput,
  Region,
  UpdateRegionInput,
} from "./regions.types";

export {
  regionFormSchema,
  type RegionFormValues,
} from "./regions.schema";

export { useRegionsQuery } from "./hooks/use-regions-query";
export { useCreateRegionMutation } from "./hooks/use-create-region-mutation";
export {
  useUpdateRegionMutation,
  type UpdateRegionMutationInput,
} from "./hooks/use-update-region-mutation";
export { useDeleteRegionMutation } from "./hooks/use-delete-region-mutation";
