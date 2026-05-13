# Admin Panel Rules

These rules are mandatory for every change inside `localloom-admin/`. They apply to human contributors and AI assistants equally. Keep this file up to date when the architecture evolves.

## 1. Scope and intent

- This steering file governs the LocalLoom Admin Panel SPA at `localloom-admin/` (Vite + React + TypeScript + shadcn/ui).
- It codifies the non-negotiable standards derived from the `admin-panel-ui` spec so every pull request respects the same foundations.
- When these rules conflict with ad-hoc guidance, these rules win. If a rule needs to change, update this file in the same PR that introduces the change and link the spec update.

## 2. shadcn/ui rules

- shadcn primitives are added **CLI-only** via `npx shadcn@latest add <name>`. Do not hand-author files under `src/components/ui/`.
- Do **not** edit files under `src/components/ui/*`. They are treated as vendor output; re-run the CLI to update them.
- Project-authored extensions, composite components, and variants live in `src/components/wrappers/`. Wrappers import the primitive from `@/components/ui/*` and add app-specific defaults.
- Compose class names with `cn` from `@/lib/utils`:

  ```ts
  import { cn } from "@/lib/utils";

  <button className={cn("rounded-md", isActive && "bg-primary text-primary-foreground")} />
  ```

- Mount a single `<Toaster />` at the layout level (inside `AppLayout`) so authenticated pages share one toast host. The `LoginPage` lives outside `AppLayout`, so it mounts its own local `<Toaster />`.
- Wrap every form with the shadcn `Form` component backed by `react-hook-form` and a `zod` resolver:

  ```ts
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { Form } from "@/components/ui/form";

  const form = useForm<Values>({ resolver: zodResolver(schema) });
  return <Form {...form}>{/* fields */}</Form>;
  ```

## 3. API integration rules

- Every backend path MUST be declared in `src/api/paths.ts` under `ADMIN_PATHS`. Raw path strings (for example `"/api/admin/categories"`) are forbidden in feature code, hooks, repositories, or components.
- Every API call MUST go through a feature Repository class (for example `AdminCategoriesRepository`) and be consumed from the UI via React Query hooks (`useQuery` / `useMutation`). Components never call axios directly.
- `Api_Client` (the axios instance exported from `src/api/client.ts`) is a singleton. Do not instantiate additional axios clients; extend the existing one via interceptors if new cross-cutting behaviour is needed.

## 4. Theming rules

- No hex literals (`#fff`, `#1a1a1a`, ...) and no CSS named colors (`red`, `slate`, ...) are allowed anywhere under `src/features/**`.
- Use Tailwind token classes (`bg-primary`, `text-foreground`, `border-border`, `ring-ring`, ...) that map to the CSS variables defined in `src/styles/tokens.css`.
- Token additions or renames happen in `src/styles/tokens.css` and `tailwind.config.ts` only; feature code consumes the mapped Tailwind classes.

## 5. Routing rules

- `/login` is the **only** public route.
- Every non-login route MUST be mounted inside the guarded route group in `src/router/index.tsx` and wrapped by `ProtectedRoute`. A route that is neither `/login` nor a descendant of `ProtectedRoute` is a bug.
- New features add their routes under the guarded group; they do not add new public routes.

## 6. Project structure rules

Top-level folders under `src/`:

- `api/` — axios client, path constants, error normalization
- `components/`
  - `ui/` — shadcn primitives (CLI-managed, do not edit)
  - `wrappers/` — project-authored components that build on shadcn primitives
  - `layout/` — app shell (AppLayout, sidebar, header, ...)
- `config/` — typed env and feature flags
- `features/` — one folder per admin domain (see below)
- `hooks/` — cross-feature React hooks
- `lib/` — framework-agnostic helpers (including `cn`)
- `providers/` — React context providers (theme, auth, query client)
- `router/` — react-router configuration
- `styles/` — global CSS and design tokens
- `types/` — shared cross-feature TypeScript types
- `test/` — optional test utilities and setup

Every Feature_Module at `src/features/<feature>/` MUST contain the following:

- `<feature>.types.ts` — domain types
- `<feature>.schema.ts` — zod schemas (where applicable)
- `<feature>.repository.ts` — singleton repository class that talks to `Api_Client` using `ADMIN_PATHS`
- `hooks/` — React Query hooks (`use-*-query.ts`, `use-*-mutation.ts`)
- `pages/` — route page components rendered by `App_Router`
- `components/` — feature-scoped components (where applicable)
- `index.ts` — barrel re-export for the feature's public surface

## 7. Environment rules

- `import.meta.env` is read in **exactly one** file: `src/config/env.ts`.
- The ESLint rule `no-restricted-syntax` enforces this. Do not disable it; fix the code instead.
- Everywhere else, import the validated `env` object:

  ```ts
  import { env } from "@/config/env";

  axios.create({ baseURL: `${env.apiBaseUrl}/api/admin` });
  ```

## 8. Definition of Done checklist

Every pull request MUST satisfy:

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] No new files added under `src/components/ui/` (shadcn primitives only; use the CLI)
- [ ] No raw API path strings outside `src/api/paths.ts`
- [ ] No hex or named color literals in `src/features/**`
- [ ] Every new route is either `/login` or nested under `ProtectedRoute`
- [ ] `import.meta.env` is accessed only from `src/config/env.ts`

## 9. References

- [Shadcn installation (Vite)](https://ui.shadcn.com/docs/installation/vite)
- [Shadcn CLI](https://ui.shadcn.com/docs/cli)
- [Shadcn theming](https://ui.shadcn.com/docs/theming)
- [Shadcn Form + react-hook-form](https://ui.shadcn.com/docs/components/form)
- [Shadcn Toast](https://ui.shadcn.com/docs/components/toast)
- [cn utility (manual installation)](https://ui.shadcn.com/docs/installation/manual)
