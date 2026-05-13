// Flat ESLint config for the LocalLoom admin panel.
//
// Key rules:
//   - Recommended TypeScript + React Hooks rules.
//   - `react-refresh/only-export-components` for Vite HMR friendliness.
//   - `no-restricted-syntax` bans raw `import.meta.env` access outside
//     `src/config/env.ts` (see Requirement 14.3). The override block turns
//     this rule off for `src/config/env.ts` itself, which is the single
//     module allowed to read `import.meta.env`.

import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

const importMetaEnvRule = {
  selector:
    "MemberExpression[object.object.name='import'][object.property.name='meta'][property.name='env']",
  message:
    "Do not read `import.meta.env` outside `src/config/env.ts`. Import the typed `env` object from `@/config/env` instead.",
};

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        console: "readonly",
        FormData: "readonly",
        File: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // TypeScript's compiler handles undefined-reference checks natively and
      // has full awareness of DOM, Node, and other ambient types via `lib`
      // and `@types/*` packages. Leaving ESLint's `no-undef` enabled on TS
      // files would require re-declaring every global (e.g. `HTMLDivElement`,
      // `setTimeout`) here, which is error-prone and duplicative. This
      // mirrors the official typescript-eslint recommendation.
      "no-undef": "off",
      "no-restricted-syntax": ["error", importMetaEnvRule],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Files under `src/components/ui/` and `src/hooks/use-toast.ts` are
    // generated verbatim by the shadcn CLI (see Requirement 2.2) and MUST
    // NOT be hand-edited. shadcn's templates include patterns that are
    // semantically correct but trip some stricter lint rules (for example
    // `const actionTypes = { ... } as const; type ActionType = typeof
    // actionTypes;`). Relax just those rules for the generated scope so we
    // can still run `npm run lint` cleanly without modifying the files.
    files: [
      "src/components/ui/**/*.{ts,tsx}",
      "src/hooks/use-toast.ts",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // `src/config/env.ts` is the single place allowed to touch
    // `import.meta.env`. Override disables the restricted-syntax rule there.
    files: ["src/config/env.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    // Test files (Vitest + Testing Library + MSW). Vitest exposes
    // `describe`, `it`, `expect`, `vi`, `beforeAll`, `afterEach`, etc.
    // as globals (see `test.globals: true` in vite.config.ts). Register
    // them here so the flat config's `no-undef` logic (and any downstream
    // tooling that reads the global list) doesn't flag them.
    files: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "src/test/**/*.{ts,tsx}",
    ],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
      },
    },
  },
  {
    // Build-time config files run in Node and rely on Node globals like
    // `__dirname` and `process`. They are not part of the browser bundle.
    files: ["*.config.{ts,js}", "vite.config.ts"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
  },
  prettier,
];
