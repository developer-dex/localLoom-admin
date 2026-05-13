/**
 * Public API for the categories Feature_Module (Requirement 12.2,
 * design.md §10.1).
 *
 * Re-exports the page component (default-exported as
 * `CategoriesPage`), the repository + types helpers, the Zod schema,
 * and every React Query hook so consumers — including the router and
 * potential future surfaces — can reach the module through a single
 * import path.
 */

export { default as CategoriesPage } from "./pages/categories-page";

export {
  AdminCategoriesRepository,
  adminCategoriesRepository,
} from "./categories.repository";

export {
  buildCategoryFormData,
  type Category,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "./categories.types";

export {
  categoryFormSchema,
  type CategoryFormValues,
} from "./categories.schema";

export { useCategoriesQuery } from "./hooks/use-categories-query";
export { useCreateCategoryMutation } from "./hooks/use-create-category-mutation";
export {
  useUpdateCategoryMutation,
  type UpdateCategoryMutationInput,
} from "./hooks/use-update-category-mutation";
export { useDeleteCategoryMutation } from "./hooks/use-delete-category-mutation";
