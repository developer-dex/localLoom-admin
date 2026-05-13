/// <reference types="vite/client" />

// Augment `ImportMetaEnv` with the admin panel's typed variables. These
// values are only read from `src/config/env.ts` (see Requirement 14.3);
// elsewhere the typed `env` export from `@/config/env` MUST be used.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
