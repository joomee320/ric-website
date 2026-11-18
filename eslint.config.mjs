import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Architecture boundary (CLAUDE.md): UI components get data through props and
  // may only import TypeScript types from lib/cms/schema.ts, nothing else in lib/cms/.
  {
    files: ["components/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "(^|/)lib/cms/(?!schema$)",
              message: "components/ must not import from lib/cms/. Pass data through props.",
            },
            {
              regex: "(^|/)lib/cms/schema$",
              allowTypeImports: true,
              message: "components/ may only use `import type` from lib/cms/schema.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
