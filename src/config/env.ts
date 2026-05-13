// Typed environment configuration for the LocalLoom admin panel.
//
// Per Requirement 14.3 this module is the ONLY place allowed to read
// `import.meta.env`. Every other file MUST import the `env` object exported
// below. An ESLint `no-restricted-syntax` rule (see `eslint.config.js`)
// enforces that restriction.
//
// Validation is performed at module load time with zod. If the schema
// rejects the incoming values this file throws a descriptive `Error` that
// lists every failing path and message, which causes the Vite build /
// dev server to fail fast with a useful diagnostic (Requirement 14.1).

import { z } from "zod";

const EnvSchema = z.object({
  VITE_API_BASE_URL: z
    .string({ required_error: "VITE_API_BASE_URL is required" })
    .min(1, "VITE_API_BASE_URL is required")
    .refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      "VITE_API_BASE_URL must start with http:// or https://",
    ),
  VITE_APP_NAME: z.string().min(1).default("LocalLoom Admin"),
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = {
  // Trim a single trailing slash so callers can safely compose
  // `${env.apiBaseUrl}/api/admin` without ending up with a double slash.
  apiBaseUrl: parsed.data.VITE_API_BASE_URL.replace(/\/$/, ""),
  appName: parsed.data.VITE_APP_NAME,
} as const;
